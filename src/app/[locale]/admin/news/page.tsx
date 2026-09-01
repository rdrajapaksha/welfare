import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { adminDeleteNews, adminUpsertNews } from "@/lib/admin-actions";
import { newsCategoryLabel } from "@/lib/labels";
import { formatDateShort } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { MediaSelect, CheckField } from "@/components/admin/admin-controls";
import { AdminDeleteButton } from "@/components/admin/delete-button";

const NEWS_CATEGORIES = ["NEWS", "ACTIVITY_REPORT", "PRESS"] as const;

export default async function AdminNewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const posts = await prisma.newsPost.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.news}</h1>
        <p className="text-sm text-ink-500">{d.news.subtitle}</p>
      </div>

      <section className="card-surface p-5">
        <h2 className="text-lg font-extrabold">{d.common.new} article</h2>
        <form action={adminUpsertNews} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <Field label="Excerpt (EN)" htmlFor="excerptEn" className="sm:col-span-2 lg:col-span-3">
            <Textarea id="excerptEn" name="excerptEn" rows={3} />
          </Field>
          <Field label={d.common.category} htmlFor="category">
            <Select id="category" name="category" defaultValue="NEWS">
              {NEWS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {newsCategoryLabel(d, cat)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Author" htmlFor="author">
            <Input id="author" name="author" placeholder="Media Unit" />
          </Field>
          <Field label="Tags" htmlFor="tags">
            <Input id="tags" name="tags" placeholder="camp, welfare" />
          </Field>
          <MediaSelect name="coverImage" label="Cover image" />
          <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-3">
            <CheckField name="isFeatured" label={d.common.featured} />
            <CheckField name="isPublished" label={d.common.published} defaultChecked />
            <Button type="submit" size="sm">
              {d.common.save}
            </Button>
          </div>
        </form>
      </section>

      {posts.length === 0 ? (
        <EmptyState title={d.admin.noRecords} />
      ) : (
        <DataTable
          head={[d.forms.subject, d.common.category, d.common.date, d.common.status, d.common.actions]}
        >
          {posts.map((post) => (
            <tr key={post.id} className="text-ink-800 dark:text-ink-100">
              <td className="px-4 py-3 font-semibold">{pick(post, "title", locale)}</td>
              <td className="px-4 py-3">{newsCategoryLabel(d, post.category)}</td>
              <td className="px-4 py-3">{formatDateShort(post.publishedAt, locale)}</td>
              <td className="px-4 py-3">
                <Badge tone={post.isPublished ? "success" : "warning"}>
                  {post.isPublished ? d.common.published : d.common.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ButtonLink href={`/${locale}/admin/news/${post.id}`} size="sm" variant="ghost">
                    {d.common.edit}
                  </ButtonLink>
                  <AdminDeleteButton
                    action={adminDeleteNews}
                    id={post.id}
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
