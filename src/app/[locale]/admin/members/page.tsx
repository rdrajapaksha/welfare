import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminCreateMember } from "@/lib/admin-actions";
import { listMembersInArrears } from "@/lib/membership-fees";
import { MEMBERSHIP_TYPES, MEMBER_STATUSES, SRI_LANKA_DISTRICTS } from "@/lib/constants";
import { memberStatusLabel, membershipTypeLabel } from "@/lib/labels";
import { formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { CheckField } from "@/components/admin/admin-controls";

export default async function AdminMembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);
  const { q: qRaw } = await searchParams;
  const q = qRaw?.trim() ?? "";

  const members = await prisma.member.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q } },
            { nic: { contains: q } },
            { membershipNo: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
          ],
        }
      : {},
    orderBy: { joinedAt: "desc" },
  });

  const { rows: arrearsRows } = await listMembersInArrears();
  const arrearsById = new Map(arrearsRows.map((r) => [r.member.id, r.arrears]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.members}</h1>
        <p className="text-sm text-ink-500">{d.admin.searchMembers}</p>
      </div>

      <section className="card-surface p-5">
        <h2 className="text-lg font-extrabold">
          {d.common.new} {d.admin.members}
        </h2>
        <form action={adminCreateMember} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="locale" value={locale} />
          <Field label={d.forms.fullName} htmlFor="fullName" required>
            <Input id="fullName" name="fullName" required />
          </Field>
          <Field label={d.forms.nic} htmlFor="nic" required>
            <Input id="nic" name="nic" required />
          </Field>
          <Field label={d.forms.phone} htmlFor="phone" required>
            <Input id="phone" name="phone" required />
          </Field>
          <Field label={d.forms.email} htmlFor="email">
            <Input id="email" name="email" type="email" />
          </Field>
          <Field label={d.forms.city} htmlFor="city">
            <Input id="city" name="city" defaultValue="Nugegoda" />
          </Field>
          <Field label={d.forms.district} htmlFor="district">
            <Select id="district" name="district" defaultValue="Colombo">
              {SRI_LANKA_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.forms.membershipType} htmlFor="membershipType">
            <Select id="membershipType" name="membershipType" defaultValue="ORDINARY">
              {MEMBERSHIP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {membershipTypeLabel(d, type)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.common.status} htmlFor="status">
            <Select id="status" name="status" defaultValue="ACTIVE">
              {MEMBER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {memberStatusLabel(d, status)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.forms.dateOfBirth} htmlFor="dateOfBirth">
            <Input id="dateOfBirth" name="dateOfBirth" type="date" />
          </Field>
          <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-3">
            <CheckField name="showInDirectory" label={d.dashboard.directoryVisibility} defaultChecked />
            <Button type="submit" size="sm">
              {d.common.save}
            </Button>
          </div>
        </form>
      </section>

      <form className="flex gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{d.common.search}</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
          <Input name="q" defaultValue={q} placeholder={d.admin.searchMembers} className="pl-10" />
        </label>
        <Button type="submit">{d.common.search}</Button>
      </form>
      {members.length === 0 ? (
        <EmptyState title={d.admin.noRecords} />
      ) : (
        <DataTable
          head={[
            d.members.membershipNo,
            d.forms.fullName,
            d.forms.nic,
            d.forms.district,
            d.forms.membershipType,
            d.common.status,
            d.fees.dues,
            d.members.memberSince,
            d.common.actions,
          ]}
        >
          {members.map((m) => {
            const arrears = arrearsById.get(m.id);
            const inArrears = (arrears?.monthsDue ?? 0) > 0;
            return (
              <tr
                key={m.id}
                className={
                  inArrears
                    ? "bg-red-50/80 text-ink-900 dark:bg-red-950/25 dark:text-ink-100"
                    : "text-ink-800 dark:text-ink-100"
                }
              >
                <td className="px-4 py-3 font-semibold">{m.membershipNo}</td>
                <td className="px-4 py-3">{m.fullName}</td>
                <td className="px-4 py-3">{m.nic}</td>
                <td className="px-4 py-3">{m.district}</td>
                <td className="px-4 py-3">{membershipTypeLabel(d, m.membershipType)}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(m.status)}>{memberStatusLabel(d, m.status)}</Badge>
                </td>
                <td className="px-4 py-3">
                  {inArrears ? (
                    <Badge tone="danger">
                      {d.fees.arrearsShort} · {arrears!.monthsDue}
                    </Badge>
                  ) : (
                    <Badge tone="success">{d.fees.paidUp}</Badge>
                  )}
                </td>
                <td className="px-4 py-3">{formatDateShort(m.joinedAt, locale)}</td>
                <td className="px-4 py-3">
                  <ButtonLink href={`/${locale}/admin/members/${m.id}`} size="sm" variant="ghost">
                    {d.common.edit}
                  </ButtonLink>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </div>
  );
}
