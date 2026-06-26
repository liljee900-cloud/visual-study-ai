import type { Overview } from "@/lib/types/studyPack";
import Badge from "@/components/ui/Badge";
import { difficultyColor } from "@/lib/utils";

interface Props {
  overview: Overview;
  videoUrl: string;
  thumbnailUrl?: string;
}

export default function OverviewPage({ overview, videoUrl, thumbnailUrl }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Video card */}
      <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={overview.videoTitle}
            className="w-full aspect-video object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={difficultyColor(overview.difficulty)}>{overview.difficulty}</Badge>
            <Badge variant="blue">{overview.category}</Badge>
            <Badge>⏱ {overview.estimatedLearningTime}</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {overview.videoTitle}
          </h1>
          <p className="text-sm text-white/60 leading-relaxed">{overview.summary}</p>
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

      {/* Meta grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Learning Objectives */}
        <div className="bg-[#161b22] border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-400">🎯</span> Learning Objectives
          </h3>
          <ul className="space-y-2.5">
            {overview.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                <span className="w-5 h-5 rounded-full bg-yellow-400/15 text-yellow-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </span>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* Prerequisites */}
        <div className="bg-[#161b22] border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-400">📋</span> Prerequisites
          </h3>
          {overview.prerequisites.length === 0 ? (
            <p className="text-sm text-white/40">None — suitable for complete beginners.</p>
          ) : (
            <ul className="space-y-2">
              {overview.prerequisites.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main topic banner */}
      <div className="bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-transparent border border-yellow-400/15 rounded-2xl p-5 flex items-center gap-4">
        <div className="text-4xl">📌</div>
        <div>
          <p className="text-xs text-yellow-400/70 font-medium uppercase tracking-widest mb-1">
            Main Topic
          </p>
          <p className="text-lg font-bold text-white">{overview.mainTopic}</p>
        </div>
      </div>
    </div>
  );
}
