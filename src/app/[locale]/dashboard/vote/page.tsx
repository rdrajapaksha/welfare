import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { EmptyState } from "@/components/ui/misc";
import { Badge, statusTone } from "@/components/ui/badge";
import { VoteForm } from "@/components/forms/vote-form";

export default async function VotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const user = await requireUser(locale);
  const d = await getDictionary(locale);

  if (!user.memberId) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold">{d.dashboard.eVoting}</h1>
        <EmptyState title={d.admin.noRecords} className="mt-6" />
      </div>
    );
  }

  const elections = await prisma.election.findMany({
    where: { status: { in: ["OPEN", "CLOSED"] } },
    orderBy: { opensAt: "desc" },
    include: {
      candidates: { orderBy: { sortOrder: "asc" } },
      votes: { where: { memberId: user.memberId }, select: { id: true, candidateId: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.dashboard.eVoting}</h1>
        <p className="mt-1 text-sm text-ink-500">{d.dashboard.eVotingNote}</p>
      </div>

      {elections.length === 0 ? (
        <EmptyState title={d.dashboard.noElections} />
      ) : (
        elections.map((election) => {
          const myVote = election.votes[0];
          const isOpen =
            election.status === "OPEN" && (!election.closesAt || election.closesAt > new Date());
          return (
            <section key={election.id} className="card-surface space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold">{pick(election, "title", locale)}</h2>
                  <p className="mt-1 text-sm text-ink-500">{pick(election, "description", locale)}</p>
                  <p className="mt-2 text-xs text-ink-400">
                    {formatDateShort(election.opensAt, locale)}
                    {election.closesAt ? ` – ${formatDateShort(election.closesAt, locale)}` : ""}
                  </p>
                </div>
                <Badge tone={statusTone(election.status)}>
                  {election.status === "OPEN" ? d.dashboard.electionOpen : d.dashboard.electionClosed}
                </Badge>
              </div>

              {myVote ? (
                <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
                  {d.dashboard.alreadyVoted}
                </p>
              ) : isOpen ? (
                <VoteForm
                  d={d}
                  electionId={election.id}
                  candidates={election.candidates.map((c) => ({
                    id: c.id,
                    name: c.name,
                    position: pick(c, "position", locale),
                    bio: c.bio,
                  }))}
                />
              ) : (
                <p className="text-sm text-ink-500">{d.dashboard.electionClosed}</p>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
