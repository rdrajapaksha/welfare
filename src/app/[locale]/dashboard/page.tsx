import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/misc";
import { claimStatusLabel, ticketStatusLabel } from "@/lib/labels";
import { ButtonLink } from "@/components/ui/button";

export default async function DashboardHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const user = await requireUser(locale);
  const d = await getDictionary(locale);

  const member = user.memberId
    ? await prisma.member.findUnique({
        where: { id: user.memberId },
        include: {
          benefitClaims: { orderBy: { submittedAt: "desc" }, take: 4, include: { programme: true } },
          tickets: { orderBy: { updatedAt: "desc" }, take: 4 },
          payments: { orderBy: { paidAt: "desc" }, take: 3 },
        },
      })
    : null;

  const announcements = await prisma.announcement.findMany({
    where: { isPublished: true, audience: { in: ["ALL", "MEMBERS"] } },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    take: 3,
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-500">{d.dashboard.welcome}</p>
        <h1 className="text-3xl font-extrabold">{user.name}</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={d.dashboard.membershipCard} value={member?.membershipNo ?? "—"} hint={member?.status} />
        <StatCard
          label={d.dashboard.duesTitle}
          value={member?.payments[0] ? formatCurrency(member.payments[0].amount, locale) : d.dashboard.duesClear}
          tone="teal"
        />
        <StatCard label={d.dashboard.tickets} value={member?.tickets.length ?? 0} tone="gold" />
      </div>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href={`/${locale}/dashboard/benefits`} size="sm">
          {d.dashboard.newClaim}
        </ButtonLink>
        <ButtonLink href={`/${locale}/dashboard/tickets`} variant="outline" size="sm">
          {d.dashboard.newTicket}
        </ButtonLink>
        <ButtonLink href={`/${locale}/dashboard/documents`} variant="outline" size="sm">
          {d.dashboard.documents}
        </ButtonLink>
      </div>
      <section>
        <h2 className="text-lg font-extrabold">{d.dashboard.myClaims}</h2>
        <ul className="mt-3 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200 bg-white dark:divide-white/8 dark:border-white/10 dark:bg-ink-900/40">
          {(member?.benefitClaims ?? []).length === 0 && (
            <li className="px-4 py-6 text-sm text-ink-500">{d.dashboard.noClaims}</li>
          )}
          {member?.benefitClaims.map((claim) => (
            <li key={claim.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold">{claim.claimNo}</p>
                <p className="text-ink-500">{pick(claim.programme, "title", locale)}</p>
              </div>
              <Badge tone={statusTone(claim.status)}>{claimStatusLabel(d, claim.status)}</Badge>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-extrabold">{d.dashboard.ticketsTitle}</h2>
        <ul className="mt-3 space-y-2">
          {(member?.tickets ?? []).length === 0 && <p className="text-sm text-ink-500">{d.dashboard.noTickets}</p>}
          {member?.tickets.map((t) => (
            <Link key={t.id} href={`/${locale}/dashboard/tickets/${t.id}`} className="card-surface flex items-center justify-between p-4">
              <span className="font-semibold">{t.subject}</span>
              <Badge tone={statusTone(t.status)}>{ticketStatusLabel(d, t.status)}</Badge>
            </Link>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-extrabold">{d.dashboard.announcements}</h2>
        <ul className="mt-3 space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className="card-surface p-4">
              <p className="text-xs text-ink-500">{formatDateShort(a.publishedAt, locale)}</p>
              <p className="font-bold">{pick(a, "title", locale)}</p>
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{pick(a, "body", locale)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
