import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { donationMethodLabel, donationPurposeLabel } from "@/lib/labels";
import { formatCurrency, formatDateShort, formatMonthYear } from "@/lib/utils";
import { getMemberArrears, getMembershipFees } from "@/lib/membership-fees";
import { Badge, statusTone } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { ArrearsBanner } from "@/components/membership/arrears-banner";
import { RenewMembershipForm } from "@/components/membership/renew-membership-form";

export default async function PaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const user = await requireUser(locale);
  const d = await getDictionary(locale);

  const member = user.memberId
    ? await prisma.member.findUnique({
        where: { id: user.memberId },
        select: { id: true, joinedAt: true, membershipType: true, status: true },
      })
    : null;

  const [payments, donations, fees, arrears, pendingPayments] = await Promise.all([
    user.memberId
      ? prisma.payment.findMany({ where: { memberId: user.memberId }, orderBy: { paidAt: "desc" } })
      : Promise.resolve([]),
    user.memberId
      ? prisma.donation.findMany({ where: { memberId: user.memberId }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
    getMembershipFees(),
    member ? getMemberArrears(member) : Promise.resolve(null),
    user.memberId
      ? prisma.payment.findMany({
          where: { memberId: user.memberId, type: "MEMBERSHIP_FEE", status: "PENDING" },
          select: { periodYear: true, periodMonth: true },
        })
      : Promise.resolve([]),
  ]);

  const pendingMonths = pendingPayments
    .filter((p) => p.periodMonth != null)
    .map((p) => ({ year: p.periodYear, month: p.periodMonth! }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold">{d.dashboard.payments}</h1>
        <p className="mt-1 text-sm text-ink-500">
          {d.fees.monthlyFeeLabel}: {formatCurrency(fees.monthly, locale)}
        </p>
      </div>

      {arrears && <ArrearsBanner d={d} locale={locale} arrears={arrears} />}

      {arrears && !arrears.exempt && (
        <section className="card-surface p-5 sm:p-6">
          <RenewMembershipForm
            d={d}
            locale={locale}
            unpaidMonths={arrears.unpaidMonths}
            pendingMonths={pendingMonths}
            monthlyFee={fees.monthly}
          />
        </section>
      )}

      {arrears && !arrears.exempt && arrears.monthsDue === 0 && pendingMonths.length === 0 && (
        <p className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900 dark:border-teal-800/50 dark:bg-teal-950/30 dark:text-teal-100">
          {d.dashboard.duesClear}
          {arrears.paidThrough
            ? ` · ${d.dashboard.duesPaidTo} ${formatMonthYear(arrears.paidThrough.year, arrears.paidThrough.month, locale)}`
            : ""}
        </p>
      )}

      <div>
        <h2 className="text-lg font-extrabold">{d.dashboard.paymentHistory}</h2>
        {payments.length === 0 ? (
          <EmptyState title={d.dashboard.noPayments} className="mt-4" />
        ) : (
          <DataTable
            className="mt-4"
            head={[d.dashboard.receiptNo, d.dashboard.period, d.common.amount, d.dashboard.method, d.common.status]}
          >
            {payments.map((row) => (
              <tr key={row.id} className="text-ink-800 dark:text-ink-100">
                <td className="px-4 py-3 font-semibold">{row.receiptNo}</td>
                <td className="px-4 py-3">
                  {row.periodMonth ? formatMonthYear(row.periodYear, row.periodMonth, locale) : row.periodYear}
                </td>
                <td className="px-4 py-3">{formatCurrency(row.amount, locale)}</td>
                <td className="px-4 py-3">{donationMethodLabel(d, row.method)}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">{d.dashboard.myDonations}</h2>
          </div>
          <ButtonLink href={`/${locale}/donations`} size="sm" variant="donate">
            {d.nav.donateNow}
          </ButtonLink>
        </div>
        {donations.length === 0 ? (
          <EmptyState title={d.dashboard.noDonations} className="mt-6" />
        ) : (
          <DataTable
            className="mt-6"
            head={[d.common.reference, d.common.date, d.common.amount, d.donations.purposeLabel, d.common.status]}
          >
            {donations.map((row) => (
              <tr key={row.id} className="text-ink-800 dark:text-ink-100">
                <td className="px-4 py-3 font-semibold">{row.reference}</td>
                <td className="px-4 py-3">{formatDateShort(row.createdAt, locale)}</td>
                <td className="px-4 py-3">{formatCurrency(row.amount, locale)}</td>
                <td className="px-4 py-3">{donationPurposeLabel(d, row.purpose)}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
