"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, LayoutDashboard, Mail, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { NavItem } from "@/lib/nav";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";

type HeaderLabels = {
  brandName: string;
  brandFull: string;
  brandTagline: string;
  language: string;
  login: string;
  dashboard: string;
  donate: string;
  join: string;
  openMenu: string;
  closeMenu: string;
  skipToContent: string;
  hotline: string;
  mainNav: string;
};

export function SiteHeader({
  locale,
  nav,
  labels,
  isAuthenticated,
  isAdmin,
}: {
  locale: Locale;
  nav: NavItem[];
  labels: HeaderLabels;
  isAuthenticated: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname() ?? "";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const href = (path: string) => `/${locale}${path === "/" ? "" : path}`;

  const isActive = (path: string) => {
    const full = href(path);
    if (path === "/") return pathname === `/${locale}` || pathname === `/${locale}/`;
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  const dashboardHref = isAdmin ? href("/admin") : href("/dashboard");

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {labels.skipToContent}
      </a>

      {/* Utility strip */}
      <div className="no-print hidden bg-ink-950 text-ink-200 lg:block">
        <div className="container-page flex h-10 items-center justify-between text-[0.8125rem]">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${siteConfig.contact.hotline.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 transition hover:text-white"
            >
              <Phone aria-hidden className="size-3.5" />
              <span className="text-ink-400">{labels.hotline}:</span>
              <span className="font-semibold text-white">{siteConfig.contact.hotlineDisplay}</span>
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="inline-flex items-center gap-1.5 transition hover:text-white"
            >
              <Mail aria-hidden className="size-3.5" />
              {siteConfig.contact.email}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-ink-400">{siteConfig.registrationNo}</span>
            <span aria-hidden className="h-3.5 w-px bg-white/20" />
            {isAuthenticated ? (
              <Link href={dashboardHref} className="inline-flex items-center gap-1.5 font-semibold text-white">
                <LayoutDashboard aria-hidden className="size-3.5" />
                {labels.dashboard}
              </Link>
            ) : (
              <Link href={href("/login")} className="font-semibold text-white transition hover:text-brand-300">
                {labels.login}
              </Link>
            )}
          </div>
        </div>
      </div>

      <header
        className={cn(
          "no-print sticky top-0 z-50 overflow-x-clip transition-all duration-300",
          scrolled
            ? "glass-panel border-b border-ink-200/60 shadow-soft dark:border-white/10"
            : "border-b border-transparent bg-canvas dark:bg-ink-950",
        )}
      >
        {/* Brand bar */}
        <div className="container-page flex items-center gap-2.5 py-2">
          <Link href={href("/")} className="group flex min-w-0 flex-1 items-center gap-2.5">
            <span className="anim-enter flex shrink-0 flex-col items-center gap-0.5">
              <Image
                src="/logo.png"
                alt={labels.brandFull}
                width={44}
                height={44}
                priority
                className="logo-hover size-9 object-contain group-hover:scale-[1.04] sm:size-10"
              />
              <span className="anim-fade anim-delay-2 font-times max-w-[8.5rem] text-center text-[0.62rem] leading-snug text-ink-800 italic sm:max-w-[9.5rem] sm:text-[0.7rem] dark:text-ink-200">
                {labels.brandTagline}
              </span>
            </span>
            <span className="anim-enter anim-delay-1 min-w-0 text-[0.75rem] leading-snug font-extrabold tracking-tight text-ink-950 sm:text-[0.88rem] sm:leading-tight lg:text-[0.95rem] dark:text-white">
              {labels.brandFull}
            </span>
          </Link>

          <div className="anim-fade anim-delay-3 flex shrink-0 items-center gap-2">
            <div className="hidden sm:block">
              <LanguageSwitcher locale={locale} label={labels.language} />
            </div>

            <Link
              href={href("/donations")}
              className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-600 px-3 text-sm font-bold text-white shadow-[0_10px_26px_-12px_rgb(236_42_43/0.5)] transition-all duration-300 hover:-translate-y-px hover:bg-brand-700 hover:shadow-[0_14px_30px_-12px_rgb(236_42_43/0.55)] active:translate-y-0 sm:px-3.5"
            >
              <Heart aria-hidden className="size-3.5 transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden sm:inline">{labels.donate}</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={labels.openMenu}
              aria-expanded={mobileOpen}
              className="grid size-9 place-items-center rounded-full border border-ink-200 text-ink-800 transition-all duration-200 hover:border-brand-400 hover:text-brand-700 xl:hidden dark:border-white/15 dark:text-white"
            >
              <Menu aria-hidden className="size-4.5" />
            </button>
          </div>
        </div>

        {/* Centered desktop nav */}
        <nav
          aria-label={labels.mainNav}
          className="anim-fade anim-delay-2 hidden border-t border-ink-200/70 xl:block dark:border-white/10"
        >
          <ul className="container-page flex flex-wrap items-center justify-center gap-x-0.5 gap-y-0.5 py-1">
            {nav.map((item) => (
              <li key={item.label} className="group relative">
                <Link
                  href={href(item.href)}
                  className={cn(
                    "nav-link-motion inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[0.78rem] font-semibold whitespace-nowrap",
                    isActive(item.href)
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                      : "text-ink-700 hover:bg-ink-100/70 hover:text-brand-700 dark:text-ink-200 dark:hover:bg-white/8 dark:hover:text-brand-300",
                  )}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown
                      aria-hidden
                      className="size-3.5 transition-transform duration-200 group-hover:rotate-180"
                    />
                  )}
                </Link>

                {item.children && (
                  <div className="pointer-events-none absolute top-full left-1/2 z-50 w-64 -translate-x-1/2 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                    <ul className="overflow-hidden rounded-2xl border border-ink-200 bg-white p-2 shadow-lift dark:border-white/12 dark:bg-ink-900">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={href(child.href)}
                            className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-800 dark:text-ink-200 dark:hover:bg-white/8 dark:hover:text-white"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-100 xl:hidden">
          <button
            type="button"
            aria-label={labels.closeMenu}
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-canvas shadow-2xl dark:bg-ink-950">
            <div className="flex min-h-18 shrink-0 items-center justify-between gap-3 border-b border-ink-200 px-5 py-3 dark:border-white/10">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex shrink-0 flex-col items-center gap-1">
                  <Image
                    src="/logo.png"
                    alt={labels.brandFull}
                    width={40}
                    height={40}
                    className="size-10 object-contain"
                  />
                  <span className="font-times max-w-[8rem] text-center text-[0.7rem] leading-snug text-ink-700 italic dark:text-ink-200">
                    {labels.brandTagline}
                  </span>
                </span>
                <span className="text-sm leading-snug font-extrabold text-ink-950 dark:text-white">
                  {labels.brandFull}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label={labels.closeMenu}
                className="grid size-9 place-items-center rounded-full border border-ink-200 text-ink-700 dark:border-white/15 dark:text-white"
              >
                <X aria-hidden className="size-4.5" />
              </button>
            </div>

            <nav className="scrollbar-slim flex-1 overflow-y-auto px-4 py-5">
              <ul className="flex flex-col gap-1">
                {nav.map((item) => {
                  const expanded = openSection === item.label;
                  return (
                    <li key={item.label}>
                      <div className="flex items-center">
                        <Link
                          href={href(item.href)}
                          className={cn(
                            "flex-1 rounded-xl px-3 py-3 text-[0.9375rem] font-semibold transition",
                            isActive(item.href)
                              ? "bg-brand-50 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200"
                              : "text-ink-800 hover:bg-ink-100/70 dark:text-ink-100 dark:hover:bg-white/8",
                          )}
                        >
                          {item.label}
                        </Link>
                        {item.children && (
                          <button
                            type="button"
                            aria-label={item.label}
                            aria-expanded={expanded}
                            onClick={() => setOpenSection(expanded ? null : item.label)}
                            className="grid size-9 place-items-center rounded-lg text-ink-500 dark:text-ink-300"
                          >
                            <ChevronDown
                              aria-hidden
                              className={cn("size-4 transition-transform", expanded && "rotate-180")}
                            />
                          </button>
                        )}
                      </div>
                      {item.children && expanded && (
                        <ul className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-ink-200 pl-3 dark:border-white/12">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={href(child.href)}
                                className="block rounded-lg px-3 py-2.5 text-sm text-ink-600 transition hover:text-brand-700 dark:text-ink-300 dark:hover:text-brand-300"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="shrink-0 space-y-3 border-t border-ink-200 p-5 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <LanguageSwitcher locale={locale} label={labels.language} />
                <Link
                  href={isAuthenticated ? dashboardHref : href("/login")}
                  className="text-sm font-semibold text-ink-700 dark:text-ink-200"
                >
                  {isAuthenticated ? labels.dashboard : labels.login}
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={href("/join")}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-ink-300 text-sm font-bold text-ink-900 dark:border-white/20 dark:text-white"
                >
                  {labels.join}
                </Link>
                <Link
                  href={href("/donations")}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-brand-600 text-sm font-bold text-white shadow-[0_10px_26px_-12px_rgb(236_42_43/0.45)] transition hover:bg-brand-700"
                >
                  <Heart aria-hidden className="size-4" />
                  {labels.donate}
                </Link>
              </div>
              <a
                href={`tel:${siteConfig.contact.hotline.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 text-sm text-ink-600 dark:text-ink-300"
              >
                <Phone aria-hidden className="size-4" />
                {siteConfig.contact.hotlineDisplay}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
