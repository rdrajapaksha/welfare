import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/i18n/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const intlLocale: Record<Locale, string> = {
  en: "en-LK",
  si: "si-LK",
  ta: "ta-LK",
};

export function formatCurrency(amount: number, locale: Locale = "en", compact = false) {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  })
    .format(amount)
    .replace("LKR", "Rs.");
}

export function formatNumber(value: number, locale: Locale = "en", compact = false) {
  return new Intl.NumberFormat(intlLocale[locale], {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
}

export function formatDate(date: Date | string, locale: Locale = "en", withTime = false) {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(intlLocale[locale], {
    dateStyle: "long",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(value);
}

export function formatDateShort(date: Date | string, locale: Locale = "en") {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium" }).format(value);
}

export function formatMonthYear(year: number, month: number, locale: Locale = "en") {
  return new Intl.DateTimeFormat(intlLocale[locale], { month: "short", year: "2-digit" }).format(
    new Date(year, month - 1, 1),
  );
}

/** Splits a date into parts for the compact calendar chip used on event cards. */
export function dateParts(date: Date | string, locale: Locale = "en") {
  const value = typeof date === "string" ? new Date(date) : date;
  return {
    day: new Intl.DateTimeFormat(intlLocale[locale], { day: "2-digit" }).format(value),
    month: new Intl.DateTimeFormat(intlLocale[locale], { month: "short" }).format(value),
    year: value.getFullYear().toString(),
    time: new Intl.DateTimeFormat(intlLocale[locale], { timeStyle: "short" }).format(value),
  };
}

export function readingTime(text: string) {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function truncate(text: string, max = 160) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function percent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

export function formatFileSize(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** Deterministic pseudo-random helper so seeded demo data renders consistently. */
export function hashToIndex(seed: string, length: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % Math.max(1, length);
}

export function maskNic(nic: string) {
  if (nic.length <= 4) return "****";
  return `${nic.slice(0, 2)}${"*".repeat(Math.max(0, nic.length - 5))}${nic.slice(-3)}`;
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return phone;
  return `${digits.slice(0, 3)} ••• ${digits.slice(-3)}`;
}

export function generateReference(prefix: string) {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}
