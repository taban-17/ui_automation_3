import { Outlet, NavLink } from "react-router-dom";

function navClass({ isActive }: { isActive: boolean }): string {
  const base = "block px-3 py-1.5 rounded text-sm";
  return isActive
    ? `${base} bg-slate-200 text-slate-900 font-medium`
    : `${base} text-slate-600 hover:bg-slate-100`;
}

export default function RouterAApp() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-50">
      <header className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Simulation Router A</h1>
          <p className="text-xs text-slate-300">Generic · firmware 1.0.0</p>
        </div>
        <span className="text-xs text-slate-300">admin</span>
      </header>

      <div className="flex flex-1">
        <nav className="w-56 bg-white border-r border-slate-200 p-4 space-y-1">
          <p className="px-3 pt-2 pb-1 text-xs uppercase tracking-wide text-slate-400">
            Wireless Settings
          </p>
          <NavLink to="wireless/basic" className={navClass}>
            Basic Configuration
          </NavLink>
          <NavLink to="wireless/security" className={navClass}>
            Security
          </NavLink>

          <p className="px-3 pt-4 pb-1 text-xs uppercase tracking-wide text-slate-400">
            LAN
          </p>
          <NavLink to="lan" className={navClass}>
            IP Address
          </NavLink>
        </nav>

        <main className="flex-1 p-8 max-w-3xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}