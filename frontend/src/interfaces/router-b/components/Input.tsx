interface InputProps {
  label: string;
  inputId: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "password";
  placeholder?: string;
}

export default function Input({
  label,
  inputId,
  value,
  onChange,
  type = "text",
  placeholder,
}: InputProps) {
  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm text-slate-600 mb-1.5"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
    </div>
  );
}