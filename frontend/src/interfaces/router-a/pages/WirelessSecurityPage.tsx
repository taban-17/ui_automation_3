import { useEffect, useState } from "react";
import { getState, patchState } from "../../../api/client";
import type { RouterState } from "@shared/types/router-state";
import Field from "../components/Field";
import SaveBar from "../components/SaveBar";

type Status = { kind: "idle" | "ok" | "error"; message?: string };

export default function WirelessSecurityPage() {
  const [loaded, setLoaded] = useState<RouterState | null>(null);
  const [psk, setPsk] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getState("router-a");
        if (cancelled) return;
        setLoaded(s);
        setPsk(s.wireless.password);
      } catch (e) {
        if (!cancelled)
          setStatus({ kind: "error", message: String(e) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setStatus({ kind: "idle" });
    try {
      const updated = await patchState("router-a", {
        wireless: { password: psk },
      });
      setLoaded(updated);
      setStatus({ kind: "ok", message: "Security settings saved" });
      setTimeout(() => setStatus({ kind: "idle" }), 3000);
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Security</h2>
      <p className="text-sm text-slate-500 mb-6">
        Configure the wireless security mode and shared key.
      </p>

      <div className="bg-white border border-slate-200 rounded p-6">
        <p className="mb-4 text-sm text-slate-600">
          <strong>Security mode:</strong> {loaded.wireless.security}
        </p>
        <Field
          label="Pre-Shared Key"
          inputId="psk-input"
          hint="8–63 characters. Required for WPA2-PSK."
          type="password"
          value={psk}
          onChange={setPsk}
        />
        <SaveBar saving={saving} status={status} onSave={handleSave} />
      </div>
    </div>
  );
}