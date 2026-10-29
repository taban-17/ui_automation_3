interface ParamProps {
  label: string;
  inputId: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "password";
  unit?: string;
}

export default function Param({
  label,
  inputId,
  value,
  onChange,
  type = "text",
  unit,
}: ParamProps) {
  return (
    <div className="flex items-center px-3 py-1.5 text-xs font-mono">
      <label
        htmlFor={inputId}
        className="w-56 text-slate-700 shrink-0"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 max-w-md px-2 py-1 border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:border-blue-500"
      />
      {unit && <span className="ml-2 text-slate-500">{unit}</span>}
    </div>
  );
}