import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminDeleteAnnouncement, adminUpsertAnnouncement } from "@/lib/admin-actions";
import { formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { CheckField } from "@/components/admin/admin-controls";
import { AdminDeleteButton } from "@/components/admin/delete-button";

export default async function AdminAnnouncementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const announcements = await prisma.announcement.findMany({
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.announcements}</h1>
        <p className="text-sm text-ink-500">{d.admin.announcementsHint}</p>
      </div>

      <section className="card-surface p-5">
        <h2 className="text-lg font-extrabold">{d.admin.sendAnnouncement}</h2>
        <p className="mt-1 text-sm text-ink-500">{d.admin.sendAnnouncementNote}</p>
        <form action={adminUpsertAnnouncement} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value="" />
          <Field label={`${d.forms.subject} (EN)`} htmlFor="titleEn" required>
            <Input id="titleEn" name="titleEn" required placeholder="e.g. AGM notice" />
          </Field>
          <Field label={`${d.forms.subject} (SI)`} htmlFor="titleSi">
            <Input id="titleSi" name="titleSi" />
          </Field>
          <Field label={`${d.forms.subject} (TA)`} htmlFor="titleTa">
            <Input id="titleTa" name="titleTa" />
          </Field>
          <Field label={`${d.forms.message} (EN)`} htmlFor="bodyEn" className="sm:col-span-2 lg:col-span-3" required>
            <Textarea id="bodyEn" name="bodyEn" rows={4} required />
          </Field>
          <Field label={`${d.forms.message} (SI)`} htmlFor="bodySi" className="sm:col-span-2 lg:col-span-3">
            <Textarea id="bodySi" name="bodySi" rows={3} />
          </Field>
          <Field label={`${d.forms.message} (TA)`} htmlFor="bodyTa" className="sm:col-span-2 lg:col-span-3">
            <Textarea id="bodyTa" name="bodyTa" rows={3} />
          </Field>
          <Field label={d.admin.audience} htmlFor="audience">
            <Select id="audience" name="audience" defaultValue="MEMBERS">
              <option value="MEMBERS">{d.admin.audienceMembers}</option>
              <option value="ALL">{d.admin.audienceAll}</option>
              <option value="COMMITTEE">{d.admin.audienceCommittee}</option>
            </Select>
          </Field>
          <Field label={d.admin.priority} htmlFor="priority">
            <Select id="priority" name="priority" defaultValue="NORMAL">
              <option value="NORMAL">Normal</option>
              <option value="IMPORTANT">Important</option>
              <option value="URGENT">Urgent</option>
            </Select>
          </Field>
          <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-3">
            <CheckField name="isPinned" label={d.admin.pinAnnouncement} />
            <CheckField name="isPublished" label={d.common.published} defaultChecked />
            <Button type="submit" size="sm">
              {d.admin.publishAnnouncement}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-extrabold">{d.admin.sentAnnouncements}</h2>
          <ButtonLink href={`/${locale}/dashboard/announcements`} variant="outline" size="sm">
            {d.admin.viewAsMember}
          </ButtonLink>
        </div>
        {announcements.length === 0 ? (
          <EmptyState title={d.dashboard.noAnnouncements} />
        ) : (
          <DataTable
            head={[
              d.forms.subject,
              d.admin.audience,
              d.admin.priority,
              d.common.status,
              d.common.date,
              d.common.actions,
            ]}
          >
            {announcements.map((item) => (
              <tr key={item.id} className="text-ink-800 dark:text-ink-100">
                <td className="px-4 py-3">
                  <p className="font-semibold">{pick(item, "title", locale)}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-500">{pick(item, "body", locale)}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge>
                    {item.audience === "MEMBERS"
                      ? d.admin.audienceMembers
                      : item.audience === "COMMITTEE"
                        ? d.admin.audienceCommittee
                        : d.admin.audienceAll}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      item.priority === "URGENT"
                        ? "danger"
                        : item.priority === "IMPORTANT"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {item.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(item.isPublished ? "ACTIVE" : "PENDING")}>
                    {item.isPinned ? `${d.common.featured} · ` : ""}
                    {item.isPublished ? d.common.published : d.common.draft}
                  </Badge>
                </td>
                <td className="px-4 py-3">{formatDateShort(item.publishedAt, locale)}</td>
                <td className="px-4 py-3">
                  <AdminDeleteButton
                    action={adminDeleteAnnouncement}
                    id={item.id}
                    locale={locale}
                    label={d.common.delete}
                  />
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </div>
  );
}
