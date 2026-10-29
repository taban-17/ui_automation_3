interface FieldProps {
  label: string;
  inputId: string;
  hint?: string;
  type?: "text" | "password" | "number";
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export default function Field({
  label,
  inputId,
  hint,
  type = "text",
  value,
  onChange,
  disabled,
}: FieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700 mb-1"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}