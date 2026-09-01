import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminDecideApplication } from "@/lib/actions";
import { membershipTypeLabel } from "@/lib/labels";
import { formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";

export default async function AdminApplicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const applications = await prisma.membershipApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.applications}</h1>
        <p className="text-sm text-ink-500">{d.admin.recentApplications}</p>
      </div>
      {applications.length === 0 ? (
        <EmptyState title={d.admin.noRecords} />
      ) : (
        <ul className="space-y-4">
          {applications.map((app) => {
            const open = app.status === "PENDING" || app.status === "UNDER_REVIEW";
            return (
              <li key={app.id} className="card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-ink-500">{app.applicationNo}</p>
                    <h2 className="text-lg font-extrabold">{app.fullName}</h2>
                    <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                      {app.email} · {app.phone} · {app.city}, {app.district}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      {d.forms.nic}: {app.nic} · {membershipTypeLabel(d, app.membershipType)} ·{" "}
                      {formatDateShort(app.createdAt, locale)}
                    </p>
                    {app.motivation && <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">{app.motivation}</p>}
                  </div>
                  <Badge tone={statusTone(app.status)}>{app.status}</Badge>
                </div>
                {open && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <form action={adminDecideApplication}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="applicationId" value={app.id} />
                      <input type="hidden" name="decision" value="APPROVED" />
                      <Button type="submit" size="sm">
                        {d.admin.approve}
                      </Button>
                    </form>
                    <form action={adminDecideApplication}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="applicationId" value={app.id} />
                      <input type="hidden" name="decision" value="REJECTED" />
                      <Button type="submit" size="sm" variant="danger">
                        {d.admin.reject}
                      </Button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
