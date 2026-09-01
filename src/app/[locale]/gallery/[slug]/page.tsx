import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Play } from "lucide-react";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { galleryCategoryLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { MediaFrame } from "@/components/ui/media";
import { ButtonLink } from "@/components/ui/button";

export async function generateStaticParams() {
  const albums = await prisma.galleryAlbum.findMany({ where: { isPublished: true }, select: { slug: true } });
  return albums.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const album = await prisma.galleryAlbum.findUnique({ where: { slug } });
  if (!album || !album.isPublished) return {};
  return buildMetadata({
    locale: raw,
    title: pick(album, "title", raw),
    description: pick(album, "caption", raw) || pick(album, "title", raw),
    path: `/gallery/${slug}`,
    image: album.coverImage,
  });
}

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);

  const album = await prisma.galleryAlbum.findUnique({
    where: { slug },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!album || !album.isPublished) notFound();

  return (
    <>
      <PageHero
        locale={locale}
        title={pick(album, "title", locale)}
        subtitle={pick(album, "caption", locale) || undefined}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[
          { name: d.nav.home, href: "/" },
          { name: d.gallery.title, href: "/gallery" },
          { name: pick(album, "title", locale) },
        ]}
      />
      <Section>
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Badge>{galleryCategoryLabel(d, album.category)}</Badge>
          <p className="text-sm text-ink-500">{formatDate(album.takenAt, locale)}</p>
        </div>
        {album.items.length === 0 ? (
          <EmptyState title={d.gallery.noItems} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {album.items.map((item, index) => {
              const caption = pick(item, "caption", locale);
              const src = item.thumbnail ?? item.url;
              return (
                <figure key={item.id} className="card-surface overflow-hidden">
                  <div className="relative">
                    <MediaFrame src={src} alt={caption || ""} ratio="4/3" className="rounded-none" />
                    {item.type === "VIDEO" && (
                      <span className="absolute inset-0 grid place-items-center bg-ink-950/25">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink-950">
                          <Play className="size-3.5" aria-hidden />
                          {d.gallery.watchVideo}
                        </span>
                      </span>
                    )}
                  </div>
                  <figcaption className="px-4 py-3 text-sm text-ink-600 dark:text-ink-300">
                    {caption || `${d.gallery.imageCounter} ${index + 1}`}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}
        <ButtonLink href={`/${locale}/gallery`} variant="ghost" className="mt-10">
          {d.common.backTo} {d.gallery.title}
        </ButtonLink>
      </Section>
    </>
  );
}
