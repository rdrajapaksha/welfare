import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { newsCategoryLabel } from "@/lib/labels";
import { formatDateShort, readingTime } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { EmptyState, FilterChips, Pagination } from "@/components/ui/misc";
import { MediaFrame } from "@/components/ui/media";

const PAGE_SIZE = 9;
const NEWS_FILTERS = ["NEWS", "ACTIVITY_REPORT"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.news.newsTitle, description: d.news.newsSubtitle, path: "/news" });
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { category, page: pageRaw } = await searchParams;
  const d = await getDictionary(locale);
  const active = NEWS_FILTERS.includes(category as (typeof NEWS_FILTERS)[number]) ? category! : "all";
  const page = Math.max(1, Number(pageRaw) || 1);

  const where = {
    isPublished: true,
    ...(active === "all" ? {} : { category: active }),
  };

  const [total, posts, counts] = await Promise.all([
    prisma.newsPost.count({ where }),
    prisma.newsPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.newsPost.groupBy({
      by: ["category"],
      where: { isPublished: true },
      _count: { _all: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countMap = Object.fromEntries(counts.map((c) => [c.category, c._count._all]));
  const allCount = Object.values(countMap).reduce((s, n) => s + n, 0);

  const queryFor = (p: number) => {
    const qs = new URLSearchParams();
    if (active !== "all") qs.set("category", active);
    if (p > 1) qs.set("page", String(p));
    const q = qs.toString();
    return `/${locale}/news${q ? `?${q}` : ""}`;
  };

  return (
    <>
      <PageHero
        locale={locale}
        title={d.news.newsTitle}
        subtitle={d.news.newsSubtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.news.newsTitle }]}
      />
      <Section>
        <FilterChips
          locale={locale}
          basePath="/news"
          paramName="category"
          activeValue={active}
          options={[
            { value: "all", label: d.common.all, count: allCount },
            ...NEWS_FILTERS.map((cat) => ({
              value: cat,
              label: newsCategoryLabel(d, cat),
              count: countMap[cat] ?? 0,
            })),
          ]}
        />
        {posts.length === 0 ? (
          <EmptyState title={d.news.noPosts} className="mt-10" />
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/${locale}/news/${post.slug}`} className="card-surface group overflow-hidden">
                <MediaFrame src={post.coverImage ?? "/media/annual-report.svg"} alt="" ratio="16/9" imgClassName="group-hover:scale-105" />
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{newsCategoryLabel(d, post.category)}</Badge>
                    {post.isFeatured && <Badge tone="gold">{d.common.featured}</Badge>}
                  </div>
                  <h2 className="mt-3 text-lg font-extrabold text-ink-950 group-hover:text-brand-700 dark:text-white">
                    {pick(post, "title", locale)}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-600 dark:text-ink-300">{pick(post, "excerpt", locale)}</p>
                  <p className="mt-3 text-xs text-ink-500">
                    {formatDateShort(post.publishedAt, locale)} · {readingTime(pick(post, "body", locale).replace(/<[^>]+>/g, " "))}{" "}
                    {d.common.minRead}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-10">
          <Pagination
            page={page}
            totalPages={totalPages}
            buildHref={queryFor}
            labels={{
              previous: d.common.previous,
              next: d.common.next,
              pagination: d.a11y.pagination,
              page: d.common.page,
              of: d.common.of,
            }}
          />
        </div>
      </Section>
    </>
  );
}
