"use client";

import type { BuildStep } from "@/lib/types/buildGuide";
import type { GuideMeta } from "@/lib/hooks/useGeneratePack";

interface Props {
  meta: GuideMeta | null;
  steps: BuildStep[];
  progress: number;       // 0–99
  statusMsg: string;
  onCancel: () => void;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     "bg-emerald-400/15 text-emerald-400 border-emerald-400/25",
  Intermediate: "bg-yellow-400/15 text-yellow-400 border-yellow-400/25",
  Advanced:     "bg-red-400/15 text-red-400 border-red-400/25",
};

// Compact step preview card for the streaming view
function MiniStep({ step, isNew }: { step: BuildStep; isNew: boolean }) {
  return (
    <div
      className={`bg-[#12151c] border border-white/[0.07] rounded-xl px-4 py-3 transition-all duration-500 ${
        isNew ? "animate-fade-in opacity-0" : "opacity-100"
      }`}
      style={isNew ? { animation: "fadeIn 0.4s ease forwards" } : undefined}
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-yellow-400 text-black font-black text-[11px] flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(250,204,21,0.25)]">
          {step.number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-white leading-tight">{step.title}</p>
          {step.editor && (
            <p className="text-[10px] text-blue-300/60 mt-0.5">{step.editor}</p>
          )}
          <p className="text-[10px] text-white/40 mt-1 leading-relaxed line-clamp-2">{step.action}</p>
          {step.settings.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {step.settings.slice(0, 3).map((s, i) => (
                <span key={i} className="text-[9px] font-mono bg-[#1e2535] border border-white/[0.08] text-white/50 rounded px-1.5 py-0.5">
                  {s.name}: <span className="text-white font-black">{s.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GeneratingGuide({ meta, steps, progress, statusMsg, onCancel }: Props) {
  const recentSteps = steps.slice(-6); // show the last 6 steps so it feels live
  const newStepIndex = steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0c12]/95 backdrop-blur-sm flex flex-col">

      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-white/[0.06] bg-[#0d1017] px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
            <span className="w-3 h-3 border-2 border-black/40 border-t-black rounded-full animate-spin block" />
          </div>
          <div className="min-w-0">
            {meta ? (
              <p className="text-sm font-black text-white truncate">{meta.title}</p>
            ) : (
              <p className="text-sm text-white/40 font-medium">{statusMsg}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        {meta && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] font-bold border rounded-md px-2 py-1 ${DIFFICULTY_COLOR[meta.difficulty] ?? DIFFICULTY_COLOR.Intermediate}`}>
              {meta.difficulty}
            </span>
            {meta.software && (
              <span className="text-[10px] bg-white/[0.04] border border-white/[0.08] text-white/30 rounded-md px-2 py-1">
                {meta.software}
              </span>
            )}
          </div>
        )}

        <button
          onClick={onCancel}
          className="flex-shrink-0 text-[11px] text-white/25 hover:text-white/60 border border-white/[0.08] hover:border-white/20 rounded-lg px-3 py-1.5 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex-shrink-0 h-1 bg-white/[0.04]">
        <div
          className="h-full bg-yellow-400 transition-all duration-700 ease-out"
          style={{ width: meta ? `${progress}%` : "15%" }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-6 space-y-3">

          {/* Guide description */}
          {meta?.description && (
            <div className="bg-[#12151c] border border-white/[0.07] rounded-xl px-4 py-3 mb-4">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-yellow-400/60 mb-1">What you&apos;ll learn</p>
              <p className="text-xs text-white/55 leading-relaxed">{meta.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {meta.estimatedTime && (
                  <span className="text-[9px] text-white/25">⏱ {meta.estimatedTime}</span>
                )}
                <span className="text-[9px] text-white/25">
                  {steps.length} / {meta.stepCount} steps
                </span>
              </div>
            </div>
          )}

          {/* Placeholder skeleton rows before meta arrives */}
          {!meta && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#12151c] border border-white/[0.05] rounded-xl px-4 py-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/5" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 bg-white/5 rounded w-2/3" />
                      <div className="h-2 bg-white/[0.03] rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-center text-[11px] text-white/25 pt-2">{statusMsg}</p>
            </div>
          )}

          {/* Live steps */}
          {recentSteps.map((step) => (
            <MiniStep
              key={step.id}
              step={step}
              isNew={steps.indexOf(step) === newStepIndex}
            />
          ))}

          {/* Generating indicator */}
          {meta && steps.length < meta.stepCount && (
            <div className="flex items-center gap-2 py-2 px-4">
              <span className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-yellow-400/60"
                    style={{ animation: `bounce 1s ${i * 0.2}s infinite` }}
                  />
                ))}
              </span>
              <span className="text-[10px] text-white/30">Generating step {steps.length + 1}…</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scaleY(1); }
          40%           { transform: scaleY(1.5); }
        }
      `}</style>
    </div>
  );
}
