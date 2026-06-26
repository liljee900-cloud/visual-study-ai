interface NumberBadgeProps {
  number: number;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

export default function NumberBadge({ number, size = "md" }: NumberBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-yellow-400 text-black font-bold flex-shrink-0 ${sizes[size]}`}
    >
      {number}
    </span>
  );
}
