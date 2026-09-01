"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { donateAction, type ActionState } from "@/lib/actions";
import { DONATION_PRESETS, DONATION_PURPOSES, DONATION_METHODS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Checkbox, RadioCard, FormAlert, Fieldset } from "@/components/ui/form";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { donationPurposeLabel, donationMethodLabel } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const initial: ActionState = {};

export function DonationForm({ locale, d }: { locale: Locale; d: Dictionary }) {
  const [state, action, pending] = useActionState(donateAction, initial);
  const [amount, setAmount] = useState<number | "custom">(5000);
  const [custom, setCustom] = useState("");

  if (state.ok) {
    return (
      <FormAlert tone="success" title={d.donations.thankYouTitle}>
        <p>{d.donations.thankYouText}</p>
        {state.reference && (
          <p className="mt-3 font-mono text-lg font-bold">
            {d.donations.yourReference}: {state.reference}
          </p>
        )}
      </FormAlert>
    );
  }

  return (
    <form action={action} className="grid gap-8">
      {state.error && <FormAlert tone="error" title={d.common.error} />}
      <input type="hidden" name="amount" value={amount === "custom" ? custom : amount} />

      <Fieldset legend={d.donations.donateTitle} description={d.donations.donateSubtitle}>
        <div>
          <p className="mb-3 text-sm font-semibold text-ink-800 dark:text-ink-100">{d.donations.amountLabel}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DONATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-sm font-bold transition",
                  amount === preset
                    ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20 dark:bg-brand-500/15 dark:text-brand-200"
                    : "border-ink-200 bg-white text-ink-800 hover:border-brand-400 dark:border-white/12 dark:bg-white/5 dark:text-white",
                )}
              >
                {formatCurrency(preset, locale)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount("custom")}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm font-bold transition",
                amount === "custom"
                  ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20"
                  : "border-ink-200 bg-white text-ink-800 dark:border-white/12 dark:bg-white/5 dark:text-white",
              )}
            >
              {d.donations.customAmount}
            </button>
          </div>
          {amount === "custom" && (
            <Input
              className="mt-3"
              name="customAmount"
              type="number"
              min={100}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Rs."
              required
            />
          )}
        </div>

        <Field label={d.donations.purposeLabel}>
          <div className="grid gap-2">
            {DONATION_PURPOSES.map((purpose) => (
              <RadioCard
                key={purpose}
                name="purpose"
                value={purpose}
                defaultChecked={purpose === "GENERAL"}
                label={donationPurposeLabel(d, purpose)}
              />
            ))}
          </div>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <RadioCard name="frequency" value="once" defaultChecked label={d.donations.frequencyOnce} />
          <RadioCard name="frequency" value="monthly" label={d.donations.frequencyMonthly} />
        </div>
      </Fieldset>

      <Fieldset legend={d.donations.donorTitle}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={d.forms.fullName} htmlFor="donorName" required>
            <Input id="donorName" name="donorName" required autoComplete="name" />
          </Field>
          <Field label={d.forms.email} htmlFor="email" required>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </Field>
        </div>
        <Field label={d.forms.phone} htmlFor="phone">
          <Input id="phone" name="phone" inputMode="tel" />
        </Field>
        <Field label={d.donations.messageLabel} htmlFor="message">
          <Textarea id="message" name="message" rows={3} />
        </Field>
        <Checkbox name="isAnonymous" label={d.donations.anonymousLabel} />
      </Fieldset>

      <Fieldset legend={d.donations.methodTitle}>
        <div className="grid gap-2">
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
      </Fieldset>

      <Button type="submit" disabled={pending} size="lg" variant="donate">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? d.common.submitting : d.donations.submitCta}
      </Button>
      <p className="text-xs text-ink-500">{d.donations.taxNote}</p>
    </form>
  );
}
