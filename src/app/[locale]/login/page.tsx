import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { LoginForm } from "@/components/forms/login-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({ locale: raw, title: d.auth.loginTitle, description: d.auth.loginSubtitle, path: "/login", noIndex: true });
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { next } = await searchParams;
  const d = await getDictionary(locale);

  return (
    <section className="container-page grid min-h-[70vh] items-center py-16 lg:grid-cols-2 lg:gap-16">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-brand-700 uppercase">{d.brand.full}</p>
        <h1 className="mt-4 text-4xl font-extrabold">{d.auth.loginTitle}</h1>
        <p className="mt-3 text-ink-600 dark:text-ink-300">{d.auth.loginSubtitle}</p>
        <div className="mt-8 max-w-md rounded-3xl border border-ink-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-ink-900">
          <LoginForm locale={locale} d={d} nextPath={next} />
          <p className="mt-5 text-sm text-ink-500">
            {d.auth.noAccount}{" "}
            <Link href={`/${locale}/join`} className="font-bold text-brand-700">
              {d.auth.joinCta}
            </Link>
          </p>
          <p className="mt-3 text-xs text-ink-400">{d.auth.forgotNote}</p>
        </div>
      </div>
      <div className="hidden rounded-3xl bg-ink-950 p-8 text-white lg:block">
        <p className="text-sm font-bold tracking-wider text-brand-300 uppercase">{d.auth.demoTitle}</p>
        <p className="mt-2 text-sm text-ink-300">{d.auth.demoNote}</p>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="rounded-2xl bg-white/5 p-4">
            <dt className="font-bold">{d.auth.demoAdmin}</dt>
            <dd className="mt-1 font-mono text-ink-200">admin@heartlinkallianz.lk / Admin@hla2026</dd>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <dt className="font-bold">{d.auth.demoMember}</dt>
            <dd className="mt-1 font-mono text-ink-200">member@heartlinkallianz.lk / Member@hla2026</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
