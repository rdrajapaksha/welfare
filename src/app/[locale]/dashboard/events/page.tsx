import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

export default async function MemberEventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const user = await requireUser(locale);
  const d = await getDictionary(locale);

  const registrations = user.memberId
    ? await prisma.eventRegistration.findMany({
        where: { memberId: user.memberId },
        include: { event: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{d.dashboard.myEvents}</h1>
          <p className="mt-1 text-sm text-ink-500">{d.dashboard.events}</p>
        </div>
        <ButtonLink href={`/${locale}/events`} size="sm" variant="outline">
          {d.events.upcoming}
        </ButtonLink>
      </div>
      {registrations.length === 0 ? (
        <EmptyState title={d.dashboard.noEventRegistrations} className="mt-8" />
      ) : (
        <ul className="mt-8 space-y-3">
          {registrations.map((reg) => (
            <li key={reg.id}>
              <Link href={`/${locale}/events/${reg.event.slug}`} className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-bold">{pick(reg.event, "title", locale)}</p>
                  <p className="text-sm text-ink-500">
                    {formatDateShort(reg.event.startsAt, locale)} · {reg.event.venue}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    {d.events.guests}: {reg.guests} · {formatDateShort(reg.createdAt, locale)}
                  </p>
                </div>
                <Badge tone={statusTone(reg.status)}>{reg.status}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
