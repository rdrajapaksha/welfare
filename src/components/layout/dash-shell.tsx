"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardCheck,
  FolderOpen,
  HandCoins,
  HeartHandshake,
  Images,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  LogOut,
  Mail,
  Megaphone,
  Newspaper,
  Settings,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  UserRound,
  HeartHandshake,
  Wallet,
  CalendarDays,
  Megaphone,
  LifeBuoy,
  FolderOpen,
  ChartLine: LineChart,
  Users,
  FileCheck: ClipboardCheck,
  HandCoins,
  Newspaper,
  Images,
  Mail,
  Settings,
};

export function DashShell({
  locale,
  title,
  items,
  logoutLabel,
  children,
}: {
  locale: Locale;
  title: string;
  items: { label: string; href: string; icon: string }[];
  logoutLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <div className="card-surface sticky top-28 p-3">
            <p className="px-3 pt-2 pb-3 text-xs font-bold tracking-[0.14em] text-ink-400 uppercase">
              {title}
            </p>
            <nav>
              <ul className="grid gap-0.5">
                {items.map((item) => {
                  const href = `/${locale}${item.href}`;
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  const Icon = ICONS[item.icon] ?? LayoutDashboard;
                  return (
                    <li key={item.href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                          active
                            ? "bg-brand-50 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200"
                            : "text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-white/8",
                        )}
                      >
                        <Icon aria-hidden className="size-4 shrink-0 opacity-80" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <form action={logoutAction} className="mt-3 border-t border-ink-100 pt-3 dark:border-white/10">
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-ink-50 hover:text-brand-700 dark:text-ink-300 dark:hover:bg-white/8"
              >
                <LogOut aria-hidden className="size-4" />
                {logoutLabel}
              </button>
            </form>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
