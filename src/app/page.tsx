import Header from "@/components/layout/Header";
import InputPanel from "@/components/home/InputPanel";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-yellow-400/4 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center gap-5 w-full max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 text-xs text-yellow-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            AI-Powered Visual Learning · Version 1
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
            Turn any video into
            <br />
            <span className="text-yellow-400">visual study cards</span>
          </h1>

          <p className="text-base sm:text-lg text-white/45 max-w-xl leading-relaxed">
            YouTube URL, raw transcript, or uploaded video file — paste or drop it in
            and get beautiful concept cards, step notes, cheat sheets, and quizzes.
          </p>

          {/* 3-mode input panel */}
          <div className="w-full mt-3">
            <InputPanel />
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {[
              "📚 Concept Cards",
              "🪜 Step-by-Step Notes",
              "⚡ Cheat Sheets",
              "🧠 Quiz Mode",
              "🎴 Flashcards",
              "🎬 Video Upload",
              "🚀 Export (soon)",
            ].map((f) => (
              <span
                key={f}
                className="text-xs px-3 py-1.5 bg-white/5 border border-white/8 rounded-full text-white/40"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* How it works */}
      <section className="border-t border-white/5 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xl font-bold mb-8 text-white">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                icon: "🔗",
                title: "Pick your input",
                desc: "YouTube URL for online videos, paste a transcript you already have, or upload a video file from your computer.",
              },
              {
                step: "2",
                icon: "🤖",
                title: "AI analyzes everything",
                desc: "Claude reads the full content and identifies every concept, tool, shortcut, workflow, and technique.",
              },
              {
                step: "3",
                icon: "✨",
                title: "Study visually",
                desc: "Get beautiful concept cards, step notes, cheat sheets, and quizzes. No re-watching required.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#161b22] border border-white/5 rounded-2xl p-6 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-yellow-400 text-black font-black text-sm flex items-center justify-center">
                    {item.step}
                  </span>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-white/20 px-4">
        Visual Study AI — Built for learners · No tracking · Your data stays local
      </footer>
    </div>
  );
}
