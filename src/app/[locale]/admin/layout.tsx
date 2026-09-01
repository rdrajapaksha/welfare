import { requireAdmin } from "@/lib/auth";
import { getDictionary, type Locale } from "@/i18n";
import { adminNav } from "@/lib/nav";
import { DashShell } from "@/components/layout/dash-shell";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  await requireAdmin(locale, `/${locale}/admin`);
  const d = await getDictionary(locale);

  return (
    <DashShell locale={locale} title={d.admin.title} items={adminNav(d)} logoutLabel={d.nav.logout}>
      {children}
    </DashShell>
  );
}
