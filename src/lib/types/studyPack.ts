// Core data model — designed to be Book Builder-compatible in the future.
// Each field maps to a visual component so the renderer stays data-driven.

export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Overview {
  videoTitle: string;
  mainTopic: string;
  difficulty: Difficulty;
  estimatedLearningTime: string;
  prerequisites: string[];
  learningObjectives: string[];
  summary: string;
  category: string;
}

export interface Concept {
  id: string;
  number: number;
  name: string;
  icon: string;            // emoji icon
  beginnerExplanation: string;
  whatItDoes: string;
  whyItMatters: string;
  whenToUse: string;
  example: string;
  commonMistakes: string[];
  proTip: string;
  screenshotPlaceholder?: string; // timestamp or description for future screenshot capture
}

export interface TutorialStep {
  id: string;
  number: number;
  title: string;
  explanation: string;
  whyItMatters: string;
  expectedResult: string;
  mistakesToAvoid: string[];
  tips: string[];
  timestamp?: string;
}

export interface CheatSheet {
  definitions: { term: string; definition: string }[];
  importantSettings: { name: string; value: string; note: string }[];
  keyboardShortcuts: { key: string; action: string }[];
  workflow: string[];
  bestPractices: string[];
  commonPitfalls: string[];
  memoryTricks: string[];
}

export interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "fill-blank" | "short-answer";
  question: string;
  options?: string[];        // for multiple-choice
  answer: string;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface Quiz {
  questions: QuizQuestion[];
  flashcards: Flashcard[];
}

export interface StudyPack {
  id: string;
  createdAt: string;
  videoUrl: string;
  thumbnailUrl?: string;
  overview: Overview;
  concepts: Concept[];
  steps: TutorialStep[];
  cheatSheet: CheatSheet;
  quiz: Quiz;
  // Metadata for future Book Builder
  tags: string[];
  version: "1.0";
}

// Lightweight index entry stored in localStorage
export interface StudyPackMeta {
  id: string;
  createdAt: string;
  videoUrl: string;
  thumbnailUrl?: string;
  videoTitle: string;
  mainTopic: string;
  difficulty: Difficulty;
  category: string;
  tags: string[];
}
