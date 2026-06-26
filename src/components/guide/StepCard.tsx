"use client";

import { useState } from "react";
import type { BuildStep } from "@/lib/types/buildGuide";
import ScreenshotPlaceholder from "@/components/study/ScreenshotPlaceholder";

interface Props {
  step: BuildStep;
  isLast: boolean;
}

// Socket-style dot colors matching Blender node conventions
function SocketDot({ type }: { type?: string }) {
  const color =
    type === "geometry" ? "bg-[#00d6a3]" :
    type === "vector"   ? "bg-[#6363c7]" :
    type === "boolean"  ? "bg-[#cca6d7]" :
    type === "object"   ? "bg-[#ed9e5c]" :
                          "bg-[#a0a0a0]";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />;
}

export default function StepCard({ step, isLast }: Props) {
  const [sideNoteOpen, setSideNoteOpen] = useState(false);

  return (
    <div className="relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[22px] top-full w-0.5 h-5 bg-gradient-to-b from-yellow-400/40 to-transparent z-0" />
      )}

      <div className="bg-[#12151c] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-yellow-400/20 transition-colors group">

        {/* ── HEADER ── */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3 border-b border-white/[0.05]">
          <div className="w-10 h-10 rounded-full bg-yellow-400 text-black font-black text-sm flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(250,204,21,0.3)]">
            {step.number}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-black text-white text-[15px] leading-tight">{step.title}</h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {step.editor && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#1e2a3a] border border-blue-400/20 text-blue-300/80 rounded-md px-2 py-0.5">
                  {step.editor}
                </span>
              )}
              {step.panel && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-white/30 rounded-md px-2 py-0.5">
                  {step.panel}
                </span>
              )}
              {step.shortcut && (
                <kbd className="text-[9px] font-black font-mono bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 rounded px-2 py-0.5 tracking-wider">
                  {step.shortcut}
                </kbd>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">

          {/* ── SCREENSHOT ── real or placeholder */}
          <ScreenshotPlaceholder
            description={step.screenshotPlaceholder}
            screenshotUrl={step.screenshotUrl}
            stepNumber={step.number}
            editor={step.editor}
            size="md"
          />

          {/* ── NODE-STYLE ACTION BOX ── */}
          <div className="bg-[#0d1017] border border-white/[0.08] rounded-xl overflow-hidden">
            {/* Title bar */}
            <div className="bg-[#1a2030] border-b border-white/[0.06] px-3 py-2 flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-yellow-400/80">Action</span>
              {step.whereToClick && (
                <span className="text-[9px] text-white/25 truncate">· {step.whereToClick}</span>
              )}
            </div>
            {/* Action row */}
            <div className="px-3 py-2.5 flex items-start gap-2">
              <SocketDot />
              <p className="text-xs text-white/80 leading-relaxed font-medium">{step.action}</p>
            </div>

            {/* Menu path as a row */}
            {step.menuPath && (
              <div className="border-t border-white/[0.05] px-3 py-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Path</span>
                {step.menuPath.split("→").map((part, i, arr) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-white/55 bg-white/[0.05] border border-white/[0.08] rounded px-1.5 py-0.5">
                      {part.trim()}
                    </span>
                    {i < arr.length - 1 && <span className="text-white/20 text-[10px]">›</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── NODE-STYLE SETTINGS BOX ── */}
          {step.settings.length > 0 && (
            <div className="bg-[#0d1017] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="bg-[#1a2030] border-b border-white/[0.06] px-3 py-2">
                <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">Settings</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {step.settings.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <SocketDot type="value" />
                      <span className="text-[11px] text-white/50 truncate">{s.name}</span>
                      {s.note && <span className="text-[9px] text-white/20 italic hidden sm:inline truncate">({s.note})</span>}
                    </div>
                    <div className="flex items-baseline gap-1 flex-shrink-0">
                      <span className="text-[11px] font-black font-mono text-white bg-[#1e2535] border border-white/[0.08] rounded px-2 py-0.5 tabular-nums">
                        {s.value}
                      </span>
                      {s.unit && <span className="text-[9px] text-white/25">{s.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NODE CONNECTIONS BOX ── */}
          {step.connections.length > 0 && (
            <div className="bg-[#0d1017] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="bg-[#1a2030] border-b border-white/[0.06] px-3 py-2">
                <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">Connections</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {step.connections.map((c, i) => (
                  <div key={i} className="px-3 py-2 flex items-center gap-2 flex-wrap">
                    <SocketDot type="geometry" />
                    <span className="text-[10px] font-mono text-[#00d6a3]/80">{c.from}</span>
                    <span className="text-white/20 text-xs">→</span>
                    <span className="text-[10px] font-mono text-[#00d6a3]/80">{c.to}</span>
                    {c.note && <span className="text-[9px] text-white/25 italic">({c.note})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USE FOR / PURPOSE (yellow label style) ── */}
          <div className="flex items-start gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-yellow-400 flex-shrink-0 mt-0.5 pt-px">Why:</span>
            <p className="text-xs text-white/55 leading-relaxed">{step.purpose}</p>
          </div>

          {/* ── EXPECTED RESULT ── */}
          <div className="bg-[#0d1a14] border border-emerald-400/15 rounded-xl px-3 py-2.5">
            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-emerald-400/70 block mb-1">✓ Expected</span>
            <p className="text-xs text-white/65 leading-relaxed">{step.expectedResult}</p>
          </div>

          {/* ── MISTAKES + TIPS ── */}
          {(step.commonMistakes.length > 0 || step.tips.length > 0) && (
            <div className="grid grid-cols-2 gap-2">
              {step.commonMistakes.length > 0 && (
                <div className="bg-[#1a0d0d] border border-red-400/12 rounded-xl px-3 py-2.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.12em] text-red-400/60 block mb-1.5">⚠ Watch Out</span>
                  <ul className="space-y-1">
                    {step.commonMistakes.map((m, i) => (
                      <li key={i} className="text-[10px] text-white/45 flex items-start gap-1.5">
                        <span className="text-red-400/50 flex-shrink-0">•</span>{m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {step.tips.length > 0 && (
                <div className="bg-[#0d1220] border border-blue-400/12 rounded-xl px-3 py-2.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.12em] text-blue-400/60 block mb-1.5">💡 Tips</span>
                  <ul className="space-y-1">
                    {step.tips.map((t, i) => (
                      <li key={i} className="text-[10px] text-white/45 flex items-start gap-1.5">
                        <span className="text-blue-400/50 flex-shrink-0">•</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ── SIDE NOTE (collapsible) ── */}
          {step.sideNote && (
            <div>
              <button
                onClick={() => setSideNoteOpen(o => !o)}
                className="w-full flex items-center gap-2 text-[10px] text-purple-400/60 hover:text-purple-400 transition-colors"
              >
                <span className="w-4 h-4 rounded border border-purple-400/25 bg-purple-400/6 flex items-center justify-center font-black">
                  {sideNoteOpen ? "−" : "+"}
                </span>
                <span className="font-bold uppercase tracking-wider">Concept: {step.sideNote.title}</span>
              </button>
              {sideNoteOpen && (
                <div className="mt-2 bg-[#130d1a] border border-purple-400/15 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-purple-400/60 mb-1.5">📖 {step.sideNote.title}</p>
                  <p className="text-[11px] text-white/55 leading-relaxed">{step.sideNote.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLast && (
          <div className="px-4 py-2.5 border-t border-white/[0.04] flex items-center justify-between">
            <span className="text-[9px] text-white/15 uppercase tracking-widest">Step {step.number} of {step.number}</span>
            <span className="text-[9px] text-yellow-400/40 font-bold uppercase tracking-wider">Verify → continue</span>
          </div>
        )}
      </div>
    </div>
  );
}
