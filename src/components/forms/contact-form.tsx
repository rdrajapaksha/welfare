"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { contactAction, type ActionState } from "@/lib/actions";
import { CONTACT_TOPICS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, FormAlert } from "@/components/ui/form";
import type { Dictionary } from "@/i18n/dictionaries/en";

const initial: ActionState = {};

function topicLabel(d: Dictionary, topic: string) {
  switch (topic) {
    case "MEMBERSHIP":
      return d.contact.topicMembership;
    case "DONATION":
      return d.contact.topicDonation;
    case "WELFARE":
      return d.contact.topicWelfare;
    case "VOLUNTEER":
      return d.contact.topicVolunteer;
    case "SPONSORSHIP":
      return d.contact.topicSponsorship;
    case "COMPLAINT":
      return d.contact.topicComplaint;
    default:
      return d.contact.topicGeneral;
  }
}

export function ContactForm({ d }: { d: Dictionary }) {
  const [state, action, pending] = useActionState(contactAction, initial);

  if (state.ok) {
    return <FormAlert tone="success" title={d.contact.successTitle}>{d.contact.successText}</FormAlert>;
  }

  return (
    <form action={action} className="grid gap-4">
      {state.error && <FormAlert tone="error" title={d.common.error} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.forms.fullName} htmlFor="name" required>
          <Input id="name" name="name" required autoComplete="name" placeholder={d.forms.namePlaceholder} />
        </Field>
        <Field label={d.forms.email} htmlFor="email" required>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder={d.forms.emailPlaceholder} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.forms.phone} htmlFor="phone">
          <Input id="phone" name="phone" inputMode="tel" placeholder={d.forms.phonePlaceholder} />
        </Field>
        <Field label={d.contact.topicLabel} htmlFor="topic">
          <Select id="topic" name="topic" defaultValue="GENERAL">
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topicLabel(d, topic)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label={d.forms.subject} htmlFor="subject" required>
        <Input id="subject" name="subject" required />
      </Field>
      <Field label={d.forms.message} htmlFor="message" required>
        <Textarea id="message" name="message" required rows={6} />
      </Field>
      <Button type="submit" disabled={pending} size="lg">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? d.common.submitting : d.common.submit}
      </Button>
    </form>
  );
}
