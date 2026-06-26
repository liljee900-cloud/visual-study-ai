export function buildStudyPackPrompt(transcript: string, videoUrl: string, videoTitle?: string): string {
  return `You are an expert educational content designer. Your job is to transform a raw video transcript into a richly structured study pack.

VIDEO URL: ${videoUrl}
VIDEO TITLE: ${videoTitle || "Unknown"}

TRANSCRIPT:
${transcript.slice(0, 18000)}

---

Generate a COMPLETE study pack as a single JSON object matching this exact TypeScript interface:

{
  "overview": {
    "videoTitle": string,
    "mainTopic": string,
    "difficulty": "Beginner" | "Intermediate" | "Advanced" | "Expert",
    "estimatedLearningTime": string (e.g. "45 minutes"),
    "prerequisites": string[],
    "learningObjectives": string[] (5-8 items, action-verb format),
    "summary": string (2-3 sentences, engaging),
    "category": string (e.g. "3D Design", "Programming", "AI", "Marketing")
  },
  "concepts": [
    {
      "id": string (kebab-case),
      "number": number,
      "name": string,
      "icon": string (single relevant emoji),
      "beginnerExplanation": string (explain to a 12-year-old),
      "whatItDoes": string,
      "whyItMatters": string,
      "whenToUse": string,
      "example": string (concrete, practical),
      "commonMistakes": string[] (2-3 items),
      "proTip": string,
      "screenshotPlaceholder": string (description of what a screenshot would show)
    }
  ],
  "steps": [
    {
      "id": string,
      "number": number,
      "title": string,
      "explanation": string (thorough, 2-4 sentences),
      "whyItMatters": string,
      "expectedResult": string,
      "mistakesToAvoid": string[],
      "tips": string[]
    }
  ],
  "cheatSheet": {
    "definitions": [{ "term": string, "definition": string }],
    "importantSettings": [{ "name": string, "value": string, "note": string }],
    "keyboardShortcuts": [{ "key": string, "action": string }],
    "workflow": string[] (ordered steps),
    "bestPractices": string[],
    "commonPitfalls": string[],
    "memoryTricks": string[]
  },
  "quiz": {
    "questions": [
      {
        "id": string,
        "type": "multiple-choice" | "true-false" | "fill-blank" | "short-answer",
        "question": string,
        "options": string[] (for multiple-choice only, 4 options),
        "answer": string,
        "explanation": string
      }
    ],
    "flashcards": [
      { "id": string, "front": string, "back": string }
    ]
  },
  "tags": string[] (5-10 relevant tags)
}

RULES:
- Extract EVERY important concept, tool, node, shortcut, workflow, button, method, definition, technique from the transcript
- concepts array should have 6-15 items minimum
- steps array should have 5-12 items representing the actual tutorial flow
- quiz should have 8-12 questions (mix of all types) and 8-12 flashcards
- cheatSheet.keyboardShortcuts only if mentioned in transcript, else empty array
- Be specific and educational — not generic. The person reading should learn the actual content.
- Do NOT wrap in markdown code fences. Return ONLY valid JSON.`;
}
