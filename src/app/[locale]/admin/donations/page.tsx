import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminConfirmDonation } from "@/lib/actions";
import { donationMethodLabel, donationPurposeLabel } from "@/lib/labels";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";

export default async function AdminDonationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const donations = await prisma.donation.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.donations}</h1>
        <p className="text-sm text-ink-500">{d.admin.recentDonations}</p>
      </div>
      {donations.length === 0 ? (
        <EmptyState title={d.admin.noRecords} />
      ) : (
        <DataTable
          head={[
            d.common.reference,
            d.forms.fullName,
            d.common.date,
            d.common.amount,
            d.donations.purposeLabel,
            d.dashboard.method,
            d.common.status,
            d.common.actions,
          ]}
        >
          {donations.map((row) => (
            <tr key={row.id} className="text-ink-800 dark:text-ink-100">
              <td className="px-4 py-3 font-semibold">{row.reference}</td>
              <td className="px-4 py-3">{row.isAnonymous ? d.donations.anonymousDonor : row.donorName}</td>
              <td className="px-4 py-3">{formatDateShort(row.createdAt, locale)}</td>
              <td className="px-4 py-3">{formatCurrency(row.amount, locale)}</td>
              <td className="px-4 py-3">{donationPurposeLabel(d, row.purpose)}</td>
              <td className="px-4 py-3">{donationMethodLabel(d, row.method)}</td>
              <td className="px-4 py-3">
                <Badge tone={statusTone(row.status)}>{row.status}</Badge>
              </td>
              <td className="px-4 py-3">
                {row.status === "PENDING" ? (
                  <form action={adminConfirmDonation}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="donationId" value={row.id} />
                    <Button type="submit" size="sm">
                      {d.admin.markConfirmed}
                    </Button>
                  </form>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
