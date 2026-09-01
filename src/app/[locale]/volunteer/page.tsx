import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { VolunteerForm } from "@/components/forms/volunteer-form";
import { volunteerAreaLabel } from "@/lib/labels";
import { VOLUNTEER_AREAS } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.volunteer.title, description: d.volunteer.subtitle, path: "/volunteer" });
}

export default async function VolunteerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);

  return (
    <>
      <PageHero
        locale={locale}
        title={d.volunteer.title}
        subtitle={d.volunteer.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.volunteer.title }]}
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-extrabold">{d.volunteer.whyTitle}</h2>
            <ul className="mt-5 space-y-3">
              {[d.volunteer.why1, d.volunteer.why2, d.volunteer.why3, d.volunteer.why4].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-ink-700 dark:text-ink-200">
                  <HeartHandshake className="mt-0.5 size-5 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
            <h3 className="mt-10 text-lg font-extrabold">{d.volunteer.areasTitle}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {VOLUNTEER_AREAS.map((area) => (
                <li
                  key={area}
                  className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 dark:bg-brand-500/15 dark:text-brand-200"
                >
                  {volunteerAreaLabel(d, area)}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-surface p-6 lg:col-span-3 lg:p-8">
            <VolunteerForm d={d} />
          </div>
        </div>
      </Section>
    </>
  );
}
