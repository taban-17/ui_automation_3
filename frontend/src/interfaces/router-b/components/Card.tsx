interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function Card({ title, subtitle, children }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}