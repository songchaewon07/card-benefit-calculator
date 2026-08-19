import type { HTMLAttributes } from "react";

type Tone = "neutral" | "positive" | "negative" | "primary";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  positive:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  negative: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
  primary: "bg-primary/10 text-primary",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({
  tone = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
      {...props}
    />
  );
}
