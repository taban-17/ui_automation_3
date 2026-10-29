import { useEffect, useState } from "react";
import { getState, patchState } from "../../../api/client";
import type { RouterState } from "@shared/types/router-state";
import Panel from "../components/Panel";
import Param from "../components/Param";
import ReadOnlyParam from "../components/ReadOnlyParam";

export default function WlanPage() {
  const [loaded, setLoaded] = useState<RouterState | null>(null);
  const [ssid, setSsid] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "error"; msg?: string }>(
    { kind: "idle" }
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getState("router-c");
        if (cancelled) return;
        setLoaded(s);
        setSsid(s.wireless.ssid);
      } catch (e) {
        if (!cancelled)
          setStatus({ kind: "error", msg: e instanceof Error ? e.message : String(e) });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleCommit() {
    setSaving(true);
    setStatus({ kind: "idle" });
    try {
      const updated = await patchState("router-c", { wireless: { ssid } });
      setLoaded(updated);
      setStatus({ kind: "ok", msg: "WLAN profile committed" });
      setTimeout(() => setStatus({ kind: "idle" }), 3000);
    } catch (e) {
      setStatus({ kind: "error", msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p className="text-xs font-mono text-slate-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <Panel title="SSID Profile — Radio 0">
        <Param
          label="WLAN SSID"
          inputId="wlan-ssid-input"
          value={ssid}
          onChange={setSsid}
        />
        <ReadOnlyParam
          label="Security Mode"
          value={loaded.wireless.security}
        />
        <ReadOnlyParam
          label="Radio Band"
          value={
            loaded.wireless.bands["2.4GHz"].enabled ? "2.4 GHz (802.11 b/g/n)" : "disabled"
          }
        />
        <ReadOnlyParam
          label="Beacon SSID"
          value={loaded.wireless.broadcast ? "advertised" : "hidden"}
        />
        <ReadOnlyParam
          label="Radio Enable"
          value={loaded.wireless.enabled ? "enabled" : "disabled"}
        />
      </Panel>

      <div className="flex items-center gap-4">
        <button
          onClick={handleCommit}
          disabled={saving}
          className="px-3 py-1 border border-slate-400 bg-slate-100 text-xs font-mono text-slate-800 hover:bg-slate-200 disabled:opacity-50"
        >
          {saving ? "Committing…" : "Commit"}
        </button>
        {status.kind === "ok" && (
          <span className="text-xs font-mono text-green-700">{status.msg}</span>
        )}
        {status.kind === "error" && (
          <span className="text-xs font-mono text-red-700">{status.msg}</span>
        )}
      </div>
    </div>
  );
}