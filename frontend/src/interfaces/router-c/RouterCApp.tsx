import { NavLink, Outlet } from "react-router-dom";

function tabClass({ isActive }: { isActive: boolean }): string {
  const base =
    "px-4 py-2 text-xs font-mono border-b-2 -mb-px transition-colors";
  return isActive
    ? `${base} border-blue-600 text-slate-900 bg-white`
    : `${base} border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50`;
}

export default function RouterCApp() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-50">
      <header className="bg-slate-900 text-white px-6 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-sm font-mono font-semibold tracking-wide">
            TECHNICORE
          </h1>
          <span className="text-xs font-mono text-slate-400">
            Simulation Router C · WLAN Controller v1.0.0
          </span>
        </div>
      </header>

      <nav className="bg-slate-200 border-b border-slate-300 px-6 flex gap-1">
        <NavLink to="wlan" className={tabClass}>
          WLAN Configuration
        </NavLink>
        <NavLink to="security" className={tabClass}>
          Security
        </NavLink>
        <NavLink to="interface" className={tabClass}>
          Interface
        </NavLink>
        <NavLink to="clients" className={tabClass}>
        Clients
        </NavLink>
      </nav>

      <main className="flex-1 p-6 max-w-4xl">
        <Outlet />
      </main>
    </div>
  );
}