"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { unifiedSearch, TYPE_LABELS, TYPE_COLORS } from "@/lib/blender/unified-search";
import type { UnifiedSearchResult } from "@/lib/blender/types";

export default function BlenderSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setResults(unifiedSearch(q, 12));
  }, []);

  useEffect(() => {
    search(query);
    setActiveIndex(-1);
  }, [query, search]);

  const navigate = (result: UnifiedSearchResult) => {
    setQuery("");
    setResults([]);
    setFocused(false);
    router.push(result.url);
  };

  const navigateToAI = () => {
    if (!query.trim()) return;
    const q = query;
    setQuery("");
    setResults([]);
    setFocused(false);
    router.push(`/blender/reference?type=node&name=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        navigate(results[activeIndex]);
      } else if (activeIndex === results.length) {
        navigateToAI();
      } else if (results.length > 0) {
        navigate(results[0]);
      } else {
        navigateToAI();
      }
    } else if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = focused && (results.length > 0 || query.trim().length > 1);

  return (
    <div className="relative w-full max-w-2xl">
      <div className={`flex items-center gap-3 bg-white/5 border rounded-xl px-4 py-3 transition-all ${
        focused ? "border-yellow-400/40 bg-white/8" : "border-white/10 hover:border-white/20"
      }`}>
        <span className="text-white/30 text-lg flex-shrink-0">🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search nodes, modifiers, editors… or Enter to generate with AI"
          className="flex-1 bg-transparent text-white placeholder-white/25 text-sm focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-white/25 hover:text-white/50 text-xs flex-shrink-0">✕</button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b22] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
          {results.map((r, i) => (
            <button key={`${r.type}-${r.id}`} onMouseDown={() => navigate(r)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                i === activeIndex ? "bg-white/10" : "hover:bg-white/5"
              } ${i > 0 ? "border-t border-white/5" : ""}`}>
              <span className="text-lg flex-shrink-0">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white truncate">{r.name}</span>
                  <span className={`text-[9px] font-bold border rounded px-1.5 py-0.5 flex-shrink-0 ${TYPE_COLORS[r.type] ?? ""}`}>
                    {TYPE_LABELS[r.type] ?? r.type}
                  </span>
                </div>
                <p className="text-xs text-white/35 leading-tight truncate mt-0.5">{r.description}</p>
              </div>
            </button>
          ))}

          {/* AI generate option */}
          <button onMouseDown={navigateToAI}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left border-t border-white/8 transition-colors ${
              activeIndex === results.length ? "bg-white/10" : "hover:bg-white/5"
            }`}>
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-sm font-semibold text-yellow-400">Generate AI reference for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-white/30">Ask Claude to explain any Blender feature</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
