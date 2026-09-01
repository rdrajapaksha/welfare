import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminUpdateTicketStatus } from "@/lib/actions";
import { TICKET_STATUSES } from "@/lib/constants";
import { ticketCategoryLabel, ticketPriorityLabel, ticketStatusLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { TicketReplyForm } from "@/components/forms/ticket-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/form";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } }, member: true },
  });
  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      <ButtonLink href={`/${locale}/admin/tickets`} variant="ghost" size="sm">
        {d.common.back}
      </ButtonLink>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-ink-500">{ticket.ticketNo}</p>
          <h1 className="text-2xl font-extrabold">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-ink-500">
            {ticket.contactName} · {ticket.email}
            {ticket.member ? ` · ${ticket.member.membershipNo}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{ticketCategoryLabel(d, ticket.category)}</Badge>
          <Badge tone={statusTone(ticket.priority)}>{ticketPriorityLabel(d, ticket.priority)}</Badge>
          <Badge tone={statusTone(ticket.status)}>{ticketStatusLabel(d, ticket.status)}</Badge>
        </div>
      </div>
      <p className="text-sm whitespace-pre-line text-ink-600 dark:text-ink-300">{ticket.description}</p>

      <form action={adminUpdateTicketStatus} className="card-surface flex flex-wrap items-end gap-3 p-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="ticketId" value={ticket.id} />
        <label className="min-w-48 flex-1">
          <span className="mb-1.5 block text-sm font-semibold">{d.common.status}</span>
          <Select name="status" defaultValue={ticket.status}>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ticketStatusLabel(d, status)}
              </option>
            ))}
          </Select>
        </label>
        <Button type="submit" size="sm">
          {d.common.save}
        </Button>
      </form>

      <section>
        <h2 className="font-extrabold">{d.dashboard.conversation}</h2>
        <ul className="mt-3 space-y-3">
          {ticket.messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-2xl p-4 text-sm ${
                m.isInternal
                  ? "border border-gold-200 bg-gold-50 dark:border-gold-400/20 dark:bg-gold-400/10"
                  : m.authorRole === "ADMIN"
                    ? "bg-ink-50 dark:bg-white/5"
                    : "bg-brand-50 dark:bg-brand-500/10"
              }`}
            >
              <p className="text-xs font-bold">
                {m.authorName} · {formatDate(m.createdAt, locale, true)}
                {m.isInternal && (
                  <Badge tone="gold" className="ml-2">
                    {d.admin.internalNote}
                  </Badge>
                )}
              </p>
              <p className="mt-2 whitespace-pre-line">{m.body}</p>
            </li>
          ))}
        </ul>
        <TicketReplyForm d={d} ticketId={ticket.id} closed={false} allowInternal />
      </section>
    </div>
  );
}
