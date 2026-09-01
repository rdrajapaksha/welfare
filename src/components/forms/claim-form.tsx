"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createClaimAction, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, FormAlert } from "@/components/ui/form";
import type { Dictionary } from "@/i18n/dictionaries/en";

const initial: ActionState = {};

export function ClaimForm({
  d,
  programmes,
}: {
  d: Dictionary;
  programmes: { id: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(createClaimAction, initial);

  if (state.ok) {
    return (
      <FormAlert tone="success" title={d.common.success}>
        {d.common.reference}: {state.reference}
      </FormAlert>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      {state.error && <FormAlert tone="error" title={d.common.error} />}
      <Field label={d.dashboard.claimProgramme} htmlFor="programmeId" required>
        <Select id="programmeId" name="programmeId" required defaultValue="">
          <option value="" disabled>
            {d.forms.selectPlaceholder}
          </option>
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={d.common.amount} htmlFor="amount" required error={state.fieldErrors?.amount}>
        <Input id="amount" name="amount" type="number" min={500} required />
      </Field>
      <Field label={d.forms.message} htmlFor="reason" required error={state.fieldErrors?.reason}>
        <Textarea id="reason" name="reason" required rows={5} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? d.common.submitting : d.dashboard.newClaim}
      </Button>
    </form>
  );
}
