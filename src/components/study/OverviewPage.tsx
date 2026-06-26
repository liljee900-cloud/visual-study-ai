import type { Overview, BeforeAfter } from "@/lib/types/studyPack";
import Badge from "@/components/ui/Badge";
import BeforeAfterBlock from "./BeforeAfterBlock";
import { difficultyColor } from "@/lib/utils";

interface Props {
  overview: Overview;
  videoUrl: string;
  thumbnailUrl?: string;
  beforeAfter?: BeforeAfter[];
}

export default function OverviewPage({ overview, videoUrl, thumbnailUrl, beforeAfter }: Props) {
  return (
    <div className="space-y-5 animate-fade-in">

      {/* Hero card */}
      <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={overview.videoTitle}
            className="w-full aspect-video object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-yellow-400/5 via-transparent to-purple-400/5 flex items-center justify-center">
            <span className="text-6xl opacity-20">🎬</span>
          </div>
        )}

        <div className="p-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={difficultyColor(overview.difficulty)}>{overview.difficulty}</Badge>
            <Badge variant="blue">{overview.category}</Badge>
            <Badge>⏱ {overview.estimatedLearningTime}</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">{overview.videoTitle}</h1>
          <p className="text-sm text-white/55 leading-relaxed">{overview.summary}</p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            ▶ Watch original video ↗
          </a>
        </div>
      </div>

      {/* Main topic banner */}
      <div className="bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-transparent border border-yellow-400/15 rounded-2xl p-5 flex items-center gap-4">
        <span className="text-4xl">📌</span>
        <div>
          <p className="text-[10px] text-yellow-400/60 font-bold uppercase tracking-widest mb-1">Main Topic</p>
          <p className="text-lg font-black text-white">{overview.mainTopic}</p>
        </div>
      </div>

      {/* Objectives + Prerequisites */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#161b22] border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
            <span className="text-yellow-400">🎯</span> Learning Objectives
          </h3>
          <ul className="space-y-3">
            {overview.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/65">
                <span className="w-5 h-5 rounded-full bg-yellow-400/15 text-yellow-400 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </span>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#161b22] border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
            <span className="text-yellow-400">📋</span> Prerequisites
          </h3>
          {overview.prerequisites.length === 0 ? (
            <p className="text-sm text-white/35">None — suitable for complete beginners.</p>
          ) : (
            <ul className="space-y-2">
              {overview.prerequisites.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/65">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Before / After — shown on overview when available */}
      {beforeAfter && beforeAfter.length > 0 && (
        <div>
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <span>🔄</span> Before & After
          </h3>
          <BeforeAfterBlock items={beforeAfter} />
        </div>
      )}
    </div>
  );
}
