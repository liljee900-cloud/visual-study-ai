"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import DiagramBlock from "@/components/study/DiagramBlock";
import Callout from "@/components/study/Callout";
import ScreenshotPlaceholder from "@/components/study/ScreenshotPlaceholder";
import Badge from "@/components/ui/Badge";
import { difficultyColor } from "@/lib/utils";
import { NODE_MAP } from "@/lib/blender/nodes";

interface Phase {
  phase: number;
  title: string;
  description: string;
  relevantNodes: string[];
  keySteps: string[];
  screenshotDescription: string;
}

interface KeyNode {
  nodeId: string;
  name: string;
  whyNeeded: string;
}

interface Lesson {
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  summary: string;
  whatYoullBuild: string;
  prerequisiteTopics: string[];
  learningPath: Phase[];
  keyNodes: KeyNode[];
  workflowDiagram: { title: string; nodes: string[] };
  tips: string[];
  commonChallenges: string[];
  practiceProjects: { title: string; description: string; difficulty: string }[];
  nextTopicsToLearn: string[];
}

export default function TopicResultPage() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("blender-topic-lesson");
    const q = sessionStorage.getItem("blender-topic-query");
    if (raw) setLesson(JSON.parse(raw));
    if (q) setQuery(q);
  }, []);

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-white/30">
          <p className="text-4xl">🧊</p>
          <p>No lesson loaded. Go back to generate one.</p>
          <Link href="/blender" className="text-yellow-400 hover:text-yellow-300 text-sm">← Back to Library</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-white/5 bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-white/30">
          <Link href="/blender" className="hover:text-white/60 transition-colors">Library</Link>
          <span>/</span>
          <span className="text-white/60">AI Lesson: {query}</span>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Hero */}
        <div className="bg-gradient-to-br from-yellow-400/10 via-yellow-400/4 to-transparent border border-yellow-400/15 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">🤖</span>
            <div>
              <div className="text-[10px] text-yellow-400/60 font-bold uppercase tracking-widest mb-1">AI-Generated Lesson</div>
              <h1 className="text-2xl font-black text-white">{lesson.title}</h1>
              <p className="text-white/50 mt-1">{lesson.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant={difficultyColor(lesson.difficulty)}>{lesson.difficulty}</Badge>
            <Badge>⏱ {lesson.estimatedTime}</Badge>
          </div>
          <p className="text-sm text-white/60 leading-relaxed mt-4">{lesson.summary}</p>
        </div>

        {/* What you'll build */}
        <div className="bg-emerald-400/5 border border-emerald-400/15 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-2">✅ What You&apos;ll Build</p>
          <p className="text-sm text-white/70 leading-relaxed">{lesson.whatYoullBuild}</p>
        </div>

        {/* Prerequisites */}
        {lesson.prerequisiteTopics?.length > 0 && (
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Prerequisites</p>
            <div className="flex flex-wrap gap-2">
              {lesson.prerequisiteTopics.map((t, i) => (
                <span key={i} className="text-xs bg-white/5 border border-white/10 text-white/50 rounded-full px-3 py-1">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Workflow diagram */}
        {lesson.workflowDiagram?.nodes?.length > 0 && (
          <DiagramBlock diagram={lesson.workflowDiagram} />
        )}

        {/* Learning path */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><span>🪜</span> Learning Path</h2>
          <div className="space-y-4">
            {lesson.learningPath?.map((phase, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-yellow-400 text-black font-black text-sm flex items-center justify-center">
                    {phase.phase}
                  </div>
                  {i < lesson.learningPath.length - 1 && <div className="w-0.5 flex-1 bg-white/8 mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="bg-[#161b22] border border-white/8 rounded-2xl overflow-hidden">
                    <div className="border-b border-white/5 px-5 py-3">
                      <h3 className="font-bold text-white">{phase.title}</h3>
                    </div>
                    <div className="px-5 pt-4 pb-2">
                      <ScreenshotPlaceholder description={phase.screenshotDescription} size="md" label={`Phase ${phase.phase}`} />
                    </div>
                    <div className="p-5 space-y-3">
                      <p className="text-sm text-white/65 leading-relaxed">{phase.description}</p>
                      {phase.keySteps?.length > 0 && (
                        <ul className="space-y-1.5">
                          {phase.keySteps.map((s, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-white/55">
                              <span className="text-yellow-400 flex-shrink-0 mt-0.5">→</span>{s}
                            </li>
                          ))}
                        </ul>
                      )}
                      {phase.relevantNodes?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {phase.relevantNodes.map((n, j) => (
                            <span key={j} className="text-[10px] bg-blue-400/10 border border-blue-400/15 text-blue-300 rounded-full px-2 py-0.5">{n}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key nodes with links */}
        {lesson.keyNodes?.length > 0 && (
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><span>🔷</span> Key Nodes for This Topic</h2>
            <div className="space-y-3">
              {lesson.keyNodes.map((kn, i) => {
                const nodeData = NODE_MAP[kn.nodeId];
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{nodeData?.icon ?? "🔷"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {nodeData ? (
                          <Link href={`/blender/nodes/${kn.nodeId}`} className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors">
                            {kn.name}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-white">{kn.name}</span>
                        )}
                        {nodeData && <span className="text-[10px] text-white/25">→ view node</span>}
                      </div>
                      <p className="text-xs text-white/45 leading-relaxed mt-0.5">{kn.whyNeeded}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips + Challenges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white mb-2">💡 Tips</h3>
            {lesson.tips?.map((t, i) => <Callout key={i} type="tip" text={t} />)}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white mb-2">⚠ Common Challenges</h3>
            {lesson.commonChallenges?.map((c, i) => <Callout key={i} type="warning" text={c} />)}
          </div>
        </div>

        {/* Practice projects */}
        {lesson.practiceProjects?.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><span>🏋️</span> Practice Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lesson.practiceProjects.map((p, i) => (
                <div key={i} className="bg-[#161b22] border border-white/8 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-yellow-400/15 text-yellow-400 text-xs font-bold flex items-center justify-center">{i+1}</span>
                    <span className="text-xs text-white/30">{p.difficulty}</span>
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1">{p.title}</h4>
                  <p className="text-xs text-white/45 leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next topics */}
        {lesson.nextTopicsToLearn?.length > 0 && (
          <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">What to Learn Next</p>
            <div className="flex flex-wrap gap-2">
              {lesson.nextTopicsToLearn.map((t, i) => (
                <span key={i} className="text-xs bg-purple-400/10 border border-purple-400/15 text-purple-300 rounded-full px-3 py-1">{t}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/blender" className="flex-1 text-center bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl text-sm transition-colors">
            ← Back to Library
          </Link>
        </div>

      </main>
    </div>
  );
}
