// Client-side localStorage helpers.
// Structured so Supabase can replace this layer later without changing callers.

import type { StudyPack, StudyPackMeta } from "./types/studyPack";

const PACKS_KEY = "vsa:packs";
const META_KEY = "vsa:meta";

export function savePack(pack: StudyPack): void {
  const packs = loadAllPacks();
  packs[pack.id] = pack;
  localStorage.setItem(PACKS_KEY, JSON.stringify(packs));

  const meta: StudyPackMeta = {
    id: pack.id,
    createdAt: pack.createdAt,
    videoUrl: pack.videoUrl,
    thumbnailUrl: pack.thumbnailUrl,
    videoTitle: pack.overview.videoTitle,
    mainTopic: pack.overview.mainTopic,
    difficulty: pack.overview.difficulty,
    category: pack.overview.category,
    tags: pack.tags,
  };
  const metas = loadMetas();
  metas[pack.id] = meta;
  localStorage.setItem(META_KEY, JSON.stringify(metas));
}

export function loadPack(id: string): StudyPack | null {
  const packs = loadAllPacks();
  return packs[id] ?? null;
}

export function loadAllPacks(): Record<string, StudyPack> {
  try {
    const raw = localStorage.getItem(PACKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function loadMetas(): Record<string, StudyPackMeta> {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
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
