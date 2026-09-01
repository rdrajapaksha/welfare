import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Noto_Sans_Sinhala, Noto_Sans_Tamil, Plus_Jakarta_Sans } from "next/font/google";
import { getDictionary } from "@/i18n";
import { isLocale, localeMeta, locales, type Locale } from "@/i18n/config";
import { getCurrentUser } from "@/lib/auth";
import { mainNav } from "@/lib/nav";
import { buildAlternates, organizationSchema, websiteSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { JsonLd } from "@/components/ui/json-ld";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const notoSinhala = Noto_Sans_Sinhala({
  variable: "--font-noto-sinhala",
  subsets: ["sinhala"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = await getDictionary(locale);

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: d.meta.defaultTitle, template: d.meta.titleTemplate },
    description: d.meta.description,
    keywords: d.meta.keywords,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "nonprofit",
    formatDetection: { telephone: true, address: true, email: true },
    alternates: {
      canonical: `${siteConfig.url}/${locale}`,
      languages: buildAlternates(""),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [{ url: "/icon.png", type: "image/png", sizes: "256x256" }],
      apple: [{ url: "/icon.png", sizes: "256x256" }],
    },
    manifest: "/manifest.webmanifest",
    other: { "theme-color": "#ec2a2b" },
  };
}

const themeScript = `(function(){try{var s=localStorage.getItem("hla-theme");var m=window.matchMedia("(prefers-color-scheme: dark)").matches;if(s==="dark"||(!s&&false&&m)){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const [d, user] = await Promise.all([getDictionary(locale), getCurrentUser()]);
  const isAdmin = user?.role === "ADMIN" || user?.role === "EDITOR";

  return (
    <html
      lang={localeMeta[locale].htmlLang}
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} ${notoSinhala.variable} ${notoTamil.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <JsonLd data={[organizationSchema(locale, d.meta.description), websiteSchema(locale)]} />

        <SiteHeader
          locale={locale}
          nav={mainNav(d)}
          isAuthenticated={Boolean(user)}
          isAdmin={isAdmin}
          labels={{
            brandName: d.brand.name,
            brandFull: d.brand.full,
            brandTagline: d.brand.tagline,
            language: d.a11y.languageSwitcher,
            login: d.nav.login,
            dashboard: d.nav.dashboard,
            donate: d.nav.donateNow,
            join: d.nav.join,
            openMenu: d.nav.openMenu,
            closeMenu: d.nav.closeMenu,
            skipToContent: d.nav.skipToContent,
            hotline: d.contact.hotline,
            mainNav: d.a11y.mainNav,
          }}
        />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter locale={locale} d={d} />
        <ScrollToTop label={d.a11y.scrollTop} />
      </body>
    </html>
  );
}
