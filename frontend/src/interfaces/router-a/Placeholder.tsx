import { useEffect, useState } from "react";
import { getState, resetRouter } from "../../api/client";
import { RouterState } from "@shared/types/router-state";

export default function RouterAPlaceholder() {
  const [state, setState] = useState<RouterState | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setState(await getState("router-a"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleReset() {
    try {
      setError(null);
      setState(await resetRouter("router-a"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Router A — scaffold check</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}
      {state ? (
        <>
          <p className="mb-2">
            <strong>Device:</strong> {state.device.manufacturer} {state.device.model}
          </p>
          <p className="mb-4">
            <strong>SSID:</strong> {state.wireless.ssid}
          </p>
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reset to initial
          </button>
        </>
      ) : (
        <p>Loading…</p>
      )}
    </div>
  );
}