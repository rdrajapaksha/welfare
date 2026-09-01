import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "brand"
  | "ink"
  | "gold"
  | "teal"
  | "neutral"
  | "success"
  | "warning"
  | "danger";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-800 ring-brand-200 dark:bg-brand-500/15 dark:text-brand-200 dark:ring-brand-400/30",
  ink: "bg-ink-100 text-ink-800 ring-ink-200 dark:bg-white/10 dark:text-ink-100 dark:ring-white/15",
  gold: "bg-gold-50 text-gold-800 ring-gold-200 dark:bg-gold-400/15 dark:text-gold-200 dark:ring-gold-400/30",
  teal: "bg-teal-50 text-teal-800 ring-teal-200 dark:bg-teal-400/15 dark:text-teal-200 dark:ring-teal-400/30",
  neutral: "bg-ink-50 text-ink-600 ring-ink-200 dark:bg-white/5 dark:text-ink-300 dark:ring-white/10",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-200 dark:ring-emerald-400/30",
  warning: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/30",
  danger: "bg-red-50 text-red-800 ring-red-200 dark:bg-red-400/15 dark:text-red-200 dark:ring-red-400/30",
};

export function Badge({
  children,
  tone = "brand",
  className,
  dot = false,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

/** Maps arbitrary domain statuses to a consistent colour language. */
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "ACTIVE":
    case "CONFIRMED":
    case "APPROVED":
    case "PAID":
    case "RESOLVED":
    case "COMPLETED":
      return "success";
    case "PENDING":
    case "SUBMITTED":
    case "UNDER_REVIEW":
    case "OPEN":
    case "NEW":
    case "PLANNED":
      return "warning";
    case "REJECTED":
    case "FAILED":
    case "SUSPENDED":
    case "URGENT":
      return "danger";
    case "IN_PROGRESS":
    case "ONGOING":
    case "AWAITING_MEMBER":
    case "CONTACTED":
      return "brand";
    default:
      return "neutral";
  }
}
