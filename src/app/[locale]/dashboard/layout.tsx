import { requireUser } from "@/lib/auth";
import { getDictionary, type Locale } from "@/i18n";
import { memberNav } from "@/lib/nav";
import { DashShell } from "@/components/layout/dash-shell";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMemberArrears } from "@/lib/membership-fees";
import { ArrearsBanner } from "@/components/membership/arrears-banner";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const user = await requireUser(locale, `/${locale}/dashboard`);
  const d = await getDictionary(locale);

  const member = user.memberId
    ? await prisma.member.findUnique({
        where: { id: user.memberId },
        select: { id: true, joinedAt: true, membershipType: true, status: true },
      })
    : null;
  const arrears = member ? await getMemberArrears(member) : null;

  return (
    <DashShell locale={locale} title={d.dashboard.title} items={memberNav(d)} logoutLabel={d.nav.logout}>
      {arrears && arrears.monthsDue > 0 && (
        <div className="mb-6">
          <ArrearsBanner
            d={d}
            locale={locale}
            arrears={arrears}
            href={`/${locale}/dashboard/payments`}
          />
        </div>
      )}
      {children}
    </DashShell>
  );
}
