"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { submitSuggestionAction, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, FormAlert, Checkbox } from "@/components/ui/form";
import type { Dictionary } from "@/i18n/dictionaries/en";

const initial: ActionState = {};

export function SuggestionForm({ d }: { d: Dictionary }) {
  const [state, action, pending] = useActionState(submitSuggestionAction, initial);

  if (state.ok) {
    return (
      <FormAlert tone="success" title={d.dashboard.suggestionSuccess}>
        {state.reference}
      </FormAlert>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      {state.error && <FormAlert tone="error" title={d.common.error} />}
      <Field label={d.dashboard.suggestionCategory} htmlFor="category">
        <Select id="category" name="category" defaultValue="SUGGESTION">
          <option value="SUGGESTION">{d.dashboard.catSuggestion}</option>
          <option value="IDEA">{d.dashboard.catIdea}</option>
          <option value="GRIEVANCE">{d.dashboard.catGrievance}</option>
        </Select>
      </Field>
      <Field label={d.forms.subject} htmlFor="subject" required>
        <Input id="subject" name="subject" required maxLength={140} />
      </Field>
      <Field label={d.dashboard.suggestionBody} htmlFor="body" required>
        <Textarea id="body" name="body" required rows={6} maxLength={4000} />
      </Field>
      <Checkbox name="isAnonymous" label={d.dashboard.submitAnonymous} />
      <p className="text-xs text-ink-500">{d.dashboard.anonymousNote}</p>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {d.dashboard.submitSuggestion}
      </Button>
    </form>
  );
}
