import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { listMembersInArrears } from "@/lib/membership-fees";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { TrendChart } from "@/components/ui/charts";
import { formatMonthYear } from "@/lib/utils";

export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [members, active, donationsMonth, donationsYear, pendingApps, openTickets, upcoming, volunteers, stats, arrears] =
    await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: "ACTIVE" } }),
      prisma.donation.aggregate({
        where: { status: "CONFIRMED", createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      prisma.donation.aggregate({
        where: { status: "CONFIRMED", createdAt: { gte: yearStart } },
        _sum: { amount: true },
      }),
      prisma.membershipApplication.count({ where: { status: "PENDING" } }),
      prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.event.count({ where: { startsAt: { gte: now } } }),
      prisma.volunteerApplication.count({ where: { status: { in: ["NEW", "ACTIVE"] } } }),
      prisma.monthlyStat.findMany({ orderBy: [{ year: "asc" }, { month: "asc" }], take: 12 }),
      listMembersInArrears(),
    ]);

  const sampleArrears = arrears.rows[0]?.arrears;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.title}</h1>
        <p className="text-sm text-ink-500">{d.admin.demoReadOnly}</p>
      </div>

      {arrears.rows.length > 0 && sampleArrears && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-900 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-extrabold">
              {d.admin.arrearsAlert.replace("{count}", String(arrears.rows.length))}
            </p>
            <ButtonLink href={`/${locale}/admin/fees`} size="sm" variant="danger">
              {d.admin.fees}
            </ButtonLink>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={d.admin.kpiMembers} value={members} hint={`${d.admin.kpiActiveMembers}: ${active}`} />
        <StatCard
          label={d.admin.kpiDonationsMonth}
          value={formatCurrency(donationsMonth._sum.amount ?? 0, locale, true)}
          tone="teal"
        />
        <StatCard
          label={d.admin.kpiDonationsYear}
          value={formatCurrency(donationsYear._sum.amount ?? 0, locale, true)}
          tone="gold"
        />
        <StatCard label={d.admin.inArrears} value={arrears.rows.length} tone="ink" />
        <StatCard label={d.admin.kpiOpenTickets} value={openTickets} tone="ink" />
        <StatCard label={d.admin.kpiPendingApplications} value={pendingApps} />
        <StatCard label={d.admin.kpiUpcomingEvents} value={upcoming} tone="teal" />
        <StatCard label={d.admin.kpiVolunteers} value={volunteers} tone="gold" />
      </div>
      <div className="card-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold">{d.admin.chartDonationTrend}</h2>
          <ButtonLink href={`/${locale}/admin/analytics`} variant="ghost" size="sm">
            {d.admin.analytics}
          </ButtonLink>
        </div>
        <TrendChart
          data={stats.map((s) => ({
            label: formatMonthYear(s.year, s.month, locale),
            value: s.donationTotal,
          }))}
        />
      </div>
    </div>
  );
}
