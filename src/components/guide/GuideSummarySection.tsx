import type { GuideSummary } from "@/lib/types/buildGuide";

interface Props {
  summary: GuideSummary;
  finalResultDescription: string;
  finalResultScreenshot: string;
}

export default function GuideSummarySection({ summary, finalResultDescription }: Props) {
  return (
    <div className="space-y-3 pt-2">

      {/* ── COMPLETE banner ── */}
      <div className="bg-yellow-400 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-black/15 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🏆</span>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-black/50">Tutorial Complete</p>
            <h3 className="font-black text-black text-lg leading-tight">You built it.</h3>
          </div>
        </div>
        {finalResultDescription && (
          <div className="bg-black/10 px-5 py-3 border-t border-black/10">
            <p className="text-[11px] text-black/70 leading-relaxed">{finalResultDescription}</p>
          </div>
        )}
      </div>

      {/* What was built */}
      {summary.whatWasBuilt && (
        <div className="bg-[#12151c] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="bg-[#1a2030] border-b border-white/[0.06] px-4 py-2.5">
            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">What Was Built</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed px-4 py-3">{summary.whatWasBuilt}</p>
        </div>
      )}

      {/* Techniques + Takeaways — infographic grid */}
      <div className="grid grid-cols-2 gap-3">
        {summary.techniquesLearned.length > 0 && (
          <div className="bg-[#12151c] border border-blue-400/15 rounded-2xl overflow-hidden">
            <div className="bg-[#0d1220] border-b border-blue-400/10 px-3 py-2.5">
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-blue-400/70">Techniques Learned</span>
            </div>
            <ul className="divide-y divide-white/[0.04]">
              {summary.techniquesLearned.map((t, i) => (
                <li key={i} className="flex items-start gap-2 px-3 py-2">
                  <span className="text-blue-400/60 flex-shrink-0 font-black text-[10px] mt-0.5">✓</span>
                  <span className="text-[11px] text-white/55 leading-snug">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {summary.keyTakeaways.length > 0 && (
          <div className="bg-[#12151c] border border-yellow-400/15 rounded-2xl overflow-hidden">
            <div className="bg-[#1a1500] border-b border-yellow-400/10 px-3 py-2.5">
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-yellow-400/70">Key Takeaways</span>
            </div>
            <ul className="divide-y divide-white/[0.04]">
              {summary.keyTakeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2 px-3 py-2">
                  <span className="text-yellow-400/60 flex-shrink-0 font-black text-[10px] mt-0.5">★</span>
                  <span className="text-[11px] text-white/55 leading-snug">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Related + Next — same grid style */}
      <div className="grid grid-cols-2 gap-3">
        {summary.relatedTechniques.length > 0 && (
          <div className="bg-[#12151c] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="bg-[#1a2030] border-b border-white/[0.06] px-3 py-2.5">
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/30">Related Techniques</span>
            </div>
            <div className="flex flex-wrap gap-1.5 px-3 py-3">
              {summary.relatedTechniques.map((t, i) => (
                <span key={i} className="text-[10px] bg-white/[0.05] border border-white/[0.08] text-white/40 rounded-full px-2.5 py-1">{t}</span>
              ))}
            </div>
          </div>
        )}
        {summary.suggestedNextLessons.length > 0 && (
          <div className="bg-[#12151c] border border-purple-400/15 rounded-2xl overflow-hidden">
            <div className="bg-[#130d1a] border-b border-purple-400/10 px-3 py-2.5">
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-purple-400/70">What to Learn Next</span>
            </div>
            <ul className="divide-y divide-white/[0.04]">
              {summary.suggestedNextLessons.map((l, i) => (
                <li key={i} className="flex items-start gap-2 px-3 py-2">
                  <span className="text-purple-400/60 flex-shrink-0 font-black text-[10px] mt-0.5">→</span>
                  <span className="text-[11px] text-white/55 leading-snug">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
