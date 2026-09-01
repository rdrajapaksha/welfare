import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { PARTNER_TIER_ORDER, partnerTierLabel } from "@/lib/labels";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.partners.title, description: d.partners.subtitle, path: "/partners" });
}

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);
  const partners = await prisma.partner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  if (partners.length === 0) {
    return (
      <>
        <PageHero locale={locale} title={d.partners.title} subtitle={d.partners.subtitle} crumbLabel={d.a11y.breadcrumb} crumbs={[{ name: d.nav.home, href: "/" }, { name: d.partners.title }]} />
        <Section>
          <EmptyState title={d.partners.noPartners} />
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHero
        locale={locale}
        title={d.partners.title}
        subtitle={d.partners.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.partners.title }]}
      />
      {PARTNER_TIER_ORDER.map((tier) => {
        const group = partners.filter((p) => p.tier === tier);
        if (group.length === 0) return null;
        return (
          <Section key={tier} tone={tier === "PLATINUM" ? "alt" : "canvas"}>
            <h2 className="text-2xl font-extrabold">{partnerTierLabel(d, tier)}</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((p) => (
                <article key={p.id} className="card-surface p-6">
                  <div className="grid h-20 place-items-center rounded-xl bg-ink-50 dark:bg-white/5">
                    <Image src={p.logoUrl} alt={p.name} width={200} height={72} className="max-h-14 w-auto object-contain" />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold">{p.name}</h3>
                  {p.since && (
                    <p className="text-xs text-ink-500">
                      {d.partners.partnerSince} {p.since}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{pick(p, "description", locale)}</p>
                  {p.website && (
                    <a href={p.website} className="mt-3 inline-block text-sm font-bold text-brand-700" rel="noopener noreferrer" target="_blank">
                      {d.partners.visitWebsite}
                    </a>
                  )}
                </article>
              ))}
            </div>
          </Section>
        );
      })}
      <Section tone="ink">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">{d.partners.becomeTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-200">{d.partners.becomeText}</p>
          <ButtonLink href={`/${locale}/contact?topic=SPONSORSHIP`} variant="gold" className="mt-6">
            {d.partners.becomeCta}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
