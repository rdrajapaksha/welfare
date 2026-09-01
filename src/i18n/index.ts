import en, { type Dictionary } from "./dictionaries/en";
import { defaultLocale, fieldSuffix, isLocale, type Locale } from "./config";

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: async () => en,
  si: async () => (await import("./dictionaries/si")).default,
  ta: async () => (await import("./dictionaries/ta")).default,
};

export async function getDictionary(locale: string): Promise<Dictionary> {
  const key: Locale = isLocale(locale) ? locale : defaultLocale;
  return loaders[key]();
}

/**
 * Reads a translated column off a Prisma record, e.g. `pick(post, "title", "si")`
 * resolves `post.titleSi` and falls back to English when a translation is blank.
 */
export function pick<T extends Record<string, unknown>, K extends string>(
  record: T,
  field: K,
  locale: Locale,
): string {
  const localized = record[`${field}${fieldSuffix[locale]}` as keyof T];
  if (typeof localized === "string" && localized.trim().length > 0) return localized;
  const fallback = record[`${field}En` as keyof T];
  return typeof fallback === "string" ? fallback : "";
}

export type { Dictionary };
export * from "./config";
