"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { renewMembershipFeeAction, type ActionState } from "@/lib/actions";
import { DONATION_METHODS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { RadioCard, FormAlert, Fieldset, Field } from "@/components/ui/form";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";
import { donationMethodLabel } from "@/lib/labels";
import { cn, formatCurrency, formatMonthYear } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import type { FeeMonth } from "@/lib/membership-fees";

const initial: ActionState = {};

export function RenewMembershipForm({
  d,
  locale,
  unpaidMonths,
  pendingMonths,
  monthlyFee,
}: {
  d: Dictionary;
  locale: Locale;
  unpaidMonths: FeeMonth[];
  pendingMonths: FeeMonth[];
  monthlyFee: number;
}) {
  const [state, action, pending] = useActionState(renewMembershipFeeAction, initial);
  const pendingKeys = new Set(pendingMonths.map((m) => `${m.year}-${m.month}`));
  const selectable = unpaidMonths.filter((m) => !pendingKeys.has(`${m.year}-${m.month}`));
  const allValues = selectable.map((m) => `${m.year}-${m.month}`);
  const [selected, setSelected] = useState<string[]>(() =>
    allValues.slice(0, Math.min(3, allValues.length)),
  );

  const total = selected.length * monthlyFee;
  const allSelected = allValues.length > 0 && selected.length === allValues.length;

  function toggle(value: string) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function selectAll() {
    setSelected(allValues);
  }

  function clearSelection() {
    setSelected([]);
  }

  if (state.ok) {
    return (
      <FormAlert tone="success" title={d.fees.renewSuccess}>
        {state.reference && (
          <p className="mt-2 font-mono text-sm font-bold">
            {d.common.reference}: {state.reference}
          </p>
        )}
      </FormAlert>
    );
  }

  if (selectable.length === 0 && pendingMonths.length === 0) {
    return <p className="text-sm text-ink-500">{d.fees.renewNoDue}</p>;
  }

  return (
    <div className="space-y-5">
      {pendingMonths.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">{d.fees.renewPending}</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {pendingMonths.map((m) => (
              <li
                key={`pend-${m.year}-${m.month}`}
                className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-500/20 dark:text-amber-100"
              >
                {formatMonthYear(m.year, m.month, locale)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectable.length > 0 && (
        <form action={action} className="space-y-4">
          {state.error && (
            <FormAlert
              tone="error"
              title={
                state.error === "duplicate"
                  ? d.fees.renewDuplicate
                  : state.error === "noneSelected"
                    ? d.fees.renewSelectMonths
                    : d.common.error
              }
            />
          )}

          <Fieldset legend={d.fees.renewTitle} description={d.fees.renewHint}>
            <p className="text-xs text-ink-500">{d.fees.renewMultiHint}</p>
            <p className="text-sm font-semibold">
              {d.fees.monthlyFeeLabel}: {formatCurrency(monthlyFee, locale)}
            </p>

            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold tracking-wider text-ink-500 uppercase">
                  {d.fees.renewSelectMonths}
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={selectAll}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold transition",
                      allSelected
                        ? "bg-brand-600 text-white"
                        : "bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-white/10 dark:text-ink-200",
                    )}
                  >
                    {d.fees.renewSelectAll}
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    disabled={selected.length === 0}
                    className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] font-bold text-ink-700 hover:bg-ink-200 disabled:opacity-40 dark:bg-white/10 dark:text-ink-200"
                  >
                    {d.fees.renewClearSelection}
                  </button>
                </div>
              </div>

              <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-ink-100 p-2 dark:border-white/10">
                {selectable.map((m) => {
                  const value = `${m.year}-${m.month}`;
                  const checked = selected.includes(value);
                  return (
                    <label
                      key={value}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition",
                        checked
                          ? "border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-500/15 dark:text-brand-100"
                          : "border-ink-200 bg-white text-ink-700 hover:border-brand-400 dark:border-white/12 dark:bg-white/5 dark:text-ink-200",
                      )}
                    >
                      <input
                        type="checkbox"
                        name="periods"
                        value={value}
                        checked={checked}
                        onChange={() => toggle(value)}
                        className="sr-only"
                      />
                      {formatMonthYear(m.year, m.month, locale)}
                    </label>
                  );
                })}
              </div>
            </div>

            <p className="text-sm font-extrabold">
              {d.fees.renewTotal}: {formatCurrency(total, locale)}
              {selected.length > 0 ? ` (${selected.length})` : ""}
            </p>

            <Field label={d.donations.methodTitle}>
              <div className="grid gap-1.5 sm:grid-cols-3">
                {DONATION_METHODS.map((method) => (
                  <RadioCard
                    key={method}
                    name="method"
                    value={method}
                    defaultChecked={method === "BANK_TRANSFER"}
                    label={donationMethodLabel(d, method)}
                  />
                ))}
              </div>
            </Field>
          </Fieldset>

          <div className="rounded-xl border border-ink-100 bg-ink-50/80 p-3 text-xs dark:border-white/10 dark:bg-white/5">
            <p className="font-extrabold text-sm">{d.donations.bankTitle}</p>
            <dl className="mt-2 grid gap-1">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{d.donations.bankName}</dt>
                <dd className="font-semibold">{siteConfig.bank.bankName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">{d.donations.bankAccountNo}</dt>
                <dd className="font-mono font-bold">{siteConfig.bank.accountNo}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-ink-500">{d.donations.bankNote}</p>
          </div>

          <Button type="submit" disabled={pending || selected.length === 0} size="md" variant="donate">
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? d.common.submitting : d.fees.renewSubmit}
          </Button>
        </form>
      )}
    </div>
  );
}
