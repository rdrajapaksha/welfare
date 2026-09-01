import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { cn, percent } from "@/lib/utils";

export function Breadcrumbs({
  items,
  locale,
  label,
  tone = "dark",
}: {
  items: { name: string; href?: string }[];
  locale: Locale;
  label: string;
  tone?: "dark" | "light";
}) {
  return (
    <nav aria-label={label}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1.5 text-sm",
          tone === "light" ? "text-ink-200/80" : "text-ink-500 dark:text-ink-400",
        )}
      >
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={`/${locale}${item.href === "/" ? "" : item.href}`}
                  className="transition hover:text-brand-700 dark:hover:text-brand-300"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn(
                    last && (tone === "light" ? "font-medium text-white" : "font-medium text-ink-900 dark:text-white"),
                  )}
                >
                  {item.name}
                </span>
              )}
              {!last && <ChevronRight aria-hidden className="size-3.5 opacity-50" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center dark:border-white/12 dark:bg-white/5",
        className,
      )}
    >
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-ink-50 text-ink-400 dark:bg-white/10 dark:text-ink-300">
        {icon ?? <Inbox className="size-6" />}
      </div>
      <p className="text-base font-semibold text-ink-900 dark:text-white">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-ink-500 dark:text-ink-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Progress({
  value,
  total,
  className,
  tone = "brand",
  showLabel = false,
}: {
  value: number;
  total: number;
  className?: string;
  tone?: "brand" | "teal" | "gold";
  showLabel?: boolean;
}) {
  const pct = percent(value, total);
  const tones = {
    brand: "bg-gradient-to-r from-brand-600 to-brand-400",
    teal: "bg-gradient-to-r from-teal-600 to-teal-400",
    gold: "bg-gradient-to-r from-gold-600 to-gold-400",
  } as const;

  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-white/10"
      >
        <div className={cn("h-full rounded-full transition-all", tones[tone])} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <p className="mt-1.5 text-xs font-semibold text-ink-500 dark:text-ink-400">{pct}%</p>
      )}
    </div>
  );
}

/** Link-based filter chips. Keeps filtering server-rendered and crawlable. */
export function FilterChips({
  options,
  activeValue,
  basePath,
  paramName,
  locale,
  className,
}: {
  options: { value: string; label: string; count?: number }[];
  activeValue: string;
  basePath: string;
  paramName: string;
  locale: Locale;
  className?: string;
}) {
  return (
    <div className={cn("scrollbar-slim -mx-1 flex gap-2 overflow-x-auto px-1 pb-1", className)}>
      {options.map((option) => {
        const active = option.value === activeValue;
        const query = option.value === "all" ? "" : `?${paramName}=${encodeURIComponent(option.value)}`;
        return (
          <Link
            key={option.value}
            href={`/${locale}${basePath}${query}`}
            scroll={false}
            aria-current={active ? "true" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition",
              active
                ? "bg-ink-950 text-white shadow-[0_8px_20px_-12px_rgb(10_23_46/0.7)] dark:bg-white dark:text-ink-950"
                : "border border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-700 dark:border-white/12 dark:bg-white/5 dark:text-ink-200 dark:hover:bg-white/10",
            )}
          >
            {option.label}
            {typeof option.count === "number" && (
              <span className={cn("text-xs", active ? "opacity-70" : "opacity-55")}>{option.count}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  buildHref,
  labels,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  labels: { previous: string; next: string; pagination: string; page: string; of: string };
}) {
  if (totalPages <= 1) return null;

  const windowed = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1,
  );

  return (
    <nav aria-label={labels.pagination} className="flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link
          href={buildHref(page - 1)}
          rel="prev"
          className="rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-700 dark:border-white/12 dark:text-ink-200"
        >
          {labels.previous}
        </Link>
      )}
      {windowed.map((n, i) => {
        const gap = i > 0 && n - windowed[i - 1] > 1;
        return (
          <span key={n} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-ink-400">…</span>}
            <Link
              href={buildHref(n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "grid size-10 place-items-center rounded-full text-sm font-semibold transition",
                n === page
                  ? "bg-brand-700 text-white"
                  : "border border-ink-200 text-ink-700 hover:border-brand-400 hover:text-brand-700 dark:border-white/12 dark:text-ink-200",
              )}
            >
              {n}
            </Link>
          </span>
        );
      })}
      {page < totalPages && (
        <Link
          href={buildHref(page + 1)}
          rel="next"
          className="rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-700 dark:border-white/12 dark:text-ink-200"
        >
          {labels.next}
        </Link>
      )}
    </nav>
  );
}

export function DataTable({
  head,
  children,
  className,
}: {
  head: ReactNode[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "scrollbar-slim overflow-x-auto rounded-2xl border border-ink-200 bg-white dark:border-white/10 dark:bg-ink-900/50",
        className,
      )}
    >
      <table className="w-full min-w-[42rem] text-left text-sm">
        <thead className="border-b border-ink-200 bg-ink-50/70 dark:border-white/10 dark:bg-white/5">
          <tr>
            {head.map((cell, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-3 text-xs font-bold tracking-wider text-ink-500 uppercase dark:text-ink-400"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 dark:divide-white/8">{children}</tbody>
      </table>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "brand" | "teal" | "gold" | "ink";
  className?: string;
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200",
    teal: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200",
    gold: "bg-gold-50 text-gold-700 dark:bg-gold-500/15 dark:text-gold-200",
    ink: "bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-ink-100",
  } as const;

  return (
    <div className={cn("card-surface p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ink-500 dark:text-ink-400">{label}</p>
        {icon && <span className={cn("grid size-9 place-items-center rounded-xl", tones[tone])}>{icon}</span>}
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink-950 dark:text-white">{value}</p>
      {hint && <div className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">{hint}</div>}
    </div>
  );
}
