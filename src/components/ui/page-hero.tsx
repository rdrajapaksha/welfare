import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { Breadcrumbs } from "./misc";
import { cn } from "@/lib/utils";

export function PageHero({
  locale,
  title,
  subtitle,
  crumbs,
  crumbLabel,
  actions,
  className,
}: {
  locale: Locale;
  title: string;
  subtitle?: string;
  crumbs: { name: string; href?: string }[];
  crumbLabel: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden bg-ink-950 text-white", className)}>
      <div aria-hidden className="mesh-ink pointer-events-none absolute inset-0 opacity-90" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-8%] size-[28rem] rounded-full bg-brand-600/20 blur-3xl"
      />
      <div className="container-page relative py-16 sm:py-20 lg:py-24">
        <Breadcrumbs items={crumbs} locale={locale} label={crumbLabel} tone="light" />
        <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-200 sm:text-lg">{subtitle}</p>
        )}
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
