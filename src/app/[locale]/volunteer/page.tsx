import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { VolunteerForm } from "@/components/forms/volunteer-form";
import { volunteerAreaDesc, volunteerAreaLabel } from "@/lib/labels";
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
          </div>
          <div className="card-surface p-6 lg:col-span-3 lg:p-8">
            <VolunteerForm d={d} />
          </div>
        </div>
      </Section>
      <Section className="border-t border-ink-100 dark:border-white/10">
        <h2 className="text-2xl font-extrabold">{d.volunteer.categoriesTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-600 dark:text-ink-300">{d.volunteer.areasTitle}</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VOLUNTEER_AREAS.map((area) => (
            <li key={area} className="rounded-2xl border border-ink-100 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-bold tracking-wider text-brand-600 uppercase">{area}</p>
              <h3 className="mt-2 text-base font-extrabold">{volunteerAreaLabel(d, area)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                {volunteerAreaDesc(d, area)}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
