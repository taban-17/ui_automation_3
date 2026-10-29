interface PanelProps {
  title: string;
  children: React.ReactNode;
}

export default function Panel({ title, children }: PanelProps) {
  return (
    <div className="border border-slate-300 bg-white">
      <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-300 text-xs font-mono font-semibold text-slate-700 uppercase tracking-wide">
        {title}
      </div>
      <div className="divide-y divide-slate-200">{children}</div>
    </div>
  );
}