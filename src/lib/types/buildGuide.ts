// Build Guide — v2.0 data model
// Replaces the old StudyPack (v1.0) concept-card format.
// Each BuildGuide reconstructs the full tutorial as a step-by-step instruction manual.

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface SettingValue {
  name: string;
  value: string;
  unit?: string;      // "m", "°", "%", etc.
  note?: string;      // brief explanation of what this value does
}

export interface NodeConnection {
  from: string;       // "Noise Texture → Color"
  to: string;         // "Principled BSDF → Base Color"
  note?: string;
}

export interface SideNote {
  title: string;
  explanation: string;
  type?: "concept" | "tip" | "warning";
}

export interface CheckpointIssue {
  issue: string;
  fix: string;
}

export interface Checkpoint {
  id: string;
  afterStep: number;   // insert checkpoint after this step number
  title: string;
  description: string;
  screenshotPlaceholder: string;
  verificationPoints: string[];  // "Node is connected correctly", "Mesh is visible", etc.
  commonIssues: CheckpointIssue[];
}

export interface BuildStep {
  id: string;
  number: number;
  title: string;

  // Location context
  editor?: string;       // "Shader Editor", "3D Viewport", "Properties Panel", etc.
  panel?: string;        // "Object Properties", "Modifier Stack", etc.

  // Action details
  action: string;        // Primary instruction: what to do
  shortcut?: string;     // "Shift+A", "Ctrl+Z", "Tab"
  menuPath?: string;     // "Add → Texture → Noise Texture"
  whereToClick?: string; // "Click in the empty node editor space"

  // Values and settings
  settings: SettingValue[];

  // Node connections (for node-based tutorials)
  connections: NodeConnection[];

  // Context and learning
  purpose: string;       // Why this step matters
  expectedResult: string; // What should appear on screen

  // Common pitfalls
  commonMistakes: string[];
  tips: string[];

  // Visual — screenshotUrl populated after frame extraction; placeholder used until then
  screenshotPlaceholder: string;
  screenshotUrl?: string;       // base64 data URI or blob URL once extracted

  // Optional concept aside
  sideNote?: SideNote;
}

export interface FinalResult {
  description: string;
  screenshotPlaceholder: string;
}

export interface GuideSummary {
  whatWasBuilt: string;
  techniquesLearned: string[];
  keyTakeaways: string[];
  relatedTechniques: string[];
  suggestedNextLessons: string[];
}

export interface BuildGuide {
  id: string;
  createdAt: string;
  videoUrl: string;
  thumbnailUrl?: string;
  version: "2.0";

  // Overview
  title: string;
  description: string;
  software: string;        // "Blender 4.x"
  difficulty: Difficulty;
  estimatedTime: string;   // "45 minutes"
  prerequisites: string[];

  // What you'll build
  finalResult: FinalResult;

  // The complete step-by-step guide
  steps: BuildStep[];

  // Checkpoint moments (key milestones)
  checkpoints: Checkpoint[];

  // Wrap-up
  summary: GuideSummary;

  tags: string[];
}
