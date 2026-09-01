import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminDeleteNews, adminUpsertNews } from "@/lib/admin-actions";
import { newsCategoryLabel } from "@/lib/labels";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { MediaSelect, CheckField } from "@/components/admin/admin-controls";
import { AdminDeleteButton } from "@/components/admin/delete-button";

const NEWS_CATEGORIES = ["NEWS", "ACTIVITY_REPORT", "PRESS"] as const;

export default async function AdminNewsEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ButtonLink href={`/${locale}/admin/news`} variant="ghost" size="sm">
            {d.common.back}
          </ButtonLink>
          <h1 className="mt-2 text-2xl font-extrabold">{d.common.edit}: {post.titleEn}</h1>
        </div>
        <AdminDeleteButton
          action={adminDeleteNews}
          id={post.id}
          locale={locale}
          label={d.common.delete}
        />
      </div>

      <section className="card-surface p-5">
        <form action={adminUpsertNews} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={post.id} />
          <Field label={`${d.forms.subject} (EN)`} htmlFor="titleEn" required>
            <Input id="titleEn" name="titleEn" required defaultValue={post.titleEn} />
          </Field>
          <Field label={`${d.forms.subject} (SI)`} htmlFor="titleSi">
            <Input id="titleSi" name="titleSi" defaultValue={post.titleSi} />
          </Field>
          <Field label={`${d.forms.subject} (TA)`} htmlFor="titleTa">
            <Input id="titleTa" name="titleTa" defaultValue={post.titleTa} />
          </Field>
          <Field label="Excerpt (EN)" htmlFor="excerptEn" className="sm:col-span-2 lg:col-span-3">
            <Textarea id="excerptEn" name="excerptEn" rows={3} defaultValue={post.excerptEn} />
          </Field>
          <Field label="Excerpt (SI)" htmlFor="excerptSi">
            <Textarea id="excerptSi" name="excerptSi" rows={2} defaultValue={post.excerptSi} />
          </Field>
          <Field label="Excerpt (TA)" htmlFor="excerptTa">
            <Textarea id="excerptTa" name="excerptTa" rows={2} defaultValue={post.excerptTa} />
          </Field>
          <Field label="Body (EN)" htmlFor="bodyEn" className="sm:col-span-2 lg:col-span-3">
            <Textarea id="bodyEn" name="bodyEn" rows={5} defaultValue={post.bodyEn} />
          </Field>
          <Field label="Body (SI)" htmlFor="bodySi">
            <Textarea id="bodySi" name="bodySi" rows={3} defaultValue={post.bodySi} />
          </Field>
          <Field label="Body (TA)" htmlFor="bodyTa">
            <Textarea id="bodyTa" name="bodyTa" rows={3} defaultValue={post.bodyTa} />
          </Field>
          <Field label={d.common.category} htmlFor="category">
            <Select id="category" name="category" defaultValue={post.category}>
              {NEWS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {newsCategoryLabel(d, cat)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Author" htmlFor="author">
            <Input id="author" name="author" defaultValue={post.author} />
          </Field>
          <Field label="Tags" htmlFor="tags">
            <Input id="tags" name="tags" defaultValue={post.tags} />
          </Field>
          <MediaSelect name="coverImage" label="Cover image" defaultValue={post.coverImage} />
          <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-3">
            <CheckField name="isFeatured" label={d.common.featured} defaultChecked={post.isFeatured} />
            <CheckField
              name="isPublished"
              label={d.common.published}
              defaultChecked={post.isPublished}
            />
            <Button type="submit">{d.common.save}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
