import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminVolunteerStatus } from "@/lib/actions";
import { adminDeleteVolunteer } from "@/lib/admin-actions";
import { volunteerAreaLabel } from "@/lib/labels";
import { VOLUNTEER_AREAS } from "@/lib/constants";
import { formatDateShort, cn } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { AdminDeleteButton } from "@/components/admin/delete-button";

const VOLUNTEER_STATUSES = ["NEW", "CONTACTED", "ACTIVE", "INACTIVE", "DECLINED"] as const;

export default async function AdminVolunteersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; status?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);
  const sp = await searchParams;
  const category = sp.category && VOLUNTEER_AREAS.includes(sp.category as (typeof VOLUNTEER_AREAS)[number])
    ? sp.category
    : "ALL";
  const statusFilter = sp.status && VOLUNTEER_STATUSES.includes(sp.status as (typeof VOLUNTEER_STATUSES)[number])
    ? sp.status
    : "ALL";

  const volunteers = await prisma.volunteerApplication.findMany({
    where: statusFilter === "ALL" ? undefined : { status: statusFilter },
    orderBy: { createdAt: "desc" },
  });

  const filtered =
    category === "ALL"
      ? volunteers
      : volunteers.filter((v) =>
          v.interests
            .split(",")
            .map((s) => s.trim())
            .includes(category),
        );

  const categoryCounts = Object.fromEntries(
    VOLUNTEER_AREAS.map((area) => [
      area,
      volunteers.filter((v) =>
        v.interests
          .split(",")
          .map((s) => s.trim())
          .includes(area),
      ).length,
    ]),
  ) as Record<string, number>;

  const hrefFor = (next: { category?: string; status?: string }) => {
    const q = new URLSearchParams();
    const c = next.category ?? category;
    const s = next.status ?? statusFilter;
    if (c !== "ALL") q.set("category", c);
    if (s !== "ALL") q.set("status", s);
    const qs = q.toString();
    return `/${locale}/admin/volunteers${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.volunteers}</h1>
        <p className="text-sm text-ink-500">{d.admin.volunteersHint}</p>
      </div>

      <section>
        <h2 className="text-sm font-extrabold tracking-wider text-ink-500 uppercase">
          {d.volunteer.categoriesTitle}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={hrefFor({ category: "ALL" })}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold transition",
              category === "ALL"
                ? "bg-ink-950 text-white dark:bg-white dark:text-ink-950"
                : "bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-white/10 dark:text-ink-200",
            )}
          >
            {d.common.all} ({volunteers.length})
          </Link>
          {VOLUNTEER_AREAS.map((area) => (
            <Link
              key={area}
              href={hrefFor({ category: area })}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition",
                category === area
                  ? "bg-brand-600 text-white"
                  : "bg-brand-50 text-brand-800 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-200",
              )}
            >
              {volunteerAreaLabel(d, area)} ({categoryCounts[area] ?? 0})
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-extrabold tracking-wider text-ink-500 uppercase">
          {d.common.status}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["ALL", ...VOLUNTEER_STATUSES] as const).map((status) => (
            <Link
              key={status}
              href={hrefFor({ status })}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition",
                statusFilter === status
                  ? "bg-ink-950 text-white dark:bg-white dark:text-ink-950"
                  : "bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-white/10 dark:text-ink-200",
              )}
            >
              {status === "ALL" ? d.common.all : status}
            </Link>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState title={d.admin.noRecords} />
      ) : (
        <ul className="space-y-4">
          {filtered.map((vol) => (
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
                        <Badge key={area} tone={area === category ? "danger" : "neutral"}>
                          {volunteerAreaLabel(d, area)}
                        </Badge>
                      ))}
                  </p>
                  <p className="mt-2 text-xs text-ink-500">
                    {vol.availability} · {vol.hoursPerMonth}h · {formatDateShort(vol.createdAt, locale)}
                  </p>
                  {vol.skills && (
                    <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                      <span className="font-semibold">{d.volunteer.skillsLabel}: </span>
                      {vol.skills}
                    </p>
                  )}
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
