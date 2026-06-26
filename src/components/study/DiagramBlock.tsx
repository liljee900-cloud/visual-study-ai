import type { Diagram } from "@/lib/types/studyPack";

interface Props {
  diagram: Diagram;
}

const NODE_COLORS = [
  "border-yellow-400/40 bg-yellow-400/8 text-yellow-300",
  "border-blue-400/40 bg-blue-400/8 text-blue-300",
  "border-purple-400/40 bg-purple-400/8 text-purple-300",
  "border-emerald-400/40 bg-emerald-400/8 text-emerald-300",
  "border-orange-400/40 bg-orange-400/8 text-orange-300",
  "border-pink-400/40 bg-pink-400/8 text-pink-300",
];

export default function DiagramBlock({ diagram }: Props) {
  return (
    <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">🔀</span>
        <h3 className="font-bold text-white text-sm">{diagram.title}</h3>
      </div>

      {/* Flow diagram */}
      <div className="flex flex-col items-center gap-0">
        {diagram.nodes.map((node, i) => (
          <div key={i} className="flex flex-col items-center w-full max-w-xs">
            {/* Node box */}
            <div
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${NODE_COLORS[i % NODE_COLORS.length]}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white/10 text-[10px] font-black text-white flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold">{node}</span>
              </div>
              {i === 0 && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/40">INPUT</span>
              )}
              {i === diagram.nodes.length - 1 && (
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/40">OUTPUT</span>
              )}
            </div>

            {/* Connector arrow */}
            {i < diagram.nodes.length - 1 && (
              <div className="flex flex-col items-center py-1 text-white/20">
                <div className="w-px h-3 bg-white/15" />
                <span className="text-xs leading-none">▼</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {diagram.description && (
        <p className="text-xs text-white/35 text-center mt-4 leading-relaxed">{diagram.description}</p>
      )}
    </div>
  );
}
