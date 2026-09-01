import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { dateParts, formatDateShort } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { EmptyState, FilterChips } from "@/components/ui/misc";
import { MediaFrame } from "@/components/ui/media";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.events.title, description: d.events.subtitle, path: "/events" });
}

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { filter } = await searchParams;
  const d = await getDictionary(locale);
  const past = filter === "past";
  const now = new Date();

  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      startsAt: past ? { lt: now } : { gte: now },
    },
    orderBy: { startsAt: past ? "desc" : "asc" },
  });

  return (
    <>
      <PageHero
        locale={locale}
        title={d.events.title}
        subtitle={d.events.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.events.title }]}
      />
      <Section>
        <FilterChips
          locale={locale}
          basePath="/events"
          paramName="filter"
          activeValue={past ? "past" : "all"}
          options={[
            { value: "all", label: d.events.upcoming },
            { value: "past", label: d.events.past },
          ]}
        />
        {events.length === 0 ? (
          <EmptyState title={past ? d.events.noPast : d.events.noUpcoming} className="mt-10" />
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {events.map((event) => {
              const parts = dateParts(event.startsAt, locale);
              const seats =
                event.capacity != null ? Math.max(0, event.capacity - event.attendeeCount) : null;
              return (
                <Link key={event.id} href={`/${locale}/events/${event.slug}`} className="card-surface group overflow-hidden">
                  <MediaFrame src={event.coverImage ?? "/media/medical-camp.svg"} alt="" ratio="16/9" imgClassName="group-hover:scale-105" />
                  <div className="flex gap-4 p-5">
                    <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-brand-50 text-center dark:bg-brand-500/15">
                      <p className="text-[0.65rem] font-bold tracking-wider text-brand-700 uppercase">{parts.month}</p>
                      <p className="text-xl font-extrabold text-ink-950 dark:text-white">{parts.day}</p>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        {event.registrationOpen && !past && <Badge tone="teal">{d.events.registerCta}</Badge>}
                        {past && <Badge tone="neutral">{d.events.past}</Badge>}
                      </div>
                      <h2 className="mt-2 text-lg font-extrabold text-ink-950 group-hover:text-brand-700 dark:text-white">
                        {pick(event, "title", locale)}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                        <MapPin className="size-3.5" aria-hidden />
                        {event.venue}, {event.city}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                        <CalendarDays className="size-3.5" aria-hidden />
                        {formatDateShort(event.startsAt, locale)}
                        {seats != null && (
                          <>
                            {" "}
                            · {seats} {d.events.seatsLeft}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
