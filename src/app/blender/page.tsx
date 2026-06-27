import Link from "next/link";
import Header from "@/components/layout/Header";
import BlenderSearch from "@/components/blender/BlenderSearch";
import TopicGenerator from "@/components/blender/TopicGenerator";
import { BLENDER_CATEGORIES } from "@/lib/blender/categories";
import { NODE_INDEX, NODES_BY_CATEGORY } from "@/lib/blender/nodes";
import { SHADER_NODE_INDEX } from "@/lib/blender/shader-nodes";
import { COMPOSITOR_NODE_INDEX } from "@/lib/blender/compositor-nodes";
import { MODIFIER_INDEX, MODIFIERS_BY_CATEGORY } from "@/lib/blender/modifiers";
import { EDITOR_INDEX } from "@/lib/blender/editors";

const catColorBg: Record<string, string> = {
  blue: "bg-blue-400/8 border-blue-400/15 hover:border-blue-400/30",
  purple: "bg-purple-400/8 border-purple-400/15 hover:border-purple-400/30",
  green: "bg-emerald-400/8 border-emerald-400/15 hover:border-emerald-400/30",
  yellow: "bg-yellow-400/8 border-yellow-400/15 hover:border-yellow-400/30",
  red: "bg-red-400/8 border-red-400/15 hover:border-red-400/30",
  orange: "bg-orange-400/8 border-orange-400/15 hover:border-orange-400/30",
};

export default function BlenderLibraryPage() {
  const nodeCategories = BLENDER_CATEGORIES.filter(c =>
    ["geometry-nodes","shader-nodes","compositor-nodes","texture-nodes","simulation-nodes"].includes(c.id)
  );
  const otherCategories = BLENDER_CATEGORIES.filter(c =>
    !["geometry-nodes","shader-nodes","compositor-nodes","texture-nodes","simulation-nodes"].includes(c.id)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <div className="border-b border-white/5 bg-gradient-to-b from-[#0d1117] to-[#080a0f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🧊</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black text-white">Blender Knowledge Library</h1>
                <span className="text-xs bg-blue-400/10 border border-blue-400/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">v4.4</span>
              </div>
              <p className="text-white/45 mt-1">Your personal Blender textbook — searchable nodes, tools, workflows, and AI-generated lessons.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-6 mb-8">
            {[
              { label: "Geometry Nodes", value: NODE_INDEX.length },
              { label: "Shader Nodes", value: SHADER_NODE_INDEX.length },
              { label: "Compositor Nodes", value: COMPOSITOR_NODE_INDEX.length },
              { label: "Modifiers", value: MODIFIER_INDEX.length },
              { label: "Editors", value: EDITOR_INDEX.length },
              { label: "Blender version", value: "4.4" },
            ].map(s => (
              <div key={s.label} className="bg-white/3 border border-white/8 rounded-xl px-4 py-2.5">
                <p className="text-lg font-black text-yellow-400">{s.value}</p>
                <p className="text-xs text-white/35">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <BlenderSearch />
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 space-y-12">

        {/* AI Topic Generator */}
        <TopicGenerator />

        {/* Node Library */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>🔷</span> Node Library
            </h2>
            <Link href="/blender/nodes" className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
              View all nodes →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nodeCategories.map(cat => {
              const nodes = NODES_BY_CATEGORY[cat.id] ?? [];
              return (
                <Link key={cat.id} href={`/blender/category/${cat.id}`}
                  className={`block border rounded-2xl p-5 transition-all ${catColorBg[cat.color] ?? "bg-white/3 border-white/10"}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h3 className="font-bold text-white">{cat.name}</h3>
                      <p className="text-xs text-white/35">{nodes.length} nodes documented</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/45 leading-relaxed mb-3">{cat.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {cat.topics.slice(0,4).map(t => (
                      <span key={t} className="text-[10px] bg-white/5 border border-white/8 text-white/30 rounded-full px-2 py-0.5">{t}</span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Modifier Library */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>⚙️</span> Modifier Reference
            </h2>
            <Link href="/blender/modifiers" className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
              View all {MODIFIER_INDEX.length} modifiers →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["generate","deform","modify","physics"] as const).map(cat => (
              <div key={cat} className="bg-[#161b22] border border-white/8 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 capitalize">{cat}</p>
                <p className="text-2xl font-black text-white">{MODIFIERS_BY_CATEGORY[cat].length}</p>
                <p className="text-xs text-white/30 mt-1">modifiers</p>
              </div>
            ))}
          </div>
          <Link href="/blender/modifiers" className="mt-3 block text-center bg-white/4 hover:bg-white/8 border border-white/8 rounded-xl py-3 text-sm text-white/50 hover:text-white transition-all">
            Browse Array, Bevel, Boolean, Subdivision Surface, Cloth, and more →
          </Link>
        </section>

        {/* Editor Reference */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>🖥️</span> Editor Reference
            </h2>
            <Link href="/blender/editors" className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
              View all {EDITOR_INDEX.length} editors →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EDITOR_INDEX.slice(0, 8).map(e => (
              <Link key={e.id} href={`/blender/editors/${e.id}`}
                className="group bg-[#161b22] border border-white/8 hover:border-yellow-400/20 rounded-xl p-3 flex items-center gap-2 transition-all">
                <span className="text-xl">{e.icon}</span>
                <span className="text-xs font-semibold text-white/70 group-hover:text-yellow-400 transition-colors truncate">{e.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* All Blender Categories */}
        <section>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mb-5">
            <span>📚</span> Blender Reference Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {otherCategories.map(cat => (
              <Link key={cat.id} href={`/blender/category/${cat.id}`}
                className="group bg-[#161b22] border border-white/8 hover:border-yellow-400/20 rounded-xl p-4 flex flex-col gap-2 transition-all">
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors leading-tight">{cat.name}</h3>
                <p className="text-[10px] text-white/30 leading-relaxed line-clamp-2">{cat.description}</p>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
