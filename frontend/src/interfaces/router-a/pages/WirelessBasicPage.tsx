import { useEffect, useState } from "react";
import { getState, patchState } from "../../../api/client";
import type { RouterState } from "@shared/types/router-state";
import Field from "../components/Field";
import SaveBar from "../components/SaveBar";

type Status = { kind: "idle" | "ok" | "error"; message?: string };

export default function WirelessBasicPage() {
  const [loaded, setLoaded] = useState<RouterState | null>(null);
  const [ssid, setSsid] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getState("router-a");
        if (cancelled) return;
        setLoaded(s);
        setSsid(s.wireless.ssid);
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
      const updated = await patchState("router-a", { wireless: { ssid } });
      setLoaded(updated);
      setStatus({ kind: "ok", message: "Settings saved" });
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
      <h2 className="text-xl font-semibold mb-1">Basic Configuration</h2>
      <p className="text-sm text-slate-500 mb-6">
        Configure the primary wireless network identifier.
      </p>

      <div className="bg-white border border-slate-200 rounded p-6">
        <Field
          label="SSID"
          inputId="ssid-input"
          hint="The name broadcast by this wireless network. 1–32 characters."
          value={ssid}
          onChange={setSsid}
        />
        <SaveBar saving={saving} status={status} onSave={handleSave} />
      </div>
    </div>
  );
}