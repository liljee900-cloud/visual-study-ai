import type { CheatSheet } from "@/lib/types/studyPack";
import SectionHeader from "@/components/ui/SectionHeader";
import Callout from "./Callout";

interface Props { cheatSheet: CheatSheet }

function Block({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
      <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

export default function CheatSheetPage({ cheatSheet }: Props) {
  return (
    <div className="space-y-4 animate-fade-in">
      <SectionHeader icon="⚡" title="Cheat Sheet" subtitle="Everything reviewable in under 5 minutes." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Definitions */}
        {cheatSheet.definitions.length > 0 && (
          <Block title="Key Definitions" icon="📖">
            <div className="space-y-3">
              {cheatSheet.definitions.map((d, i) => (
                <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <p className="text-xs font-bold text-yellow-400">{d.term}</p>
                  <p className="text-xs text-white/55 mt-0.5 leading-relaxed">{d.definition}</p>
                </div>
              ))}
            </div>
          </Block>
        )}

        {/* Keyboard shortcuts */}
        {cheatSheet.keyboardShortcuts.length > 0 && (
          <Block title="Keyboard Shortcuts" icon="⌨️">
            <div className="space-y-2">
              {cheatSheet.keyboardShortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-white/55">{s.action}</span>
                  <kbd className="text-xs bg-white/8 border border-white/15 rounded px-2 py-1 text-white font-mono flex-shrink-0">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </Block>
        )}

        {/* Workflow */}
        {cheatSheet.workflow.length > 0 && (
          <Block title="Workflow Order" icon="🔄">
            <ol className="space-y-2">
              {cheatSheet.workflow.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-white/65">
                  <span className="w-5 h-5 rounded-full bg-yellow-400/15 text-yellow-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Block>
        )}

        {/* Important Settings */}
        {cheatSheet.importantSettings.length > 0 && (
          <Block title="Important Settings" icon="⚙️">
            <div className="space-y-2">
              {cheatSheet.importantSettings.map((s, i) => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{s.name}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">{s.note}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-lg flex-shrink-0">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </Block>
        )}

        {/* Best Practices */}
        {cheatSheet.bestPractices.length > 0 && (
          <Block title="Best Practices" icon="⭐">
            <div className="space-y-2">
              {cheatSheet.bestPractices.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-emerald-400 text-sm flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-xs text-white/65 leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </Block>
        )}

        {/* Common Pitfalls */}
        {cheatSheet.commonPitfalls.length > 0 && (
          <Block title="Common Pitfalls" icon="🚫">
            <div className="space-y-2">
              {cheatSheet.commonPitfalls.map((p, i) => (
                <Callout key={i} type="warning" text={p} />
              ))}
            </div>
          </Block>
        )}

        {/* Memory Tricks */}
        {cheatSheet.memoryTricks.length > 0 && (
          <Block title="Memory Tricks" icon="🧠">
            <div className="space-y-2">
              {cheatSheet.memoryTricks.map((t, i) => (
                <Callout key={i} type="remember" text={t} />
              ))}
            </div>
          </Block>
        )}
      </div>
    </div>
  );
}
