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
    title: d.footer.privacy,
    description: "How Heart Link Allianz Welfare Society - Sri Lanka collects, uses and protects personal information.",
    path: "/privacy",
  });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);

  const sections = [
    {
      title: "Who we are",
      body: `${siteConfig.legalName} (Reg. No. ${siteConfig.registrationNo}) is a registered welfare association in Sri Lanka. This policy explains how we handle information about members, donors, volunteers, applicants and visitors to this website. The office is at ${siteConfig.contact.address.street}, ${siteConfig.contact.address.locality}. You can write to ${siteConfig.contact.email}.`,
    },
    {
      title: "What we collect",
      body: "We collect the details you give us on membership applications, donation forms, event registrations, volunteer forms and support tickets — typically name, NIC number, contact details, address and the reason you are contacting us. The website also stores a session cookie when you sign in, and a language preference. We do not sell mailing lists or run third-party advertising trackers.",
    },
    {
      title: "How we use information",
      body: "Membership records are used to administer welfare schemes, subscriptions, the annual general meeting and the optional public directory (name, city and membership category only). Donation records are used to issue receipts, report spending and, unless you ask to remain anonymous, to acknowledge gifts. Volunteer and event data is used only to organise programmes. Welfare claims are reviewed by the claims committee and recorded in the ledger.",
    },
    {
      title: "Sharing, retention and security",
      body: "We share personal data only when the constitution or the law requires it — for example with our independent auditor, a bank processing a grant, or a public authority with a lawful request. Records are kept for the period required by association rules and tax law, then archived or destroyed. Access to the member and admin dashboards is limited to authenticated users with the appropriate role.",
    },
    {
      title: "Your rights",
      body: "Members may inspect their own record from the dashboard and request a correction through a support ticket. You may opt out of the public directory at any time. Donors may ask for a copy of their receipt. To withdraw consent for marketing messages or to raise a privacy concern, email the secretary or call the office. Complaints that cannot be resolved internally may be referred under Sri Lankan data-protection law.",
    },
  ];

  return (
    <>
      <PageHero
        locale={locale}
        title={d.footer.privacy}
        subtitle="How we collect, use and protect information entrusted to the association."
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.footer.privacy }]}
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
