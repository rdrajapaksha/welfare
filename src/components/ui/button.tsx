import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "ink" | "gold" | "donate" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 " +
  "disabled:pointer-events-none disabled:opacity-55 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink-950 text-white shadow-[0_10px_28px_-12px_rgb(10_10_10/0.45)] hover:bg-ink-800 hover:shadow-[0_14px_34px_-12px_rgb(10_10_10/0.55)] active:translate-y-px",
  secondary:
    "bg-ink-900 text-white hover:bg-ink-800 shadow-[0_10px_28px_-14px_rgb(10_10_10/0.5)] active:translate-y-px",
  outline:
    "border border-ink-300 bg-white/70 text-ink-900 hover:border-brand-600 hover:bg-white hover:text-brand-700 dark:bg-white/5 dark:text-white dark:border-white/20 dark:hover:bg-white/10",
  ghost:
    "text-ink-700 hover:bg-ink-100/80 hover:text-ink-900 dark:text-ink-200 dark:hover:bg-white/10 dark:hover:text-white",
  ink: "bg-white text-ink-900 hover:bg-ink-50 shadow-[0_10px_28px_-16px_rgb(0_0_0/0.5)]",
  gold: "bg-gold-400 text-ink-950 hover:bg-gold-300 shadow-[0_10px_28px_-14px_rgb(184_148_69/0.55)]",
  donate:
    "bg-brand-600 text-white shadow-[0_10px_28px_-12px_rgb(236_42_43/0.5)] hover:bg-brand-700 hover:shadow-[0_14px_34px_-12px_rgb(201_31_32/0.55)] active:translate-y-px",
  danger: "bg-brand-700 text-white hover:bg-brand-800",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  fullWidth,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  fullWidth,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
