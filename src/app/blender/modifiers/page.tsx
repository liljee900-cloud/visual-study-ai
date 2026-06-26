import Link from "next/link";
import Header from "@/components/layout/Header";
import { MODIFIER_INDEX, MODIFIERS_BY_CATEGORY } from "@/lib/blender/modifiers";

const catLabel: Record<string, string> = {
  generate: "Generate",
  deform: "Deform",
  modify: "Modify",
  physics: "Physics",
};

const catIcon: Record<string, string> = {
  generate: "🏗️",
  deform: "🌀",
  modify: "🔧",
  physics: "⚛️",
};

const catColor: Record<string, string> = {
  generate: "border-blue-400/20 bg-blue-400/5",
  deform:   "border-orange-400/20 bg-orange-400/5",
  modify:   "border-purple-400/20 bg-purple-400/5",
  physics:  "border-green-400/20 bg-green-400/5",
};

const itemColor: Record<string, string> = {
  yellow: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
  blue:   "bg-blue-400/10 text-blue-300 border-blue-400/20",
  green:  "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  red:    "bg-red-400/10 text-red-300 border-red-400/20",
  purple: "bg-purple-400/10 text-purple-300 border-purple-400/20",
  orange: "bg-orange-400/10 text-orange-300 border-orange-400/20",
};

export default function ModifiersPage() {
  const categories = ["generate", "deform", "modify", "physics"] as const;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <div className="border-b border-white/5 bg-gradient-to-b from-[#0d1117] to-[#080a0f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/blender" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Library</Link>
            <span className="text-white/15">/</span>
            <span className="text-white/50 text-sm">Modifiers</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl">⚙️</span>
            <div>
              <h1 className="text-2xl font-black text-white">Modifier Reference</h1>
              <p className="text-white/40 mt-1">{MODIFIER_INDEX.length} modifiers across 4 categories — all fully documented.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        {categories.map(cat => {
          const mods = MODIFIERS_BY_CATEGORY[cat];
          return (
            <section key={cat}>
              <div className={`border rounded-xl px-4 py-3 flex items-center gap-2 mb-4 ${catColor[cat]}`}>
                <span>{catIcon[cat]}</span>
                <h2 className="font-black text-white">{catLabel[cat]} Modifiers</h2>
                <span className="text-xs text-white/30 ml-auto">{mods.length} modifiers</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mods.map(m => (
                  <Link key={m.id} href={`/blender/modifiers/${m.id}`}
                    className="group bg-[#161b22] border border-white/8 hover:border-white/20 rounded-xl p-4 flex items-start gap-3 transition-all">
                    <span className="text-xl flex-shrink-0 mt-0.5">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors">{m.name}</span>
                        <span className={`text-[9px] font-bold border rounded px-1.5 py-0.5 ${itemColor[m.color] ?? itemColor.blue}`}>
                          {cat.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{m.description}</p>
                    </div>
                    <span className="text-white/15 group-hover:text-white/40 text-xs flex-shrink-0">→</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
