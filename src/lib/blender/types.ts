// Blender Knowledge Library — type system
// Versioned so data can be swapped when Blender releases new versions.
// To add entries: add to the relevant data file and export from the index.
// To update for a new Blender release: update blenderVersion + lastVerified fields.

// ─── Node types ──────────────────────────────────────────────────────────────

export type NodeCategory =
  | "geometry-nodes"
  | "shader-nodes"
  | "compositor-nodes"
  | "texture-nodes"
  | "simulation-nodes";

export type ModifierCategory =
  | "generate" | "deform" | "modify" | "physics";

// All top-level browseable categories in the library
export type BlenderCategory =
  | "interface" | "navigation" | "viewport" | "object-mode" | "edit-mode"
  | "sculpt-mode" | "uv-editing" | "shading" | "geometry-nodes" | "shader-nodes"
  | "compositor-nodes" | "texture-nodes" | "simulation-nodes"
  | "compositing" | "animation" | "rigging" | "constraints" | "physics"
  | "particles" | "grease-pencil" | "video-editing" | "rendering" | "eevee"
  | "cycles" | "asset-browser" | "modifiers" | "add-ons" | "preferences"
  | "shortcuts" | "lighting" | "cameras" | "materials" | "texturing"
  | "procedural-workflows" | "editors" | "tools";

export type BlenderItemType = "node" | "modifier" | "editor" | "tool" | "shortcut";

export type AccentColor = "yellow" | "blue" | "green" | "red" | "purple" | "orange";

// ─── Nodes ───────────────────────────────────────────────────────────────────

export interface NodeSocket {
  name: string;
  type: "Geometry" | "Float" | "Integer" | "Boolean" | "Vector" | "Color" | "String" | "Shader" | "Image" | "Object" | "Collection" | "Material" | "Texture" | "Rotation" | "Menu";
  description: string;
  default?: string;
}

export interface BlenderNode {
  id: string;
  name: string;
  category: NodeCategory;
  subcategory: string;
  icon: string;
  color: AccentColor;
  description: string;
  whyItExists: string;
  whenToUse: string;
  inputs: NodeSocket[];
  outputs: NodeSocket[];
  beginnerExplanation: string;
  advancedExplanation: string;
  commonUseCases: string[];
  typicalConnections: string[];
  exampleWorkflow: string;
  commonMistakes: string[];
  performanceTips: string[];
  relatedNodes: string[];
  frequentlyUsedWith: string[];
  screenshotPlaceholder: string;
  quiz: { question: string; answer: string }[];
  practiceExercise: string;
  blenderVersion: string;
  lastVerified?: string;
  tags: string[];
}

// Index entry for fast search — keeps search bundle small
export interface NodeIndex {
  id: string;
  name: string;
  category: NodeCategory;
  subcategory: string;
  icon: string;
  color: AccentColor;
  tags: string[];
  description: string;
}

// ─── Modifiers ───────────────────────────────────────────────────────────────

export interface ModifierParameter {
  name: string;
  type: "float" | "int" | "bool" | "enum" | "object" | "collection" | "string" | "vector";
  default?: string;
  range?: string;
  description: string;
}

export interface BlenderModifier {
  id: string;
  name: string;
  category: ModifierCategory;
  icon: string;
  color: AccentColor;
  blenderVersion: string;
  lastVerified?: string;
  description: string;
  whyItExists: string;
  whenToUse: string;
  beginnerExplanation: string;
  advancedExplanation: string;
  parameters: ModifierParameter[];
  commonUseCases: string[];
  exampleWorkflow: string;
  commonMistakes: string[];
  performanceTips: string[];
  relatedModifiers: string[];
  screenshotPlaceholder: string;
  quiz: { question: string; answer: string }[];
  practiceExercise: string;
  tags: string[];
}

export interface ModifierIndex {
  id: string;
  name: string;
  category: ModifierCategory;
  icon: string;
  color: AccentColor;
  description: string;
  tags: string[];
}

// ─── Editors / Workspaces ────────────────────────────────────────────────────

export interface EditorShortcut {
  key: string;
  action: string;
  context?: string;
}

export interface EditorPanel {
  name: string;
  location: string;
  description: string;
}

export interface BlenderEditor {
  id: string;
  name: string;
  shortName?: string;
  icon: string;
  color: AccentColor;
  description: string;
  purpose: string;
  whatYouCanDo: string[];
  keyAreas: EditorPanel[];
  beginnerExplanation: string;
  advancedExplanation: string;
  commonWorkflows: string[];
  shortcuts: EditorShortcut[];
  tips: string[];
  commonMistakes: string[];
  relatedEditors: string[];
  screenshotPlaceholder: string;
  tags: string[];
}

export interface EditorIndex {
  id: string;
  name: string;
  icon: string;
  color: AccentColor;
  description: string;
  tags: string[];
}

// ─── Category definitions ─────────────────────────────────────────────────────

export interface BlenderCategoryDef {
  id: BlenderCategory;
  name: string;
  icon: string;
  description: string;
  color: string;
  nodeCount?: number;
  topics: string[];
}

// ─── Unified search ───────────────────────────────────────────────────────────

export interface UnifiedSearchResult {
  id: string;
  type: BlenderItemType;
  name: string;
  category: string;
  icon: string;
  description: string;
  url: string;
  tags: string[];
  score?: number;
}

// ─── AI-generated reference (for on-demand generation) ───────────────────────

export interface AIReferenceRequest {
  type: BlenderItemType;
  name: string;
  category?: string;
  context?: string;
}
