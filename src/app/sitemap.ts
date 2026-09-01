import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, localePath } from "@/lib/seo";

const STATIC_PATHS = [
  "",
  "/about",
  "/about/committee",
  "/services",
  "/projects",
  "/news",
  "/events",
  "/members",
  "/join",
  "/gallery",
  "/donations",
  "/donations/updates",
  "/transparency",
  "/partners",
  "/faq",
  "/volunteer",
  "/documents",
  "/contact",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programmes, projects, posts, events, albums] = await Promise.all([
    prisma.programme.findMany({ where: { isActive: true }, select: { slug: true } }),
    prisma.project.findMany({ select: { slug: true } }),
    prisma.newsPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.event.findMany({ where: { isPublished: true }, select: { slug: true, startsAt: true } }),
    prisma.galleryAlbum.findMany({ where: { isPublished: true }, select: { slug: true, takenAt: true } }),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: absoluteUrl(localePath(locale, path)),
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : path === "/donations" || path === "/transparency" ? 0.9 : 0.7,
      });
    }
    for (const item of programmes) {
      entries.push({
        url: absoluteUrl(localePath(locale, `/services/${item.slug}`)),
        changeFrequency: "monthly",
        priority: 0.65,
      });
    }
    for (const item of projects) {
      entries.push({
        url: absoluteUrl(localePath(locale, `/projects/${item.slug}`)),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    for (const item of posts) {
      entries.push({
        url: absoluteUrl(localePath(locale, `/news/${item.slug}`)),
        lastModified: item.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    for (const item of events) {
      entries.push({
        url: absoluteUrl(localePath(locale, `/events/${item.slug}`)),
        lastModified: item.startsAt,
        changeFrequency: "weekly",
        priority: 0.65,
      });
    }
    for (const item of albums) {
      entries.push({
        url: absoluteUrl(localePath(locale, `/gallery/${item.slug}`)),
        lastModified: item.takenAt,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return entries;
}
