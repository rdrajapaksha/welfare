import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { memberStatusLabel, membershipTypeLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { ProfileForm } from "@/components/forms/profile-form";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const user = await requireUser(locale);
  const d = await getDictionary(locale);

  const member = user.memberId
    ? await prisma.member.findUnique({ where: { id: user.memberId } })
    : null;

  if (!member) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold">{d.dashboard.profile}</h1>
        <EmptyState title={d.admin.noRecords} className="mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.dashboard.profile}</h1>
        <p className="mt-1 text-sm text-ink-500">{d.dashboard.profileNote}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-surface p-4">
          <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">{d.members.membershipNo}</p>
          <p className="mt-1 font-extrabold">{member.membershipNo}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">{d.forms.membershipType}</p>
          <p className="mt-1 font-extrabold">{membershipTypeLabel(d, member.membershipType)}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">{d.common.status}</p>
          <Badge tone={statusTone(member.status)} className="mt-2">
            {memberStatusLabel(d, member.status)}
          </Badge>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">{d.members.memberSince}</p>
          <p className="mt-1 font-extrabold">{formatDate(member.joinedAt, locale)}</p>
        </div>
      </div>

      <dl className="card-surface grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold tracking-wider text-ink-500 uppercase">{d.forms.fullName}</dt>
          <dd className="mt-1 font-semibold">{member.fullName}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold tracking-wider text-ink-500 uppercase">{d.forms.nic}</dt>
          <dd className="mt-1 font-semibold">{member.nic}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold tracking-wider text-ink-500 uppercase">{d.forms.dateOfBirth}</dt>
          <dd className="mt-1 font-semibold">{formatDate(member.dateOfBirth, locale)}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold tracking-wider text-ink-500 uppercase">{d.forms.district}</dt>
          <dd className="mt-1 font-semibold">{member.district}</dd>
        </div>
      </dl>
      <div className="card-surface p-6">
        <h2 className="font-extrabold">{d.dashboard.profileEdit}</h2>
        <div className="mt-4">
          <ProfileForm d={d} member={member} />
        </div>
      </div>
    </div>
  );
}
