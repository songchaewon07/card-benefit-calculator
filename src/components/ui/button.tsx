import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40",
  secondary:
    "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
  ghost:
    "bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  sm: "px-3.5 py-1.5 text-xs",
};

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors whitespace-nowrap";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
