import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PlayCircle,
  Share2,
  ShieldCheck,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";
import { footerNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";
import { NewsletterForm } from "@/components/forms/newsletter-form";

const socialIcons = {
  facebook: Share2,
  instagram: Camera,
  youtube: PlayCircle,
  whatsapp: MessageCircle,
} as const;

export function SiteFooter({ locale, d }: { locale: Locale; d: Dictionary }) {
  const href = (path: string) => `/${locale}${path === "/" ? "" : path}`;
  const columns = footerNav(d);
  const year = new Date().getFullYear();

  return (
    <footer className="no-print mt-auto bg-ink-950 text-ink-200">
      <div className="mesh-ink border-b border-white/8">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href={href("/")} className="inline-flex max-w-full items-center gap-3">
              <Image
                src="/logo.png"
                alt={d.brand.full}
                width={56}
                height={56}
                className="size-14 shrink-0 object-contain"
              />
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-base font-extrabold text-white sm:text-lg">{d.brand.full}</span>
                <span className="text-xs font-medium text-brand-300">{d.brand.tagline}</span>
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-300">{d.footer.aboutText}</p>

            <div className="mt-6 space-y-2.5 text-sm">
              <p className="flex items-start gap-2.5">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <span>
                  {siteConfig.contact.address.street}, {siteConfig.contact.address.locality}{" "}
                  {siteConfig.contact.address.postalCode}, {siteConfig.contact.address.countryName}
                </span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone aria-hidden className="size-4 shrink-0 text-brand-400" />
                <a href={`tel:${siteConfig.contact.phone}`} className="transition hover:text-white">
                  {siteConfig.contact.phoneDisplay}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail aria-hidden className="size-4 shrink-0 text-brand-400" />
                <a href={`mailto:${siteConfig.contact.email}`} className="transition hover:text-white">
                  {siteConfig.contact.email}
                </a>
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold tracking-[0.14em] text-ink-400 uppercase">
                {d.footer.followUs}
              </p>
              <ul
                aria-label={d.a11y.socialLinks}
                className="mt-3 flex flex-wrap items-center gap-2"
              >
                {siteConfig.social.map((item) => {
                  const Icon = socialIcons[item.key as keyof typeof socialIcons] ?? MessageCircle;
                  return (
                    <li key={item.key}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer me"
                        aria-label={item.label}
                        className="grid size-10 place-items-center rounded-full border border-white/15 text-ink-200 transition hover:border-brand-400 hover:bg-brand-600 hover:text-white"
                      >
                        <Icon aria-hidden className="size-4.5" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <nav
            aria-label={d.a11y.footerNav}
            className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2"
          >
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-bold text-white">{column.title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <Link
                        href={href(link.href)}
                        className="text-ink-300 transition hover:text-brand-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-white">{d.footer.newsletterTitle}</h3>
            <p className="mt-3 text-sm text-ink-300">{d.footer.newsletterText}</p>
            <div className="mt-4">
              <NewsletterForm
                locale={locale}
                labels={{
                  placeholder: d.forms.emailPlaceholder,
                  cta: d.footer.newsletterCta,
                  success: d.footer.newsletterSuccess,
                  exists: d.footer.newsletterExists,
                  error: d.common.error,
                  email: d.forms.email,
                }}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/12 bg-white/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck aria-hidden className="size-4 text-teal-300" />
                {d.transparency.pledgeTitle}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-300">{d.transparency.pledge2}</p>
              <Link
                href={href("/transparency")}
                className="mt-3 inline-block text-xs font-bold text-brand-300 underline underline-offset-4 transition hover:text-brand-200"
              >
                {d.transparency.reportsTitle}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col gap-3 py-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {d.brand.full}. {d.footer.rights} · {d.brand.regNo}
        </p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <li>
            <Link href={href("/privacy")} className="transition hover:text-white">
              {d.footer.privacy}
            </Link>
          </li>
          <li>
            <Link href={href("/terms")} className="transition hover:text-white">
              {d.footer.terms}
            </Link>
          </li>
          <li>
            <Link href={href("/faq")} className="transition hover:text-white">
              {d.nav.faq}
            </Link>
          </li>
          <li>
            <Link href={href("/contact")} className="transition hover:text-white">
              {d.nav.contact}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
