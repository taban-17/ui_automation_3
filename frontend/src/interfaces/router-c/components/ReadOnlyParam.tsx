interface ReadOnlyParamProps {
  label: string;
  value: string;
}

export default function ReadOnlyParam({ label, value }: ReadOnlyParamProps) {
  return (
    <div className="flex items-center px-3 py-1.5 text-xs font-mono">
      <span className="w-56 text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}