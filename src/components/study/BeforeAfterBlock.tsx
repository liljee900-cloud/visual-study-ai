import type { BeforeAfter } from "@/lib/types/studyPack";
import ScreenshotPlaceholder from "./ScreenshotPlaceholder";

interface Props {
  items: BeforeAfter[];
}

export default function BeforeAfterBlock({ items }: Props) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-6">
      {items.map((item, i) => (
        <div key={i} className="bg-[#161b22] border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
            <span>🔄</span> {item.label}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
            {/* Before */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-400/70 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                  Before
                </span>
              </div>
              <ScreenshotPlaceholder description={item.before.screenshotPlaceholder} size="sm" />
              <p className="text-xs text-white/50 leading-relaxed">{item.before.description}</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-1 px-2 sm:px-4">
              <div className="hidden sm:block w-px h-8 bg-white/10" />
              <span className="text-white/20 text-xl sm:rotate-0 rotate-90">→</span>
              <div className="hidden sm:block w-px h-8 bg-white/10" />
            </div>

            {/* After */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                  After
                </span>
              </div>
              <ScreenshotPlaceholder description={item.after.screenshotPlaceholder} size="sm" />
              <p className="text-xs text-white/50 leading-relaxed">{item.after.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
