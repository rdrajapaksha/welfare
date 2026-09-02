import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import {
  adminAddCandidate,
  adminDeleteCandidate,
  adminDeleteElection,
  adminUpsertElection,
} from "@/lib/admin-actions";
import { formatDateShort } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { AdminDeleteButton } from "@/components/admin/delete-button";

export default async function AdminElectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const elections = await prisma.election.findMany({
    orderBy: { opensAt: "desc" },
    include: {
      candidates: { orderBy: { sortOrder: "asc" }, include: { _count: { select: { votes: true } } } },
      _count: { select: { votes: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.elections}</h1>
        <p className="text-sm text-ink-500">{d.admin.electionsHint}</p>
      </div>

      <section className="card-surface p-5">
        <h2 className="text-lg font-extrabold">{d.admin.createElection}</h2>
        <form action={adminUpsertElection} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value="" />
          <Field label={`${d.forms.subject} (EN)`} htmlFor="titleEn" required>
            <Input id="titleEn" name="titleEn" required placeholder="AGM 2026 Office Bearers" />
          </Field>
          <Field label={`${d.forms.subject} (SI)`} htmlFor="titleSi">
            <Input id="titleSi" name="titleSi" />
          </Field>
          <Field label={`${d.forms.subject} (TA)`} htmlFor="titleTa">
            <Input id="titleTa" name="titleTa" />
          </Field>
          <Field label={`${d.forms.message} (EN)`} htmlFor="descriptionEn" className="sm:col-span-2 lg:col-span-3">
            <Textarea id="descriptionEn" name="descriptionEn" rows={3} />
          </Field>
          <Field label={d.common.status} htmlFor="status">
            <Select id="status" name="status" defaultValue="DRAFT">
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </Select>
          </Field>
          <Field label={d.admin.opensAt} htmlFor="opensAt">
            <Input id="opensAt" name="opensAt" type="datetime-local" />
          </Field>
          <Field label={d.admin.closesAt} htmlFor="closesAt">
            <Input id="closesAt" name="closesAt" type="datetime-local" />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" size="sm">
              {d.admin.createElection}
            </Button>
          </div>
        </form>
      </section>

      {elections.length === 0 ? (
        <EmptyState title={d.dashboard.noElections} />
      ) : (
        elections.map((election) => (
          <section key={election.id} className="card-surface space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">{pick(election, "title", locale)}</h2>
                <p className="text-sm text-ink-500">
                  {election._count.votes} {d.admin.votesCast} · {formatDateShort(election.opensAt, locale)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ButtonLink
                  href={`/${locale}/admin/elections/${election.id}/report`}
                  variant="outline"
                  size="sm"
                >
                  {d.admin.electionReport}
                </ButtonLink>
                <Badge tone={statusTone(election.status)}>{election.status}</Badge>
                <AdminDeleteButton action={adminDeleteElection} id={election.id} locale={locale} />
              </div>
            </div>

            <form action={adminUpsertElection} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="id" value={election.id} />
              <input type="hidden" name="titleEn" value={election.titleEn} />
              <input type="hidden" name="titleSi" value={election.titleSi} />
              <input type="hidden" name="titleTa" value={election.titleTa} />
              <input type="hidden" name="descriptionEn" value={election.descriptionEn} />
              <input type="hidden" name="descriptionSi" value={election.descriptionSi} />
              <input type="hidden" name="descriptionTa" value={election.descriptionTa} />
              <Field label={d.common.status} htmlFor={`status-${election.id}`}>
                <Select id={`status-${election.id}`} name="status" defaultValue={election.status}>
                  <option value="DRAFT">Draft</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </Select>
              </Field>
              <Button type="submit" size="sm" variant="outline">
                {d.common.save}
              </Button>
            </form>

            <DataTable head={[d.forms.fullName, d.admin.position, d.admin.votesCast, ""]}>
              {election.candidates.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3">{pick(c, "position", locale)}</td>
                  <td className="px-4 py-3">{c._count.votes}</td>
                  <td className="px-4 py-3">
                    <AdminDeleteButton action={adminDeleteCandidate} id={c.id} locale={locale} />
                  </td>
                </tr>
              ))}
            </DataTable>

            <form action={adminAddCandidate} className="grid gap-3 rounded-xl border border-ink-100 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="electionId" value={election.id} />
              <Field label={d.forms.fullName} htmlFor={`name-${election.id}`} required>
                <Input id={`name-${election.id}`} name="name" required />
              </Field>
              <Field label={`${d.admin.position} (EN)`} htmlFor={`pos-${election.id}`} required>
                <Input id={`pos-${election.id}`} name="positionEn" required placeholder="President" />
              </Field>
              <Field label={d.admin.bio} htmlFor={`bio-${election.id}`}>
                <Input id={`bio-${election.id}`} name="bio" />
              </Field>
              <div className="flex items-end">
                <Button type="submit" size="sm">
                  {d.admin.addCandidate}
                </Button>
              </div>
            </form>
          </section>
        ))
      )}
    </div>
  );
}
