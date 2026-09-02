import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminDeleteMember, adminUpdateMember } from "@/lib/admin-actions";
import {
  BLOOD_GROUPS,
  MEMBERSHIP_TYPES,
  MEMBER_STATUSES,
  SRI_LANKA_DISTRICTS,
} from "@/lib/constants";
import { memberStatusLabel, membershipTypeLabel } from "@/lib/labels";
import { formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Fieldset, Input, Select, Textarea } from "@/components/ui/form";
import { CheckField } from "@/components/admin/admin-controls";
import { AdminDeleteButton } from "@/components/admin/delete-button";

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      _count: { select: { benefitClaims: true, tickets: true, eventRegistrations: true } },
    },
  });
  if (!member) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ButtonLink href={`/${locale}/admin/members`} variant="ghost" size="sm">
            {d.common.back}
          </ButtonLink>
          <h1 className="mt-2 text-2xl font-extrabold">{member.fullName}</h1>
          <p className="mt-1 text-sm text-ink-500">
            {member.membershipNo} · {member.nic} · {d.members.memberSince}{" "}
            {formatDateShort(member.joinedAt, locale)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink href={`/${locale}/admin/fees`} size="sm" variant="secondary">
            {d.admin.recordPayment}
          </ButtonLink>
          <Badge tone={statusTone(member.status)}>{memberStatusLabel(d, member.status)}</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-4">
          <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">Claims</p>
          <p className="mt-1 text-2xl font-extrabold">{member._count.benefitClaims}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">{d.admin.tickets}</p>
          <p className="mt-1 text-2xl font-extrabold">{member._count.tickets}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">{d.admin.events}</p>
          <p className="mt-1 text-2xl font-extrabold">{member._count.eventRegistrations}</p>
        </div>
      </div>

      <section className="card-surface p-5">
        <h2 className="text-lg font-extrabold">{d.common.edit}</h2>
        <form action={adminUpdateMember} className="mt-4 space-y-6">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={member.id} />

          <Fieldset legend={d.dashboard.personalInfo}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={d.forms.fullName} htmlFor="fullName" required>
                <Input id="fullName" name="fullName" required defaultValue={member.fullName} />
              </Field>
              <Field label={d.forms.nameWithInitials} htmlFor="nameWithInitials">
                <Input
                  id="nameWithInitials"
                  name="nameWithInitials"
                  defaultValue={member.nameWithInitials}
                />
              </Field>
              <Field label={d.forms.occupation} htmlFor="occupation">
                <Input id="occupation" name="occupation" defaultValue={member.occupation ?? ""} />
              </Field>
              <Field label={d.forms.bloodGroup} htmlFor="bloodGroup">
                <Select id="bloodGroup" name="bloodGroup" defaultValue={member.bloodGroup ?? ""}>
                  <option value="">{d.forms.selectPlaceholder}</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.forms.membershipType} htmlFor="membershipType">
                <Select id="membershipType" name="membershipType" defaultValue={member.membershipType}>
                  {MEMBERSHIP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {membershipTypeLabel(d, type)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.common.status} htmlFor="status">
                <Select id="status" name="status" defaultValue={member.status}>
                  {MEMBER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {memberStatusLabel(d, status)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Fieldset>

          <Fieldset legend={d.dashboard.contactInfo}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={d.forms.phone} htmlFor="phone" required>
                <Input id="phone" name="phone" required defaultValue={member.phone} inputMode="tel" />
              </Field>
              <Field label={d.forms.whatsapp} htmlFor="whatsapp">
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  defaultValue={member.whatsapp ?? ""}
                  inputMode="tel"
                />
              </Field>
              <Field label={d.forms.email} htmlFor="email" className="sm:col-span-2">
                <Input id="email" name="email" type="email" defaultValue={member.email ?? ""} />
              </Field>
              <Field label={d.forms.addressLine1} htmlFor="addressLine1" required className="sm:col-span-2">
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  required
                  defaultValue={member.addressLine1}
                />
              </Field>
              <Field label={d.forms.addressLine2} htmlFor="addressLine2" className="sm:col-span-2">
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  defaultValue={member.addressLine2 ?? ""}
                />
              </Field>
              <Field label={d.forms.city} htmlFor="city" required>
                <Input id="city" name="city" required defaultValue={member.city} />
              </Field>
              <Field label={d.forms.district} htmlFor="district" required>
                <Select id="district" name="district" defaultValue={member.district} required>
                  {SRI_LANKA_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Fieldset>

          <Fieldset legend={d.dashboard.emergencyContact}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={d.forms.emergencyName} htmlFor="emergencyName">
                <Input
                  id="emergencyName"
                  name="emergencyName"
                  defaultValue={member.emergencyName ?? ""}
                />
              </Field>
              <Field label={d.forms.emergencyPhone} htmlFor="emergencyPhone">
                <Input
                  id="emergencyPhone"
                  name="emergencyPhone"
                  defaultValue={member.emergencyPhone ?? ""}
                  inputMode="tel"
                />
              </Field>
            </div>
          </Fieldset>

          <Field label="Bio" htmlFor="bio">
            <Textarea id="bio" name="bio" rows={4} defaultValue={member.bio ?? ""} />
          </Field>

          <CheckField
            name="showInDirectory"
            label={d.dashboard.directoryVisibility}
            defaultChecked={member.showInDirectory}
          />

          <Button type="submit">{d.common.save}</Button>
        </form>
      </section>

      <section className="card-surface border-red-200 p-5 dark:border-red-900/40">
        <h2 className="font-extrabold text-red-700 dark:text-red-300">{d.admin.dangerZone}</h2>
        <p className="mt-1 text-sm text-ink-500">Permanently remove this member record.</p>
        <div className="mt-4">
          <AdminDeleteButton
            action={adminDeleteMember}
            id={member.id}
            locale={locale}
            label={d.common.delete}
          />
        </div>
      </section>
    </div>
  );
}
