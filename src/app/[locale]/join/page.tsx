import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { getMembershipFees } from "@/lib/membership-fees";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { JoinForm } from "@/components/forms/join-form";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.members.joinTitle, description: d.members.joinSubtitle, path: "/join" });
}

export default async function JoinPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);
  const fees = await getMembershipFees();

  const steps = [
    [d.members.step1, d.members.step1Text],
    [d.members.step2, d.members.step2Text],
    [d.members.step3, d.members.step3Text],
    [d.members.step4, d.members.step4Text],
  ];

  return (
    <>
      <PageHero
        locale={locale}
        title={d.members.joinTitle}
        subtitle={d.members.joinSubtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.members.joinTitle }]}
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-extrabold">{d.members.stepsTitle}</h2>
            <ol className="mt-5 space-y-4">
              {steps.map(([title, text], i) => (
                <li key={title} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-700 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold">{title}</p>
                    <p className="text-sm text-ink-600 dark:text-ink-300">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="card-surface mt-8 p-5">
              <h3 className="font-extrabold">{d.members.feesTitle}</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt>{d.members.feesRegistration}</dt>
                  <dd className="font-bold">{formatCurrency(fees.registration, locale)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{d.members.feesMonthly}</dt>
                  <dd className="font-bold">{formatCurrency(fees.monthly, locale)}</dd>
                </div>
              </dl>
              <ButtonLink href={`/${locale}/documents`} variant="ghost" className="mt-4 px-0">
                {d.nav.documents}
              </ButtonLink>
            </div>
          </div>
          <div className="card-surface p-6 lg:col-span-3 lg:p-8">
            <JoinForm d={d} />
          </div>
        </div>
      </Section>
    </>
  );
}
