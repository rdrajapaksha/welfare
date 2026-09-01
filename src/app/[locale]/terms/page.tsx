import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({
    locale: raw,
    title: d.footer.terms,
    description: "Terms of use for the Heart Link Allianz Welfare Association website and member services.",
    path: "/terms",
  });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);

  const sections = [
    {
      title: "About these terms",
      body: `These terms govern use of ${siteConfig.name}'s website, member dashboard and public forms. The association is registered in Sri Lanka as ${siteConfig.legalName} (${siteConfig.registrationNo}). Using the site means you agree to these terms and to the constitution of the association where membership is concerned.`,
    },
    {
      title: "Membership and the constitution",
      body: "Online membership applications are offers only. Admission is decided by the membership sub-committee under the constitution. Welfare benefits, voting rights and subscriptions are governed by that constitution and by circulars published in the document centre — not by marketing copy on this website. Members must keep contact details accurate and treat other members' information with care.",
    },
    {
      title: "Donations and payments",
      body: "Donations are voluntary gifts to the association's stated purposes. A reference is issued at submission; a receipt follows once the treasurer confirms the funds. Card payments shown as confirmed on this demo site are illustrative. Standing orders and bank transfers remain the member's responsibility to maintain. Refunds are considered only where a payment was made in error and the funds have not been allocated.",
    },
    {
      title: "Website use",
      body: "You must not misuse the site, attempt to access another person's dashboard, scrape personal directories, or post unlawful or abusive content on forms. Event registrations may be closed when capacity is reached. Content is provided in English, Sinhala and Tamil in good faith; the constitution and audited accounts in their original language prevail if a translation differs. We may suspend accounts that breach these terms.",
    },
    {
      title: "Liability and governing law",
      body: "The association is not liable for delays caused by banks, postal services, third-party platforms or events outside our reasonable control. Information on programmes is updated regularly but eligibility is always confirmed by the committee. These terms are governed by the law of Sri Lanka. Disputes that cannot be settled by the grievance procedure in the constitution may be taken to the courts of Colombo.",
    },
  ];

  return (
    <>
      <PageHero
        locale={locale}
        title={d.footer.terms}
        subtitle="The conditions that apply when you use this website, donate, or apply for membership."
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.footer.terms }]}
      />
      <Section>
        <div className="mx-auto max-w-3xl space-y-10">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-xl font-extrabold">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-ink-600 dark:text-ink-300">{section.body}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
