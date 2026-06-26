import { NODE_INDEX } from "./nodes";
import { BLENDER_CATEGORIES } from "./categories";
import type { NodeIndex } from "./types";

export interface SearchResult {
  type: "node" | "category";
  id: string;
  name: string;
  icon: string;
  description: string;
  category?: string;
  href: string;
}

export function searchLibrary(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  const results: Array<SearchResult & { score: number }> = [];

  // Search nodes
  for (const node of NODE_INDEX) {
    let score = 0;
    if (node.name.toLowerCase() === q) score += 100;
    else if (node.name.toLowerCase().startsWith(q)) score += 60;
    else if (node.name.toLowerCase().includes(q)) score += 40;
    if (node.tags.some(t => t.includes(q))) score += 20;
    if (node.description.toLowerCase().includes(q)) score += 10;
    if (node.subcategory.toLowerCase().includes(q)) score += 15;
    if (node.category.includes(q)) score += 10;

    if (score > 0) {
      results.push({
        type: "node",
        id: node.id,
        name: node.name,
        icon: node.icon,
        description: node.description,
        category: node.category,
        href: `/blender/nodes/${node.id}`,
        score,
      });
    }
  }

  // Search categories
  for (const cat of BLENDER_CATEGORIES) {
    let score = 0;
    if (cat.name.toLowerCase().includes(q)) score += 50;
    if (cat.description.toLowerCase().includes(q)) score += 20;
    if (cat.topics.some(t => t.toLowerCase().includes(q))) score += 15;
    if (score > 0) {
      results.push({
        type: "category",
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        href: `/blender/category/${cat.id}`,
        score,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score: _score, ...r }) => r);
}

export function getNodesByCategory(category: string): NodeIndex[] {
  return NODE_INDEX.filter(n => n.category === category);
}
