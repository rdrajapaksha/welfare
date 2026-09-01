"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createTicketAction, replyTicketAction, type ActionState } from "@/lib/actions";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@/lib/constants";
import { ticketCategoryLabel, ticketPriorityLabel } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, FormAlert, Checkbox } from "@/components/ui/form";
import type { Dictionary } from "@/i18n/dictionaries/en";

const initial: ActionState = {};

export function NewTicketForm({ d }: { d: Dictionary }) {
  const [state, action, pending] = useActionState(createTicketAction, initial);

  if (state.ok) {
    return (
      <FormAlert tone="success" title={d.dashboard.ticketCreated2}>
        {state.reference}
      </FormAlert>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      {state.error && <FormAlert tone="error" title={d.common.error} />}
      <Field label={d.dashboard.ticketCategory} htmlFor="category">
        <Select id="category" name="category" defaultValue="OTHER">
          {TICKET_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {ticketCategoryLabel(d, cat)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={d.dashboard.ticketPriority} htmlFor="priority">
        <Select id="priority" name="priority" defaultValue="MEDIUM">
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {ticketPriorityLabel(d, p)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={d.dashboard.ticketSubject} htmlFor="subject" required>
        <Input id="subject" name="subject" required />
      </Field>
      <Field label={d.dashboard.ticketDescription} htmlFor="description" required>
        <Textarea id="description" name="description" required rows={6} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {d.dashboard.newTicket}
      </Button>
    </form>
  );
}

export function TicketReplyForm({
  d,
  ticketId,
  closed,
  allowInternal = false,
}: {
  d: Dictionary;
  ticketId: string;
  closed: boolean;
  allowInternal?: boolean;
}) {
  const [state, action, pending] = useActionState(replyTicketAction, initial);
  if (closed) return <p className="text-sm text-ink-500">{d.dashboard.ticketResolvedNote}</p>;

  return (
    <form action={action} className="mt-4 grid gap-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      {state.ok && <p className="text-sm text-teal-700">{d.common.success}</p>}
      <Textarea name="body" required rows={4} placeholder={d.dashboard.replyPlaceholder} />
      {allowInternal && <Checkbox name="isInternal" label={d.admin.internalNote} />}
      <Button type="submit" disabled={pending} size="sm">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {d.dashboard.sendReply}
      </Button>
    </form>
  );
}
