import { Outlet } from "react-router-dom";

export default function RouterBApp() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
            B
          </div>
          <div>
            <h1 className="text-base font-semibold">NovaLink Router</h1>
            <p className="text-xs text-slate-500">Simulation Router B</p>
          </div>
        </div>
        <span className="text-xs text-slate-500">admin</span>
      </header>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}