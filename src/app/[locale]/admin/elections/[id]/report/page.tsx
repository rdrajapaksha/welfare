import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { Badge, statusTone } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { PrintReportButton } from "@/components/admin/print-report-button";

export default async function ElectionReportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      candidates: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { votes: true } } },
      },
      _count: { select: { votes: true } },
    },
  });
  if (!election) notFound();

  const eligible = await prisma.member.count({ where: { status: "ACTIVE" } });
  const totalVotes = election._count.votes;
  const turnoutPct = eligible > 0 ? Math.round((totalVotes / eligible) * 1000) / 10 : 0;

  const ranked = [...election.candidates].sort((a, b) => b._count.votes - a._count.votes);
  const topCount = ranked[0]?._count.votes ?? 0;
  const leaders = ranked.filter((c) => c._count.votes === topCount && topCount > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <ButtonLink href={`/${locale}/admin/elections`} variant="ghost" size="sm">
            {d.common.back}
          </ButtonLink>
          <h1 className="mt-2 text-2xl font-extrabold">{d.admin.electionReport}</h1>
          <p className="mt-1 text-sm text-ink-500">{d.admin.electionReportHint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink
            href={`/${locale}/admin/elections/${election.id}/report.csv`}
            variant="outline"
            size="sm"
          >
            {d.admin.downloadCsv}
          </ButtonLink>
          <PrintReportButton label={d.admin.printReport} />
        </div>
      </div>

      <article className="card-surface space-y-6 p-6 print:border-0 print:shadow-none">
        <header className="border-b border-ink-100 pb-4 dark:border-white/10">
          <p className="text-xs font-bold tracking-[0.14em] text-ink-400 uppercase">
            {siteConfig.shortName}
          </p>
          <h2 className="mt-1 text-xl font-extrabold">{pick(election, "title", locale)}</h2>
          <p className="mt-1 text-sm text-ink-500">{pick(election, "description", locale)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Badge tone={statusTone(election.status)}>{election.status}</Badge>
            <span className="text-ink-500">
              {formatDateShort(election.opensAt, locale)}
              {election.closesAt ? ` – ${formatDateShort(election.closesAt, locale)}` : ""}
            </span>
          </div>
        </header>

        <section>
          <h3 className="font-extrabold">{d.admin.electionSummary}</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-ink-50 px-4 py-3 dark:bg-white/5">
              <dt className="text-xs font-bold tracking-wider text-ink-500 uppercase">
                {d.admin.votesCast}
              </dt>
              <dd className="mt-1 text-2xl font-extrabold">{totalVotes}</dd>
            </div>
            <div className="rounded-xl bg-ink-50 px-4 py-3 dark:bg-white/5">
              <dt className="text-xs font-bold tracking-wider text-ink-500 uppercase">
                {d.admin.totalEligibleHint}
              </dt>
              <dd className="mt-1 text-2xl font-extrabold">{eligible}</dd>
            </div>
            <div className="rounded-xl bg-ink-50 px-4 py-3 dark:bg-white/5">
              <dt className="text-xs font-bold tracking-wider text-ink-500 uppercase">
                {d.admin.turnout}
              </dt>
              <dd className="mt-1 text-2xl font-extrabold">{turnoutPct}%</dd>
            </div>
          </dl>
          {leaders.length === 1 && (
            <p className="mt-3 text-sm font-semibold text-teal-800 dark:text-teal-200">
              {d.admin.leading}: {leaders[0].name} ({pick(leaders[0], "position", locale)}) —{" "}
              {leaders[0]._count.votes} {d.admin.votesCast.toLowerCase()}
            </p>
          )}
          {leaders.length > 1 && (
            <p className="mt-3 text-sm font-semibold text-amber-800 dark:text-amber-200">
              {d.admin.tied}: {leaders.map((l) => l.name).join(", ")} — {topCount}{" "}
              {d.admin.votesCast.toLowerCase()}
            </p>
          )}
        </section>

        <section>
          <h3 className="font-extrabold">{d.admin.resultsByCandidate}</h3>
          <div className="mt-3">
            <DataTable
              head={[
                "#",
                d.forms.fullName,
                d.admin.position,
                d.admin.votesCast,
                d.admin.voteShare,
              ]}
            >
              {ranked.map((c, i) => {
                const share =
                  totalVotes > 0 ? Math.round((c._count.votes / totalVotes) * 1000) / 10 : 0;
                return (
                  <tr key={c.id} className="text-ink-800 dark:text-ink-100">
                    <td className="px-4 py-3 font-semibold">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className="px-4 py-3">{pick(c, "position", locale)}</td>
                    <td className="px-4 py-3">{c._count.votes}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                          <div
                            className="h-full rounded-full bg-[#ec2a2b]"
                            style={{ width: `${Math.min(share, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          </div>
        </section>

        <p className="text-xs text-ink-400">
          Generated {new Date().toISOString().slice(0, 16).replace("T", " ")} UTC ·{" "}
          {siteConfig.legalName} · Reg. {siteConfig.registrationNo}
        </p>
      </article>
    </div>
  );
}
