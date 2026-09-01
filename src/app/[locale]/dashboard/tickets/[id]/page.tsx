import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { ticketStatusLabel } from "@/lib/labels";
import { TicketReplyForm } from "@/components/forms/ticket-form";
import { ButtonLink } from "@/components/ui/button";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const user = await requireUser(locale);
  const d = await getDictionary(locale);

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!ticket || ticket.memberId !== user.memberId) notFound();

  const closed = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

  return (
    <div className="space-y-6">
      <ButtonLink href={`/${locale}/dashboard/tickets`} variant="ghost" size="sm">
        {d.common.back}
      </ButtonLink>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-ink-500">{ticket.ticketNo}</p>
          <h1 className="text-2xl font-extrabold">{ticket.subject}</h1>
        </div>
        <Badge tone={statusTone(ticket.status)}>{ticketStatusLabel(d, ticket.status)}</Badge>
      </div>
      <p className="text-sm text-ink-600 dark:text-ink-300">{ticket.description}</p>
      <section>
        <h2 className="font-extrabold">{d.dashboard.conversation}</h2>
        <ul className="mt-3 space-y-3">
          {ticket.messages
            .filter((m) => !m.isInternal)
            .map((m) => (
              <li
                key={m.id}
                className={`rounded-2xl p-4 text-sm ${m.authorRole === "ADMIN" ? "bg-ink-50 dark:bg-white/5" : "bg-brand-50 dark:bg-brand-500/10"}`}
              >
                <p className="text-xs font-bold">
                  {m.authorName} · {formatDate(m.createdAt, locale, true)}
                </p>
                <p className="mt-2 whitespace-pre-line">{m.body}</p>
              </li>
            ))}
        </ul>
        <TicketReplyForm d={d} ticketId={ticket.id} closed={closed} />
      </section>
    </div>
  );
}
