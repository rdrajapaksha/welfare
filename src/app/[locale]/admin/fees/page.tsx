import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import {
  adminConfirmMembershipPayment,
  adminRecordMembershipPayment,
  adminUpdateMembershipFees,
} from "@/lib/admin-actions";
import { getMembershipFees, listMembersInArrears } from "@/lib/membership-fees";
import { donationMethodLabel } from "@/lib/labels";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { Field, Input, Select, FormAlert } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { Button, ButtonLink } from "@/components/ui/button";

export default async function AdminFeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; paid?: string; confirmed?: string; error?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);
  const sp = await searchParams;

  const [fees, { rows: arrearsRows }, members, pendingRenewals] = await Promise.all([
    getMembershipFees(),
    listMembersInArrears(),
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, membershipNo: true, membershipType: true },
    }),
    prisma.payment.findMany({
      where: { type: "MEMBERSHIP_FEE", status: "PENDING" },
      orderBy: { paidAt: "asc" },
      include: { member: { select: { id: true, fullName: true, membershipNo: true } } },
    }),
  ]);

  const now = new Date();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.fees}</h1>
        <p className="text-sm text-ink-500">{d.admin.feesHint}</p>
      </div>

      {sp.saved && <FormAlert tone="success" title={d.admin.feesSaved} />}
      {sp.paid && <FormAlert tone="success" title={d.admin.paymentRecorded} />}
      {sp.confirmed && <FormAlert tone="success" title={d.admin.paymentConfirmed} />}
      {sp.error === "duplicate" && <FormAlert tone="error" title={d.admin.paymentDuplicate} />}

      <section className="card-surface p-5">
        <h2 className="text-lg font-extrabold">{d.admin.editFees}</h2>
        <p className="mt-1 text-sm text-ink-500">{d.admin.editFeesHint}</p>
        <form action={adminUpdateMembershipFees} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />
          <Field label={d.members.feesMonthly} htmlFor="monthly" required>
            <Input
              id="monthly"
              name="monthly"
              type="number"
              min={0}
              step={50}
              required
              defaultValue={fees.monthly}
            />
          </Field>
          <Field label={d.members.feesRegistration} htmlFor="registration" required>
            <Input
              id="registration"
              name="registration"
              type="number"
              min={0}
              step={100}
              required
              defaultValue={fees.registration}
            />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm">
              {d.common.save}
            </Button>
          </div>
        </form>
      </section>

      <section className="card-surface p-5">
        <h2 className="text-lg font-extrabold">{d.admin.recordPayment}</h2>
        <p className="mt-1 text-sm text-ink-500">{d.admin.recordPaymentHint}</p>
        <form action={adminRecordMembershipPayment} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input type="hidden" name="locale" value={locale} />
          <Field label={d.admin.members} htmlFor="memberId" required className="sm:col-span-2">
            <Select id="memberId" name="memberId" required defaultValue="">
              <option value="" disabled>
                {d.forms.selectPlaceholder}
              </option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.membershipNo} — {m.fullName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.dashboard.period} htmlFor="periodMonth" required>
            <Select id="periodMonth" name="periodMonth" defaultValue={String(now.getMonth() + 1)}>
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                return (
                  <option key={month} value={month}>
                    {formatMonthYear(now.getFullYear(), month, locale)}
                  </option>
                );
              })}
            </Select>
          </Field>
          <Field label="Year" htmlFor="periodYear" required>
            <Input
              id="periodYear"
              name="periodYear"
              type="number"
              required
              defaultValue={now.getFullYear()}
              min={2020}
              max={2100}
            />
          </Field>
          <Field label={d.common.amount} htmlFor="amount">
            <Input id="amount" name="amount" type="number" min={0} defaultValue={fees.monthly} />
          </Field>
          <Field label={d.dashboard.method} htmlFor="method">
            <Select id="method" name="method" defaultValue="BANK_TRANSFER">
              <option value="BANK_TRANSFER">{d.donations.methodBank}</option>
              <option value="CASH">{d.donations.methodCash}</option>
              <option value="CHEQUE">{d.donations.methodCheque}</option>
            </Select>
          </Field>
          <div className="flex items-end sm:col-span-2 lg:col-span-4">
            <Button type="submit" size="sm">
              {d.admin.recordPayment}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold">{d.admin.pendingRenewals}</h2>
          <p className="text-sm text-ink-500">{d.admin.pendingRenewalsHint}</p>
        </div>
        {pendingRenewals.length === 0 ? (
          <EmptyState title={d.admin.noRecords} />
        ) : (
          <DataTable
            head={[
              d.members.membershipNo,
              d.forms.fullName,
              d.dashboard.period,
              d.common.amount,
              d.dashboard.method,
              d.common.actions,
            ]}
          >
            {pendingRenewals.map((row) => (
              <tr key={row.id} className="text-ink-800 dark:text-ink-100">
                <td className="px-4 py-3 font-semibold">{row.member.membershipNo}</td>
                <td className="px-4 py-3">{row.member.fullName}</td>
                <td className="px-4 py-3">
                  {row.periodMonth
                    ? formatMonthYear(row.periodYear, row.periodMonth, locale)
                    : row.periodYear}
                </td>
                <td className="px-4 py-3">{formatCurrency(row.amount, locale)}</td>
                <td className="px-4 py-3">{donationMethodLabel(d, row.method)}</td>
                <td className="px-4 py-3">
                  <form action={adminConfirmMembershipPayment}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="paymentId" value={row.id} />
                    <Button type="submit" size="sm">
                      {d.admin.confirmPayment}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-red-700 dark:text-red-300">{d.admin.arrearsList}</h2>
            <p className="text-sm text-ink-500">
              {d.admin.arrearsListHint} · {d.members.feesMonthly}: {formatCurrency(fees.monthly, locale)}
            </p>
          </div>
          <Badge tone="danger">
            {arrearsRows.length} {d.admin.inArrears}
          </Badge>
        </div>

        {arrearsRows.length === 0 ? (
          <EmptyState title={d.admin.noArrears} />
        ) : (
          <DataTable
            head={[
              d.members.membershipNo,
              d.forms.fullName,
              d.fees.monthsDue,
              d.fees.amountDue,
              d.common.actions,
            ]}
          >
            {arrearsRows.map(({ member, arrears }) => (
              <tr key={member.id} className="bg-red-50/70 text-ink-900 dark:bg-red-950/20 dark:text-ink-100">
                <td className="px-4 py-3 font-semibold text-red-800 dark:text-red-200">
                  {member.membershipNo}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{member.fullName}</p>
                  <p className="text-xs text-red-700/80 dark:text-red-300/80">
                    {arrears.unpaidMonths
                      .slice(-3)
                      .map((m) => formatMonthYear(m.year, m.month, locale))
                      .join(", ")}
                    {arrears.unpaidMonths.length > 3 ? "…" : ""}
                  </p>
                </td>
                <td className="px-4 py-3 font-bold text-red-700 dark:text-red-300">{arrears.monthsDue}</td>
                <td className="px-4 py-3 font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(arrears.amountDue, locale)}
                </td>
                <td className="px-4 py-3">
                  <ButtonLink href={`/${locale}/admin/members/${member.id}`} size="sm" variant="outline">
                    {d.admin.viewMember}
                  </ButtonLink>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </div>
  );
}
