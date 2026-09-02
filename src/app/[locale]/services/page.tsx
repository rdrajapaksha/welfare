import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { PROGRAMME_CATEGORIES } from "@/lib/constants";
import { programmeCategoryLabel } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { EmptyState, FilterChips } from "@/components/ui/misc";
import { MediaFrame } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.services.title, description: d.services.subtitle, path: "/services" });
}

export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { category } = await searchParams;
  const d = await getDictionary(locale);
  const active = PROGRAMME_CATEGORIES.includes(category as (typeof PROGRAMME_CATEGORIES)[number]) ? category! : "all";

  const [programmes, counts] = await Promise.all([
    prisma.programme.findMany({
      where: { isActive: true, ...(active === "all" ? {} : { category: active }) },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.programme.groupBy({
      by: ["category"],
      where: { isActive: true },
      _count: { _all: true },
    }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.category, c._count._all]));

  return (
    <>
      <PageHero
        locale={locale}
        title={d.services.title}
        subtitle={d.services.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.services.title }]}
      />
      <Section>
        <FilterChips
          locale={locale}
          basePath="/services"
          paramName="category"
          activeValue={active}
          options={[
            { value: "all", label: d.common.all, count: Object.values(countMap).reduce((s, n) => s + n, 0) },
            ...PROGRAMME_CATEGORIES.map((cat) => ({
              value: cat,
              label: programmeCategoryLabel(d, cat),
              count: countMap[cat] ?? 0,
            })),
          ]}
        />
        {programmes.length === 0 ? (
          <EmptyState title={d.services.noProgrammes} className="mt-10" />
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {programmes.map((p, i) => (
              <Reveal key={p.id} delay={i * 50} variant="scale">
                <Link href={`/${locale}/services/${p.slug}`} className="card-surface card-interactive group flex h-full flex-col overflow-hidden">
                  <MediaFrame src={p.coverImage ?? "/media/hero-secondary.svg"} alt="" ratio="16/9" imgClassName="group-hover:scale-105" />
                  <div className="flex flex-1 flex-col p-6">
                    <Badge>{programmeCategoryLabel(d, p.category)}</Badge>
                    <h2 className="mt-3 text-xl font-extrabold text-ink-950 transition-colors duration-300 group-hover:text-brand-700 dark:text-white">
                      {pick(p, "title", locale)}
                    </h2>
                    <p className="mt-2 flex-1 text-sm text-ink-600 dark:text-ink-300">{pick(p, "summary", locale)}</p>
                    {p.benefitAmount != null && (
                      <p className="mt-3 text-sm font-semibold text-ink-800 dark:text-ink-100">
                        {d.services.benefitUpTo} {formatCurrency(p.benefitAmount, locale)}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                      {d.common.readMore}
                      <ArrowRight className="link-arrow size-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
