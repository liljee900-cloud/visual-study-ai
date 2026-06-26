// Core data model — Book Builder-compatible, screenshot-ready architecture.

export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type CalloutType = "tip" | "warning" | "important" | "best-practice" | "remember" | "result";

export interface Callout {
  type: CalloutType;
  text: string;
}

export interface Diagram {
  title: string;
  nodes: string[];           // ordered node/step names for linear flow
  description?: string;
}

export interface SettingHighlight {
  name: string;
  value: string;
  note: string;
  color?: "yellow" | "blue" | "green" | "red";
}

export interface BeforeAfter {
  label: string;
  before: { description: string; screenshotPlaceholder: string };
  after:  { description: string; screenshotPlaceholder: string };
}

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
  icon: string;
  color: "yellow" | "blue" | "green" | "red" | "purple";
  beginnerExplanation: string;
  whyItExists: string;
  whatHappens: string;
  whenToUse: string;
  realWorldExample: string;
  commonMistake: string;
  proTip: string;
  screenshotPlaceholder: string;
  callouts?: Callout[];
  settings?: SettingHighlight[];
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
  screenshotPlaceholder: string;
  callout?: Callout;
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
  options?: string[];
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
  diagram?: Diagram;
  beforeAfter?: BeforeAfter[];
  cheatSheet: CheatSheet;
  quiz: Quiz;
  tags: string[];
  version: "1.0";
}

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
