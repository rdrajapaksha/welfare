import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { programmeCategoryLabel } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { MediaFrame } from "@/components/ui/media";

export async function generateStaticParams() {
  const programmes = await prisma.programme.findMany({ where: { isActive: true }, select: { slug: true } });
  return programmes.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const programme = await prisma.programme.findUnique({ where: { slug } });
  if (!programme) return {};
  return buildMetadata({
    locale: raw,
    title: pick(programme, "title", raw),
    description: pick(programme, "summary", raw),
    path: `/services/${slug}`,
    image: programme.coverImage ?? undefined,
  });
}

export default async function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);

  const programme = await prisma.programme.findUnique({ where: { slug } });
  if (!programme || !programme.isActive) notFound();

  const related = await prisma.programme.findMany({
    where: { isActive: true, category: programme.category, slug: { not: slug } },
    orderBy: { sortOrder: "asc" },
    take: 3,
  });

  return (
    <>
      <PageHero
        locale={locale}
        title={pick(programme, "title", locale)}
        subtitle={pick(programme, "summary", locale)}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[
          { name: d.nav.home, href: "/" },
          { name: d.services.title, href: "/services" },
          { name: pick(programme, "title", locale) },
        ]}
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <MediaFrame src={programme.coverImage ?? "/media/hero-secondary.svg"} alt="" ratio="16/9" className="mb-8" />
            <Badge>{programmeCategoryLabel(d, programme.category)}</Badge>
            <div
              className="prose-hla mt-6"
              dangerouslySetInnerHTML={{ __html: pick(programme, "body", locale) }}
            />
          </div>
          <aside className="space-y-5 lg:col-span-4">
            {programme.benefitAmount != null && (
              <div className="card-surface p-6">
                <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">{d.services.benefitUpTo}</p>
                <p className="mt-2 text-3xl font-extrabold text-brand-700">
                  {formatCurrency(programme.benefitAmount, locale)}
                </p>
              </div>
            )}
            {pick(programme, "eligibility", locale) && (
              <div className="card-surface p-6">
                <h2 className="font-extrabold">{d.services.eligibility}</h2>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{pick(programme, "eligibility", locale)}</p>
              </div>
            )}
            <div className="card-surface p-6">
              <h2 className="font-extrabold">{d.services.howToApply}</h2>
              <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{d.services.howToApplyText}</p>
              <div className="mt-4 flex flex-col gap-2">
                <ButtonLink href={`/${locale}/dashboard/benefits`}>{d.services.applyCta}</ButtonLink>
                <ButtonLink href={`/${locale}/documents`} variant="outline">
                  {d.services.formsCta}
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </Section>
      {related.length > 0 && (
        <Section tone="alt">
          <h2 className="text-2xl font-extrabold">{d.services.relatedTitle}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <Link href={`/${locale}/services/${item.slug}`} className="card-surface block p-5">
                  <p className="font-bold text-ink-950 dark:text-white">{pick(item, "title", locale)}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-600 dark:text-ink-300">{pick(item, "summary", locale)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
