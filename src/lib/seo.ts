import type { Metadata } from "next";
import { locales, localeMeta, defaultLocale, type Locale } from "@/i18n/config";
import { siteConfig } from "./site";

type BuildMetadataArgs = {
  locale: Locale;
  title: string;
  description: string;
  /** Path without the locale prefix, e.g. "/donations" or "/news/my-post". */
  path?: string;
  image?: string;
  keywords?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
};

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function localePath(locale: Locale, path = "") {
  const clean = path === "/" ? "" : path;
  return `/${locale}${clean.startsWith("/") || clean === "" ? clean : `/${clean}`}`;
}

/** hreflang map so Google serves the right language variant of every page. */
export function buildAlternates(path = "") {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[localeMeta[locale].htmlLang] = absoluteUrl(localePath(locale, path));
  }
  languages["x-default"] = absoluteUrl(localePath(defaultLocale, path));
  return languages;
}

export function buildMetadata({
  locale,
  title,
  description,
  path = "",
  image,
  keywords,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: BuildMetadataArgs): Metadata {
  const canonical = absoluteUrl(localePath(locale, path));
  const ogImage = image ?? absoluteUrl(`/${locale}/opengraph-image`);

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical,
      languages: buildAlternates(path),
    },
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeMeta[l].ogLocale),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

// ---------------------------------------------------------------------------
// JSON-LD structured data
// ---------------------------------------------------------------------------

export function organizationSchema(locale: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: absoluteUrl(localePath(locale)),
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/og-default.png"),
    description,
    foundingDate: String(siteConfig.foundedYear),
    identifier: siteConfig.registrationNo,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address.street,
      addressLocality: siteConfig.contact.address.locality,
      addressRegion: siteConfig.contact.address.region,
      postalCode: siteConfig.contact.address.postalCode,
      addressCountry: siteConfig.contact.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.contact.geo.latitude,
      longitude: siteConfig.contact.geo.longitude,
    },
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    sameAs: siteConfig.social.map((s) => s.href),
    knowsLanguage: ["en", "si", "ta"],
  };
}

export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: absoluteUrl(localePath(locale)),
    name: siteConfig.name,
    inLanguage: localeMeta[locale].htmlLang,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl(localePath(locale, "/news"))}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(
  locale: Locale,
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(localePath(locale, item.path)),
    })),
  };
}

export function articleSchema(args: {
  locale: Locale;
  headline: string;
  description: string;
  path: string;
  published: Date;
  modified: Date;
  author: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: args.headline,
    description: args.description,
    mainEntityOfPage: absoluteUrl(localePath(args.locale, args.path)),
    datePublished: args.published.toISOString(),
    dateModified: args.modified.toISOString(),
    inLanguage: localeMeta[args.locale].htmlLang,
    author: { "@type": "Organization", name: args.author },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    ...(args.image ? { image: [args.image] } : {}),
  };
}

export function eventSchema(args: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
  startsAt: Date;
  endsAt: Date | null;
  venue: string;
  city: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: args.name,
    description: args.description,
    startDate: args.startsAt.toISOString(),
    ...(args.endsAt ? { endDate: args.endsAt.toISOString() } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: absoluteUrl(localePath(args.locale, args.path)),
    inLanguage: localeMeta[args.locale].htmlLang,
    location: {
      "@type": "Place",
      name: args.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: args.city,
        addressCountry: "LK",
      },
    },
    organizer: { "@id": `${siteConfig.url}/#organization` },
    isAccessibleForFree: true,
    ...(args.image ? { image: [args.image] } : {}),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function donateActionSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: "Donate to Heart Link Allianz Welfare Society - Sri Lanka",
    recipient: { "@id": `${siteConfig.url}/#organization` },
    target: {
      "@type": "EntryPoint",
      urlTemplate: absoluteUrl(localePath(locale, "/donations")),
    },
  };
}
