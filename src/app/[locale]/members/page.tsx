import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { SRI_LANKA_DISTRICTS } from "@/lib/constants";
import { membershipTypeLabel } from "@/lib/labels";
import { initials } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { Input, Select } from "@/components/ui/form";
import { Button, ButtonLink } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const d = await getDictionary(raw);
  return buildMetadata({
    locale: raw,
    title: d.members.directoryTitle,
    description: d.members.directorySubtitle,
    path: "/members",
  });
}

export default async function MembersDirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; district?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { q: qRaw, district: districtRaw } = await searchParams;
  const d = await getDictionary(locale);
  const q = qRaw?.trim() ?? "";
  const district = SRI_LANKA_DISTRICTS.includes(districtRaw as (typeof SRI_LANKA_DISTRICTS)[number])
    ? districtRaw!
    : "";

  const members = await prisma.member.findMany({
    where: {
      showInDirectory: true,
      status: "ACTIVE",
      ...(district ? { district } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q } },
              { city: { contains: q } },
              { membershipNo: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      membershipType: true,
      city: true,
      district: true,
    },
  });

  return (
    <>
      <PageHero
        locale={locale}
        title={d.members.directoryTitle}
        subtitle={d.members.directorySubtitle}
        crumbLabel={d.a11y.breadcrumb}
        crumbs={[{ name: d.nav.home, href: "/" }, { name: d.members.directoryTitle }]}
      />
      <Section>
        <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:bg-teal-500/10 dark:text-teal-100">
          {d.members.directoryPrivacyNote}
        </p>
        <form action={`/${locale}/members`} className="mt-6 grid gap-3 sm:grid-cols-12">
          <label className="relative sm:col-span-6">
            <span className="sr-only">{d.common.search}</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
            <Input name="q" defaultValue={q} placeholder={d.members.searchPlaceholder} className="pl-10" />
          </label>
          <div className="sm:col-span-4">
            <Select name="district" defaultValue={district} aria-label={d.members.filterDistrict}>
              <option value="">{d.members.filterDistrict} — {d.common.all}</option>
              {SRI_LANKA_DISTRICTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" fullWidth>
              {d.common.search}
            </Button>
          </div>
        </form>
        {members.length === 0 ? (
          <EmptyState title={d.common.noResults} description={d.common.noResultsHint} className="mt-10" />
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <li key={member.id} className="card-surface flex gap-4 p-5">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-sm font-extrabold text-brand-800 dark:bg-brand-500/15 dark:text-brand-200">
                  {initials(member.fullName)}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-ink-950 dark:text-white">{member.fullName}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge>{membershipTypeLabel(d, member.membershipType)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                    {member.city}, {member.district}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="card-surface mt-12 p-8 text-center">
          <h2 className="text-xl font-extrabold">{d.members.joinTitle}</h2>
          <p className="mx-auto mt-2 max-w-xl text-ink-600 dark:text-ink-300">{d.members.joinSubtitle}</p>
          <ButtonLink href={`/${locale}/join`} className="mt-5">
            {d.members.applyNow}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
