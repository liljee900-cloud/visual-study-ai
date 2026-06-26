import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visual Study AI — Transform Videos Into Visual Study Packs",
  description:
    "Paste a YouTube URL and get a beautiful visual study pack with concept cards, step-by-step notes, cheat sheets, and quizzes.",
  keywords: ["study", "AI", "learning", "YouTube", "visual notes", "education"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080a0f] text-[#f0f6fc] antialiased">
        {children}
      </body>
    </html>
  );
}
