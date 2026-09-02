"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { castVoteAction, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form";
import type { Dictionary } from "@/i18n/dictionaries/en";

const initial: ActionState = {};

export function VoteForm({
  d,
  electionId,
  candidates,
}: {
  d: Dictionary;
  electionId: string;
  candidates: { id: string; name: string; position: string; bio: string | null }[];
}) {
  const [state, action, pending] = useActionState(castVoteAction, initial);

  if (state.ok) {
    return <FormAlert tone="success" title={d.dashboard.voteSuccess} />;
  }

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="electionId" value={electionId} />
      {state.error && (
        <FormAlert
          tone="error"
          title={
            state.error === "alreadyVoted"
              ? d.dashboard.alreadyVoted
              : d.common.error
          }
        />
      )}
      <ul className="grid gap-3">
        {candidates.map((c) => (
          <li key={c.id}>
            <label className="card-surface flex cursor-pointer gap-3 p-4 has-[:checked]:ring-2 has-[:checked]:ring-[var(--brand-red,#ec2a2b)]">
              <input
                type="radio"
                name="candidateId"
                value={c.id}
                required
                className="mt-1"
              />
              <span>
                <span className="block font-bold">{c.name}</span>
                <span className="block text-sm text-ink-500">{c.position}</span>
                {c.bio && <span className="mt-1 block text-sm text-ink-600">{c.bio}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {d.dashboard.castVote}
      </Button>
    </form>
  );
}
