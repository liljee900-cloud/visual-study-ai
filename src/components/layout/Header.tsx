"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080a0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center">
            <span className="text-black font-black text-sm">V</span>
          </div>
          <span className="font-bold text-white tracking-tight">
            Visual<span className="text-yellow-400">Study</span> AI
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/library"
            className="px-3 py-1.5 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            My Library
          </Link>
          <span className="px-3 py-1.5 text-sm text-white/20 cursor-not-allowed flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/50 animate-pulse" />
            Book Builder
            <span className="text-[10px] text-yellow-400/60 ml-0.5">soon</span>
          </span>
        </nav>
      </div>
    </header>
  );
}
