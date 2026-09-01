import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminVolunteerStatus } from "@/lib/actions";
import { adminDeleteVolunteer } from "@/lib/admin-actions";
import { volunteerAreaLabel } from "@/lib/labels";
import { formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { AdminDeleteButton } from "@/components/admin/delete-button";

const VOLUNTEER_STATUSES = ["NEW", "CONTACTED", "ACTIVE", "INACTIVE", "DECLINED"] as const;

export default async function AdminVolunteersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const volunteers = await prisma.volunteerApplication.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.volunteers}</h1>
        <p className="text-sm text-ink-500">{d.volunteer.formSubtitle}</p>
      </div>
      {volunteers.length === 0 ? (
        <EmptyState title={d.admin.noRecords} />
      ) : (
        <ul className="space-y-4">
          {volunteers.map((vol) => (
            <li key={vol.id} className="card-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-500">{vol.reference}</p>
                  <h2 className="text-lg font-extrabold">{vol.fullName}</h2>
                  <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                    {vol.email} · {vol.phone} · {vol.city}, {vol.district}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {vol.interests
                      .split(",")
                      .filter(Boolean)
                      .map((area) => (
                        <Badge key={area}>{volunteerAreaLabel(d, area)}</Badge>
                      ))}
                  </p>
                  <p className="mt-2 text-xs text-ink-500">
                    {vol.availability} · {vol.hoursPerMonth}h · {formatDateShort(vol.createdAt, locale)}
                  </p>
                  {vol.motivation && (
                    <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">{vol.motivation}</p>
                  )}
                </div>
                <Badge tone={statusTone(vol.status)}>{vol.status}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <form action={adminVolunteerStatus} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="volunteerId" value={vol.id} />
                  <Select name="status" defaultValue={vol.status} className="max-w-xs">
                    {VOLUNTEER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                  <Button type="submit" size="sm">
                    {d.common.save}
                  </Button>
                </form>
                <AdminDeleteButton
                  action={adminDeleteVolunteer}
                  id={vol.id}
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
