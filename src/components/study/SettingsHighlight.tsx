import type { SettingHighlight } from "@/lib/types/studyPack";

interface Props {
  settings: SettingHighlight[];
  title?: string;
}

const colorMap: Record<string, { badge: string; border: string }> = {
  yellow: { badge: "bg-yellow-400/15 text-yellow-300 border-yellow-400/25", border: "border-yellow-400/15" },
  blue:   { badge: "bg-blue-400/15 text-blue-300 border-blue-400/25",       border: "border-blue-400/15"   },
  green:  { badge: "bg-emerald-400/15 text-emerald-300 border-emerald-400/25", border: "border-emerald-400/15" },
  red:    { badge: "bg-red-400/15 text-red-300 border-red-400/25",           border: "border-red-400/15"   },
};

export default function SettingsHighlight({ settings, title }: Props) {
  if (!settings || settings.length === 0) return null;
  return (
    <div className="space-y-2">
      {title && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{title}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {settings.map((s, i) => {
          const colors = colorMap[s.color ?? "yellow"];
          return (
            <div key={i} className={`bg-white/3 border ${colors.border} rounded-xl px-4 py-3 flex items-center gap-3`}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/70 truncate">{s.name}</p>
                {s.note && <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{s.note}</p>}
              </div>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border flex-shrink-0 ${colors.badge}`}>
                {s.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
