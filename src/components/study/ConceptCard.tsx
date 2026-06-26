import type { Concept } from "@/lib/types/studyPack";
import NumberBadge from "@/components/ui/NumberBadge";

interface Props {
  concept: Concept;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</p>
      <div className="text-sm text-white/80 leading-relaxed">{children}</div>
    </div>
  );
}

export default function ConceptCard({ concept }: Props) {
  return (
    <div className="bg-[#161b22] border border-white/10 hover:border-yellow-400/20 rounded-2xl overflow-hidden transition-colors group">
      {/* Card header */}
      <div className="bg-gradient-to-r from-yellow-400/8 to-transparent border-b border-white/5 px-5 py-4 flex items-center gap-3">
        <NumberBadge number={concept.number} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base leading-tight">{concept.name}</h3>
        </div>
        <span className="text-2xl">{concept.icon}</span>
      </div>

      {/* Screenshot placeholder */}
      {concept.screenshotPlaceholder && (
        <div className="mx-4 mt-4 bg-white/3 border border-dashed border-white/10 rounded-xl px-4 py-5 flex items-center gap-3 text-white/30">
          <span className="text-xl">🖼</span>
          <div>
            <p className="text-xs font-medium text-white/40">Screenshot Placeholder</p>
            <p className="text-xs mt-0.5">{concept.screenshotPlaceholder}</p>
          </div>
        </div>
      )}

      {/* Content grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Row label="What it is">
          <p className="italic text-white/60">&ldquo;{concept.beginnerExplanation}&rdquo;</p>
        </Row>

        <Row label="What it does">{concept.whatItDoes}</Row>

        <Row label="Why it matters">{concept.whyItMatters}</Row>

        <Row label="When to use">{concept.whenToUse}</Row>

        <div className="sm:col-span-2">
          <Row label="Example">
            <div className="bg-white/3 border border-white/8 rounded-lg px-3 py-2 font-mono text-xs text-white/70 leading-relaxed">
              {concept.example}
            </div>
          </Row>
        </div>

        {concept.commonMistakes.length > 0 && (
          <Row label="Common mistakes">
            <ul className="space-y-1">
              {concept.commonMistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✗</span>
                  {m}
                </li>
              ))}
            </ul>
          </Row>
        )}

        <Row label="Pro tip">
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 flex-shrink-0">💡</span>
            <span className="text-yellow-200/80">{concept.proTip}</span>
          </div>
        </Row>
      </div>
    </div>
  );
}
