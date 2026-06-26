"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import NodeCard from "@/components/blender/NodeCard";
import BlenderSearch from "@/components/blender/BlenderSearch";
import { NODE_INDEX } from "@/lib/blender/nodes";
import Link from "next/link";

const CATEGORIES = [
  { id: "all", label: "All Nodes" },
  { id: "geometry-nodes", label: "Geometry Nodes" },
  { id: "shader-nodes", label: "Shader Nodes" },
  { id: "compositor-nodes", label: "Compositor" },
  { id: "texture-nodes", label: "Texture Nodes" },
];

export default function NodesPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? NODE_INDEX
    : NODE_INDEX.filter(n => n.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="border-b border-white/5 bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/blender" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Library</Link>
            <span className="text-white/15">/</span>
            <span className="text-white/50 text-sm">Node Library</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-4">Node Library</h1>
          <BlenderSearch />
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-yellow-400 text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}>
              {cat.label}
              {cat.id !== "all" && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  ({NODE_INDEX.filter(n => n.category === cat.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(node => <NodeCard key={node.id} node={node} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <p className="text-4xl mb-3">📭</p>
            <p>No nodes in this category yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
