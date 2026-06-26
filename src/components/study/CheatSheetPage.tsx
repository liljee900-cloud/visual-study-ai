import type { CheatSheet } from "@/lib/types/studyPack";
import SectionHeader from "@/components/ui/SectionHeader";

interface Props {
  cheatSheet: CheatSheet;
}

function Block({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#161b22] border border-white/10 rounded-2xl p-5">
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
      <SectionHeader
        icon="⚡"
        title="Cheat Sheet"
        subtitle="Everything you need to know — reviewable in under 5 minutes."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Definitions */}
        {cheatSheet.definitions.length > 0 && (
          <Block title="Key Definitions" icon="📖">
            <div className="space-y-3">
              {cheatSheet.definitions.map((d, i) => (
                <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <p className="text-xs font-bold text-yellow-400">{d.term}</p>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{d.definition}</p>
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
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-white/60">{s.action}</span>
                  <kbd className="text-xs bg-white/8 border border-white/15 rounded px-2 py-0.5 text-white font-mono">
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
                <li key={i} className="flex items-start gap-2.5 text-xs text-white/70">
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
            <div className="space-y-2.5">
              {cheatSheet.importantSettings.map((s, i) => (
                <div key={i} className="bg-white/3 border border-white/8 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{s.name}</span>
                    <span className="text-xs font-mono text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                      {s.value}
                    </span>
                  </div>
                  <p className="text-xs text-white/45">{s.note}</p>
                </div>
              ))}
            </div>
          </Block>
        )}

        {/* Best Practices */}
        {cheatSheet.bestPractices.length > 0 && (
          <Block title="Best Practices" icon="✅">
            <ul className="space-y-2">
              {cheatSheet.bestPractices.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                  <span className="text-emerald-400 flex-shrink-0">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {/* Common Pitfalls */}
        {cheatSheet.commonPitfalls.length > 0 && (
          <Block title="Common Pitfalls" icon="⚠️">
            <ul className="space-y-2">
              {cheatSheet.commonPitfalls.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                  <span className="text-red-400 flex-shrink-0">✗</span>
                  {p}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {/* Memory Tricks */}
        {cheatSheet.memoryTricks.length > 0 && (
          <Block title="Memory Tricks" icon="🧠">
            <ul className="space-y-2">
              {cheatSheet.memoryTricks.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                  <span className="text-purple-400 flex-shrink-0">💡</span>
                  {t}
                </li>
              ))}
            </ul>
          </Block>
        )}
      </div>
    </div>
  );
}
