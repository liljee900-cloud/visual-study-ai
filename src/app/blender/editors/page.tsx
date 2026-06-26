import Link from "next/link";
import Header from "@/components/layout/Header";
import { EDITOR_INDEX } from "@/lib/blender/editors";

const colorMap: Record<string, string> = {
  yellow: "border-yellow-400/15 hover:border-yellow-400/30",
  blue:   "border-blue-400/15 hover:border-blue-400/30",
  green:  "border-emerald-400/15 hover:border-emerald-400/30",
  red:    "border-red-400/15 hover:border-red-400/30",
  purple: "border-purple-400/15 hover:border-purple-400/30",
  orange: "border-orange-400/15 hover:border-orange-400/30",
};

export default function EditorsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="border-b border-white/5 bg-gradient-to-b from-[#0d1117] to-[#080a0f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/blender" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Library</Link>
            <span className="text-white/15">/</span>
            <span className="text-white/50 text-sm">Editors</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl">🖥️</span>
            <div>
              <h1 className="text-2xl font-black text-white">Blender Editors</h1>
              <p className="text-white/40 mt-1">{EDITOR_INDEX.length} editors — from the 3D Viewport to the Python Console.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EDITOR_INDEX.map(e => (
            <Link key={e.id} href={`/blender/editors/${e.id}`}
              className={`group bg-[#161b22] border rounded-2xl p-5 flex items-start gap-4 transition-all ${colorMap[e.color] ?? colorMap.blue}`}>
              <span className="text-3xl flex-shrink-0">{e.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white group-hover:text-yellow-400 transition-colors mb-1">{e.name}</h3>
                <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{e.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {e.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[9px] bg-white/5 border border-white/8 text-white/25 rounded-full px-2 py-0.5">{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
