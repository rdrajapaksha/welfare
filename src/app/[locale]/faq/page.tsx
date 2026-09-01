import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata, faqSchema } from "@/lib/seo";
import { FAQ_CATEGORIES } from "@/lib/constants";
import { faqCategoryLabel } from "@/lib/labels";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Accordion } from "@/components/ui/accordion";
import { EmptyState } from "@/components/ui/misc";
import { JsonLd } from "@/components/ui/json-ld";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.faq.title, description: d.faq.subtitle, path: "/faq" });
}

export default async function FaqPage({
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
  const active = FAQ_CATEGORIES.includes(category as (typeof FAQ_CATEGORIES)[number]) ? category! : "all";

  const faqs = await prisma.faq.findMany({
    where: { isPublished: true, ...(active === "all" ? {} : { category: active }) },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <JsonLd
        data={faqSchema(faqs.map((f) => ({ question: pick(f, "question", locale), answer: pick(f, "answer", locale) })))}
      />
      <PageHero
        locale={locale}
        title={d.faq.title}
        subtitle={d.faq.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.faq.title }]}
      />
      <Section>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/${locale}/faq`} variant={active === "all" ? "secondary" : "outline"} size="sm">
            {d.common.all}
          </ButtonLink>
          {FAQ_CATEGORIES.map((cat) => (
            <ButtonLink
              key={cat}
              href={`/${locale}/faq?category=${cat}`}
              variant={active === cat ? "secondary" : "outline"}
              size="sm"
            >
              {faqCategoryLabel(d, cat)}
            </ButtonLink>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          {faqs.length === 0 ? (
            <EmptyState title={d.faq.noFaqs} />
          ) : (
            <Accordion
              items={faqs.map((f) => ({
                id: f.id,
                question: pick(f, "question", locale),
                answer: pick(f, "answer", locale),
              }))}
            />
          )}
        </div>
        <div className="card-surface mt-12 p-8 text-center">
          <h2 className="text-xl font-extrabold">{d.faq.stillStuckTitle}</h2>
          <p className="mt-2 text-ink-600 dark:text-ink-300">{d.faq.stillStuckText}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <ButtonLink href={`/${locale}/contact`}>{d.faq.contactCta}</ButtonLink>
            <ButtonLink href={`/${locale}/dashboard/tickets`} variant="outline">
              {d.faq.ticketCta}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
