import { useEffect, useState } from "react";
import { getState } from "../../../api/client";
import type { RouterState } from "@shared/types/router-state";
import { isDevicePresent } from "@shared/types/router-state";
import Panel from "../components/Panel";

export default function ClientsPage() {
  const [loaded, setLoaded] = useState<RouterState | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setLoaded(await getState("router-c"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (error) return <p className="text-xs font-mono text-red-700">{error}</p>;
  if (!loaded) return <p className="text-xs font-mono text-slate-500">Loading…</p>;

  const tick = loaded.system.simulationTick;
  const present = loaded.connectedDevices.filter((d) => isDevicePresent(d, tick));

  return (
    <div className="space-y-4">
      <Panel title="Associated Clients — All Interfaces">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="text-slate-600">
              <tr className="border-b border-slate-300">
                <th className="text-left px-3 py-1.5 font-semibold">Client</th>
                <th className="text-left px-3 py-1.5 font-semibold">IP</th>
                <th className="text-left px-3 py-1.5 font-semibold">MAC</th>
                <th className="text-left px-3 py-1.5 font-semibold">IF</th>
              </tr>
            </thead>
            <tbody>
              {present.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                    No associated clients
                  </td>
                </tr>
              )}
              {present.map((d) => (
                <tr key={d.mac} className="border-b border-slate-100">
                  <td className="px-3 py-1">{d.hostname}</td>
                  <td className="px-3 py-1">{d.ip}</td>
                  <td className="px-3 py-1">{d.mac}</td>
                  <td className="px-3 py-1">{d.interface}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="flex items-center gap-4">
        <button
          onClick={load}
          className="px-3 py-1 border border-slate-400 bg-slate-100 text-xs font-mono text-slate-800 hover:bg-slate-200"
        >
          Refresh
        </button>
        <span className="text-xs font-mono text-slate-500">
          {present.length} / {loaded.connectedDevices.length} clients · tick {tick}
        </span>
      </div>
    </div>
  );
}