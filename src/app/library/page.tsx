"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadMetas, deletePack, migrateMetas } from "@/lib/storage";
import type { PackMeta } from "@/lib/storage";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { difficultyColor } from "@/lib/utils";

export default function LibraryPage() {
  const [metas, setMetas] = useState<PackMeta[]>([]);

  useEffect(() => {
    migrateMetas();
    const m = loadMetas();
    setMetas(Object.values(m).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, []);

  function handleDelete(id: string) {
    if (!confirm("Delete this study pack?")) return;
    deletePack(id);
    setMetas((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">My Library</h1>
            <p className="text-sm text-white/40 mt-1">
              {metas.length} guide{metas.length !== 1 ? "s" : ""} saved locally
            </p>
          </div>
          <Link
            href="/"
            className="bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            + New Pack
          </Link>
        </div>

        {/* Book Builder teaser */}
        <div className="mb-8 bg-gradient-to-r from-yellow-400/8 via-yellow-400/4 to-transparent border border-yellow-400/15 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-3xl">📚</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-sm">Book Builder</h3>
              <span className="text-[10px] bg-yellow-400/15 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded-full font-medium">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Select multiple study packs and let AI combine them into a custom printable book —
              your personal Blender guide, AI automation manual, or any topic you choose.
            </p>
          </div>
          <button
            disabled
            className="text-xs text-white/20 border border-white/10 px-3 py-2 rounded-xl cursor-not-allowed flex-shrink-0"
          >
            Create Book
          </button>
        </div>

        {metas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">📭</span>
            <h2 className="text-lg font-bold text-white mb-2">No study packs yet</h2>
            <p className="text-sm text-white/40 mb-6">
              Paste a YouTube URL on the home page to generate your first study pack.
            </p>
            <Link
              href="/"
              className="bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              Generate First Pack
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metas.map((meta) => (
              <div
                key={meta.id}
                className="bg-[#161b22] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all group"
              >
                {meta.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={meta.thumbnailUrl}
                    alt={meta.title}
                    className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={difficultyColor(meta.difficulty)}>{meta.difficulty}</Badge>
                    {meta.stepCount != null && (
                      <Badge variant="blue">{meta.stepCount} steps</Badge>
                    )}
                    {meta.version === "1.0" && (
                      <Badge variant="default">v1.0</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">
                    {meta.title}
                  </h3>
                  {meta.subtitle && <p className="text-xs text-white/40 line-clamp-2">{meta.subtitle}</p>}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/study/${meta.id}`}
                      className="flex-1 text-center text-sm font-semibold bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 py-2 rounded-xl transition-colors"
                    >
                      Open Guide →
                    </Link>
                    <button
                      onClick={() => handleDelete(meta.id)}
                      className="text-xs text-white/25 hover:text-red-400 p-2 rounded-xl hover:bg-red-400/8 transition-colors"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
