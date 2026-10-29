import { useEffect, useState } from "react";
import { getState, patchState } from "../../../api/client";
import type { RouterState } from "@shared/types/router-state";
import Field from "../components/Field";
import SaveBar from "../components/SaveBar";

type Status = { kind: "idle" | "ok" | "error"; message?: string };

export default function LanPage() {
  const [loaded, setLoaded] = useState<RouterState | null>(null);
  const [ip, setIp] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getState("router-a");
        if (cancelled) return;
        setLoaded(s);
        setIp(s.lan.ipAddress);
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
        lan: { ipAddress: ip },
      });
      setLoaded(updated);
      setStatus({ kind: "ok", message: "LAN settings saved" });
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
      <h2 className="text-xl font-semibold mb-1">LAN IP Address</h2>
      <p className="text-sm text-slate-500 mb-6">
        Configure the router&apos;s management IP address on the local network.
      </p>

      <div className="bg-white border border-slate-200 rounded p-6">
        <Field
          label="LAN IP Address"
          inputId="lan-ip-input"
          hint="IPv4 address. Changing this may disconnect active clients."
          value={ip}
          onChange={setIp}
        />
        <Field
          label="Subnet Mask"
          inputId="subnet-mask-input"
          value={loaded.lan.subnetMask}
          onChange={() => {}}
          disabled
          hint="Read-only in this simulation."
        />
        <SaveBar saving={saving} status={status} onSave={handleSave} />
      </div>
    </div>
  );
}