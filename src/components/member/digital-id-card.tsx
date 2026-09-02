import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { memberQrDataUrl } from "@/lib/member-qr";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

type MemberCardProps = {
  d: Dictionary;
  locale: Locale;
  member: {
    id: string;
    membershipNo: string;
    fullName: string;
    nameWithInitials: string;
    membershipType: string;
    status: string;
    district: string;
    joinedAt: Date;
  };
  membershipTypeLabel: string;
  statusLabel: string;
};

export async function DigitalMemberIdCard({
  d,
  locale,
  member,
  membershipTypeLabel,
  statusLabel,
}: MemberCardProps) {
  const qr = await memberQrDataUrl(member.membershipNo, member.id);

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-lg dark:border-white/10">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <Image src="/logo.png" alt="" width={44} height={44} className="rounded-full bg-white p-0.5" />
        <div>
          <p className="text-sm font-bold tracking-wide">{siteConfig.shortName}</p>
          <p className="text-xs text-white/60">{d.dashboard.digitalId}</p>
        </div>
      </div>
      <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-xs tracking-[0.14em] text-white/50 uppercase">{d.members.membershipNo}</p>
          <p className="mt-1 font-mono text-lg font-bold text-[#ec2a2b]">{member.membershipNo}</p>
          <p className="mt-4 text-2xl font-extrabold leading-tight">{member.fullName}</p>
          <p className="mt-1 text-sm text-white/70">{member.nameWithInitials}</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-white/45">{d.forms.membershipType}</dt>
              <dd className="font-semibold">{membershipTypeLabel}</dd>
            </div>
            <div>
              <dt className="text-white/45">{d.common.status}</dt>
              <dd className="font-semibold">{statusLabel}</dd>
            </div>
            <div>
              <dt className="text-white/45">{d.forms.district}</dt>
              <dd className="font-semibold">{member.district}</dd>
            </div>
            <div>
              <dt className="text-white/45">{d.members.memberSince}</dt>
              <dd className="font-semibold">{formatDate(member.joinedAt, locale)}</dd>
            </div>
          </dl>
        </div>
        <div className="justify-self-center rounded-xl bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt={d.dashboard.qrAlt} width={160} height={160} className="size-40" />
        </div>
      </div>
      <p className="border-t border-white/10 px-5 py-3 text-xs text-white/45">{d.dashboard.qrHint}</p>
    </div>
  );
}
