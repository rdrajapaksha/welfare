import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminDeleteAlbum, adminUpsertAlbum } from "@/lib/admin-actions";
import { galleryCategoryLabel } from "@/lib/labels";
import { formatDateShort } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { MediaSelect, CheckField } from "@/components/admin/admin-controls";
import { AdminDeleteButton } from "@/components/admin/delete-button";
import { MEDIA_OPTIONS } from "@/lib/media";

const ALBUM_CATEGORIES = ["EVENT", "COMMUNITY", "HIGHLIGHT"] as const;

export default async function AdminGalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const albums = await prisma.galleryAlbum.findMany({
    orderBy: { takenAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.gallery}</h1>
        <p className="text-sm text-ink-500">{d.gallery.subtitle}</p>
      </div>

      <section className="card-surface p-5">
        <h2 className="text-lg font-extrabold">{d.common.new} album</h2>
        <form action={adminUpsertAlbum} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value="" />
          <Field label={`${d.forms.subject} (EN)`} htmlFor="titleEn" required>
            <Input id="titleEn" name="titleEn" required />
          </Field>
          <Field label={`${d.forms.subject} (SI)`} htmlFor="titleSi">
            <Input id="titleSi" name="titleSi" />
          </Field>
          <Field label={`${d.forms.subject} (TA)`} htmlFor="titleTa">
            <Input id="titleTa" name="titleTa" />
          </Field>
          <Field label="Caption (EN)" htmlFor="captionEn" className="sm:col-span-2 lg:col-span-3">
            <Textarea id="captionEn" name="captionEn" rows={2} />
          </Field>
          <Field label={d.common.category} htmlFor="category">
            <Select id="category" name="category" defaultValue="EVENT">
              {ALBUM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {galleryCategoryLabel(d, cat)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.common.date} htmlFor="takenAt">
            <Input id="takenAt" name="takenAt" type="datetime-local" />
          </Field>
          <MediaSelect name="coverImage" label="Cover image" />
          {[1, 2, 3].map((n) => (
            <Field key={n} label={`Extra photo ${n} (${d.common.optional})`} htmlFor={`itemUrl-${n}`}>
              <Select id={`itemUrl-${n}`} name="itemUrl" defaultValue="">
                <option value="">{d.forms.selectPlaceholder}</option>
                {MEDIA_OPTIONS.map((src) => (
                  <option key={src} value={src}>
                    {src.replace("/media/", "")}
                  </option>
                ))}
              </Select>
            </Field>
          ))}
          <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-3">
            <CheckField name="isPublished" label={d.common.published} defaultChecked />
            <Button type="submit" size="sm">
              {d.common.save}
            </Button>
          </div>
        </form>
      </section>

      {albums.length === 0 ? (
        <EmptyState title={d.admin.noRecords} />
      ) : (
        <DataTable
          head={[
            d.forms.subject,
            d.common.category,
            d.common.date,
            d.common.photos,
            d.common.status,
            d.common.actions,
          ]}
        >
          {albums.map((album) => (
            <tr key={album.id} className="text-ink-800 dark:text-ink-100">
              <td className="px-4 py-3 font-semibold">{pick(album, "title", locale)}</td>
              <td className="px-4 py-3">{galleryCategoryLabel(d, album.category)}</td>
              <td className="px-4 py-3">{formatDateShort(album.takenAt, locale)}</td>
              <td className="px-4 py-3">{album._count.items}</td>
              <td className="px-4 py-3">
                <Badge tone={album.isPublished ? "success" : "warning"}>
                  {album.isPublished ? d.common.published : d.common.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ButtonLink href={`/${locale}/gallery/${album.slug}`} size="sm" variant="ghost">
                    {d.gallery.viewAlbum}
                  </ButtonLink>
                  <AdminDeleteButton
                    action={adminDeleteAlbum}
                    id={album.id}
                    locale={locale}
                    label={d.common.delete}
                  />
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
