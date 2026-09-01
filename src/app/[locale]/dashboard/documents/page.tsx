import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { documentCategoryLabel } from "@/lib/labels";
import { formatFileSize } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

export default async function MemberDocumentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireUser(locale);
  const d = await getDictionary(locale);
  const docs = await prisma.document.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{d.documents.title}</h1>
      <p className="mt-1 text-sm text-ink-500">{d.documents.subtitle}</p>
      <ul className="mt-6 space-y-3">
        {docs.map((doc) => (
          <li key={doc.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs text-ink-500">{documentCategoryLabel(d, doc.category)}</p>
              <p className="font-bold">{pick(doc, "title", locale)}</p>
              <p className="text-xs text-ink-500">
                {doc.fileType} · {formatFileSize(doc.fileSizeKb)}
              </p>
            </div>
            <ButtonLink href={doc.fileUrl} size="sm">
              <Download className="size-4" />
              {d.common.download}
            </ButtonLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
