import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import ScreenshotPlaceholder from "@/components/study/ScreenshotPlaceholder";
import Callout from "@/components/study/Callout";
import { EDITOR_MAP, EDITOR_INDEX } from "@/lib/blender/editors";

const accentMap: Record<string, string> = {
  yellow: "border-yellow-400/20 bg-yellow-400/5",
  blue:   "border-blue-400/20 bg-blue-400/5",
  green:  "border-emerald-400/20 bg-emerald-400/5",
  red:    "border-red-400/20 bg-red-400/5",
  purple: "border-purple-400/20 bg-purple-400/5",
  orange: "border-orange-400/20 bg-orange-400/5",
};

export async function generateStaticParams() {
  return EDITOR_INDEX.map(e => ({ id: e.id }));
}

export default async function EditorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const editor = EDITOR_MAP[id];
  if (!editor) notFound();

  const relatedEditors = editor.relatedEditors.map(eid => EDITOR_MAP[eid]).filter(Boolean);
  const accent = accentMap[editor.color] ?? accentMap.blue;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="border-b border-white/5 bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-white/30">
          <Link href="/blender" className="hover:text-white/60 transition-colors">Library</Link>
          <span>/</span>
          <Link href="/blender/editors" className="hover:text-white/60 transition-colors">Editors</Link>
          <span>/</span>
          <span className="text-white/60">{editor.name}</span>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className={`border rounded-2xl p-6 ${accent}`}>
          <div className="flex items-start gap-4">
            <span className="text-4xl">{editor.icon}</span>
            <div>
              <h1 className="text-2xl font-black text-white">{editor.name}</h1>
              <p className="text-white/60 mt-1 leading-relaxed">{editor.purpose}</p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder description={editor.screenshotPlaceholder} size="lg" label={editor.name} />

        {/* What you can do */}
        <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">What You Can Do Here</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {editor.whatYouCanDo.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/65">
                <span className="text-yellow-400 flex-shrink-0 mt-0.5">✓</span>{w}
              </div>
            ))}
          </div>
        </div>

        {/* Beginner / Advanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-400/5 border border-green-400/15 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-400/60 mb-3">🟢 Beginner</p>
            <p className="text-sm text-white/75 leading-relaxed italic">&ldquo;{editor.beginnerExplanation}&rdquo;</p>
          </div>
          <div className="bg-purple-400/5 border border-purple-400/15 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400/60 mb-3">🟣 Advanced</p>
            <p className="text-sm text-white/75 leading-relaxed">{editor.advancedExplanation}</p>
          </div>
        </div>

        {/* Key areas */}
        {editor.keyAreas.length > 0 && (
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Key Areas</p>
            <div className="space-y-3">
              {editor.keyAreas.map((area, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs bg-white/5 border border-white/10 text-white/40 rounded px-2 py-0.5 flex-shrink-0 mt-0.5">{area.location}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{area.name}</p>
                    <p className="text-xs text-white/40 leading-relaxed">{area.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common workflows */}
        {editor.commonWorkflows.length > 0 && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Common Workflows</p>
            <ul className="space-y-2">
              {editor.commonWorkflows.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/65 font-mono">
                  <span className="text-yellow-400 flex-shrink-0 mt-0.5">→</span>{w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Shortcuts */}
        {editor.shortcuts.length > 0 && (
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">⌨️ Shortcuts</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {editor.shortcuts.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <kbd className="text-[10px] font-bold bg-white/8 border border-white/15 rounded px-2 py-0.5 text-white/70 flex-shrink-0">{s.key}</kbd>
                  <span className="text-xs text-white/50">{s.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips + Mistakes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60 mb-2">💡 Tips</p>
            {editor.tips.map((t, i) => <Callout key={i} type="tip" text={t} />)}
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-2">⚠️ Common Mistakes</p>
            {editor.commonMistakes.map((m, i) => <Callout key={i} type="warning" text={m} />)}
          </div>
        </div>

        {/* Related editors */}
        {relatedEditors.length > 0 && (
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Related Editors</p>
            <div className="flex flex-wrap gap-2">
              {relatedEditors.map(e => (
                <Link key={e.id} href={`/blender/editors/${e.id}`}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-yellow-400 transition-colors bg-white/4 border border-white/8 rounded-xl px-3 py-2">
                  <span>{e.icon}</span><span>{e.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {editor.tags.map(t => (
            <span key={t} className="text-xs bg-white/4 border border-white/8 text-white/30 rounded-full px-3 py-1">{t}</span>
          ))}
        </div>

      </main>
    </div>
  );
}
