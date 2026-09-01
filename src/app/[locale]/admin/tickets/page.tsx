import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { ticketCategoryLabel, ticketPriorityLabel, ticketStatusLabel } from "@/lib/labels";
import { formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";

export default async function AdminTicketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: "desc" },
    include: { member: { select: { fullName: true, membershipNo: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.tickets}</h1>
        <p className="text-sm text-ink-500">{d.dashboard.ticketsSubtitle}</p>
      </div>
      {tickets.length === 0 ? (
        <EmptyState title={d.admin.noRecords} />
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link href={`/${locale}/admin/tickets/${t.id}`} className="card-surface block p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-ink-500">{t.ticketNo}</p>
                    <p className="font-bold">{t.subject}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {t.contactName}
                      {t.member?.membershipNo ? ` · ${t.member.membershipNo}` : ""} ·{" "}
                      {ticketCategoryLabel(d, t.category)} · {formatDateShort(t.updatedAt, locale)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={statusTone(t.priority)}>{ticketPriorityLabel(d, t.priority)}</Badge>
                    <Badge tone={statusTone(t.status)}>{ticketStatusLabel(d, t.status)}</Badge>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
