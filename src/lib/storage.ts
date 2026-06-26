// Client-side localStorage helpers.
// Handles both v1.0 StudyPack and v2.0 BuildGuide formats.
// Structured so Supabase can replace this layer later without changing callers.

import type { BuildGuide } from "./types/buildGuide";

const PACKS_KEY = "vsa:packs";
const META_KEY = "vsa:meta";

// Unified meta — works for both v1.0 and v2.0
export interface PackMeta {
  id: string;
  createdAt: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  subtitle: string;
  difficulty: string;
  tags: string[];
  stepCount?: number;
  version: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPack = BuildGuide | Record<string, any>;

export function savePack(pack: AnyPack): void {
  const packs = loadAllPacks();
  packs[pack.id] = pack;
  localStorage.setItem(PACKS_KEY, JSON.stringify(packs));

  const meta = extractMeta(pack);
  const metas = loadMetas();
  metas[pack.id] = meta;
  localStorage.setItem(META_KEY, JSON.stringify(metas));
}

function extractMeta(pack: AnyPack): PackMeta {
  if (pack.version === "2.0") {
    const guide = pack as BuildGuide;
    return {
      id: guide.id,
      createdAt: guide.createdAt,
      videoUrl: guide.videoUrl,
      thumbnailUrl: guide.thumbnailUrl,
      title: guide.title,
      subtitle: guide.description,
      difficulty: guide.difficulty,
      tags: guide.tags,
      stepCount: guide.steps?.length ?? 0,
      version: "2.0",
    };
  }
  // Legacy v1.0 format — access via index to satisfy strict types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = pack as any;
  return {
    id: p.id,
    createdAt: p.createdAt,
    videoUrl: p.videoUrl,
    thumbnailUrl: p.thumbnailUrl,
    title: p.overview?.videoTitle ?? p.title ?? "Untitled",
    subtitle: p.overview?.mainTopic ?? p.description ?? "",
    difficulty: p.overview?.difficulty ?? p.difficulty ?? "Intermediate",
    tags: p.tags ?? [],
    version: "1.0",
  };
}

export function loadPack(id: string): AnyPack | null {
  const packs = loadAllPacks();
  return packs[id] ?? null;
}

export function loadAllPacks(): Record<string, AnyPack> {
  try {
    const raw = localStorage.getItem(PACKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function loadMetas(): Record<string, PackMeta> {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return {};
    // Re-derive metas from packs to catch format changes
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return {};
  }
}

export function deletePack(id: string): void {
  const packs = loadAllPacks();
  delete packs[id];
  localStorage.setItem(PACKS_KEY, JSON.stringify(packs));

  const metas = loadMetas();
  delete metas[id];
  localStorage.setItem(META_KEY, JSON.stringify(metas));
}

// Migrate old meta records to new shape on first load
export function migrateMetas(): void {
  try {
    const packs = loadAllPacks();
    if (Object.keys(packs).length === 0) return;
    const metas: Record<string, PackMeta> = {};
    for (const pack of Object.values(packs)) {
      metas[pack.id] = extractMeta(pack);
    }
    localStorage.setItem(META_KEY, JSON.stringify(metas));
  } catch {}
}
