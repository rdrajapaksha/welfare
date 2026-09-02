import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { EmptyState } from "@/components/ui/misc";
import { Badge, statusTone } from "@/components/ui/badge";
import { SuggestionForm } from "@/components/forms/suggestion-form";

export default async function SuggestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const user = await requireUser(locale);
  const d = await getDictionary(locale);

  const mine = user.memberId
    ? await prisma.suggestion.findMany({
        where: { memberId: user.memberId },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.dashboard.suggestions}</h1>
        <p className="mt-1 text-sm text-ink-500">{d.dashboard.suggestionsNote}</p>
      </div>

      <section className="card-surface p-5">
        <h2 className="font-extrabold">{d.dashboard.newSuggestion}</h2>
        <div className="mt-4">
          <SuggestionForm d={d} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-extrabold">{d.dashboard.mySuggestions}</h2>
        <p className="mt-1 text-xs text-ink-500">{d.dashboard.mySuggestionsNote}</p>
        {mine.length === 0 ? (
          <EmptyState title={d.dashboard.noSuggestions} className="mt-4" />
        ) : (
          <ul className="mt-4 space-y-3">
            {mine.map((s) => (
              <li key={s.id} className="card-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">{s.subject}</p>
                  <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-400">
                  {s.reference} · {formatDateShort(s.createdAt, locale)} · {s.category}
                </p>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{s.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
