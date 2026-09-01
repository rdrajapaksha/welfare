import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { donationPurposeLabel } from "@/lib/labels";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.donations.updatesTitle, description: d.donations.updatesSubtitle, path: "/donations/updates" });
}

export default async function DonationUpdatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);
  const donations = await prisma.donation.findMany({
    where: { status: "CONFIRMED" },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <>
      <PageHero
        locale={locale}
        title={d.donations.updatesTitle}
        subtitle={d.donations.updatesSubtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[
          { name: d.nav.home, href: "/" },
          { name: d.nav.donations, href: "/donations" },
          { name: d.donations.updatesTitle },
        ]}
      />
      <Section>
        <h2 className="text-xl font-extrabold">{d.donations.recentDonations}</h2>
        <ul className="mt-6 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200 bg-white dark:divide-white/8 dark:border-white/10 dark:bg-ink-900/50">
          {donations.map((don) => (
            <li key={don.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-semibold">{don.isAnonymous ? d.donations.anonymousDonor : don.donorName}</p>
                <p className="text-xs text-ink-500">{formatDateShort(don.createdAt, locale)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{donationPurposeLabel(d, don.purpose)}</Badge>
                <p className="font-extrabold">{formatCurrency(don.amount, locale)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
