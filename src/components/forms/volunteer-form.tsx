"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select, Checkbox, FormAlert, Fieldset } from "@/components/ui/form";
import { SRI_LANKA_DISTRICTS, VOLUNTEER_AREAS, AVAILABILITY_OPTIONS } from "@/lib/constants";
import { volunteerAction, type ActionState } from "@/lib/actions";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { volunteerAreaLabel } from "@/lib/labels";

const initial: ActionState = {};

export function VolunteerForm({ d }: { d: Dictionary }) {
  const [state, action, pending] = useActionState(volunteerAction, initial);

  if (state.ok) {
    return (
      <FormAlert tone="success" title={d.volunteer.successTitle}>
        <p>{d.volunteer.successText}</p>
        {state.reference && (
          <p className="mt-2 font-semibold">
            {d.common.reference}: {state.reference}
          </p>
        )}
      </FormAlert>
    );
  }

  return (
    <form action={action} className="grid gap-6">
      {state.error && <FormAlert tone="error" title={d.common.error} />}
      <Fieldset legend={d.volunteer.formTitle} description={d.volunteer.formSubtitle}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={d.forms.fullName} htmlFor="fullName" required error={state.fieldErrors?.fullName}>
            <Input id="fullName" name="fullName" required autoComplete="name" placeholder={d.forms.namePlaceholder} />
          </Field>
          <Field label={d.forms.email} htmlFor="email" required error={state.fieldErrors?.email}>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder={d.forms.emailPlaceholder} />
          </Field>
          <Field label={d.forms.phone} htmlFor="phone" required error={state.fieldErrors?.phone}>
            <Input id="phone" name="phone" required inputMode="tel" placeholder={d.forms.phonePlaceholder} />
          </Field>
          <Field label={d.forms.nic} htmlFor="nic" error={state.fieldErrors?.nic}>
            <Input id="nic" name="nic" placeholder={d.forms.nicPlaceholder} />
          </Field>
          <Field label={d.forms.city} htmlFor="city" required>
            <Input id="city" name="city" required />
          </Field>
          <Field label={d.forms.district} htmlFor="district" required>
            <Select id="district" name="district" required defaultValue="">
              <option value="" disabled>
                {d.forms.selectPlaceholder}
              </option>
              {SRI_LANKA_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.forms.dateOfBirth} htmlFor="dateOfBirth">
            <Input id="dateOfBirth" name="dateOfBirth" type="date" />
          </Field>
          <Field label={d.volunteer.hoursLabel} htmlFor="hoursPerMonth" required>
            <Input id="hoursPerMonth" name="hoursPerMonth" type="number" min={2} max={160} defaultValue={8} />
          </Field>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-ink-800 dark:text-ink-100">
            {d.volunteer.interestsLabel}
          </legend>
          <p className="mt-1 text-xs text-ink-500">{d.volunteer.interestsHint}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {VOLUNTEER_AREAS.map((area) => (
              <Checkbox key={area} name="interests" value={area} label={volunteerAreaLabel(d, area)} />
            ))}
          </div>
        </fieldset>

        <Field label={d.volunteer.availabilityLabel} htmlFor="availability" required>
          <Select id="availability" name="availability" required defaultValue="WEEKENDS">
            {AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "WEEKENDS"
                  ? d.volunteer.availabilityWeekends
                  : opt === "WEEKDAYS"
                    ? d.volunteer.availabilityWeekdays
                    : opt === "EVENINGS"
                      ? d.volunteer.availabilityEvenings
                      : d.volunteer.availabilityFlexible}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={d.volunteer.skillsLabel} htmlFor="skills">
          <Input id="skills" name="skills" placeholder={d.volunteer.skillsPlaceholder} />
        </Field>
        <Field label={d.volunteer.experienceLabel} htmlFor="experience">
          <Textarea id="experience" name="experience" rows={3} />
        </Field>
        <Field label={d.volunteer.motivationLabel} htmlFor="motivation" required>
          <Textarea id="motivation" name="motivation" required rows={4} />
        </Field>
        <Checkbox name="consent" required label={d.forms.privacyConsent} />
      </Fieldset>

      <Button type="submit" disabled={pending} size="lg">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? d.common.submitting : d.volunteer.submitCta}
      </Button>
    </form>
  );
}
