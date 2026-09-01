import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, Lock } from "lucide-react";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { documentCategoryLabel } from "@/lib/labels";
import { formatDateShort, formatFileSize } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.documents.title, description: d.documents.subtitle, path: "/documents" });
}

export default async function DocumentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const d = await getDictionary(locale);
  const user = await getCurrentUser();
  const docs = await prisma.document.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" } });

  return (
    <>
      <PageHero
        locale={locale}
        title={d.documents.title}
        subtitle={d.documents.subtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.documents.title }]}
      />
      {DOCUMENT_CATEGORIES.map((category) => {
        const group = docs.filter((doc) => doc.category === category);
        if (group.length === 0) return null;
        return (
          <Section key={category} tone={category === "CONSTITUTION" ? "alt" : "canvas"}>
            <h2 className="text-2xl font-extrabold">{documentCategoryLabel(d, category)}</h2>
            <div className="mt-6 grid gap-4">
              {group.map((doc) => {
                const locked = doc.membersOnly && !user;
                return (
                  <article key={doc.id} className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-ink-950 dark:text-white">{pick(doc, "title", locale)}</h3>
                        {doc.membersOnly && (
                          <Badge tone="gold">
                            <Lock className="size-3" /> {d.documents.membersOnly}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{pick(doc, "description", locale)}</p>
                      <p className="mt-2 text-xs text-ink-500">
                        {d.documents.version} {doc.version} · {doc.fileType} · {formatFileSize(doc.fileSizeKb)} · {d.documents.lastUpdated}{" "}
                        {formatDateShort(doc.updatedAt, locale)}
                      </p>
                    </div>
                    {locked ? (
                      <ButtonLink href={`/${locale}/login?next=/${locale}/documents`} variant="outline">
                        {d.nav.login}
                      </ButtonLink>
                    ) : (
                      <ButtonLink href={doc.fileUrl}>
                        <Download className="size-4" />
                        {d.common.download}
                      </ButtonLink>
                    )}
                  </article>
                );
              })}
            </div>
          </Section>
        );
      })}
      {docs.length === 0 && (
        <Section>
          <EmptyState title={d.documents.noDocuments} />
        </Section>
      )}
      <Section>
        <div className="card-surface p-8 text-center">
          <h2 className="text-xl font-extrabold">{d.documents.helpTitle}</h2>
          <p className="mt-2 text-ink-600">{d.documents.helpText}</p>
          <ButtonLink href={`/${locale}/contact`} className="mt-5" variant="outline">
            {d.nav.contact}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
