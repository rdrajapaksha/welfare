import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/forms/contact-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.contact.title, description: d.contact.subtitle, path: "/contact" });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);
  const c = siteConfig.contact;

  return (
    <>
      <PageHero
        locale={locale}
        title={d.contact.title}
        subtitle={d.contact.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.contact.title }]}
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="text-xl font-extrabold">{d.contact.formTitle}</h2>
            <p className="mt-1 text-sm text-ink-500">{d.contact.formSubtitle}</p>
            <div className="mt-6">
              <ContactForm d={d} />
            </div>
          </div>
          <aside className="lg:col-span-2">
            <div className="card-surface p-6">
              <h2 className="font-extrabold">{d.contact.detailsTitle}</h2>
              <ul className="mt-4 space-y-3 text-sm text-ink-700 dark:text-ink-200">
                <li className="flex gap-3">
                  <MapPin className="size-4 shrink-0 text-brand-600" />
                  {c.address.street}, {c.address.locality} {c.address.postalCode}
                </li>
                <li className="flex gap-3">
                  <Phone className="size-4 shrink-0 text-brand-600" />
                  <a href={`tel:${c.phone}`}>{c.phoneDisplay}</a>
                </li>
                <li className="flex gap-3">
                  <Phone className="size-4 shrink-0 text-brand-600" />
                  {d.contact.hotline}: {c.hotlineDisplay}
                </li>
                <li className="flex gap-3">
                  <Mail className="size-4 shrink-0 text-brand-600" />
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                </li>
                <li className="flex gap-3">
                  <Clock className="size-4 shrink-0 text-brand-600" />
                  {d.contact.officeHoursValue}
                </li>
              </ul>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-ink-200 dark:border-white/10">
              <iframe title={d.contact.mapTitle} src={c.mapEmbed} className="h-56 w-full" loading="lazy" />
            </div>
            <div className="mt-4 rounded-2xl bg-brand-50 p-5 dark:bg-brand-500/10">
              <p className="font-bold">{d.contact.emergencyTitle}</p>
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{d.contact.emergencyText}</p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
