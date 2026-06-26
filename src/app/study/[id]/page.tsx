"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { StudyPack } from "@/lib/types/studyPack";
import { loadPack } from "@/lib/storage";
import Header from "@/components/layout/Header";
import OverviewPage from "@/components/study/OverviewPage";
import ConceptsPage from "@/components/study/ConceptsPage";
import StepsPage from "@/components/study/StepsPage";
import CheatSheetPage from "@/components/study/CheatSheetPage";
import QuizPage from "@/components/study/QuizPage";
import Badge from "@/components/ui/Badge";
import { difficultyColor } from "@/lib/utils";

type Tab = "overview" | "concepts" | "steps" | "cheatsheet" | "quiz";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📌" },
  { id: "concepts", label: "Concepts", icon: "🧩" },
  { id: "steps", label: "Steps", icon: "🪜" },
  { id: "cheatsheet", label: "Cheat Sheet", icon: "⚡" },
  { id: "quiz", label: "Quiz", icon: "🧠" },
];

export default function StudyPackPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pack, setPack] = useState<StudyPack | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = loadPack(id);
    if (!p) {
      router.push("/");
      return;
    }
    setPack(p);
    setLoading(false);
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/40">
          <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
          <p className="text-sm">Loading study pack...</p>
        </div>
      </div>
    );
  }

  if (!pack) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Pack meta bar */}
      <div className="border-b border-white/5 bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          <Badge variant={difficultyColor(pack.overview.difficulty)}>
            {pack.overview.difficulty}
          </Badge>
          <Badge variant="blue">{pack.overview.category}</Badge>
          <span className="text-white/30 text-xs hidden sm:block">|</span>
          <h1 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-lg">
            {pack.overview.videoTitle}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              title="Export (coming soon)"
              className="text-xs text-white/25 border border-white/10 px-3 py-1.5 rounded-lg cursor-not-allowed"
            >
              Export ↗
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-14 z-40 border-b border-white/5 bg-[#080a0f]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "border-yellow-400 text-yellow-400"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === "concepts" && (
                  <span className="text-[10px] bg-white/5 text-white/30 px-1.5 py-0.5 rounded-full">
                    {pack.concepts.length}
                  </span>
                )}
                {tab.id === "steps" && (
                  <span className="text-[10px] bg-white/5 text-white/30 px-1.5 py-0.5 rounded-full">
                    {pack.steps.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {activeTab === "overview" && (
          <OverviewPage
            overview={pack.overview}
            videoUrl={pack.videoUrl}
            thumbnailUrl={pack.thumbnailUrl}
          />
        )}
        {activeTab === "concepts" && <ConceptsPage concepts={pack.concepts} />}
        {activeTab === "steps" && <StepsPage steps={pack.steps} />}
        {activeTab === "cheatsheet" && <CheatSheetPage cheatSheet={pack.cheatSheet} />}
        {activeTab === "quiz" && <QuizPage quiz={pack.quiz} />}
      </main>

      {/* Bottom nav — mobile friendly quick jump */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#080a0f]/95 backdrop-blur-md border-t border-white/10 flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[10px] transition-colors ${
              activeTab === tab.id ? "text-yellow-400" : "text-white/30"
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
