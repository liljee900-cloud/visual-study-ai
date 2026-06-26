import Link from "next/link";
import type { NodeIndex } from "@/lib/blender/types";

interface Props { node: NodeIndex; compact?: boolean }

const catColors: Record<string, string> = {
  "geometry-nodes": "bg-blue-400/10 text-blue-400 border-blue-400/20",
  "shader-nodes":   "bg-purple-400/10 text-purple-400 border-purple-400/20",
  "compositor-nodes":"bg-green-400/10 text-green-400 border-green-400/20",
  "texture-nodes":  "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  "simulation-nodes":"bg-red-400/10 text-red-400 border-red-400/20",
};

const nodeColors: Record<string, string> = {
  yellow: "from-yellow-400/8",
  blue:   "from-blue-400/8",
  green:  "from-emerald-400/8",
  red:    "from-red-400/8",
  purple: "from-purple-400/8",
  orange: "from-orange-400/8",
};

export default function NodeCard({ node, compact }: Props) {
  return (
    <Link href={`/blender/nodes/${node.id}`} className="group block">
      <div className={`bg-[#161b22] border border-white/8 hover:border-yellow-400/25 rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(250,204,21,0.05)] ${compact ? "p-4" : "p-0"}`}>
        {!compact && (
          <div className={`bg-gradient-to-r ${nodeColors[node.color] ?? "from-white/3"} to-transparent border-b border-white/5 px-4 py-3 flex items-center gap-3`}>
            <span className="text-2xl">{node.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm truncate group-hover:text-yellow-400 transition-colors">{node.name}</h3>
              <p className="text-[10px] text-white/30 capitalize">{node.subcategory}</p>
            </div>
            <span className="text-white/15 group-hover:text-white/40 transition-colors text-sm">→</span>
          </div>
        )}
        {compact ? (
          <div className="flex items-center gap-2">
            <span className="text-xl">{node.icon}</span>
            <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors truncate">{node.name}</span>
          </div>
        ) : (
          <div className="px-4 py-3">
            <p className="text-xs text-white/45 leading-relaxed line-clamp-2">{node.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${catColors[node.category] ?? "bg-white/5 text-white/30 border-white/10"}`}>
                {node.category.replace("-", " ")}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
