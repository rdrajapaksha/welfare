import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { articleSchema, buildMetadata } from "@/lib/seo";
import { newsCategoryLabel } from "@/lib/labels";
import { formatDate, readingTime } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/ui/json-ld";
import { MediaFrame } from "@/components/ui/media";

export async function generateStaticParams() {
  const posts = await prisma.newsPost.findMany({ where: { isPublished: true }, select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const post = await prisma.newsPost.findUnique({ where: { slug } });
  if (!post || !post.isPublished) return {};
  return buildMetadata({
    locale: raw,
    title: pick(post, "title", raw),
    description: pick(post, "excerpt", raw),
    path: `/news/${slug}`,
    type: "article",
    image: post.coverImage ?? undefined,
    publishedTime: post.publishedAt.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
  });
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);

  const post = await prisma.newsPost.findUnique({ where: { slug } });
  if (!post || !post.isPublished) notFound();

  const related = await prisma.newsPost.findMany({
    where: { isPublished: true, category: post.category, slug: { not: slug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const tags = post.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <>
      <JsonLd
        data={articleSchema({
          locale,
          headline: pick(post, "title", locale),
          description: pick(post, "excerpt", locale),
          path: `/news/${slug}`,
          published: post.publishedAt,
          modified: post.updatedAt,
          author: post.author,
          image: post.coverImage ?? undefined,
        })}
      />
      <PageHero
        locale={locale}
        title={pick(post, "title", locale)}
        subtitle={pick(post, "excerpt", locale)}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[
          { name: d.nav.home, href: "/" },
          { name: d.news.newsTitle, href: "/news" },
          { name: pick(post, "title", locale) },
        ]}
      />
      <Section>
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-ink-500">
            <Badge>{newsCategoryLabel(d, post.category)}</Badge>
            <span>
              {d.news.by} {post.author}
            </span>
            <span>{formatDate(post.publishedAt, locale)}</span>
            <span>
              {readingTime(pick(post, "body", locale).replace(/<[^>]+>/g, " "))} {d.common.minRead}
            </span>
          </div>
          <MediaFrame src={post.coverImage ?? "/media/annual-report.svg"} alt="" ratio="16/9" className="mb-8" />
          <div className="prose-hla" dangerouslySetInnerHTML={{ __html: pick(post, "body", locale) }} />
          {tags.length > 0 && (
            <p className="mt-8 text-sm text-ink-500">
              {d.news.tags}: {tags.join(" · ")}
            </p>
          )}
        </div>
      </Section>
      {related.length > 0 && (
        <Section tone="alt">
          <h2 className="text-2xl font-extrabold">{d.news.relatedTitle}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <Link href={`/${locale}/news/${item.slug}`} className="card-surface block overflow-hidden">
                  <MediaFrame src={item.coverImage ?? "/media/annual-report.svg"} alt="" ratio="16/9" className="rounded-none" />
                  <div className="p-4">
                    <p className="font-bold">{pick(item, "title", locale)}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-500">{pick(item, "excerpt", locale)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
