import { NODE_INDEX } from "./nodes";
import { SHADER_NODE_INDEX } from "./shader-nodes";
import { COMPOSITOR_NODE_INDEX } from "./compositor-nodes";
import { MODIFIER_INDEX } from "./modifiers";
import { EDITOR_INDEX } from "./editors";
import type { UnifiedSearchResult } from "./types";

function score(item: { name: string; description: string; tags: string[] }, q: string): number {
  const ql = q.toLowerCase();
  const terms = ql.split(/\s+/).filter(Boolean);
  let s = 0;
  for (const term of terms) {
    if (item.name.toLowerCase() === term) s += 100;
    else if (item.name.toLowerCase().startsWith(term)) s += 60;
    else if (item.name.toLowerCase().includes(term)) s += 40;
    if (item.description.toLowerCase().includes(term)) s += 10;
    if (item.tags.some(t => t.toLowerCase().includes(term))) s += 20;
  }
  return s;
}

export function unifiedSearch(query: string, limit = 20): UnifiedSearchResult[] {
  if (!query.trim()) return [];

  const toNode = (n: typeof NODE_INDEX[0]): UnifiedSearchResult => ({
    id: n.id,
    type: "node" as const,
    name: n.name,
    category: n.category,
    icon: n.icon,
    description: n.description,
    url: `/blender/nodes/${n.id}`,
    tags: n.tags,
    score: score(n, query),
  });

  const nodes: UnifiedSearchResult[] = [
    ...NODE_INDEX.map(toNode),
    ...SHADER_NODE_INDEX.map(toNode),
    ...COMPOSITOR_NODE_INDEX.map(toNode),
  ];

  const modifiers: UnifiedSearchResult[] = MODIFIER_INDEX.map(m => ({
    id: m.id,
    type: "modifier" as const,
    name: m.name,
    category: m.category,
    icon: m.icon,
    description: m.description,
    url: `/blender/modifiers/${m.id}`,
    tags: m.tags,
    score: score(m, query),
  }));

  const editors: UnifiedSearchResult[] = EDITOR_INDEX.map(e => ({
    id: e.id,
    type: "editor" as const,
    name: e.name,
    category: "editor",
    icon: e.icon,
    description: e.description,
    url: `/blender/editors/${e.id}`,
    tags: e.tags,
    score: score(e, query),
  }));

  return [...nodes, ...modifiers, ...editors]
    .filter(r => (r.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}

export const TYPE_LABELS: Record<string, string> = {
  node: "Node",
  modifier: "Modifier",
  editor: "Editor",
  tool: "Tool",
  shortcut: "Shortcut",
};

export const TYPE_COLORS: Record<string, string> = {
  node: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  modifier: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  editor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  tool: "text-green-400 bg-green-400/10 border-green-400/20",
  shortcut: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};
