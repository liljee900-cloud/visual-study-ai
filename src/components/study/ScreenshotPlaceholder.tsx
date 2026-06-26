interface Props {
  description: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  timestamp?: string;
  screenshotUrl?: string;   // real extracted frame — shows instead of placeholder
  stepNumber?: number;
  editor?: string;
}

const sizes = {
  sm: "min-h-[120px]",
  md: "min-h-[180px]",
  lg: "min-h-[240px]",
};

export default function ScreenshotPlaceholder({
  description,
  label,
  size = "md",
  timestamp,
  screenshotUrl,
  stepNumber,
  editor,
}: Props) {
  // ── Real screenshot ───────────────────────────────────────────────────────
  if (screenshotUrl) {
    return (
      <div className={`relative w-full ${sizes[size]} rounded-xl overflow-hidden bg-black`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={screenshotUrl} alt={description} className="w-full h-full object-cover" />
        {label && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
            <p className="text-[10px] text-white/60 font-mono">{label}</p>
          </div>
        )}
        {timestamp && (
          <div className="absolute top-2 right-2 bg-black/60 rounded-md px-2 py-0.5">
            <p className="text-[10px] text-white/50 font-mono">{timestamp}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Premium viewport-style placeholder ───────────────────────────────────
  return (
    <div className={`relative w-full ${sizes[size]} rounded-xl overflow-hidden bg-[#0a0d14] border border-white/[0.06]`}>

      {/* Blender-dark viewport dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #6b7280 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Viewport header bar */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-[#141820]/95 border-b border-white/[0.05] flex items-center px-2.5 gap-2 z-10">
        {editor && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-blue-300/50">{editor}</span>
        )}
        {stepNumber != null && !editor && (
          <span className="text-[9px] font-mono text-white/20">Step {stepNumber}</span>
        )}
        {stepNumber != null && editor && (
          <span className="ml-auto text-[9px] font-mono text-white/15">Step {stepNumber}</span>
        )}
        {timestamp && (
          <span className="ml-auto text-[9px] font-mono text-white/15">{timestamp}</span>
        )}
      </div>

      {/* Description as viewport annotation */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-6 pt-7 pb-3">
        <p className="text-xs text-white/50 leading-relaxed text-center max-w-sm font-medium">
          {description}
        </p>
        <div className="flex items-center gap-2.5">
          <div className="h-px w-6 bg-white/10" />
          <span className="text-[9px] font-mono text-white/15 uppercase tracking-[0.15em]">
            {label ?? "Visual Reference"}
          </span>
          <div className="h-px w-6 bg-white/10" />
        </div>
      </div>

      {/* Corner crosshairs */}
      <div className="absolute top-7 left-2 w-3 h-3 border-t border-l border-white/[0.08]" />
      <div className="absolute top-7 right-2 w-3 h-3 border-t border-r border-white/[0.08]" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/[0.08]" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/[0.08]" />
    </div>
  );
}
