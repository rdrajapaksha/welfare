import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminDeleteEvent, adminUpsertEvent } from "@/lib/admin-actions";
import { formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { MediaSelect, CheckField } from "@/components/admin/admin-controls";
import { AdminDeleteButton } from "@/components/admin/delete-button";

export default async function AdminEventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const events = await prisma.event.findMany({
    orderBy: { startsAt: "desc" },
    include: { _count: { select: { registrations: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.events}</h1>
        <p className="text-sm text-ink-500">{d.events.subtitle}</p>
      </div>

      <section className="card-surface p-5">
        <h2 className="text-lg font-extrabold">{d.common.new} event</h2>
        <form action={adminUpsertEvent} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value="" />
          <Field label={`${d.forms.subject} (EN)`} htmlFor="titleEn" required>
            <Input id="titleEn" name="titleEn" required />
          </Field>
          <Field label={`${d.forms.subject} (SI)`} htmlFor="titleSi">
            <Input id="titleSi" name="titleSi" />
          </Field>
          <Field label={`${d.forms.subject} (TA)`} htmlFor="titleTa">
            <Input id="titleTa" name="titleTa" />
          </Field>
          <Field label="Summary (EN)" htmlFor="summaryEn" className="sm:col-span-2 lg:col-span-3">
            <Textarea id="summaryEn" name="summaryEn" rows={3} />
          </Field>
          <Field label={d.events.venue} htmlFor="venue">
            <Input id="venue" name="venue" placeholder="HLA Association Hall" />
          </Field>
          <Field label={d.forms.city} htmlFor="city">
            <Input id="city" name="city" placeholder="Nugegoda" />
          </Field>
          <Field label={d.events.capacity} htmlFor="capacity">
            <Input id="capacity" name="capacity" type="number" min={0} />
          </Field>
          <Field label={d.events.startsAt} htmlFor="startsAt" required>
            <Input id="startsAt" name="startsAt" type="datetime-local" required />
          </Field>
          <Field label={d.events.endsAt} htmlFor="endsAt">
            <Input id="endsAt" name="endsAt" type="datetime-local" />
          </Field>
          <MediaSelect name="coverImage" label="Cover image" />
          <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-3">
            <CheckField name="registrationOpen" label={d.events.registerCta} defaultChecked />
            <CheckField name="isPublished" label={d.common.published} defaultChecked />
            <Button type="submit" size="sm">
              {d.common.save}
            </Button>
          </div>
        </form>
      </section>

      {events.length === 0 ? (
        <EmptyState title={d.admin.noRecords} />
      ) : (
        <DataTable
          head={[
            d.forms.subject,
            d.events.venue,
            d.events.startsAt,
            d.events.attendees,
            d.common.status,
            d.common.actions,
          ]}
        >
          {events.map((event) => (
            <tr key={event.id} className="text-ink-800 dark:text-ink-100">
              <td className="px-4 py-3 font-semibold">{pick(event, "title", locale)}</td>
              <td className="px-4 py-3">
                {event.venue}, {event.city}
              </td>
              <td className="px-4 py-3">{formatDateShort(event.startsAt, locale)}</td>
              <td className="px-4 py-3">
                {event.attendeeCount}
                {event.capacity != null ? ` / ${event.capacity}` : ""} · {event._count.registrations}
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusTone(event.registrationOpen ? "ACTIVE" : "CLOSED")}>
                  {event.registrationOpen ? d.events.registerCta : d.events.registrationClosed}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ButtonLink href={`/${locale}/admin/events/${event.id}`} size="sm" variant="ghost">
                    {d.common.edit}
                  </ButtonLink>
                  <AdminDeleteButton
                    action={adminDeleteEvent}
                    id={event.id}
                    locale={locale}
                    label={d.common.delete}
                  />
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
