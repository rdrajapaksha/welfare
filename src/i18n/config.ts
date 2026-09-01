export const locales = ["en", "si", "ta"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeMeta: Record<
  Locale,
  { label: string; englishLabel: string; htmlLang: string; ogLocale: string; short: string }
> = {
  en: { label: "English", englishLabel: "English", htmlLang: "en-LK", ogLocale: "en_LK", short: "EN" },
  si: { label: "සිංහල", englishLabel: "Sinhala", htmlLang: "si-LK", ogLocale: "si_LK", short: "සි" },
  ta: { label: "தமிழ்", englishLabel: "Tamil", htmlLang: "ta-LK", ogLocale: "ta_LK", short: "த" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Suffix used on multilingual Prisma columns, e.g. `titleEn` / `titleSi` / `titleTa`. */
export const fieldSuffix: Record<Locale, "En" | "Si" | "Ta"> = {
  en: "En",
  si: "Si",
  ta: "Ta",
};
