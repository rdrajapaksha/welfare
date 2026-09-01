import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 shadow-xs transition " +
  "placeholder:text-ink-400 border-ink-200 " +
  "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none " +
  "disabled:bg-ink-50 disabled:text-ink-400 " +
  "dark:bg-ink-900/60 dark:text-white dark:border-white/15 dark:placeholder:text-ink-400";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-ink-800 dark:text-ink-100"
      >
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-brand-600">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-500 dark:text-ink-400">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cn(controlBase, className)} {...rest} />;
}

export function Textarea({ className, rows = 5, ...rest }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cn(controlBase, "resize-y", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <select className={cn(controlBase, "appearance-none pr-9", className)} {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  className,
  ...rest
}: { label: ReactNode } & ComponentProps<"input">) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 text-sm text-ink-700 dark:text-ink-200",
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 size-4.5 shrink-0 rounded border-ink-300 text-brand-700 accent-brand-700 focus:ring-2 focus:ring-brand-500/30 dark:border-white/25"
        {...rest}
      />
      <span className="leading-relaxed">{label}</span>
    </label>
  );
}

export function RadioCard({
  label,
  description,
  className,
  ...rest
}: { label: ReactNode; description?: string } & ComponentProps<"input">) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 bg-white p-3.5 transition",
        "hover:border-brand-400 has-checked:border-brand-600 has-checked:bg-brand-50/70 has-checked:ring-2 has-checked:ring-brand-500/20",
        "dark:border-white/12 dark:bg-white/5 dark:has-checked:bg-brand-500/10",
        className,
      )}
    >
      <input
        type="radio"
        className="mt-0.5 size-4.5 shrink-0 accent-brand-700 focus:ring-2 focus:ring-brand-500/30"
        {...rest}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-900 dark:text-white">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">{description}</span>
        )}
      </span>
    </label>
  );
}

export function FormAlert({
  tone = "success",
  title,
  children,
}: {
  tone?: "success" | "error" | "info";
  title: string;
  children?: ReactNode;
}) {
  const tones = {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-100",
    error:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-100",
    info: "border-ink-200 bg-ink-50 text-ink-900 dark:border-white/15 dark:bg-white/5 dark:text-white",
  } as const;

  return (
    <div role="status" className={cn("rounded-2xl border p-4", tones[tone])}>
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 text-sm opacity-90">{children}</div>}
    </div>
  );
}

export function Fieldset({
  legend,
  description,
  children,
  className,
}: {
  legend: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="text-base font-bold text-ink-950 dark:text-white">{legend}</legend>
      {description && (
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{description}</p>
      )}
      <div className="mt-4 grid gap-4">{children}</div>
    </fieldset>
  );
}
