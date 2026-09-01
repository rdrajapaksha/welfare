import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { galleryCategoryLabel } from "@/lib/labels";
import { formatDateShort } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { EmptyState, FilterChips } from "@/components/ui/misc";
import { MediaFrame } from "@/components/ui/media";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.gallery.title, description: d.gallery.subtitle, path: "/gallery" });
}

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { type } = await searchParams;
  const d = await getDictionary(locale);
  const mediaType = type === "PHOTO" || type === "VIDEO" ? type : "all";

  const albums = await prisma.galleryAlbum.findMany({
    where: {
      isPublished: true,
      ...(mediaType === "all" ? {} : { items: { some: { type: mediaType } } }),
    },
    orderBy: { takenAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <>
      <PageHero
        locale={locale}
        title={d.gallery.title}
        subtitle={d.gallery.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.gallery.title }]}
      />
      <Section>
        <FilterChips
          locale={locale}
          basePath="/gallery"
          paramName="type"
          activeValue={mediaType}
          options={[
            { value: "all", label: d.gallery.tabAll },
            { value: "PHOTO", label: d.gallery.tabPhotos },
            { value: "VIDEO", label: d.gallery.tabVideos },
          ]}
        />
        {albums.length === 0 ? (
          <EmptyState title={d.gallery.noItems} className="mt-10" />
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Link key={album.id} href={`/${locale}/gallery/${album.slug}`} className="card-surface group overflow-hidden">
                <MediaFrame src={album.coverImage} alt="" ratio="16/9" imgClassName="group-hover:scale-105" />
                <div className="p-5">
                  <Badge>{galleryCategoryLabel(d, album.category)}</Badge>
                  <h2 className="mt-3 text-lg font-extrabold text-ink-950 group-hover:text-brand-700 dark:text-white">
                    {pick(album, "title", locale)}
                  </h2>
                  <p className="mt-1 text-sm text-ink-500">
                    {formatDateShort(album.takenAt, locale)} · {album._count.items} {d.gallery.albums}
                  </p>
                  {pick(album, "caption", locale) && (
                    <p className="mt-2 line-clamp-2 text-sm text-ink-600 dark:text-ink-300">{pick(album, "caption", locale)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
