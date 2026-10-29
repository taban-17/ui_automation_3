import { useEffect, useState } from "react";
import { getState, patchState } from "../../../api/client";
import type { RouterState, RouterStatePatch } from "@shared/types/router-state";
import Card from "../components/Card";
import Input from "../components/Input";

export default function Dashboard() {
  const [loaded, setLoaded] = useState<RouterState | null>(null);
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [ip, setIp] = useState("");
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "error"; msg: string } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getState("router-b");
        if (cancelled) return;
        setLoaded(s);
        setSsid(s.wireless.ssid);
        setPassword(s.wireless.password);
        setIp(s.lan.ipAddress);
      } catch (e) {
        if (!cancelled)
          setToast({
            kind: "error",
            msg: e instanceof Error ? e.message : String(e),
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function buildPatch(): RouterStatePatch {
    if (!loaded) return {};
    const patch: RouterStatePatch = {};
    if (ssid !== loaded.wireless.ssid) patch.wireless = { ...patch.wireless, ssid };
    if (password !== loaded.wireless.password)
      patch.wireless = { ...patch.wireless, password };
    if (ip !== loaded.lan.ipAddress) patch.lan = { ipAddress: ip };
    return patch;
  }

  async function handleApply() {
    const patch = buildPatch();
    if (Object.keys(patch).length === 0) {
      setToast({ kind: "ok", msg: "No changes to apply" });
      setTimeout(() => setToast(null), 2500);
      return;
    }
    setApplying(true);
    try {
      const updated = await patchState("router-b", patch);
      setLoaded(updated);
      setSsid(updated.wireless.ssid);
      setPassword(updated.wireless.password);
      setIp(updated.lan.ipAddress);
      setToast({ kind: "ok", msg: "Changes applied" });
      setTimeout(() => setToast(null), 2500);
    } catch (e) {
      setToast({
        kind: "error",
        msg: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setApplying(false);
    }
  }

  if (!loaded) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {toast && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${
            toast.kind === "ok"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Card
          title="Main Network"
          subtitle="The network your devices connect to"
        >
          <Input
            label="Wi-Fi Name"
            inputId="wifi-name-input"
            value={ssid}
            onChange={setSsid}
            placeholder="My Home Wi-Fi"
          />
          <Input
            label="Wi-Fi Password"
            inputId="wifi-password-input"
            type="password"
            value={password}
            onChange={setPassword}
          />
        </Card>

        <Card title="Router" subtitle="Your router's identity on the network">
          <Input
            label="Router IP"
            inputId="router-ip-input"
            value={ip}
            onChange={setIp}
            placeholder="192.168.1.1"
          />
          <p className="text-xs text-slate-400 pt-2">
            Most people never need to change this.
          </p>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleApply}
          disabled={applying}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {applying ? "Applying…" : "Apply changes"}
        </button>
      </div>
    </div>
  );
}