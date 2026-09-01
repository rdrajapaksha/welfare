import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { projectStatusLabel } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState, Progress } from "@/components/ui/misc";
import { MediaFrame } from "@/components/ui/media";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.projects.title, description: d.projects.subtitle, path: "/projects" });
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);

  const projects = await prisma.project.findMany({ orderBy: { startedAt: "desc" } });

  return (
    <>
      <PageHero
        locale={locale}
        title={d.projects.title}
        subtitle={d.projects.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.projects.title }]}
      />
      <Section>
        {projects.length === 0 ? (
          <EmptyState title={d.common.noResults} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.id} href={`/${locale}/projects/${p.slug}`} className="card-surface group overflow-hidden">
                <MediaFrame src={p.coverImage ?? "/media/housing-project.svg"} alt="" ratio="16/9" imgClassName="group-hover:scale-105" />
                <div className="p-5">
                  <Badge tone={statusTone(p.status)}>{projectStatusLabel(d, p.status)}</Badge>
                  <h2 className="mt-3 text-lg font-extrabold text-ink-950 group-hover:text-brand-700 dark:text-white">
                    {pick(p, "title", locale)}
                  </h2>
                  <p className="mt-1 text-sm text-ink-500">{p.location}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-600 dark:text-ink-300">{pick(p, "summary", locale)}</p>
                  <Progress value={p.raisedAmount} total={p.targetAmount} className="mt-4" showLabel />
                  <p className="mt-2 text-xs text-ink-500">
                    {d.projects.raised} {formatCurrency(p.raisedAmount, locale)} · {d.projects.target}{" "}
                    {formatCurrency(p.targetAmount, locale)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
