import type { TutorialStep } from "@/lib/types/studyPack";
import ScreenshotPlaceholder from "./ScreenshotPlaceholder";
import Callout from "./Callout";
import SectionHeader from "@/components/ui/SectionHeader";

interface Props { steps: TutorialStep[] }

function StepCard({ step, isLast }: { step: TutorialStep; isLast: boolean }) {
  return (
    <div className="flex gap-4 sm:gap-6">
      {/* Timeline column */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-yellow-400 text-black font-black text-sm flex items-center justify-center z-10 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
          {step.number}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-yellow-400/30 to-transparent mt-2" />}
      </div>

      {/* Card */}
      <div className="flex-1 pb-8">
        <div className="bg-[#161b22] border border-white/8 rounded-2xl overflow-hidden">

          {/* Step header */}
          <div className="bg-gradient-to-r from-white/3 to-transparent border-b border-white/5 px-5 py-3.5 flex items-center gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/50">Step {step.number}</p>
              <h3 className="font-black text-white text-base leading-tight">{step.title}</h3>
            </div>
          </div>

          {/* Screenshot — full width */}
          <div className="px-4 pt-4">
            <ScreenshotPlaceholder
              description={step.screenshotPlaceholder}
              label={`Step ${step.number}`}
              size="md"
            />
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Main explanation */}
            <p className="text-sm text-white/80 leading-relaxed">{step.explanation}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Why it matters */}
              <div className="bg-blue-400/5 border border-blue-400/15 rounded-xl px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60 mb-1.5">Why this matters</p>
                <p className="text-xs text-white/65 leading-relaxed">{step.whyItMatters}</p>
              </div>

              {/* Expected result */}
              <div className="bg-emerald-400/5 border border-emerald-400/15 rounded-xl px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-1.5">✓ Expected result</p>
                <p className="text-xs text-white/65 leading-relaxed">{step.expectedResult}</p>
              </div>
            </div>

            {/* Mistakes + Tips */}
            {(step.mistakesToAvoid.length > 0 || step.tips.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {step.mistakesToAvoid.length > 0 && (
                  <div className="bg-red-400/5 border border-red-400/15 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-2">⚠ Avoid</p>
                    <ul className="space-y-1.5">
                      {step.mistakesToAvoid.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                          <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>{m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {step.tips.length > 0 && (
                  <div className="bg-yellow-400/5 border border-yellow-400/15 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/60 mb-2">💡 Tips</p>
                    <ul className="space-y-1.5">
                      {step.tips.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                          <span className="text-yellow-400 flex-shrink-0 mt-0.5">→</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Callout */}
            {step.callout && <Callout type={step.callout.type} text={step.callout.text} />}
          </div>
        </div>

        {/* Arrow between steps */}
        {!isLast && (
          <div className="flex justify-center mt-3 text-white/15 text-lg">↓</div>
        )}
      </div>
    </div>
  );
}

export default function StepsPage({ steps }: Props) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <SectionHeader
          icon="🪜"
          title="Step-by-Step Tutorial"
          subtitle="Follow each step with visual guides and expected results."
          count={steps.length}
        />
      </div>
      <div>
        {steps.map((step, i) => (
          <StepCard key={step.id} step={step} isLast={i === steps.length - 1} />
        ))}
      </div>
    </div>
  );
}
