import { AlertTriangle } from "lucide-react";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { MemberArrears } from "@/lib/membership-fees";
import { ButtonLink } from "@/components/ui/button";

export function ArrearsBanner({
  d,
  locale,
  arrears,
  href,
  compact = false,
}: {
  d: Dictionary;
  locale: Locale;
  arrears: MemberArrears;
  href?: string;
  compact?: boolean;
}) {
  if (arrears.exempt || arrears.monthsDue <= 0) return null;

  const latest = arrears.unpaidMonths[arrears.unpaidMonths.length - 1];
  const periodLabel = latest
    ? formatMonthYear(latest.year, latest.month, locale)
    : "";

  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-900 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-100"
    >
      <div className="flex flex-wrap items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-extrabold tracking-tight">{d.fees.arrearsTitle}</p>
          <p className={`mt-1 ${compact ? "text-xs" : "text-sm"}`}>
            {d.fees.arrearsText
              .replace("{months}", String(arrears.monthsDue))
              .replace("{amount}", formatCurrency(arrears.amountDue, locale))
              .replace("{fee}", formatCurrency(arrears.monthlyFee, locale))}
            {periodLabel ? ` · ${d.fees.unpaidThrough} ${periodLabel}` : ""}
          </p>
        </div>
        {href && (
          <ButtonLink href={href} size="sm" variant="danger" className="shrink-0">
            {d.fees.viewPayments}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
