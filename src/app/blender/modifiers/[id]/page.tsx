import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Callout from "@/components/study/Callout";
import { WorkflowSVG } from "@/components/blender/NodeSVG";
import { MODIFIER_MAP, MODIFIER_INDEX } from "@/lib/blender/modifiers";

const accentMap: Record<string, string> = {
  yellow: "border-yellow-400/20 bg-yellow-400/5",
  blue:   "border-blue-400/20 bg-blue-400/5",
  green:  "border-emerald-400/20 bg-emerald-400/5",
  red:    "border-red-400/20 bg-red-400/5",
  purple: "border-purple-400/20 bg-purple-400/5",
  orange: "border-orange-400/20 bg-orange-400/5",
};

const paramTypeBadge: Record<string, string> = {
  float:  "bg-blue-400/10 text-blue-300 border-blue-400/20",
  int:    "bg-green-400/10 text-green-300 border-green-400/20",
  bool:   "bg-pink-400/10 text-pink-300 border-pink-400/20",
  enum:   "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
  object: "bg-purple-400/10 text-purple-300 border-purple-400/20",
  collection: "bg-orange-400/10 text-orange-300 border-orange-400/20",
  string: "bg-white/10 text-white/50 border-white/20",
  vector: "bg-teal-400/10 text-teal-300 border-teal-400/20",
};

export async function generateStaticParams() {
  return MODIFIER_INDEX.map(m => ({ id: m.id }));
}

export default async function ModifierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mod = MODIFIER_MAP[id];
  if (!mod) notFound();

  const accent = accentMap[mod.color] ?? accentMap.blue;
  const relatedMods = mod.relatedModifiers.map(rid => MODIFIER_MAP[rid]).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-white/5 bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-white/30">
          <Link href="/blender" className="hover:text-white/60 transition-colors">Library</Link>
          <span>/</span>
          <Link href="/blender/modifiers" className="hover:text-white/60 transition-colors">Modifiers</Link>
          <span>/</span>
          <span className="text-white/60">{mod.name}</span>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Header card */}
        <div className={`border rounded-2xl p-6 ${accent}`}>
          <div className="flex items-start gap-4">
            <span className="text-4xl">{mod.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-black text-white">{mod.name}</h1>
                <span className="text-xs bg-white/8 border border-white/10 text-white/40 rounded-full px-2.5 py-1 capitalize">
                  {mod.category} Modifier
                </span>
                <span className="text-xs bg-white/8 border border-white/10 text-white/40 rounded-full px-2.5 py-1">
                  Blender {mod.blenderVersion}+
                </span>
              </div>
              <p className="text-white/65 leading-relaxed">{mod.description}</p>
            </div>
          </div>
        </div>

        {/* Modifier visual card */}
        <div className={`border rounded-2xl overflow-hidden ${accent}`}>
          {/* Header */}
          <div className="px-5 py-3 border-b border-white/8 flex items-center gap-3">
            <span className="text-2xl">{mod.icon}</span>
            <div>
              <p className="text-xs font-bold text-white/70">{mod.name}</p>
              <p className="text-[10px] text-white/30 capitalize">{mod.category} Modifier · Blender {mod.blenderVersion}+</p>
            </div>
          </div>

          {/* Parameters visual */}
          {mod.parameters.length > 0 && (
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Parameters</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mod.parameters.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 bg-black/20 rounded-xl px-3 py-2">
                    <span className={`text-[9px] font-bold border rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5 ${paramTypeBadge[p.type] ?? "bg-white/10 text-white/40 border-white/15"}`}>
                      {p.type}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/85 truncate">{p.name}
                        {p.default && <span className="ml-2 font-mono text-white/35 font-normal">{p.default}</span>}
                      </p>
                      <p className="text-[10px] text-white/40 leading-relaxed truncate">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workflow diagram */}
          <div className="px-5 pb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Typical Workflow</p>
            <div className="bg-black/30 rounded-xl p-3 overflow-x-auto">
              <WorkflowSVG steps={["Base Mesh", `${mod.name}`, "Result"]} />
            </div>
          </div>
        </div>

        {/* Why / When */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/60 mb-2">Why it exists</p>
            <p className="text-sm text-white/70 leading-relaxed">{mod.whyItExists}</p>
          </div>
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60 mb-2">When to use it</p>
            <p className="text-sm text-white/70 leading-relaxed">{mod.whenToUse}</p>
          </div>
        </div>

        {/* Beginner / Advanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-400/5 border border-green-400/15 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-400/60 mb-3">🟢 Beginner</p>
            <p className="text-sm text-white/75 leading-relaxed italic">&ldquo;{mod.beginnerExplanation}&rdquo;</p>
          </div>
          <div className="bg-purple-400/5 border border-purple-400/15 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400/60 mb-3">🟣 Advanced</p>
            <p className="text-sm text-white/75 leading-relaxed">{mod.advancedExplanation}</p>
          </div>
        </div>

        {/* Parameters */}
        {mod.parameters.length > 0 && (
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">⚙️ Parameters</p>
            <div className="space-y-3">
              {mod.parameters.map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5 ${paramTypeBadge[p.type] ?? paramTypeBadge.string}`}>
                    {p.type}
                  </span>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-white">{p.name}</span>
                      {p.default && <span className="text-[10px] font-mono text-white/30">default: {p.default}</span>}
                      {p.range && <span className="text-[10px] font-mono text-white/25">range: {p.range}</span>}
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed mt-0.5">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Use cases */}
        <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Common Use Cases</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mod.commonUseCases.map((uc, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/65">
                <span className="text-yellow-400 flex-shrink-0 mt-0.5">→</span>{uc}
              </div>
            ))}
          </div>
        </div>

        {/* Example workflow */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">📋 Example Workflow</p>
          <p className="text-sm text-white/70 font-mono leading-relaxed">{mod.exampleWorkflow}</p>
        </div>

        {/* Mistakes + Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-2">⚠️ Common Mistakes</p>
            {mod.commonMistakes.map((m, i) => <Callout key={i} type="warning" text={m} />)}
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60 mb-2">💡 Performance Tips</p>
            {mod.performanceTips.map((t, i) => <Callout key={i} type="tip" text={t} />)}
          </div>
        </div>

        {/* Quiz */}
        {mod.quiz.length > 0 && (
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">🧠 Quick Quiz</p>
            <div className="space-y-4">
              {mod.quiz.map((q, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-white/70 hover:text-white transition-colors list-none">
                    <span className="w-5 h-5 rounded-full bg-yellow-400/15 text-yellow-400 text-[10px] flex items-center justify-center flex-shrink-0 font-bold">Q</span>
                    {q.question}
                  </summary>
                  <div className="mt-2 ml-7 text-sm text-emerald-300/80 bg-emerald-400/5 border border-emerald-400/15 rounded-xl px-4 py-3">
                    ✓ {q.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Practice */}
        <Callout type="best-practice" text={`Practice: ${mod.practiceExercise}`} />

        {/* Related */}
        {relatedMods.length > 0 && (
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Related Modifiers</p>
            <div className="flex flex-wrap gap-2">
              {relatedMods.map(m => (
                <Link key={m.id} href={`/blender/modifiers/${m.id}`}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-yellow-400 transition-colors bg-white/4 border border-white/8 rounded-xl px-3 py-2">
                  <span>{m.icon}</span><span>{m.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {mod.tags.map(t => (
            <span key={t} className="text-xs bg-white/4 border border-white/8 text-white/30 rounded-full px-3 py-1">{t}</span>
          ))}
        </div>

      </main>
    </div>
  );
}
