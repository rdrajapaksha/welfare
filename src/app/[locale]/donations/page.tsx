import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { buildMetadata, donateActionSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { DonationForm } from "@/components/forms/donation-form";
import { JsonLd } from "@/components/ui/json-ld";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.donations.title, description: d.donations.subtitle, path: "/donations" });
}

export default async function DonationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);
  const bank = siteConfig.bank;

  return (
    <>
      <JsonLd data={donateActionSchema(locale)} />
      <PageHero
        locale={locale}
        title={d.donations.title}
        subtitle={d.donations.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.donations.title }]}
        actions={
          <ButtonLink href={`/${locale}/donations/updates`} variant="ink" size="sm">
            {d.donations.updatesTitle}
          </ButtonLink>
        }
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <DonationForm locale={locale} d={d} />
          </div>
          <aside className="space-y-5 lg:col-span-2">
            <div id="bank" className="card-surface scroll-mt-28 p-6">
              <h2 className="text-lg font-extrabold">{d.donations.bankTitle}</h2>
              <p className="mt-1 text-sm text-ink-500">{d.donations.bankSubtitle}</p>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  [d.donations.bankName, bank.bankName],
                  [d.donations.bankBranch, bank.branch],
                  [d.donations.bankAccountName, bank.accountName],
                  [d.donations.bankAccountNo, bank.accountNo],
                  [d.donations.bankSwift, bank.swift],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3 border-b border-ink-100 py-2 dark:border-white/8">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-ink-500">{d.donations.bankNote}</p>
            </div>
            <div className="card-surface p-6">
              <h2 className="text-lg font-extrabold">{d.donations.impactTitle}</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-600 dark:text-ink-300">
                <li>Rs. 2,500 — {d.donations.impact1}</li>
                <li>Rs. 15,000 — {d.donations.impact2}</li>
                <li>Rs. 25,000 — {d.donations.impact3}</li>
                <li>Rs. 50,000 — {d.donations.impact4}</li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
