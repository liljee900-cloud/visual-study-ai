"use client";

import { useState } from "react";
import type { Quiz, QuizQuestion } from "@/lib/types/studyPack";
import SectionHeader from "@/components/ui/SectionHeader";

interface Props {
  quiz: Quiz;
}

function QuestionCard({ question, index }: { question: QuizQuestion; index: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isCorrect = selected === question.answer;

  return (
    <div className="bg-[#161b22] border border-white/10 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-7 h-7 rounded-full bg-yellow-400/15 text-yellow-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mr-2">
            {question.type.replace("-", " ")}
          </span>
          <p className="text-sm font-semibold text-white mt-1">{question.question}</p>
        </div>
      </div>

      {/* Multiple choice */}
      {question.type === "multiple-choice" && question.options && (
        <div className="space-y-2 mb-4">
          {question.options.map((opt, i) => {
            const letter = ["A", "B", "C", "D"][i];
            const isSelected = selected === opt;
            const showResult = revealed || selected !== null;
            const isAnswer = opt === question.answer;
            return (
              <button
                key={i}
                onClick={() => {
                  if (!revealed) setSelected(opt);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all border
                  ${showResult && isAnswer ? "border-emerald-400/40 bg-emerald-400/8 text-emerald-300" : ""}
                  ${showResult && isSelected && !isAnswer ? "border-red-400/40 bg-red-400/8 text-red-300" : ""}
                  ${!showResult ? "border-white/10 hover:border-yellow-400/30 hover:bg-white/3 text-white/70" : ""}
                  ${showResult && !isSelected && !isAnswer ? "border-white/5 text-white/30" : ""}
                `}
              >
                <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {letter}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* True/False */}
      {question.type === "true-false" && (
        <div className="flex gap-3 mb-4">
          {["True", "False"].map((opt) => (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all
                ${selected === opt && opt === question.answer ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : ""}
                ${selected === opt && opt !== question.answer ? "border-red-400/40 bg-red-400/10 text-red-300" : ""}
                ${selected !== opt ? "border-white/10 text-white/60 hover:border-white/20 hover:bg-white/3" : ""}
              `}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Fill blank / short answer */}
      {(question.type === "fill-blank" || question.type === "short-answer") && (
        <div className="mb-4">
          <input
            type="text"
            placeholder={question.type === "fill-blank" ? "Fill in the blank..." : "Your answer..."}
            className="w-full bg-white/3 border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
          />
        </div>
      )}

      {/* Reveal button */}
      <button
        onClick={() => setRevealed(true)}
        className="text-xs text-yellow-400/70 hover:text-yellow-400 transition-colors"
      >
        {revealed ? "✓ Answer revealed" : "Reveal answer"}
      </button>

      {revealed && (
        <div className="mt-3 bg-emerald-400/5 border border-emerald-400/15 rounded-xl p-3">
          <p className="text-xs font-bold text-emerald-400 mb-1">
            ✓ Answer: {question.answer}
          </p>
          <p className="text-xs text-white/55 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

function FlashcardDeck({ flashcards }: { flashcards: Quiz["flashcards"] }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = flashcards[current];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-white/40">
        <span>Card {current + 1} of {flashcards.length}</span>
        <span className="text-xs">Click card to flip</span>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer min-h-[200px] bg-[#161b22] border border-white/10 hover:border-yellow-400/20 rounded-2xl p-8 flex items-center justify-center text-center transition-all"
        style={{ perspective: "1000px" }}
      >
        {!flipped ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/50 mb-3">
              Question
            </p>
            <p className="text-lg font-semibold text-white leading-snug">{card.front}</p>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/50 mb-3">
              Answer
            </p>
            <p className="text-base text-white/80 leading-relaxed">{card.back}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setCurrent(Math.max(0, current - 1)); setFlipped(false); }}
          disabled={current === 0}
          className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← Previous
        </button>
        <div className="flex gap-1">
          {flashcards.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setFlipped(false); }}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-yellow-400 w-4" : "bg-white/20"}`}
            />
          ))}
        </div>
        <button
          onClick={() => { setCurrent(Math.min(flashcards.length - 1, current + 1)); setFlipped(false); }}
          disabled={current === flashcards.length - 1}
          className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default function QuizPage({ quiz }: Props) {
  const [mode, setMode] = useState<"quiz" | "flashcards">("quiz");

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        icon="🧠"
        title="Quiz & Flashcards"
        subtitle="Test your knowledge from the video."
      />

      {/* Mode toggle */}
      <div className="flex gap-2 bg-white/3 border border-white/8 rounded-xl p-1 w-fit">
        {(["quiz", "flashcards"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              mode === m
                ? "bg-yellow-400 text-black"
                : "text-white/50 hover:text-white"
            }`}
          >
            {m === "quiz" ? `📝 Quiz (${quiz.questions.length})` : `🎴 Flashcards (${quiz.flashcards.length})`}
          </button>
        ))}
      </div>

      {mode === "quiz" ? (
        <div className="space-y-4">
          {quiz.questions.map((q, i) => (
            <QuestionCard key={q.id} question={q} index={i} />
          ))}
        </div>
      ) : (
        <FlashcardDeck flashcards={quiz.flashcards} />
      )}
    </div>
  );
}
