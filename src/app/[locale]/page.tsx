import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata, faqSchema, localePath } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { formatCurrency, formatDateShort, percent } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/ui/json-ld";
import { MediaFrame } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/section";
import { Progress } from "@/components/ui/misc";
import { programmeCategoryLabel } from "@/lib/labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({
    locale: raw,
    title: d.meta.defaultTitle,
    description: d.meta.description,
    path: "",
    keywords: d.meta.keywords,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);
  const href = (path: string) => localePath(locale, path);

  const [programmes, projects, news, events, partners, faqs, report, memberCount] = await Promise.all([
    prisma.programme.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
    prisma.project.findMany({ where: { status: { in: ["ONGOING", "PLANNED"] } }, take: 3, orderBy: { startedAt: "desc" } }),
    prisma.newsPost.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" }, take: 3 }),
    prisma.event.findMany({
      where: { isPublished: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
    prisma.partner.findMany({ where: { isActive: true }, orderBy: [{ tier: "asc" }, { sortOrder: "asc" }] }),
    prisma.faq.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" }, take: 5 }),
    prisma.annualReport.findFirst({ where: { isPublished: true }, orderBy: { year: "desc" } }),
    prisma.member.count({ where: { status: "ACTIVE" } }),
  ]);

  const adminPct = report ? percent(report.adminSpend, report.totalExpenditure) : 7;
  const directPct = 100 - adminPct;

  return (
    <>
      <JsonLd data={faqSchema(faqs.map((f) => ({ question: pick(f, "question", locale), answer: pick(f, "answer", locale) })))} />

      <section className="relative overflow-hidden bg-canvas dark:bg-ink-950">
        <div aria-hidden className="mesh-brand pointer-events-none absolute inset-0" />
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-bold tracking-[0.12em] text-brand-800 uppercase dark:border-white/15 dark:bg-white/5 dark:text-brand-200">
              <Sparkles className="size-3.5" aria-hidden />
              {d.home.heroEyebrow}
            </p>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-[4.1rem] lg:leading-[1.05]">
              {d.home.heroTitle}{" "}
              <span className="text-gradient-brand">{d.home.heroTitleAccent}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600 dark:text-ink-300">{d.home.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={href("/donations")} size="lg" variant="donate">
                {d.home.heroPrimaryCta}
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href={href("/join")} variant="outline" size="lg">
                {d.home.heroSecondaryCta}
              </ButtonLink>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm font-medium text-ink-500 dark:text-ink-400">
              <ShieldCheck className="size-4 text-teal-600" aria-hidden />
              {d.home.heroTrust}
            </p>
          </div>
          <div className="relative lg:col-span-6">
            <MediaFrame
              src="/media/hero-primary.svg"
              alt=""
              ratio="4/3"
              priority
              className="shadow-lift"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute -bottom-6 left-4 max-w-xs rounded-2xl bg-white p-4 shadow-lift dark:bg-ink-900 sm:left-8">
              <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">{d.transparency.ratioTitle}</p>
              <p className="mt-1 text-2xl font-extrabold text-ink-950 dark:text-white">{directPct}¢</p>
              <p className="text-xs text-ink-500">{d.transparency.ratioText}</p>
            </div>
          </div>
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow={d.home.statsTitle}
          title={d.home.statsTitle}
          subtitle={d.home.statsSubtitle}
          align="center"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: d.home.statMembers, value: Math.max(memberCount, siteConfig.impact.members), format: "number" as const },
            { label: d.home.statFamilies, value: siteConfig.impact.familiesAssisted, format: "number" as const },
            { label: d.home.statDisbursed, value: siteConfig.impact.welfareDisbursed, format: "currency" as const },
            { label: d.home.statProjects, value: siteConfig.impact.projects, format: "number" as const },
            { label: d.home.statVolunteers, value: siteConfig.impact.volunteers, format: "number" as const },
            { label: d.home.statYears, value: new Date().getFullYear() - siteConfig.foundedYear, format: "number" as const, suffix: "+" },
          ].map((stat) => (
            <div key={stat.label} className="card-surface p-6">
              <p className="text-sm font-semibold text-ink-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-extrabold text-ink-950 dark:text-white">
                <Counter value={stat.value} locale={locale} format={stat.format} suffix={stat.suffix} />
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="alt">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <MediaFrame src="/media/about-team.svg" alt="" ratio="4/3" />
          </Reveal>
          <Reveal delay={80}>
            <Eyebrow>{d.home.aboutEyebrow}</Eyebrow>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">{d.home.aboutTitle}</h2>
            <p className="mt-4 text-ink-600 dark:text-ink-300">{d.home.aboutText}</p>
            <ul className="mt-6 space-y-3">
              {[d.home.aboutPoint1, d.home.aboutPoint2, d.home.aboutPoint3].map((point) => (
                <li key={point} className="flex gap-3 text-sm font-medium text-ink-800 dark:text-ink-100">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <ButtonLink href={href("/about")} variant="outline" className="mt-8">
              {d.home.aboutCta}
              <ArrowRight className="size-4" />
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow={d.home.servicesEyebrow}
          title={d.home.servicesTitle}
          subtitle={d.home.servicesSubtitle}
          action={
            <ButtonLink href={href("/services")} variant="ghost">
              {d.home.servicesCta}
              <ArrowRight className="size-4" />
            </ButtonLink>
          }
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {programmes.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <Link href={href(`/services/${p.slug}`)} className="card-surface group flex h-full flex-col overflow-hidden">
                <MediaFrame src={p.coverImage ?? "/media/hero-secondary.svg"} alt="" ratio="16/9" imgClassName="group-hover:scale-105" />
                <div className="flex flex-1 flex-col p-6">
                  <Badge>{programmeCategoryLabel(d, p.category)}</Badge>
                  <h3 className="mt-3 text-xl font-extrabold text-ink-950 group-hover:text-brand-700 dark:text-white">
                    {pick(p, "title", locale)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-ink-600 dark:text-ink-300">{pick(p, "summary", locale)}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                    {d.common.readMore}
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="alt">
        <SectionHeading
          eyebrow={d.home.projectsEyebrow}
          title={d.home.projectsTitle}
          subtitle={d.home.projectsSubtitle}
          action={
            <ButtonLink href={href("/projects")} variant="ghost">
              {d.common.viewAll}
              <ArrowRight className="size-4" />
            </ButtonLink>
          }
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={href(`/projects/${p.slug}`)} className="card-surface group p-5">
              <MediaFrame src={p.coverImage ?? "/media/housing-project.svg"} alt="" ratio="16/9" className="mb-4" imgClassName="group-hover:scale-105" />
              <h3 className="text-lg font-extrabold text-ink-950 dark:text-white">{pick(p, "title", locale)}</h3>
              <p className="mt-1 text-sm text-ink-500">{p.location}</p>
              <Progress value={p.raisedAmount} total={p.targetAmount} className="mt-4" showLabel />
              <p className="mt-2 text-xs text-ink-500">
                {d.projects.raised} {formatCurrency(p.raisedAmount, locale)} · {d.projects.target}{" "}
                {formatCurrency(p.targetAmount, locale)}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <section className="bg-ink-950 text-white">
        <div className="container-page section-y grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow tone="light">{d.home.transparencyEyebrow}</Eyebrow>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">{d.home.transparencyTitle}</h2>
            <p className="mt-4 text-ink-200">{d.home.transparencySubtitle}</p>
            <ButtonLink href={href("/transparency")} variant="gold" className="mt-8">
              {d.home.transparencyCta}
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
          {report && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold tracking-wider text-ink-300 uppercase">{d.home.transparencyIncome}</p>
                <p className="mt-2 text-2xl font-extrabold">{formatCurrency(report.totalIncome, locale, true)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold tracking-wider text-ink-300 uppercase">{d.home.transparencySpend}</p>
                <p className="mt-2 text-2xl font-extrabold">
                  {formatCurrency(report.welfareSpend + report.projectSpend, locale, true)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold tracking-wider text-ink-300 uppercase">{d.home.transparencyAdmin}</p>
                <p className="mt-2 text-2xl font-extrabold">{adminPct}%</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow={d.home.partnersEyebrow}
          title={d.home.partnersTitle}
          subtitle={d.home.partnersSubtitle}
          action={
            <ButtonLink href={href("/partners")} variant="ghost">
              {d.common.viewAll}
              <ArrowRight className="size-4" />
            </ButtonLink>
          }
        />
        <div className="mt-10 overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 pr-8">
            {[...partners, ...partners].map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="grid h-24 w-52 shrink-0 place-items-center rounded-2xl border border-ink-100 bg-white px-4 dark:border-white/10 dark:bg-ink-900"
              >
                <Image src={p.logoUrl} alt={p.name} width={200} height={72} className="max-h-16 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="alt">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={d.home.newsEyebrow} title={d.home.newsTitle} subtitle={d.home.newsSubtitle} />
            <ul className="mt-8 space-y-4">
              {news.map((post) => (
                <li key={post.id}>
                  <Link href={href(`/news/${post.slug}`)} className="card-surface group flex gap-4 p-4">
                    <Image src={post.coverImage ?? "/media/annual-report.svg"} alt="" width={120} height={80} className="size-20 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs text-ink-500">{formatDateShort(post.publishedAt, locale)}</p>
                      <p className="mt-1 font-bold text-ink-950 group-hover:text-brand-700 dark:text-white">
                        {pick(post, "title", locale)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow={d.home.eventsEyebrow} title={d.home.eventsTitle} subtitle={d.home.eventsSubtitle} />
            <ul className="mt-8 space-y-4">
              {events.map((event) => (
                <li key={event.id}>
                  <Link href={href(`/events/${event.slug}`)} className="card-surface flex gap-4 p-4">
                    <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-brand-50 text-center dark:bg-brand-500/15">
                      <CalendarDays className="size-5 text-brand-700" />
                    </div>
                    <div>
                      <p className="text-xs text-ink-500">{formatDateShort(event.startsAt, locale)}</p>
                      <p className="mt-1 font-bold text-ink-950 dark:text-white">{pick(event, "title", locale)}</p>
                      <p className="text-sm text-ink-500">{event.venue}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          title={d.home.faqTitle}
          subtitle={d.home.faqSubtitle}
          action={
            <ButtonLink href={href("/faq")} variant="ghost">
              {d.home.faqCta}
              <ArrowRight className="size-4" />
            </ButtonLink>
          }
        />
        <div className="mx-auto mt-8 max-w-3xl">
          <Accordion
            items={faqs.map((f) => ({
              id: f.id,
              question: pick(f, "question", locale),
              answer: pick(f, "answer", locale),
            }))}
          />
        </div>
      </Section>

      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-45 mesh-ink" />
        <div className="container-page relative section-y text-center">
          <Users className="mx-auto size-10 opacity-80" />
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">{d.home.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-ink-200">{d.home.ctaText}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href={href("/donations")} variant="donate">
              <HeartHandshake className="size-4" />
              {d.home.ctaDonate}
            </ButtonLink>
            <ButtonLink href={href("/join")} variant="outline" className="border-white/30 text-white hover:bg-white/10">
              {d.home.ctaJoin}
            </ButtonLink>
            <ButtonLink href={href("/volunteer")} variant="ghost" className="text-white hover:bg-white/10">
              {d.home.ctaVolunteer}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
