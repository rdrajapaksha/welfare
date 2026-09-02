import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, isLocale, pick, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import {
  adminDeleteDocument,
  adminDeleteFaq,
  adminDeletePartner,
  adminUpsertDocument,
  adminUpsertFaq,
  adminUpsertPartner,
} from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { DataTable, EmptyState } from "@/components/ui/misc";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { CheckField } from "@/components/admin/admin-controls";
import { AdminDeleteButton } from "@/components/admin/delete-button";

const FAQ_CATEGORIES = ["GENERAL", "MEMBERSHIP", "DONATIONS", "WELFARE", "VOLUNTEER"] as const;
const DOC_CATEGORIES = [
  "GUIDE",
  "APPLICATION_FORM",
  "CONSTITUTION",
  "POLICY",
  "FINANCIAL",
  "CIRCULAR",
] as const;
const PARTNER_LOGOS = [
  "/partners/ceylon-trust-bank.svg",
  "/partners/divisional-secretariat.svg",
  "/partners/green-agro-lanka.svg",
  "/partners/kandy-textiles.svg",
  "/partners/lanka-medicare.svg",
  "/partners/metro-insurance.svg",
  "/partners/nawaloka-builders.svg",
  "/partners/orient-telecom.svg",
  "/partners/serendib-foods.svg",
  "/partners/sunrise-pharma.svg",
] as const;
const DOCUMENT_FILES = [
  "/documents/constitution.pdf",
  "/documents/membership-application-form.pdf",
  "/documents/welfare-claim-form.pdf",
  "/documents/scholarship-guidelines.pdf",
  "/documents/volunteer-handbook.pdf",
  "/documents/child-protection-policy.pdf",
  "/documents/grievance-procedure.pdf",
  "/documents/circular-2026-01-subscriptions.pdf",
  "/documents/annual-report-2025.pdf",
  "/documents/annual-report-2024.pdf",
  "/documents/annual-report-2023.pdf",
  "/documents/annual-report-2022.pdf",
  "/documents/annual-report-2021.pdf",
] as const;

export default async function AdminContentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale);
  const d = await getDictionary(locale);

  const [faqs, partners, documents] = await Promise.all([
    prisma.faq.findMany({ orderBy: [{ sortOrder: "asc" }, { category: "asc" }] }),
    prisma.partner.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.document.findMany({ orderBy: { publishedAt: "desc" } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold">{d.admin.content}</h1>
        <p className="text-sm text-ink-500">
          {d.nav.faq} · {d.nav.partners} · {d.nav.documents} · {d.dashboard.announcements}
        </p>
      </div>

      {/* Announcements moved to dedicated page */}
      <section className="card-surface flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-lg font-extrabold">{d.admin.announcements}</h2>
          <p className="mt-1 text-sm text-ink-500">{d.admin.announcementsHint}</p>
        </div>
        <ButtonLink href={`/${locale}/admin/announcements`} size="sm">
          {d.admin.sendAnnouncement}
        </ButtonLink>
      </section>

      {/* FAQs */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold">{d.nav.faq}</h2>
        <div className="card-surface p-5">
          <h3 className="font-bold">{d.common.new}</h3>
          <form action={adminUpsertFaq} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value="" />
            <Field label="Question (EN)" htmlFor="faq-qEn" required className="sm:col-span-2 lg:col-span-3">
              <Input id="faq-qEn" name="questionEn" required />
            </Field>
            <Field label="Question (SI)" htmlFor="faq-qSi">
              <Input id="faq-qSi" name="questionSi" />
            </Field>
            <Field label="Question (TA)" htmlFor="faq-qTa">
              <Input id="faq-qTa" name="questionTa" />
            </Field>
            <Field label="Answer (EN)" htmlFor="faq-aEn" className="sm:col-span-2 lg:col-span-3">
              <Textarea id="faq-aEn" name="answerEn" rows={3} required />
            </Field>
            <Field label={d.common.category} htmlFor="faq-category">
              <Select id="faq-category" name="category" defaultValue="GENERAL">
                {FAQ_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Sort order" htmlFor="faq-sort">
              <Input id="faq-sort" name="sortOrder" type="number" defaultValue={0} />
            </Field>
            <div className="flex flex-wrap items-end gap-4">
              <CheckField name="isPublished" label={d.common.published} defaultChecked />
              <Button type="submit" size="sm">
                {d.common.save}
              </Button>
            </div>
          </form>
        </div>
        {faqs.length === 0 ? (
          <EmptyState title={d.admin.noRecords} />
        ) : (
          <DataTable head={["Question", d.common.category, d.common.status, d.common.actions]}>
            {faqs.map((item) => (
              <tr key={item.id} className="text-ink-800 dark:text-ink-100">
                <td className="px-4 py-3 font-semibold">{pick(item, "question", locale)}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">
                  <Badge tone={item.isPublished ? "success" : "warning"}>
                    {item.isPublished ? d.common.published : d.common.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <AdminDeleteButton
                    action={adminDeleteFaq}
                    id={item.id}
                    locale={locale}
                    label={d.common.delete}
                  />
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>

      {/* Partners */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold">{d.nav.partners}</h2>
        <div className="card-surface p-5">
          <h3 className="font-bold">{d.common.new}</h3>
          <form action={adminUpsertPartner} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value="" />
            <Field label="Name" htmlFor="partner-name" required>
              <Input id="partner-name" name="name" required />
            </Field>
            <Field label="Website" htmlFor="partner-website">
              <Input id="partner-website" name="website" type="url" placeholder="https://" />
            </Field>
            <Field label="Tier" htmlFor="partner-tier">
              <Select id="partner-tier" name="tier" defaultValue="PARTNER">
                <option value="PLATINUM">Platinum</option>
                <option value="GOLD">Gold</option>
                <option value="SILVER">Silver</option>
                <option value="PARTNER">Partner</option>
                <option value="GOVERNMENT">Government</option>
              </Select>
            </Field>
            <Field label="Logo" htmlFor="partner-logo">
              <Select id="partner-logo" name="logoUrl" defaultValue={PARTNER_LOGOS[0]}>
                {PARTNER_LOGOS.map((src) => (
                  <option key={src} value={src}>
                    {src.replace("/partners/", "")}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={d.partners.partnerSince} htmlFor="partner-since">
              <Input id="partner-since" name="since" type="number" min={1990} max={2100} />
            </Field>
            <Field label="Sort order" htmlFor="partner-sort">
              <Input id="partner-sort" name="sortOrder" type="number" defaultValue={0} />
            </Field>
            <Field label="Description (EN)" htmlFor="partner-desc" className="sm:col-span-2 lg:col-span-3">
              <Textarea id="partner-desc" name="descriptionEn" rows={2} />
            </Field>
            <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-3">
              <CheckField name="isActive" label="Active" defaultChecked />
              <Button type="submit" size="sm">
                {d.common.save}
              </Button>
            </div>
          </form>
        </div>
        {partners.length === 0 ? (
          <EmptyState title={d.admin.noRecords} />
        ) : (
          <DataTable head={["Name", "Tier", d.common.status, d.common.actions]}>
            {partners.map((item) => (
              <tr key={item.id} className="text-ink-800 dark:text-ink-100">
                <td className="px-4 py-3 font-semibold">{item.name}</td>
                <td className="px-4 py-3">{item.tier}</td>
                <td className="px-4 py-3">
                  <Badge tone={item.isActive ? "success" : "warning"}>
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <AdminDeleteButton
                    action={adminDeletePartner}
                    id={item.id}
                    locale={locale}
                    label={d.common.delete}
                  />
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>

      {/* Documents */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold">{d.nav.documents}</h2>
        <div className="card-surface p-5">
          <h3 className="font-bold">{d.common.new}</h3>
          <form action={adminUpsertDocument} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value="" />
            <Field label={`${d.forms.subject} (EN)`} htmlFor="doc-titleEn" required>
              <Input id="doc-titleEn" name="titleEn" required />
            </Field>
            <Field label={`${d.forms.subject} (SI)`} htmlFor="doc-titleSi">
              <Input id="doc-titleSi" name="titleSi" />
            </Field>
            <Field label={`${d.forms.subject} (TA)`} htmlFor="doc-titleTa">
              <Input id="doc-titleTa" name="titleTa" />
            </Field>
            <Field label="Description (EN)" htmlFor="doc-desc" className="sm:col-span-2 lg:col-span-3">
              <Textarea id="doc-desc" name="descriptionEn" rows={2} />
            </Field>
            <Field label={d.common.category} htmlFor="doc-category">
              <Select id="doc-category" name="category" defaultValue="GUIDE">
                {DOC_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="File" htmlFor="doc-file">
              <Select id="doc-file" name="fileUrl" defaultValue={DOCUMENT_FILES[0]}>
                {DOCUMENT_FILES.map((src) => (
                  <option key={src} value={src}>
                    {src.replace("/documents/", "")}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={d.documents.version} htmlFor="doc-version">
              <Input id="doc-version" name="version" defaultValue="1.0" />
            </Field>
            <Field label="Size (KB)" htmlFor="doc-size">
              <Input id="doc-size" name="fileSizeKb" type="number" defaultValue={100} />
            </Field>
            <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-3">
              <CheckField name="membersOnly" label={d.documents.membersOnly} />
              <CheckField name="isPublished" label={d.common.published} defaultChecked />
              <Button type="submit" size="sm">
                {d.common.save}
              </Button>
            </div>
          </form>
        </div>
        {documents.length === 0 ? (
          <EmptyState title={d.admin.noRecords} />
        ) : (
          <DataTable
            head={[d.forms.subject, d.common.category, d.common.status, d.common.actions]}
          >
            {documents.map((item) => (
              <tr key={item.id} className="text-ink-800 dark:text-ink-100">
                <td className="px-4 py-3 font-semibold">{pick(item, "title", locale)}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">
                  <Badge tone={item.isPublished ? "success" : "warning"}>
                    {item.isPublished ? d.common.published : d.common.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <AdminDeleteButton
                    action={adminDeleteDocument}
                    id={item.id}
                    locale={locale}
                    label={d.common.delete}
                  />
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </div>
  );
}
