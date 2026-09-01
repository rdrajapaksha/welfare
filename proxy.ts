import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "./src/i18n/config";

const LOCALE_COOKIE = "hla_locale";

function detectLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }

  const header = request.headers.get("accept-language");
  if (header) {
    const preferred = header
      .split(",")
      .map((part) => {
        const [tag, q] = part.trim().split(";q=");
        return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { tag } of preferred) {
      const base = tag.split("-")[0];
      if ((locales as readonly string[]).includes(base)) return base;
    }
  }

  return defaultLocale;
}

/**
 * Redirects unprefixed paths to a locale-prefixed URL so every page has a
 * single canonical, indexable address per language (`/en/...`, `/si/...`, `/ta/...`).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocale) {
    const current = pathname.split("/")[1];
    const response = NextResponse.next();
    if (request.cookies.get(LOCALE_COOKIE)?.value !== current) {
      response.cookies.set(LOCALE_COOKIE, current, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }

  const locale = detectLocale(request);
  const target = new URL(`/${locale}${pathname === "/" ? "" : pathname}${search}`, request.url);
  return NextResponse.redirect(target);
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals, API routes and files that already
     * have an extension (images, robots.txt, sitemap.xml, uploads, …).
     */
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
