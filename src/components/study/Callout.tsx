import type { CalloutType } from "@/lib/types/studyPack";

interface Props {
  type: CalloutType;
  text: string;
}

const configs: Record<CalloutType, { icon: string; label: string; border: string; bg: string; text: string; label_color: string }> = {
  tip:            { icon: "💡", label: "Pro Tip",       border: "border-blue-400/30",   bg: "bg-blue-400/5",   text: "text-blue-100/80",   label_color: "text-blue-400" },
  warning:        { icon: "⚠️", label: "Warning",       border: "border-red-400/30",    bg: "bg-red-400/5",    text: "text-red-100/80",    label_color: "text-red-400"  },
  important:      { icon: "🔥", label: "Important",     border: "border-orange-400/30", bg: "bg-orange-400/5", text: "text-orange-100/80", label_color: "text-orange-400" },
  "best-practice":{ icon: "⭐", label: "Best Practice", border: "border-yellow-400/30", bg: "bg-yellow-400/5", text: "text-yellow-100/80", label_color: "text-yellow-400" },
  remember:       { icon: "🧠", label: "Remember",      border: "border-purple-400/30", bg: "bg-purple-400/5", text: "text-purple-100/80", label_color: "text-purple-400" },
  result:         { icon: "✅", label: "Result",        border: "border-emerald-400/30",bg: "bg-emerald-400/5",text: "text-emerald-100/80",label_color: "text-emerald-400" },
};

export default function Callout({ type, text }: Props) {
  const cfg = configs[type] ?? configs["tip"];
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 ${cfg.border} ${cfg.bg}`}>
      <span className="text-base flex-shrink-0 mt-0.5">{cfg.icon}</span>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${cfg.label_color}`}>{cfg.label}</p>
        <p className={`text-sm leading-relaxed ${cfg.text}`}>{text}</p>
      </div>
    </div>
  );
}
