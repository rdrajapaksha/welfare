"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfileAction, type ActionState } from "@/lib/actions";
import { BLOOD_GROUPS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, Checkbox, FormAlert, Fieldset } from "@/components/ui/form";
import type { Dictionary } from "@/i18n/dictionaries/en";

const initial: ActionState = {};

export type ProfileFormMember = {
  phone: string;
  whatsapp: string | null;
  email: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  occupation: string | null;
  bloodGroup: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  bio: string | null;
  showInDirectory: boolean;
};

export function ProfileForm({ d, member }: { d: Dictionary; member: ProfileFormMember }) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  return (
    <form action={action} className="grid gap-6">
      {state.ok && <FormAlert tone="success" title={d.dashboard.profileSaved} />}
      {state.error && <FormAlert tone="error" title={d.common.error} />}

      <Fieldset legend={d.dashboard.contactInfo}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={d.forms.phone} htmlFor="phone" required error={state.fieldErrors?.phone}>
            <Input id="phone" name="phone" required defaultValue={member.phone} inputMode="tel" />
          </Field>
          <Field label={d.forms.whatsapp} htmlFor="whatsapp">
            <Input id="whatsapp" name="whatsapp" defaultValue={member.whatsapp ?? ""} inputMode="tel" />
          </Field>
          <Field label={d.forms.email} htmlFor="email" error={state.fieldErrors?.email} className="sm:col-span-2">
            <Input id="email" name="email" type="email" defaultValue={member.email ?? ""} />
          </Field>
          <Field label={d.forms.addressLine1} htmlFor="addressLine1" required className="sm:col-span-2">
            <Input id="addressLine1" name="addressLine1" required defaultValue={member.addressLine1} />
          </Field>
          <Field label={d.forms.addressLine2} htmlFor="addressLine2" className="sm:col-span-2">
            <Input id="addressLine2" name="addressLine2" defaultValue={member.addressLine2 ?? ""} />
          </Field>
          <Field label={d.forms.city} htmlFor="city" required>
            <Input id="city" name="city" required defaultValue={member.city} />
          </Field>
          <Field label={d.forms.occupation} htmlFor="occupation">
            <Input id="occupation" name="occupation" defaultValue={member.occupation ?? ""} />
          </Field>
          <Field label={d.forms.bloodGroup} htmlFor="bloodGroup">
            <Select id="bloodGroup" name="bloodGroup" defaultValue={member.bloodGroup ?? ""}>
              <option value="">{d.forms.selectPlaceholder}</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Fieldset>

      <Fieldset legend={d.dashboard.emergencyContact}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={d.forms.emergencyName} htmlFor="emergencyName">
            <Input id="emergencyName" name="emergencyName" defaultValue={member.emergencyName ?? ""} />
          </Field>
          <Field label={d.forms.emergencyPhone} htmlFor="emergencyPhone">
            <Input id="emergencyPhone" name="emergencyPhone" defaultValue={member.emergencyPhone ?? ""} inputMode="tel" />
          </Field>
        </div>
      </Fieldset>

      <Field label={d.dashboard.personalInfo} htmlFor="bio">
        <Textarea id="bio" name="bio" rows={4} defaultValue={member.bio ?? ""} />
      </Field>

      <Checkbox name="showInDirectory" defaultChecked={member.showInDirectory} label={d.dashboard.directoryVisibility} />

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? d.common.saving : d.common.save}
      </Button>
    </form>
  );
}
