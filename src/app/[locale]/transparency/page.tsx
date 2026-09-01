import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, ShieldCheck } from "lucide-react";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { formatCurrency, formatFileSize, percent } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.transparency.title, description: d.transparency.subtitle, path: "/transparency" });
}

export default async function TransparencyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);

  const [reports, allocations] = await Promise.all([
    prisma.annualReport.findMany({ where: { isPublished: true }, orderBy: { year: "desc" } }),
    prisma.fundAllocation.findMany({ include: { project: true }, orderBy: { spentAt: "desc" }, take: 24 }),
  ]);

  const latest = reports[0];
  const directPct = latest ? 100 - percent(latest.adminSpend, latest.totalExpenditure) : 93;

  return (
    <>
      <PageHero
        locale={locale}
        title={d.transparency.title}
        subtitle={d.transparency.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.transparency.title }]}
      />

      {latest && (
        <Section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [d.transparency.income, formatCurrency(latest.totalIncome, locale)],
              [d.transparency.welfareSpend, formatCurrency(latest.welfareSpend, locale)],
              [d.transparency.projectSpend, formatCurrency(latest.projectSpend, locale)],
              [d.transparency.adminSpend, `${percent(latest.adminSpend, latest.totalExpenditure)}%`],
            ].map(([label, value]) => (
              <div key={label} className="card-surface p-6">
                <p className="text-sm font-semibold text-ink-500">{label}</p>
                <p className="mt-2 text-2xl font-extrabold text-ink-950 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl bg-teal-50 p-6 dark:bg-teal-500/10">
            <p className="text-sm font-bold tracking-wider text-teal-800 uppercase dark:text-teal-200">{d.transparency.ratioTitle}</p>
            <p className="mt-2 text-4xl font-extrabold text-teal-900 dark:text-white">{directPct}%</p>
            <p className="mt-1 text-sm text-teal-800 dark:text-teal-100">{d.transparency.ratioText}</p>
          </div>
        </Section>
      )}

      <Section tone="alt">
        <h2 className="text-2xl font-extrabold">{d.transparency.reportsTitle}</h2>
        <p className="mt-2 max-w-2xl text-ink-600 dark:text-ink-300">{d.transparency.reportsSubtitle}</p>
        {reports.length === 0 ? (
          <EmptyState title={d.transparency.noReports} className="mt-8" />
        ) : (
          <div className="mt-8 grid gap-4">
            {reports.map((report) => (
              <article key={report.id} className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-extrabold text-ink-950 dark:text-white">{pick(report, "title", locale)}</p>
                  <p className="mt-1 max-w-xl text-sm text-ink-600 dark:text-ink-300">{pick(report, "summary", locale)}</p>
                  <p className="mt-2 text-xs text-ink-500">
                    {d.transparency.auditedBy}: {report.auditedBy} · {d.transparency.fileSize}: {formatFileSize(report.fileSizeKb)}
                  </p>
                </div>
                <ButtonLink href={report.fileUrl} variant="primary">
                  <Download className="size-4" />
                  {d.transparency.downloadReport}
                </ButtonLink>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section>
        <h2 className="text-2xl font-extrabold">{d.transparency.chartsTitle}</h2>
        <p className="mt-2 text-ink-600 dark:text-ink-300">{d.transparency.chartsSubtitle}</p>
        <div className="mt-8 overflow-x-auto">
          <div className="flex min-w-[36rem] items-end gap-4">
            {[...reports].reverse().map((report) => {
              const max = Math.max(...reports.map((r) => r.totalIncome), 1);
              return (
                <div key={report.id} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-48 w-full items-end justify-center gap-1">
                    <div className="w-5 rounded-t-md bg-teal-500" style={{ height: `${percent(report.totalIncome, max)}%` }} title={d.transparency.income} />
                    <div className="w-5 rounded-t-md bg-brand-600" style={{ height: `${percent(report.totalExpenditure, max)}%` }} title={d.transparency.expenditure} />
                  </div>
                  <p className="text-xs font-bold">{report.year}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section tone="alt">
        <h2 className="text-2xl font-extrabold">{d.transparency.allocationTitle}</h2>
        <p className="mt-2 text-ink-600 dark:text-ink-300">{d.transparency.allocationSubtitle}</p>
        <DataTable
          className="mt-8"
          head={[d.common.date, d.transparency.allocationCategory, d.common.amount, d.transparency.allocationProject]}
        >
          {allocations.map((row) => (
            <tr key={row.id} className="text-ink-800 dark:text-ink-100">
              <td className="px-4 py-3">{row.spentAt.toISOString().slice(0, 10)}</td>
              <td className="px-4 py-3">
                <Badge>{row.category}</Badge>
              </td>
              <td className="px-4 py-3 font-semibold">{formatCurrency(row.amount, locale)}</td>
              <td className="px-4 py-3">{row.project ? pick(row.project, "title", locale) : "—"}</td>
            </tr>
          ))}
        </DataTable>
      </Section>

      <Section>
        <div className="card-surface p-8">
          <p className="flex items-center gap-2 text-lg font-extrabold">
            <ShieldCheck className="size-5 text-teal-600" />
            {d.transparency.pledgeTitle}
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[d.transparency.pledge1, d.transparency.pledge2, d.transparency.pledge3, d.transparency.pledge4].map((item) => (
              <li key={item} className="text-sm text-ink-600 dark:text-ink-300">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
