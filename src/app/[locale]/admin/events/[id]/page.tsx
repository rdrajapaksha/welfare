import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminDeleteEvent, adminUpsertEvent } from "@/lib/admin-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { MediaSelect, CheckField } from "@/components/admin/admin-controls";
import { AdminDeleteButton } from "@/components/admin/delete-button";

function toDatetimeLocal(date: Date | null | undefined) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function AdminEventEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ButtonLink href={`/${locale}/admin/events`} variant="ghost" size="sm">
            {d.common.back}
          </ButtonLink>
          <h1 className="mt-2 text-2xl font-extrabold">{d.common.edit}: {event.titleEn}</h1>
        </div>
        <AdminDeleteButton
          action={adminDeleteEvent}
          id={event.id}
          locale={locale}
          label={d.common.delete}
        />
      </div>

      <section className="card-surface p-5">
        <form action={adminUpsertEvent} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={event.id} />
          <Field label={`${d.forms.subject} (EN)`} htmlFor="titleEn" required>
            <Input id="titleEn" name="titleEn" required defaultValue={event.titleEn} />
          </Field>
          <Field label={`${d.forms.subject} (SI)`} htmlFor="titleSi">
            <Input id="titleSi" name="titleSi" defaultValue={event.titleSi} />
          </Field>
          <Field label={`${d.forms.subject} (TA)`} htmlFor="titleTa">
            <Input id="titleTa" name="titleTa" defaultValue={event.titleTa} />
          </Field>
          <Field label="Summary (EN)" htmlFor="summaryEn" className="sm:col-span-2 lg:col-span-3">
            <Textarea id="summaryEn" name="summaryEn" rows={3} defaultValue={event.summaryEn} />
          </Field>
          <Field label="Summary (SI)" htmlFor="summarySi">
            <Textarea id="summarySi" name="summarySi" rows={2} defaultValue={event.summarySi} />
          </Field>
          <Field label="Summary (TA)" htmlFor="summaryTa">
            <Textarea id="summaryTa" name="summaryTa" rows={2} defaultValue={event.summaryTa} />
          </Field>
          <Field label="Body (EN)" htmlFor="bodyEn" className="sm:col-span-2 lg:col-span-3">
            <Textarea id="bodyEn" name="bodyEn" rows={4} defaultValue={event.bodyEn} />
          </Field>
          <Field label={d.events.venue} htmlFor="venue">
            <Input id="venue" name="venue" defaultValue={event.venue} />
          </Field>
          <Field label={d.forms.city} htmlFor="city">
            <Input id="city" name="city" defaultValue={event.city} />
          </Field>
          <Field label={d.events.capacity} htmlFor="capacity">
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={0}
              defaultValue={event.capacity ?? undefined}
            />
          </Field>
          <Field label={d.events.startsAt} htmlFor="startsAt" required>
            <Input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocal(event.startsAt)}
            />
          </Field>
          <Field label={d.events.endsAt} htmlFor="endsAt">
            <Input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(event.endsAt)}
            />
          </Field>
          <MediaSelect name="coverImage" label="Cover image" defaultValue={event.coverImage} />
          <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-3">
            <CheckField
              name="registrationOpen"
              label={d.events.registerCta}
              defaultChecked={event.registrationOpen}
            />
            <CheckField
              name="isPublished"
              label={d.common.published}
              defaultChecked={event.isPublished}
            />
            <Button type="submit">{d.common.save}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
