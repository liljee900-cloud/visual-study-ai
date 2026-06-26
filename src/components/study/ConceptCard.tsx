import type { Concept } from "@/lib/types/studyPack";
import ScreenshotPlaceholder from "./ScreenshotPlaceholder";
import Callout from "./Callout";
import SettingsHighlight from "./SettingsHighlight";

interface Props { concept: Concept }

const colorSchemes = {
  yellow: {
    header:    "from-yellow-400/10 to-transparent border-yellow-400/20",
    number:    "bg-yellow-400 text-black",
    accent:    "text-yellow-400",
    badge:     "bg-yellow-400/10 border-yellow-400/20 text-yellow-400",
    label:     "text-yellow-400/60",
  },
  blue: {
    header:    "from-blue-400/10 to-transparent border-blue-400/20",
    number:    "bg-blue-400 text-black",
    accent:    "text-blue-400",
    badge:     "bg-blue-400/10 border-blue-400/20 text-blue-400",
    label:     "text-blue-400/60",
  },
  green: {
    header:    "from-emerald-400/10 to-transparent border-emerald-400/20",
    number:    "bg-emerald-400 text-black",
    accent:    "text-emerald-400",
    badge:     "bg-emerald-400/10 border-emerald-400/20 text-emerald-400",
    label:     "text-emerald-400/60",
  },
  red: {
    header:    "from-red-400/10 to-transparent border-red-400/20",
    number:    "bg-red-400 text-black",
    accent:    "text-red-400",
    badge:     "bg-red-400/10 border-red-400/20 text-red-400",
    label:     "text-red-400/60",
  },
  purple: {
    header:    "from-purple-400/10 to-transparent border-purple-400/20",
    number:    "bg-purple-400 text-black",
    accent:    "text-purple-400",
    badge:     "bg-purple-400/10 border-purple-400/20 text-purple-400",
    label:     "text-purple-400/60",
  },
};

function Field({ label, children, accent }: { label: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="space-y-1.5">
      <p className={`text-[10px] font-bold uppercase tracking-widest ${accent ?? "text-white/30"}`}>{label}</p>
      <div className="text-sm text-white/75 leading-relaxed">{children}</div>
    </div>
  );
}

export default function ConceptCard({ concept }: Props) {
  const c = colorSchemes[concept.color as keyof typeof colorSchemes] ?? colorSchemes["yellow"];

  return (
    <div className="bg-[#161b22] border border-white/8 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className={`bg-gradient-to-r ${c.header} border-b border-white/5 px-5 py-4`}>
        <div className="flex items-center gap-3">
          <span className={`w-9 h-9 rounded-full ${c.number} font-black text-sm flex items-center justify-center flex-shrink-0`}>
            {concept.number}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-white text-lg leading-tight">{concept.name}</h3>
              <span className="text-xl">{concept.icon}</span>
            </div>
          </div>
          <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-1 ${c.badge}`}>
            Concept #{concept.number}
          </span>
        </div>
      </div>

      {/* Screenshot — full width, prominent */}
      <div className="px-5 pt-5">
        <ScreenshotPlaceholder
          description={concept.screenshotPlaceholder}
          label={concept.name}
          size="lg"
        />
      </div>

      {/* Content grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Beginner explanation — spans full width */}
        <div className="sm:col-span-2 bg-white/3 border border-white/6 rounded-xl px-4 py-4">
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${c.label}`}>In simple terms</p>
          <p className="text-base text-white/85 leading-relaxed font-medium italic">
            &ldquo;{concept.beginnerExplanation}&rdquo;
          </p>
        </div>

        <Field label="Why it exists" accent={c.label}>{concept.whyItExists}</Field>
        <Field label="What happens when you use it" accent={c.label}>{concept.whatHappens}</Field>
        <Field label="When to use it" accent={c.label}>{concept.whenToUse}</Field>

        {/* Real-world example */}
        <div className="sm:col-span-2">
          <Field label="Real-world example" accent={c.label}>
            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-white/70 leading-relaxed">
              {concept.realWorldExample}
            </div>
          </Field>
        </div>

        {/* Settings highlight */}
        {concept.settings && concept.settings.length > 0 && (
          <div className="sm:col-span-2">
            <SettingsHighlight settings={concept.settings} title="Key settings" />
          </div>
        )}

        {/* Common mistake */}
        <div className="bg-red-400/5 border border-red-400/15 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/70 mb-1.5">⚠ Common Mistake</p>
          <p className="text-sm text-white/65 leading-relaxed">{concept.commonMistake}</p>
        </div>

        {/* Pro tip */}
        <div className="bg-yellow-400/5 border border-yellow-400/15 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/70 mb-1.5">💡 Pro Tip</p>
          <p className="text-sm text-yellow-200/70 leading-relaxed">{concept.proTip}</p>
        </div>

        {/* Callouts */}
        {concept.callouts && concept.callouts.length > 0 && (
          <div className="sm:col-span-2 space-y-2">
            {concept.callouts.map((callout, i) => (
              <Callout key={i} type={callout.type} text={callout.text} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
