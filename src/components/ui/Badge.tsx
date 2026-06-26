import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "yellow" | "green" | "blue" | "red" | "purple" | "default";
  className?: string;
}

const variants = {
  yellow: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  green: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  blue: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  red: "bg-red-400/10 text-red-400 border-red-400/20",
  purple: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  default: "bg-white/5 text-white/60 border-white/10",
};

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
