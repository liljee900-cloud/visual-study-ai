interface SectionHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  count?: number;
}

export default function SectionHeader({ icon, title, subtitle, count }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {count !== undefined && (
            <span className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full border border-white/10">
              {count}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
