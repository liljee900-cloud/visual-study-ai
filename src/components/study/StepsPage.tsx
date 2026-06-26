import type { TutorialStep } from "@/lib/types/studyPack";
import NumberBadge from "@/components/ui/NumberBadge";
import SectionHeader from "@/components/ui/SectionHeader";

interface Props {
  steps: TutorialStep[];
}

function StepCard({ step }: { step: TutorialStep }) {
  return (
    <div className="flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center gap-0">
        <NumberBadge number={step.number} size="md" />
        <div className="w-0.5 flex-1 bg-white/5 mt-2" />
      </div>

      {/* Card */}
      <div className="flex-1 bg-[#161b22] border border-white/10 hover:border-white/20 rounded-2xl p-5 mb-4 transition-colors">
        <h3 className="font-bold text-white text-base mb-3">{step.title}</h3>

        <p className="text-sm text-white/70 leading-relaxed mb-4">{step.explanation}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Why it matters */}
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">
              Why this matters
            </p>
            <p className="text-xs text-white/65 leading-relaxed">{step.whyItMatters}</p>
          </div>

          {/* Expected result */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70 mb-1.5">
              Expected result
            </p>
            <p className="text-xs text-white/65 leading-relaxed">{step.expectedResult}</p>
          </div>
        </div>

        {(step.mistakesToAvoid.length > 0 || step.tips.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {step.mistakesToAvoid.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/70 mb-1.5">
                  Avoid these
                </p>
                <ul className="space-y-1">
                  {step.mistakesToAvoid.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-white/60">
                      <span className="text-red-400 text-xs mt-0.5">✗</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {step.tips.length > 0 && (
              <div className="bg-yellow-400/5 border border-yellow-400/15 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/70 mb-1.5">
                  Tips
                </p>
                <ul className="space-y-1">
                  {step.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-white/60">
                      <span className="text-yellow-400 text-xs mt-0.5">→</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StepsPage({ steps }: Props) {
  return (
    <div className="space-y-2 animate-fade-in">
      <SectionHeader
        icon="🪜"
        title="Step-by-Step Tutorial Notes"
        subtitle="Follow the tutorial flow with detailed notes for each step."
        count={steps.length}
      />
      <div>
        {steps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
      </div>
    </div>
  );
}
