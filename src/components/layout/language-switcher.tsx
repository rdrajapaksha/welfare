"use client";

import { Check, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { localeMeta, locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  locale,
  label,
  tone = "dark",
}: {
  locale: Locale;
  label: string;
  tone?: "dark" | "light";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /** Swaps the leading locale segment, keeping the rest of the path intact. */
  const switchTo = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    const segments = (pathname ?? `/${locale}`).split("/");
    segments[1] = next;
    const target = segments.join("/") || `/${next}`;
    document.cookie = `hla_locale=${next};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => router.push(target));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition",
          pending && "opacity-60",
          tone === "light"
            ? "border-white/25 text-white hover:bg-white/10"
            : "border-ink-200 text-ink-700 hover:border-brand-400 hover:text-brand-700 dark:border-white/15 dark:text-ink-100 dark:hover:bg-white/10",
        )}
      >
        <Globe aria-hidden className="size-4" />
        <span>{localeMeta[locale].short}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-ink-200 bg-white p-1.5 shadow-lift dark:border-white/12 dark:bg-ink-900"
        >
          {locales.map((code) => (
            <li key={code} role="option" aria-selected={code === locale}>
              <button
                type="button"
                onClick={() => switchTo(code)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition",
                  code === locale
                    ? "bg-brand-50 font-semibold text-brand-800 dark:bg-brand-500/15 dark:text-brand-200"
                    : "text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-white/8",
                )}
              >
                <span>{localeMeta[code].label}</span>
                {code === locale && <Check aria-hidden className="size-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
