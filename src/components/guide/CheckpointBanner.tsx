import type { Checkpoint } from "@/lib/types/buildGuide";

interface Props {
  checkpoint: Checkpoint;
}

export default function CheckpointBanner({ checkpoint }: Props) {
  return (
    <div className="my-5 bg-[#12151c] border-2 border-yellow-400/30 rounded-2xl overflow-hidden">

      {/* Header bar */}
      <div className="bg-yellow-400 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center flex-shrink-0">
          <span className="text-black font-black text-sm">✓</span>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-black/60">Checkpoint</p>
          <h3 className="font-black text-black text-sm leading-tight">{checkpoint.title}</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-white/55 leading-relaxed">{checkpoint.description}</p>

        {/* Verification checklist — node-box style */}
        {checkpoint.verificationPoints.length > 0 && (
          <div className="bg-[#0d1017] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="bg-[#1a2030] border-b border-white/[0.06] px-3 py-2">
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-yellow-400/80">Verify Before Continuing</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {checkpoint.verificationPoints.map((pt, i) => (
                <label key={i} className="flex items-start gap-3 px-3 py-2.5 cursor-pointer group hover:bg-white/[0.02] transition-colors">
                  <div className="w-4 h-4 mt-0.5 rounded border border-white/15 bg-white/[0.04] flex-shrink-0 group-hover:border-yellow-400/40 transition-colors" />
                  <span className="text-[11px] text-white/55 group-hover:text-white/75 transition-colors leading-relaxed">{pt}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Common issues */}
        {checkpoint.commonIssues.length > 0 && (
          <div className="bg-[#0d1017] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="bg-[#1a2030] border-b border-white/[0.06] px-3 py-2">
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-red-400/70">If Something Looks Wrong</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {checkpoint.commonIssues.map((issue, i) => (
                <div key={i} className="px-3 py-2.5 flex items-start gap-2">
                  <span className="text-red-400/60 text-[10px] flex-shrink-0 mt-0.5 font-black">!</span>
                  <div>
                    <p className="text-[11px] font-bold text-red-300/70 leading-snug">{issue.issue}</p>
                    <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">Fix: {issue.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
