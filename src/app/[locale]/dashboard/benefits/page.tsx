import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { claimStatusLabel } from "@/lib/labels";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { ClaimForm } from "@/components/forms/claim-form";

export default async function BenefitsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const user = await requireUser(locale);
  const d = await getDictionary(locale);

  const [claims, programmes] = await Promise.all([
    user.memberId
      ? prisma.benefitClaim.findMany({
          where: { memberId: user.memberId },
          include: { programme: true },
          orderBy: { submittedAt: "desc" },
        })
      : Promise.resolve([]),
    prisma.programme.findMany({
      where: { isActive: true, category: { in: ["WELFARE", "EMERGENCY", "MEMBER_SUPPORT"] } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="grid gap-10 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-extrabold">{d.dashboard.benefits}</h1>
        <p className="mt-1 text-sm text-ink-500">{d.dashboard.myClaims}</p>
        {claims.length === 0 ? (
          <EmptyState title={d.dashboard.noClaims} className="mt-6" />
        ) : (
          <ul className="mt-6 space-y-3">
            {claims.map((claim) => (
              <li key={claim.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-bold">{claim.claimNo}</p>
                  <p className="text-sm text-ink-500">{pick(claim.programme, "title", locale)}</p>
                  <p className="mt-1 text-xs text-ink-500">{formatDateShort(claim.submittedAt, locale)}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold">{formatCurrency(claim.amount, locale)}</p>
                  <Badge tone={statusTone(claim.status)} className="mt-2">
                    {claimStatusLabel(d, claim.status)}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card-surface p-5 lg:col-span-2">
        <h2 className="font-extrabold">{d.dashboard.newClaim}</h2>
        <div className="mt-4">
          <ClaimForm
            d={d}
            programmes={programmes.map((p) => ({ id: p.id, title: pick(p, "title", locale) }))}
          />
        </div>
      </div>
    </div>
  );
}
