import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { projectStatusLabel } from "@/lib/labels";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge, statusTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DataTable, EmptyState, Progress, StatCard } from "@/components/ui/misc";
import { MediaFrame } from "@/components/ui/media";

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({ select: { slug: true } });
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return {};
  return buildMetadata({
    locale: raw,
    title: pick(project, "title", raw),
    description: pick(project, "summary", raw),
    path: `/projects/${slug}`,
    image: project.coverImage ?? undefined,
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);

  const project = await prisma.project.findUnique({
    where: { slug },
    include: { allocations: { orderBy: { spentAt: "desc" } } },
  });
  if (!project) notFound();

  return (
    <>
      <PageHero
        locale={locale}
        title={pick(project, "title", locale)}
        subtitle={pick(project, "summary", locale)}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[
          { name: d.nav.home, href: "/" },
          { name: d.projects.title, href: "/projects" },
          { name: pick(project, "title", locale) },
        ]}
        actions={
          <ButtonLink href={`/${locale}/donations`} variant="donate" size="sm">
            {d.projects.fundProject}
          </ButtonLink>
        }
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <MediaFrame src={project.coverImage ?? "/media/housing-project.svg"} alt="" ratio="16/9" className="mb-8" />
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(project.status)}>{projectStatusLabel(d, project.status)}</Badge>
              <span className="text-sm text-ink-500">{project.location}</span>
            </div>
            <div className="prose-hla" dangerouslySetInnerHTML={{ __html: pick(project, "body", locale) }} />
          </div>
          <aside className="space-y-4 lg:col-span-4">
            <StatCard label={d.projects.raised} value={formatCurrency(project.raisedAmount, locale)} tone="teal" />
            <StatCard label={d.projects.target} value={formatCurrency(project.targetAmount, locale)} />
            <StatCard label={d.projects.spent} value={formatCurrency(project.spentAmount, locale)} tone="gold" />
            <StatCard label={d.projects.beneficiaries} value={project.beneficiaries} tone="ink" />
            <div className="card-surface p-5">
              <Progress value={project.raisedAmount} total={project.targetAmount} showLabel />
              <p className="mt-2 text-xs text-ink-500">
                {d.common.from} {formatDateShort(project.startedAt, locale)}
                {project.completedAt ? ` · ${formatDateShort(project.completedAt, locale)}` : ""}
              </p>
            </div>
          </aside>
        </div>
      </Section>
      <Section tone="alt">
        <h2 className="text-2xl font-extrabold">{d.projects.allocationsTitle}</h2>
        {project.allocations.length === 0 ? (
          <EmptyState title={d.admin.noRecords} className="mt-8" />
        ) : (
          <DataTable
            className="mt-8"
            head={[d.common.date, d.transparency.allocationCategory, d.common.amount, d.transparency.allocationTitle]}
          >
            {project.allocations.map((row) => (
              <tr key={row.id} className="text-ink-800 dark:text-ink-100">
                <td className="px-4 py-3">{formatDateShort(row.spentAt, locale)}</td>
                <td className="px-4 py-3">
                  <Badge>{row.category}</Badge>
                </td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(row.amount, locale)}</td>
                <td className="px-4 py-3">{pick(row, "title", locale)}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </Section>
    </>
  );
}
