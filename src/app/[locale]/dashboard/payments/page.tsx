import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { donationMethodLabel, donationPurposeLabel } from "@/lib/labels";
import { formatCurrency, formatDateShort, formatMonthYear } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

export default async function PaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const user = await requireUser(locale);
  const d = await getDictionary(locale);

  const [payments, donations] = user.memberId
    ? await Promise.all([
        prisma.payment.findMany({ where: { memberId: user.memberId }, orderBy: { paidAt: "desc" } }),
        prisma.donation.findMany({ where: { memberId: user.memberId }, orderBy: { createdAt: "desc" } }),
      ])
    : [[], []];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold">{d.dashboard.payments}</h1>
        <p className="mt-1 text-sm text-ink-500">{d.dashboard.paymentHistory}</p>
      </div>
      {payments.length === 0 ? (
        <EmptyState title={d.dashboard.noPayments} />
      ) : (
        <DataTable
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
