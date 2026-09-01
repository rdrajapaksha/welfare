import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { ticketStatusLabel, ticketCategoryLabel } from "@/lib/labels";
import { NewTicketForm } from "@/components/forms/ticket-form";

export default async function TicketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const user = await requireUser(locale);
  const d = await getDictionary(locale);

  const tickets = user.memberId
    ? await prisma.supportTicket.findMany({
        where: { memberId: user.memberId },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div className="grid gap-10 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-extrabold">{d.dashboard.ticketsTitle}</h1>
        <p className="mt-1 text-sm text-ink-500">{d.dashboard.ticketsSubtitle}</p>
        <ul className="mt-6 space-y-3">
          {tickets.length === 0 && <p className="text-sm text-ink-500">{d.dashboard.noTickets}</p>}
          {tickets.map((t) => (
            <Link key={t.id} href={`/${locale}/dashboard/tickets/${t.id}`} className="card-surface block p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{t.subject}</p>
                <Badge tone={statusTone(t.status)}>{ticketStatusLabel(d, t.status)}</Badge>
              </div>
              <p className="mt-1 text-xs text-ink-500">
                {t.ticketNo} · {ticketCategoryLabel(d, t.category)} · {formatDateShort(t.createdAt, locale)}
              </p>
            </Link>
          ))}
        </ul>
      </div>
      <div className="card-surface p-5 lg:col-span-2">
        <h2 className="font-extrabold">{d.dashboard.newTicket}</h2>
        <div className="mt-4">
          <NewTicketForm d={d} />
        </div>
      </div>
    </div>
  );
}
