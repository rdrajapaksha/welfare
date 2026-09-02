import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { memberStatusLabel, membershipTypeLabel } from "@/lib/labels";
import { EmptyState } from "@/components/ui/misc";
import { DigitalMemberIdCard } from "@/components/member/digital-id-card";

export default async function MemberIdPage({ params }: { params: Promise<{ locale: string }> }) {
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
        <h1 className="text-2xl font-extrabold">{d.dashboard.digitalId}</h1>
        <EmptyState title={d.admin.noRecords} className="mt-6" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{d.dashboard.digitalId}</h1>
        <p className="mt-1 text-sm text-ink-500">{d.dashboard.digitalIdNote}</p>
      </div>
      <DigitalMemberIdCard
        d={d}
        locale={locale}
        member={member}
        membershipTypeLabel={membershipTypeLabel(d, member.membershipType)}
        statusLabel={memberStatusLabel(d, member.status)}
      />
    </div>
  );
}
