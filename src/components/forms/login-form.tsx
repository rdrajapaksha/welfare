"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, FormAlert } from "@/components/ui/form";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";

const initial: ActionState = {};

export function LoginForm({
  locale,
  d,
  nextPath,
}: {
  locale: Locale;
  d: Dictionary;
  nextPath?: string;
}) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="locale" value={locale} />
      {nextPath && <input type="hidden" name="next" value={nextPath} />}
      {state.error && (
        <FormAlert tone="error" title={d.auth[state.error as keyof typeof d.auth] || d.auth.invalidCredentials} />
      )}
      <Field label={d.auth.email} htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder={d.forms.emailPlaceholder} />
      </Field>
      <Field label={d.auth.password} htmlFor="password" required>
        <Input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} />
      </Field>
      <Button type="submit" disabled={pending} size="lg" fullWidth>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? d.auth.loggingIn : d.auth.loginCta}
      </Button>
    </form>
  );
}
