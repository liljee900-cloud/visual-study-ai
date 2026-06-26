export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function difficultyColor(difficulty: string): "green" | "yellow" | "red" | "purple" {
  switch (difficulty) {
    case "Beginner": return "green";
    case "Intermediate": return "yellow";
    case "Advanced": return "red";
    case "Expert": return "purple";
    default: return "yellow";
  }
}
