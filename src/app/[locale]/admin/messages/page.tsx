import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminDeleteMessage, adminUpdateMessageStatus } from "@/lib/admin-actions";
import { formatDate } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { AdminDeleteButton } from "@/components/admin/delete-button";

const MESSAGE_STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;

export default async function AdminMessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.messages}</h1>
        <p className="text-sm text-ink-500">{d.contact.formSubtitle}</p>
      </div>
      {messages.length === 0 ? (
        <EmptyState title={d.admin.noRecords} />
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li key={msg.id} className="card-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-500">
                    {msg.topic} · {formatDate(msg.createdAt, locale, true)}
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold">{msg.subject}</h2>
                  <p className="mt-1 text-sm text-ink-500">
                    {msg.name} · {msg.email}
                    {msg.phone ? ` · ${msg.phone}` : ""}
                  </p>
                </div>
                <Badge tone={statusTone(msg.status)}>{msg.status}</Badge>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-ink-700 dark:text-ink-200">
                {msg.message}
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <form action={adminUpdateMessageStatus} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={msg.id} />
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink-500">
                      {d.common.status}
                    </span>
                    <Select name="status" defaultValue={msg.status} className="min-w-[10rem]">
                      {MESSAGE_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <Button type="submit" size="sm">
                    {d.common.save}
                  </Button>
                </form>
                <AdminDeleteButton
                  action={adminDeleteMessage}
                  id={msg.id}
                  locale={locale}
                  label={d.common.delete}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
