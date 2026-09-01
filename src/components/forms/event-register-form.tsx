"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { eventRegisterAction, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, FormAlert } from "@/components/ui/form";
import type { Dictionary } from "@/i18n/dictionaries/en";

const initial: ActionState = {};

export function EventRegisterForm({
  d,
  eventId,
  defaultName,
  defaultEmail,
}: {
  d: Dictionary;
  eventId: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, action, pending] = useActionState(eventRegisterAction, initial);

  if (state.ok) {
    return <FormAlert tone="success" title={d.events.registrationSuccess} />;
  }

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="eventId" value={eventId} />
      {state.error && <FormAlert tone="error" title={d.common.error} />}
      <Field label={d.forms.fullName} htmlFor="fullName" required error={state.fieldErrors?.fullName}>
        <Input id="fullName" name="fullName" required autoComplete="name" defaultValue={defaultName} />
      </Field>
      <Field label={d.forms.email} htmlFor="email" required error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" required autoComplete="email" defaultValue={defaultEmail} />
      </Field>
      <Field label={d.forms.phone} htmlFor="phone" required error={state.fieldErrors?.phone}>
        <Input id="phone" name="phone" required inputMode="tel" placeholder={d.forms.phonePlaceholder} />
      </Field>
      <Field label={d.events.guests} htmlFor="guests">
        <Input id="guests" name="guests" type="number" min={0} max={8} defaultValue={0} />
      </Field>
      <Field label={d.forms.message} htmlFor="note">
        <Textarea id="note" name="note" rows={3} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? d.common.submitting : d.events.registerCta}
      </Button>
    </form>
  );
}
