import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import ScreenshotPlaceholder from "@/components/study/ScreenshotPlaceholder";
import Callout from "@/components/study/Callout";
import DiagramBlock from "@/components/study/DiagramBlock";
import { NODE_MAP, NODE_INDEX } from "@/lib/blender/nodes";

const socketTypeColors: Record<string, string> = {
  Geometry: "bg-teal-400/15 text-teal-300 border-teal-400/25",
  Float:    "bg-gray-400/15 text-gray-300 border-gray-400/25",
  Integer:  "bg-green-400/15 text-green-300 border-green-400/25",
  Boolean:  "bg-pink-400/15 text-pink-300 border-pink-400/25",
  Vector:   "bg-blue-400/15 text-blue-300 border-blue-400/25",
  Color:    "bg-yellow-400/15 text-yellow-300 border-yellow-400/25",
  Shader:   "bg-purple-400/15 text-purple-300 border-purple-400/25",
  Rotation: "bg-orange-400/15 text-orange-300 border-orange-400/25",
  Material: "bg-red-400/15 text-red-300 border-red-400/25",
  Object:   "bg-indigo-400/15 text-indigo-300 border-indigo-400/25",
  Image:    "bg-emerald-400/15 text-emerald-300 border-emerald-400/25",
};

const nodeColorAccent: Record<string, string> = {
  yellow: "border-yellow-400/20 bg-yellow-400/5",
  blue:   "border-blue-400/20 bg-blue-400/5",
  green:  "border-emerald-400/20 bg-emerald-400/5",
  red:    "border-red-400/20 bg-red-400/5",
  purple: "border-purple-400/20 bg-purple-400/5",
  orange: "border-orange-400/20 bg-orange-400/5",
};

export async function generateStaticParams() {
  return NODE_INDEX.map(n => ({ id: n.id }));
}

export default async function NodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const node = NODE_MAP[id];
  if (!node) notFound();

  const relatedNodes = node.relatedNodes.map(id => NODE_MAP[id]).filter(Boolean);
  const usedWithNodes = node.frequentlyUsedWith.map(id => NODE_MAP[id]).filter(Boolean);
  const accent = nodeColorAccent[node.color] ?? nodeColorAccent.yellow;
  const socketCls = (type: string) => socketTypeColors[type] ?? "bg-white/10 text-white/50 border-white/15";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-white/5 bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-white/30">
          <Link href="/blender" className="hover:text-white/60 transition-colors">Library</Link>
          <span>/</span>
          <Link href="/blender/nodes" className="hover:text-white/60 transition-colors">Nodes</Link>
          <span>/</span>
          <span className="text-white/60">{node.name}</span>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Header card */}
        <div className={`border rounded-2xl p-6 ${accent}`}>
          <div className="flex items-start gap-4">
            <span className="text-4xl">{node.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-black text-white">{node.name}</h1>
                <span className="text-xs bg-white/8 border border-white/10 text-white/40 rounded-full px-2.5 py-1">
                  {node.category.replace(/-/g, " ")}
                </span>
                <span className="text-xs bg-white/8 border border-white/10 text-white/40 rounded-full px-2.5 py-1">
                  {node.subcategory}
                </span>
                <span className="text-xs bg-white/8 border border-white/10 text-white/40 rounded-full px-2.5 py-1">
                  Blender {node.blenderVersion}
                </span>
              </div>
              <p className="text-white/65 leading-relaxed">{node.description}</p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder description={node.screenshotPlaceholder} size="lg" label={node.name} />

        {/* Quick summary grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/60 mb-2">Why it exists</p>
            <p className="text-sm text-white/70 leading-relaxed">{node.whyItExists}</p>
          </div>
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60 mb-2">When to use it</p>
            <p className="text-sm text-white/70 leading-relaxed">{node.whenToUse}</p>
          </div>
        </div>

        {/* Beginner / Advanced explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-400/5 border border-green-400/15 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-400/60 mb-3">🟢 Beginner</p>
            <p className="text-sm text-white/75 leading-relaxed italic">&ldquo;{node.beginnerExplanation}&rdquo;</p>
          </div>
          <div className="bg-purple-400/5 border border-purple-400/15 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400/60 mb-3">🟣 Advanced</p>
            <p className="text-sm text-white/75 leading-relaxed">{node.advancedExplanation}</p>
          </div>
        </div>

        {/* Inputs / Outputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Inputs</p>
            {node.inputs.length === 0 ? (
              <p className="text-xs text-white/25 italic">No inputs</p>
            ) : (
              <div className="space-y-3">
                {node.inputs.map((inp, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5 ${socketCls(inp.type)}`}>{inp.type}</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{inp.name}{inp.default && <span className="ml-2 text-white/30 font-normal font-mono">{inp.default}</span>}</p>
                      <p className="text-xs text-white/40 leading-relaxed">{inp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Outputs</p>
            {node.outputs.length === 0 ? (
              <p className="text-xs text-white/25 italic">No outputs</p>
            ) : (
              <div className="space-y-3">
                {node.outputs.map((out, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5 ${socketCls(out.type)}`}>{out.type}</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{out.name}</p>
                      <p className="text-xs text-white/40 leading-relaxed">{out.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Workflow diagram */}
        {node.typicalConnections.length > 0 && (
          <DiagramBlock diagram={{ title: "Typical Node Connections", nodes: node.typicalConnections }} />
        )}

        {/* Common use cases */}
        <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Common Use Cases</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {node.commonUseCases.map((uc, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/65">
                <span className="text-yellow-400 flex-shrink-0 mt-0.5">→</span>{uc}
              </div>
            ))}
          </div>
        </div>

        {/* Example workflow */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Example Workflow</p>
          <p className="text-sm text-white/70 font-mono leading-relaxed">{node.exampleWorkflow}</p>
        </div>

        {/* Common mistakes + Performance tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            {node.commonMistakes.map((m, i) => <Callout key={i} type="warning" text={m} />)}
          </div>
          <div className="space-y-2">
            {node.performanceTips.map((t, i) => <Callout key={i} type="tip" text={t} />)}
          </div>
        </div>

        {/* Quiz */}
        {node.quiz.length > 0 && (
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">🧠 Quick Quiz</p>
            <div className="space-y-4">
              {node.quiz.map((q, i) => (
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

        {/* Practice exercise */}
        <Callout type="best-practice" text={`Practice: ${node.practiceExercise}`} />

        {/* Related & used with */}
        {(relatedNodes.length > 0 || usedWithNodes.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedNodes.length > 0 && (
              <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Related Nodes</p>
                <div className="space-y-2">
                  {relatedNodes.map(n => (
                    <Link key={n.id} href={`/blender/nodes/${n.id}`}
                      className="flex items-center gap-2 text-sm text-white/60 hover:text-yellow-400 transition-colors">
                      <span>{n.icon}</span><span>{n.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {usedWithNodes.length > 0 && (
              <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Frequently Used With</p>
                <div className="space-y-2">
                  {usedWithNodes.map(n => (
                    <Link key={n.id} href={`/blender/nodes/${n.id}`}
                      className="flex items-center gap-2 text-sm text-white/60 hover:text-yellow-400 transition-colors">
                      <span>{n.icon}</span><span>{n.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {node.tags.map(t => (
            <span key={t} className="text-xs bg-white/4 border border-white/8 text-white/30 rounded-full px-3 py-1">{t}</span>
          ))}
        </div>

      </main>
    </div>
  );
}
