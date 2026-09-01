import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";

export default async function AnnouncementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireUser(locale);
  const d = await getDictionary(locale);
  const now = new Date();

  const announcements = await prisma.announcement.findMany({
    where: {
      isPublished: true,
      audience: { in: ["ALL", "MEMBERS"] },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{d.dashboard.announcements}</h1>
      <p className="mt-1 text-sm text-ink-500">{d.dashboard.announcementsSubtitle}</p>
      {announcements.length === 0 ? (
        <EmptyState title={d.dashboard.noAnnouncements} className="mt-8" />
      ) : (
        <ul className="mt-8 space-y-4">
          {announcements.map((item) => (
            <li key={item.id} className="card-surface p-5">
              <div className="flex flex-wrap items-center gap-2">
                {item.isPinned && <Badge tone="gold">{d.common.featured}</Badge>}
                {item.priority === "URGENT" && <Badge tone="danger">{item.priority}</Badge>}
                {item.priority === "IMPORTANT" && <Badge tone="warning">{item.priority}</Badge>}
                <p className="text-xs text-ink-500">{formatDate(item.publishedAt, locale)}</p>
              </div>
              <h2 className="mt-2 text-lg font-extrabold">{pick(item, "title", locale)}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                {pick(item, "body", locale)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
