import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Compass, HeartHandshake, Landmark, ShieldCheck } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { HISTORY, MISSION, VALUES, VISION } from "@/content/about";
import { PageHero } from "@/components/ui/page-hero";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { MediaFrame } from "@/components/ui/media";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.about.title, description: d.about.subtitle, path: "/about" });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);

  return (
    <>
      <PageHero
        locale={locale}
        title={d.about.title}
        subtitle={d.about.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.about.title }]}
        actions={
          <>
            <ButtonLink href={`/${locale}/about/committee`} variant="ink" size="sm">
              {d.about.committeeTitle}
            </ButtonLink>
            <ButtonLink href={`/${locale}/documents`} variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
              {d.about.documentsCta}
            </ButtonLink>
          </>
        }
      />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <MediaFrame src="/media/about-team.svg" alt="" ratio="4/3" />
          </Reveal>
          <Reveal delay={80}>
            <Eyebrow>{d.home.aboutEyebrow}</Eyebrow>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">{d.about.introTitle}</h2>
            <p className="mt-4 text-ink-600 dark:text-ink-300">{d.home.aboutText}</p>
          </Reveal>
        </div>
      </Section>

      <Section id="vision" tone="alt">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="card-surface p-8">
            <Compass className="size-8 text-brand-700" aria-hidden />
            <h2 className="mt-4 text-2xl font-extrabold">{d.about.visionTitle}</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-700 dark:text-ink-200">{VISION[locale]}</p>
          </article>
          <article className="card-surface p-8">
            <HeartHandshake className="size-8 text-teal-700" aria-hidden />
            <h2 className="mt-4 text-2xl font-extrabold">{d.about.missionTitle}</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-700 dark:text-ink-200">{MISSION[locale]}</p>
          </article>
        </div>
      </Section>

      <Section>
        <SectionHeading title={d.about.valuesTitle} subtitle={d.about.valuesSubtitle} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {VALUES.map((value) => (
            <article key={value.title.en} className="card-surface p-6">
              <ShieldCheck className="size-6 text-gold-600" aria-hidden />
              <h3 className="mt-3 text-xl font-extrabold">{value.title[locale]}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{value.text[locale]}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="history" tone="alt">
        <SectionHeading title={d.about.historyTitle} subtitle={d.about.historySubtitle} />
        <ol className="relative mt-12 space-y-8 border-l border-brand-200 pl-8 dark:border-white/15">
          {HISTORY.map((item) => (
            <li key={item.year} className="relative">
              <span className="absolute top-1 -left-[2.4rem] grid size-8 place-items-center rounded-full bg-brand-700 text-[0.65rem] font-bold text-white">
                {item.year.slice(2)}
              </span>
              <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">{item.year}</p>
              <h3 className="mt-1 text-lg font-extrabold">{item.title[locale]}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600 dark:text-ink-300">{item.text[locale]}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="card-surface grid gap-8 p-8 lg:grid-cols-2 lg:p-10">
          <div>
            <Landmark className="size-8 text-brand-700" aria-hidden />
            <h2 className="mt-4 text-2xl font-extrabold">{d.about.governanceTitle}</h2>
            <p className="mt-3 text-ink-600 dark:text-ink-300">{d.about.governanceSubtitle}</p>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:items-center lg:justify-end">
            <ButtonLink href={`/${locale}/about/committee`}>
              {d.about.committeeTitle}
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href={`/${locale}/documents`} variant="outline">
              {d.about.documentsCta}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
