// Prompt for AI Topic Generator — creates a tutorial from scratch, no source video needed.

export function topicGuidePrompt(topic: string): string {
  const now = new Date().toISOString();

  return `You are a world-class instructional designer and domain expert. Create a complete, detailed step-by-step tutorial on the following topic. You are GENERATING the content from your knowledge — there is no source video to reconstruct.

TOPIC: ${topic}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE 1 — PRACTICAL STEPS ONLY
Each step must be a concrete, actionable instruction. Not theory. Not explanation. The user should be able to follow along and produce something real.

RULE 2 — EXACT VALUES
Whenever a setting, value, or parameter matters, give the exact value:
- "Set Roughness to 0.3" not "lower the roughness"
- "Scale to 2.0 on the X axis" not "scale it up"
- "Press Shift+A → Texture → Noise Texture" not "add a noise texture"

RULE 3 — 20-50 STEPS
Create enough steps to fully cover the topic. A simple tip might have 10 steps. A full technique should have 30–50 steps. Never stop early.

RULE 4 — PRECISE CLICK LOCATIONS
For every step, state where in the UI to click or what to do:
- "In the 3D Viewport, press Tab to enter Edit Mode"
- "In the Shader Editor (open via the dropdown at the top of any panel), press Shift+A"
- "Click the + New button in the Materials Properties panel"

RULE 5 — VIVID SCREENSHOT DESCRIPTIONS
Each screenshotPlaceholder must describe what the user would see:
- WRONG: "The result so far"
- RIGHT: "3D Viewport in Solid mode showing a UV Sphere with dark grey base material. The Properties panel on the right has the Material tab open, showing the Principled BSDF with Roughness set to 0.3."

RULE 6 — DETECT DOMAIN
Identify the software from the topic and fill in editor names, shortcuts, and UI panel names accurately. Default to Blender if no software is specified.

RULE 7 — CHECKPOINTS
Add 2–5 checkpoints at natural milestones in the process.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON — no markdown, no preamble:

{
  "id": "topic-${Date.now()}",
  "createdAt": "${now}",
  "videoUrl": "topic://${encodeURIComponent(topic)}",
  "version": "2.0",
  "title": "Clear, specific title for this topic",
  "description": "1–2 sentences describing what the learner will create or achieve",
  "software": "Blender 4.x (or detected software)",
  "difficulty": "Beginner | Intermediate | Advanced",
  "estimatedTime": "e.g. '30 minutes'",
  "prerequisites": ["what you need to know first"],
  "finalResult": {
    "description": "What the learner will have made by the end",
    "screenshotPlaceholder": "Vivid description of the final result"
  },
  "steps": [
    {
      "id": "step-1",
      "number": 1,
      "title": "Short imperative title",
      "editor": "Active editor name",
      "panel": "Specific panel or null",
      "action": "Clear, direct instruction",
      "shortcut": "Keyboard shortcut or null",
      "menuPath": "Full menu path or null",
      "whereToClick": "Precise UI location or null",
      "settings": [{"name": "Setting name", "value": "Exact value", "unit": null, "note": null}],
      "connections": [],
      "purpose": "Why this step matters",
      "expectedResult": "What the user sees after completing this step",
      "commonMistakes": ["Specific mistake to avoid"],
      "tips": ["Pro tip for this step"],
      "screenshotPlaceholder": "Vivid screen description",
      "sideNote": null
    }
  ],
  "checkpoints": [
    {
      "id": "checkpoint-1",
      "afterStep": 10,
      "title": "Milestone name",
      "description": "Project state at this point",
      "screenshotPlaceholder": "What the result looks like here",
      "verificationPoints": ["Thing to verify"],
      "commonIssues": [{"issue": "Problem", "fix": "Solution"}]
    }
  ],
  "summary": {
    "whatWasBuilt": "Description of completed project",
    "techniquesLearned": ["Technique name"],
    "keyTakeaways": ["Key insight"],
    "relatedTechniques": ["Related skill"],
    "suggestedNextLessons": ["What to learn next"]
  },
  "tags": ["topic", "tags"]
}`;
}
