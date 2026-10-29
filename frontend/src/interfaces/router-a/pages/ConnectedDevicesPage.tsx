import { useEffect, useState } from "react";
import { getState } from "../../../api/client";
import type { RouterState } from "@shared/types/router-state";
import { isDevicePresent } from "@shared/types/router-state";

export default function ConnectedDevicesPage() {
  const [loaded, setLoaded] = useState<RouterState | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setLoaded(await getState("router-a"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!loaded) return <p className="text-sm text-slate-500">Loading…</p>;

  const tick = loaded.system.simulationTick;
  const present = loaded.connectedDevices.filter((d) => isDevicePresent(d, tick));

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Connected Devices</h2>
          <p className="text-sm text-slate-500">
            Devices currently active on the LAN.
          </p>
        </div>
        <button
          onClick={load}
          className="px-3 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Hostname</th>
              <th className="text-left px-4 py-2 font-medium">IP Address</th>
              <th className="text-left px-4 py-2 font-medium">MAC Address</th>
              <th className="text-left px-4 py-2 font-medium">Interface</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {present.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No devices connected
                </td>
              </tr>
            )}
            {present.map((d) => (
              <tr key={d.mac}>
                <td className="px-4 py-2">{d.hostname}</td>
                <td className="px-4 py-2 font-mono text-xs">{d.ip}</td>
                <td className="px-4 py-2 font-mono text-xs">{d.mac}</td>
                <td className="px-4 py-2 text-slate-600">{d.interface}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Showing {present.length} of {loaded.connectedDevices.length} known devices.
      </p>
    </div>
  );
}