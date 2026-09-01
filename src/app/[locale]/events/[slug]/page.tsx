import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildMetadata, eventSchema } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/ui/json-ld";
import { MediaFrame } from "@/components/ui/media";
import { EventRegisterForm } from "@/components/forms/event-register-form";

export async function generateStaticParams() {
  const events = await prisma.event.findMany({ where: { isPublished: true }, select: { slug: true } });
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || !event.isPublished) return {};
  return buildMetadata({
    locale: raw,
    title: pick(event, "title", raw),
    description: pick(event, "summary", raw),
    path: `/events/${slug}`,
    image: event.coverImage ?? undefined,
  });
}

function calendarUrl(title: string, startsAt: Date, endsAt: Date | null, venue: string) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = endsAt ?? new Date(startsAt.getTime() + 2 * 3600_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(startsAt)}/${fmt(end)}`,
    location: venue,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);
  const user = await getCurrentUser();

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || !event.isPublished) notFound();

  const title = pick(event, "title", locale);
  const seats = event.capacity != null ? Math.max(0, event.capacity - event.attendeeCount) : null;
  const upcoming = event.startsAt >= new Date();

  return (
    <>
      <JsonLd
        data={eventSchema({
          locale,
          name: title,
          description: pick(event, "summary", locale),
          path: `/events/${slug}`,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          venue: event.venue,
          city: event.city,
          image: event.coverImage ?? undefined,
        })}
      />
      <PageHero
        locale={locale}
        title={title}
        subtitle={pick(event, "summary", locale)}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[
          { name: d.nav.home, href: "/" },
          { name: d.events.title, href: "/events" },
          { name: title },
        ]}
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <MediaFrame src={event.coverImage ?? "/media/medical-camp.svg"} alt="" ratio="16/9" className="mb-8" />
            <div className="prose-hla" dangerouslySetInnerHTML={{ __html: pick(event, "body", locale) }} />
          </div>
          <aside className="space-y-5 lg:col-span-5">
            <div className="card-surface p-6">
              <dl className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 size-4 text-brand-700" aria-hidden />
                  <div>
                    <dt className="font-semibold">{d.events.startsAt}</dt>
                    <dd className="text-ink-600 dark:text-ink-300">{formatDate(event.startsAt, locale, true)}</dd>
                  </div>
                </div>
                {event.endsAt && (
                  <div className="flex gap-3">
                    <CalendarDays className="mt-0.5 size-4 text-brand-700" aria-hidden />
                    <div>
                      <dt className="font-semibold">{d.events.endsAt}</dt>
                      <dd className="text-ink-600 dark:text-ink-300">{formatDate(event.endsAt, locale, true)}</dd>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 text-brand-700" aria-hidden />
                  <div>
                    <dt className="font-semibold">{d.events.venue}</dt>
                    <dd className="text-ink-600 dark:text-ink-300">
                      {event.venue}, {event.city}
                    </dd>
                  </div>
                </div>
                {event.capacity != null && (
                  <div className="flex gap-3">
                    <Users className="mt-0.5 size-4 text-brand-700" aria-hidden />
                    <div>
                      <dt className="font-semibold">{d.events.capacity}</dt>
                      <dd className="text-ink-600 dark:text-ink-300">
                        {event.attendeeCount} {d.events.attendees}
                        {seats != null && (
                          <>
                            {" "}
                            · {seats} {d.events.seatsLeft}
                          </>
                        )}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
              <ButtonLink
                href={calendarUrl(title, event.startsAt, event.endsAt, `${event.venue}, ${event.city}`)}
                variant="outline"
                className="mt-5"
                target="_blank"
                rel="noopener noreferrer"
              >
                {d.events.addToCalendar}
              </ButtonLink>
            </div>
            <div className="card-surface p-6">
              <h2 className="text-lg font-extrabold">{d.events.registerTitle}</h2>
              {event.registrationOpen && upcoming ? (
                <div className="mt-4">
                  <EventRegisterForm d={d} eventId={event.id} defaultName={user?.name} defaultEmail={user?.email} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-500">{d.events.registrationClosed}</p>
              )}
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
