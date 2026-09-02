"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { joinAction, type ActionState } from "@/lib/actions";
import { MEMBERSHIP_TYPES, SRI_LANKA_DISTRICTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, Checkbox, FormAlert, Fieldset } from "@/components/ui/form";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { membershipTypeLabel } from "@/lib/labels";

const initial: ActionState = {};

export function JoinForm({ d }: { d: Dictionary }) {
  const [state, action, pending] = useActionState(joinAction, initial);

  if (state.ok) {
    return (
      <FormAlert tone="success" title={d.members.requestReceivedTitle}>
        <p>{d.members.requestReceivedText}</p>
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
      <FormAlert tone="info" title={d.members.requestOnlyTitle}>
        {d.members.requestOnlyText}
      </FormAlert>
      {state.error && (
        <FormAlert
          tone="error"
          title={
            state.error === "duplicateNic"
              ? d.validation.duplicateNic
              : state.error === "duplicateEmail"
                ? d.validation.duplicateEmail
                : state.error === "alreadyMember"
                  ? d.members.alreadyMember
                  : d.common.error
          }
        />
      )}
      <Fieldset legend={d.members.applyNow}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={d.forms.fullName} htmlFor="fullName" required className="sm:col-span-2">
            <Input id="fullName" name="fullName" required autoComplete="name" />
          </Field>
          <Field label={d.forms.nic} htmlFor="nic" required error={state.fieldErrors?.nic}>
            <Input id="nic" name="nic" required placeholder={d.forms.nicPlaceholder} />
          </Field>
          <Field label={d.forms.dateOfBirth} htmlFor="dateOfBirth" required>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
          </Field>
          <Field label={d.forms.gender} htmlFor="gender" required>
            <Select id="gender" name="gender" required defaultValue="">
              <option value="" disabled>
                {d.forms.selectPlaceholder}
              </option>
              <option value="MALE">{d.forms.genderMale}</option>
              <option value="FEMALE">{d.forms.genderFemale}</option>
              <option value="OTHER">{d.forms.genderOther}</option>
            </Select>
          </Field>
          <Field label={d.forms.occupation} htmlFor="occupation">
            <Input id="occupation" name="occupation" />
          </Field>
          <Field label={d.forms.addressLine1} htmlFor="addressLine1" required className="sm:col-span-2">
            <Input id="addressLine1" name="addressLine1" required autoComplete="street-address" />
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
          <Field label={d.forms.phone} htmlFor="phone" required>
            <Input id="phone" name="phone" required inputMode="tel" placeholder={d.forms.phonePlaceholder} />
          </Field>
          <Field label={d.forms.email} htmlFor="email" required>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label={d.forms.membershipType} htmlFor="membershipType">
            <Select id="membershipType" name="membershipType" defaultValue="ORDINARY">
              {MEMBERSHIP_TYPES.filter((t) => t !== "HONORARY").map((type) => (
                <option key={type} value={type}>
                  {membershipTypeLabel(d, type)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.forms.referredBy} htmlFor="referredBy">
            <Input id="referredBy" name="referredBy" />
          </Field>
        </div>
        <Field label={d.forms.motivation} htmlFor="motivation">
          <Textarea id="motivation" name="motivation" rows={4} />
        </Field>
        <Checkbox name="consent" required label={d.forms.consentLabel} />
      </Fieldset>
      <Button type="submit" disabled={pending} size="lg">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? d.common.submitting : d.members.submitRequest}
      </Button>
    </form>
  );
}
