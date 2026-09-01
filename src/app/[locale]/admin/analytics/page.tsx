import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { StatCard } from "@/components/ui/misc";
import { BarsChart, DonutChart, TrendChart } from "@/components/ui/charts";
import { donationPurposeLabel } from "@/lib/labels";

export default async function AdminAnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const [stats, donations, members, tickets, reports] = await Promise.all([
    prisma.monthlyStat.findMany({ orderBy: [{ year: "asc" }, { month: "asc" }] }),
    prisma.donation.findMany({ where: { status: "CONFIRMED" }, select: { purpose: true, amount: true } }),
    prisma.member.groupBy({ by: ["district"], _count: { _all: true } }),
    prisma.supportTicket.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.annualReport.findMany({ orderBy: { year: "asc" } }),
  ]);

  const purposeMap = new Map<string, number>();
  for (const don of donations) {
    purposeMap.set(don.purpose, (purposeMap.get(don.purpose) ?? 0) + don.amount);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.analytics}</h1>
        <p className="text-sm text-ink-500">{d.admin.chartDonationTrendNote}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={d.admin.chartDonationTrend}
          value={formatCurrency(stats.at(-1)?.donationTotal ?? 0, locale, true)}
        />
        <StatCard label={d.admin.chartMemberGrowth} value={stats.at(-1)?.newMembers ?? 0} tone="teal" />
        <StatCard
          label={d.admin.chartWelfareSpend}
          value={formatCurrency(stats.at(-1)?.welfarePaid ?? 0, locale, true)}
          tone="gold"
        />
        <StatCard label={d.admin.kpiOpenTickets} value={tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").reduce((s, t) => s + t._count._all, 0)} tone="ink" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="font-extrabold">{d.admin.chartDonationTrend}</h2>
          <TrendChart
            data={stats.map((s) => ({
              label: formatMonthYear(s.year, s.month, locale),
              value: s.donationTotal,
            }))}
          />
        </div>
        <div className="card-surface p-5">
          <h2 className="font-extrabold">{d.admin.chartMemberGrowth}</h2>
          <BarsChart
            data={stats.map((s) => ({
              label: formatMonthYear(s.year, s.month, locale),
              value: s.newMembers,
            }))}
          />
        </div>
        <div className="card-surface p-5">
          <h2 className="font-extrabold">{d.admin.chartWelfareSpend}</h2>
          <TrendChart
            extraKey
            data={stats.map((s) => ({
              label: formatMonthYear(s.year, s.month, locale),
              value: s.welfarePaid,
              extra: s.donationTotal,
            }))}
          />
        </div>
        <div className="card-surface p-5">
          <h2 className="font-extrabold">{d.admin.chartDonationPurpose}</h2>
          <DonutChart
            data={[...purposeMap.entries()].map(([label, value]) => ({
              label: donationPurposeLabel(d, label),
              value,
            }))}
          />
        </div>
        <div className="card-surface p-5">
          <h2 className="font-extrabold">{d.admin.chartMembersByDistrict}</h2>
          <BarsChart
            data={members
              .sort((a, b) => b._count._all - a._count._all)
              .slice(0, 8)
              .map((m) => ({ label: m.district, value: m._count._all }))}
          />
        </div>
        <div className="card-surface p-5">
          <h2 className="font-extrabold">{d.admin.chartTicketStatus}</h2>
          <DonutChart data={tickets.map((t) => ({ label: t.status, value: t._count._all }))} />
        </div>
        <div className="card-surface p-5 lg:col-span-2">
          <h2 className="font-extrabold">{d.admin.chartIncomeExpenditure}</h2>
          <BarsChart
            data={reports.map((r) => ({
              label: String(r.year),
              value: r.totalIncome,
              extra: r.totalExpenditure,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
