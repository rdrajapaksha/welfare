import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminDeleteSuggestion, adminUpdateSuggestion } from "@/lib/admin-actions";
import { formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { AdminDeleteButton } from "@/components/admin/delete-button";

export default async function AdminSuggestionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const suggestions = await prisma.suggestion.findMany({
    orderBy: { createdAt: "desc" },
    include: { member: { select: { fullName: true, membershipNo: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.suggestions}</h1>
        <p className="text-sm text-ink-500">{d.admin.suggestionsHint}</p>
      </div>

      {suggestions.length === 0 ? (
        <EmptyState title={d.dashboard.noSuggestions} />
      ) : (
        <ul className="space-y-4">
          {suggestions.map((s) => (
            <li key={s.id} className="card-surface space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold">{s.subject}</p>
                  <p className="mt-1 text-xs text-ink-400">
                    {s.reference} · {s.category} · {formatDateShort(s.createdAt, locale)} ·{" "}
                    {s.isAnonymous
                      ? d.dashboard.anonymous
                      : `${s.member?.fullName ?? "—"} (${s.member?.membershipNo ?? "—"})`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                  <AdminDeleteButton action={adminDeleteSuggestion} id={s.id} locale={locale} />
                </div>
              </div>
              <p className="text-sm text-ink-600 dark:text-ink-300">{s.body}</p>
              <form action={adminUpdateSuggestion} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={s.id} />
                <Field label={d.common.status} htmlFor={`st-${s.id}`}>
                  <Select id={`st-${s.id}`} name="status" defaultValue={s.status}>
                    <option value="NEW">New</option>
                    <option value="REVIEWING">Reviewing</option>
                    <option value="DONE">Done</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </Field>
                <Field label={d.admin.internalNote} htmlFor={`note-${s.id}`}>
                  <Textarea id={`note-${s.id}`} name="adminNote" rows={2} defaultValue={s.adminNote ?? ""} />
                </Field>
                <div className="flex items-end">
                  <Button type="submit" size="sm">
                    {d.common.save}
                  </Button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
