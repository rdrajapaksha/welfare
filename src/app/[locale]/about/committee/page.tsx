import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { initials } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { MediaFrame } from "@/components/ui/media";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({
    locale: raw,
    title: d.about.committeeTitle,
    description: d.about.committeeSubtitle,
    path: "/about/committee",
  });
}

export default async function CommitteePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);

  const members = await prisma.committeeMember.findMany({
    orderBy: [{ isCurrent: "desc" }, { sortOrder: "asc" }],
  });
  const current = members.filter((m) => m.isCurrent);
  const past = members.filter((m) => !m.isCurrent);

  return (
    <>
      <PageHero
        locale={locale}
        title={d.about.committeeTitle}
        subtitle={d.about.committeeSubtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[
          { name: d.nav.home, href: "/" },
          { name: d.about.title, href: "/about" },
          { name: d.about.committeeTitle },
        ]}
      />
      <Section>
        {current.length === 0 ? (
          <EmptyState title={d.admin.noRecords} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {current.map((member) => (
              <article key={member.id} className="card-surface overflow-hidden">
                {member.photoUrl ? (
                  <MediaFrame src={member.photoUrl} alt={member.name} ratio="1/1" className="rounded-none" />
                ) : (
                  <div className="grid aspect-square place-items-center bg-brand-50 text-3xl font-extrabold text-brand-800 dark:bg-brand-500/15 dark:text-brand-200">
                    {initials(member.name)}
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-lg font-extrabold text-ink-950 dark:text-white">{member.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-brand-700">{pick(member, "position", locale)}</p>
                  <p className="mt-2 text-xs text-ink-500">
                    {d.about.termLabel}: {member.termFrom} – {member.termTo ?? d.about.present}
                  </p>
                  {pick(member, "bio", locale) && (
                    <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">{pick(member, "bio", locale)}</p>
                  )}
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {member.email && (
                      <li>
                        <a href={`mailto:${member.email}`} className="inline-flex items-center gap-2 text-ink-700 hover:text-brand-700 dark:text-ink-200">
                          <Mail className="size-4" aria-hidden />
                          {member.email}
                        </a>
                      </li>
                    )}
                    {member.phone && (
                      <li>
                        <a href={`tel:${member.phone}`} className="inline-flex items-center gap-2 text-ink-700 hover:text-brand-700 dark:text-ink-200">
                          <Phone className="size-4" aria-hidden />
                          {member.phone}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
      {past.length > 0 && (
        <Section tone="alt">
          <h2 className="text-2xl font-extrabold">{d.events.past}</h2>
          <ul className="mt-6 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200 bg-white dark:divide-white/8 dark:border-white/10 dark:bg-ink-900/50">
            {past.map((member) => (
              <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-bold">{member.name}</p>
                  <p className="text-sm text-ink-500">{pick(member, "position", locale)}</p>
                </div>
                <p className="text-xs text-ink-500">
                  {d.about.termLabel}: {member.termFrom} – {member.termTo ?? d.about.present}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Section>
        <div className="card-surface p-8 text-center">
          <h2 className="text-xl font-extrabold">{d.about.governanceTitle}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-ink-600 dark:text-ink-300">{d.about.governanceSubtitle}</p>
          <ButtonLink href={`/${locale}/documents`} variant="outline" className="mt-5">
            {d.about.documentsCta}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
