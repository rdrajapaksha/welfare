import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
  tone = "brand",
}: {
  children: ReactNode;
  className?: string;
  tone?: "brand" | "light" | "gold";
}) {
  const tones = {
    brand: "text-brand-700 dark:text-brand-300",
    light: "text-brand-200",
    gold: "text-gold-600 dark:text-gold-300",
  } as const;

  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-xs font-bold tracking-[0.16em] uppercase",
        tones[tone],
        className,
      )}
    >
      <span aria-hidden className="h-px w-7 bg-current opacity-60" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "dark",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
  action?: ReactNode;
}) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        action && !centered && "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto text-center")}>
        {eyebrow && (
          <Eyebrow tone={tone === "light" ? "light" : "brand"} className={cn(centered && "justify-center")}>
            {eyebrow}
          </Eyebrow>
        )}
        <h2
          className={cn(
            "mt-4 text-3xl font-extrabold sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]",
            tone === "light" ? "text-white" : "text-ink-950 dark:text-white",
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "mt-4 text-base leading-relaxed sm:text-lg",
              tone === "light" ? "text-ink-100/85" : "text-ink-600 dark:text-ink-300",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className={cn("shrink-0", centered && "mx-auto")}>{action}</div>}
    </div>
  );
}

export function Section({
  children,
  className,
  id,
  tone = "canvas",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "canvas" | "alt" | "ink" | "none";
}) {
  const tones = {
    canvas: "bg-canvas dark:bg-ink-950",
    alt: "bg-canvas-alt dark:bg-ink-900/40",
    ink: "bg-ink-950 text-white",
    none: "",
  } as const;

  return (
    <section id={id} className={cn("section-y scroll-mt-28", tones[tone], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}
