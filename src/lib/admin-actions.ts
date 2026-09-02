"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "./auth";
import { prisma } from "./prisma";
import { slugify } from "./utils";
import type { Locale } from "@/i18n/config";

function localeOf(formData: FormData): Locale {
  const value = String(formData.get("locale") || "en");
  return (value === "si" || value === "ta" ? value : "en") as Locale;
}

function revalidateAdmin(locale: string, paths: string[] = []) {
  revalidatePath(`/${locale}/admin`);
  for (const path of paths) {
    revalidatePath(`/${locale}${path}`);
    revalidatePath(`/${locale}/admin${path.replace(/^\//, "/")}`);
  }
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true" || formData.get(key) === "1";
}

function intOr(formData: FormData, key: string, fallback: number | null = null) {
  const raw = str(formData, key);
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function dateOrNull(formData: FormData, key: string) {
  const raw = str(formData, key);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export async function adminUpsertEvent(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  const titleEn = str(formData, "titleEn");
  if (!titleEn) return;

  const slugBase = str(formData, "slug") || slugify(titleEn);
  let slug = slugBase;
  const clash = await prisma.event.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) slug = `${slugBase}-${Date.now().toString(36)}`;

  const startsAt = dateOrNull(formData, "startsAt") ?? new Date();
  const endsAt = dateOrNull(formData, "endsAt");
  const data = {
    slug,
    titleEn,
    titleSi: str(formData, "titleSi") || titleEn,
    titleTa: str(formData, "titleTa") || titleEn,
    summaryEn: str(formData, "summaryEn"),
    summarySi: str(formData, "summarySi") || str(formData, "summaryEn"),
    summaryTa: str(formData, "summaryTa") || str(formData, "summaryEn"),
    bodyEn: str(formData, "bodyEn") || `<p>${str(formData, "summaryEn")}</p>`,
    bodySi: str(formData, "bodySi") || str(formData, "bodyEn") || `<p>${str(formData, "summaryEn")}</p>`,
    bodyTa: str(formData, "bodyTa") || str(formData, "bodyEn") || `<p>${str(formData, "summaryEn")}</p>`,
    venue: str(formData, "venue") || "HLA Association Hall",
    city: str(formData, "city") || "Nugegoda",
    startsAt,
    endsAt,
    coverImage: str(formData, "coverImage") || "/media/general-meeting.svg",
    capacity: intOr(formData, "capacity"),
    registrationOpen: bool(formData, "registrationOpen"),
    isPublished: bool(formData, "isPublished"),
  };

  if (id) {
    await prisma.event.update({ where: { id }, data });
  } else {
    await prisma.event.create({ data });
  }

  revalidateAdmin(locale, ["/events", "/admin/events"]);
  redirect(`/${locale}/admin/events`);
}

export async function adminDeleteEvent(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.event.delete({ where: { id } });
  revalidateAdmin(locale, ["/events", "/admin/events"]);
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export async function adminUpdateMember(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;

  await prisma.member.update({
    where: { id },
    data: {
      fullName: str(formData, "fullName"),
      nameWithInitials: str(formData, "nameWithInitials") || str(formData, "fullName"),
      phone: str(formData, "phone"),
      whatsapp: str(formData, "whatsapp") || null,
      email: str(formData, "email") || null,
      addressLine1: str(formData, "addressLine1"),
      addressLine2: str(formData, "addressLine2") || null,
      city: str(formData, "city"),
      district: str(formData, "district"),
      occupation: str(formData, "occupation") || null,
      bloodGroup: str(formData, "bloodGroup") || null,
      membershipType: str(formData, "membershipType") || "ORDINARY",
      status: str(formData, "status") || "ACTIVE",
      emergencyName: str(formData, "emergencyName") || null,
      emergencyPhone: str(formData, "emergencyPhone") || null,
      bio: str(formData, "bio") || null,
      showInDirectory: bool(formData, "showInDirectory"),
    },
  });

  revalidateAdmin(locale, ["/members", "/admin/members"]);
  redirect(`/${locale}/admin/members/${id}`);
}

export async function adminCreateMember(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const fullName = str(formData, "fullName");
  const nic = str(formData, "nic");
  if (!fullName || !nic) return;

  const existing = await prisma.member.findUnique({ where: { nic } });
  if (existing) {
    redirect(`/${locale}/admin/members/${existing.id}`);
  }

  const count = await prisma.member.count();
  const membershipNo = str(formData, "membershipNo") || `HLA-${String(1000 + count + 1).padStart(4, "0")}`;
  const dob = dateOrNull(formData, "dateOfBirth") ?? new Date("1990-01-01");

  const created = await prisma.member.create({
    data: {
      membershipNo,
      fullName,
      nameWithInitials: str(formData, "nameWithInitials") || fullName,
      nic,
      dateOfBirth: dob,
      gender: str(formData, "gender") || "OTHER",
      occupation: str(formData, "occupation") || null,
      addressLine1: str(formData, "addressLine1") || "—",
      addressLine2: str(formData, "addressLine2") || null,
      city: str(formData, "city") || "Nugegoda",
      district: str(formData, "district") || "Colombo",
      phone: str(formData, "phone") || "0700000000",
      whatsapp: str(formData, "whatsapp") || null,
      email: str(formData, "email") || null,
      bloodGroup: str(formData, "bloodGroup") || null,
      membershipType: str(formData, "membershipType") || "ORDINARY",
      status: str(formData, "status") || "ACTIVE",
      showInDirectory: bool(formData, "showInDirectory"),
    },
  });

  revalidateAdmin(locale, ["/members", "/admin/members"]);
  redirect(`/${locale}/admin/members/${created.id}`);
}

export async function adminDeleteMember(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.member.delete({ where: { id } });
  revalidateAdmin(locale, ["/members", "/admin/members"]);
  redirect(`/${locale}/admin/members`);
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

export async function adminUpsertNews(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  const titleEn = str(formData, "titleEn");
  if (!titleEn) return;

  const slugBase = str(formData, "slug") || slugify(titleEn);
  let slug = slugBase;
  const clash = await prisma.newsPost.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) slug = `${slugBase}-${Date.now().toString(36)}`;

  const excerptEn = str(formData, "excerptEn");
  const data = {
    slug,
    category: str(formData, "category") || "NEWS",
    titleEn,
    titleSi: str(formData, "titleSi") || titleEn,
    titleTa: str(formData, "titleTa") || titleEn,
    excerptEn,
    excerptSi: str(formData, "excerptSi") || excerptEn,
    excerptTa: str(formData, "excerptTa") || excerptEn,
    bodyEn: str(formData, "bodyEn") || `<p>${excerptEn}</p>`,
    bodySi: str(formData, "bodySi") || str(formData, "bodyEn") || `<p>${excerptEn}</p>`,
    bodyTa: str(formData, "bodyTa") || str(formData, "bodyEn") || `<p>${excerptEn}</p>`,
    coverImage: str(formData, "coverImage") || "/media/annual-report.svg",
    author: str(formData, "author") || "Media Unit",
    tags: str(formData, "tags"),
    isFeatured: bool(formData, "isFeatured"),
    isPublished: bool(formData, "isPublished"),
  };

  if (id) {
    await prisma.newsPost.update({ where: { id }, data });
  } else {
    await prisma.newsPost.create({ data });
  }

  revalidateAdmin(locale, ["/news", "/admin/news"]);
  redirect(`/${locale}/admin/news`);
}

export async function adminDeleteNews(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.newsPost.delete({ where: { id } });
  revalidateAdmin(locale, ["/news", "/admin/news"]);
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export async function adminUpsertAlbum(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  const titleEn = str(formData, "titleEn");
  if (!titleEn) return;

  const slugBase = str(formData, "slug") || slugify(titleEn);
  let slug = slugBase;
  const clash = await prisma.galleryAlbum.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) slug = `${slugBase}-${Date.now().toString(36)}`;

  const coverImage = str(formData, "coverImage") || "/media/medical-camp.svg";
  const itemUrls = formData
    .getAll("itemUrl")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const data = {
    slug,
    category: str(formData, "category") || "EVENT",
    titleEn,
    titleSi: str(formData, "titleSi") || titleEn,
    titleTa: str(formData, "titleTa") || titleEn,
    captionEn: str(formData, "captionEn") || null,
    captionSi: str(formData, "captionSi") || null,
    captionTa: str(formData, "captionTa") || null,
    coverImage,
    takenAt: dateOrNull(formData, "takenAt") ?? new Date(),
    isPublished: bool(formData, "isPublished"),
  };

  if (id) {
    await prisma.galleryAlbum.update({ where: { id }, data });
    if (itemUrls.length) {
      await prisma.galleryItem.deleteMany({ where: { albumId: id } });
      await prisma.galleryItem.createMany({
        data: itemUrls.map((url, i) => ({
          albumId: id,
          type: url.includes("video") ? "VIDEO" : "PHOTO",
          url,
          thumbnail: url,
          sortOrder: i,
        })),
      });
    }
  } else {
    const album = await prisma.galleryAlbum.create({ data });
    const urls = itemUrls.length ? itemUrls : [coverImage];
    await prisma.galleryItem.createMany({
      data: urls.map((url, i) => ({
        albumId: album.id,
        type: "PHOTO",
        url,
        thumbnail: url,
        sortOrder: i,
      })),
    });
  }

  revalidateAdmin(locale, ["/gallery", "/admin/gallery"]);
  redirect(`/${locale}/admin/gallery`);
}

export async function adminDeleteAlbum(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.galleryAlbum.delete({ where: { id } });
  revalidateAdmin(locale, ["/gallery", "/admin/gallery"]);
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

export async function adminUpsertAnnouncement(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  const titleEn = str(formData, "titleEn");
  if (!titleEn) return;

  const bodyEn = str(formData, "bodyEn");
  const data = {
    titleEn,
    titleSi: str(formData, "titleSi") || titleEn,
    titleTa: str(formData, "titleTa") || titleEn,
    bodyEn,
    bodySi: str(formData, "bodySi") || bodyEn,
    bodyTa: str(formData, "bodyTa") || bodyEn,
    audience: str(formData, "audience") || "ALL",
    priority: str(formData, "priority") || "NORMAL",
    isPinned: bool(formData, "isPinned"),
    isPublished: bool(formData, "isPublished"),
  };

  if (id) await prisma.announcement.update({ where: { id }, data });
  else await prisma.announcement.create({ data });

  revalidateAdmin(locale, ["/dashboard/announcements", "/admin/announcements", "/admin/content"]);
  redirect(`/${locale}/admin/announcements`);
}

export async function adminDeleteAnnouncement(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.announcement.delete({ where: { id } });
  revalidateAdmin(locale, ["/dashboard/announcements", "/admin/announcements", "/admin/content"]);
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export async function adminUpsertFaq(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  const questionEn = str(formData, "questionEn");
  if (!questionEn) return;
  const answerEn = str(formData, "answerEn");

  const data = {
    category: str(formData, "category") || "GENERAL",
    questionEn,
    questionSi: str(formData, "questionSi") || questionEn,
    questionTa: str(formData, "questionTa") || questionEn,
    answerEn,
    answerSi: str(formData, "answerSi") || answerEn,
    answerTa: str(formData, "answerTa") || answerEn,
    sortOrder: intOr(formData, "sortOrder", 0) ?? 0,
    isPublished: bool(formData, "isPublished"),
  };

  if (id) await prisma.faq.update({ where: { id }, data });
  else await prisma.faq.create({ data });

  revalidateAdmin(locale, ["/faq", "/admin/content"]);
  redirect(`/${locale}/admin/content`);
}

export async function adminDeleteFaq(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.faq.delete({ where: { id } });
  revalidateAdmin(locale, ["/faq", "/admin/content"]);
}

// ---------------------------------------------------------------------------
// Partners
// ---------------------------------------------------------------------------

export async function adminUpsertPartner(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) return;

  const slugBase = str(formData, "slug") || slugify(name);
  let slug = slugBase;
  const clash = await prisma.partner.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) slug = `${slugBase}-${Date.now().toString(36)}`;

  const data = {
    name,
    slug,
    logoUrl: str(formData, "logoUrl") || "/partners/ceylon-trust-bank.svg",
    website: str(formData, "website") || null,
    tier: str(formData, "tier") || "PARTNER",
    descriptionEn: str(formData, "descriptionEn") || null,
    descriptionSi: str(formData, "descriptionSi") || null,
    descriptionTa: str(formData, "descriptionTa") || null,
    since: intOr(formData, "since"),
    sortOrder: intOr(formData, "sortOrder", 0) ?? 0,
    isActive: bool(formData, "isActive"),
  };

  if (id) await prisma.partner.update({ where: { id }, data });
  else await prisma.partner.create({ data });

  revalidateAdmin(locale, ["/partners", "/admin/content"]);
  redirect(`/${locale}/admin/content`);
}

export async function adminDeletePartner(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.partner.delete({ where: { id } });
  revalidateAdmin(locale, ["/partners", "/admin/content"]);
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function adminUpsertDocument(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  const titleEn = str(formData, "titleEn");
  if (!titleEn) return;

  const slugBase = str(formData, "slug") || slugify(titleEn);
  let slug = slugBase;
  const clash = await prisma.document.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) slug = `${slugBase}-${Date.now().toString(36)}`;

  const descriptionEn = str(formData, "descriptionEn");
  const data = {
    slug,
    category: str(formData, "category") || "GUIDE",
    titleEn,
    titleSi: str(formData, "titleSi") || titleEn,
    titleTa: str(formData, "titleTa") || titleEn,
    descriptionEn,
    descriptionSi: str(formData, "descriptionSi") || descriptionEn,
    descriptionTa: str(formData, "descriptionTa") || descriptionEn,
    fileUrl: str(formData, "fileUrl") || "/documents/constitution.pdf",
    fileType: str(formData, "fileType") || "PDF",
    fileSizeKb: intOr(formData, "fileSizeKb", 100) ?? 100,
    version: str(formData, "version") || "1.0",
    membersOnly: bool(formData, "membersOnly"),
    isPublished: bool(formData, "isPublished"),
  };

  if (id) await prisma.document.update({ where: { id }, data });
  else await prisma.document.create({ data });

  revalidateAdmin(locale, ["/documents", "/dashboard/documents", "/admin/content"]);
  redirect(`/${locale}/admin/content`);
}

export async function adminDeleteDocument(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.document.delete({ where: { id } });
  revalidateAdmin(locale, ["/documents", "/dashboard/documents", "/admin/content"]);
}

// ---------------------------------------------------------------------------
// Contact messages
// ---------------------------------------------------------------------------

export async function adminUpdateMessageStatus(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!id || !status) return;
  await prisma.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath(`/${locale}/admin/messages`);
}

export async function adminDeleteMessage(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath(`/${locale}/admin/messages`);
}

// ---------------------------------------------------------------------------
// Volunteers
// ---------------------------------------------------------------------------

export async function adminDeleteVolunteer(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.volunteerApplication.delete({ where: { id } });
  revalidatePath(`/${locale}/admin/volunteers`);
}

// ---------------------------------------------------------------------------
// Elections (AGM e-voting)
// ---------------------------------------------------------------------------

export async function adminUpsertElection(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  const titleEn = str(formData, "titleEn");
  if (!titleEn) return;

  const slugBase = str(formData, "slug") || slugify(titleEn);
  let slug = slugBase;
  const clash = await prisma.election.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) slug = `${slugBase}-${Date.now().toString(36)}`;

  const opensAt = dateOrNull(formData, "opensAt");
  const closesAt = dateOrNull(formData, "closesAt");

  const data = {
    slug,
    titleEn,
    titleSi: str(formData, "titleSi") || titleEn,
    titleTa: str(formData, "titleTa") || titleEn,
    descriptionEn: str(formData, "descriptionEn"),
    descriptionSi: str(formData, "descriptionSi") || str(formData, "descriptionEn"),
    descriptionTa: str(formData, "descriptionTa") || str(formData, "descriptionEn"),
    status: str(formData, "status") || "DRAFT",
    ...(opensAt ? { opensAt } : {}),
    closesAt,
  };

  if (id) await prisma.election.update({ where: { id }, data });
  else {
    await prisma.election.create({
      data: { ...data, opensAt: opensAt ?? new Date() },
    });
  }

  revalidateAdmin(locale, ["/dashboard/vote", "/admin/elections"]);
  redirect(`/${locale}/admin/elections`);
}

export async function adminAddCandidate(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const electionId = str(formData, "electionId");
  const name = str(formData, "name");
  const positionEn = str(formData, "positionEn");
  if (!electionId || !name || !positionEn) return;

  await prisma.electionCandidate.create({
    data: {
      electionId,
      name,
      positionEn,
      positionSi: str(formData, "positionSi") || positionEn,
      positionTa: str(formData, "positionTa") || positionEn,
      bio: str(formData, "bio") || null,
      sortOrder: intOr(formData, "sortOrder", 0) ?? 0,
    },
  });

  revalidateAdmin(locale, ["/dashboard/vote", "/admin/elections"]);
}

export async function adminDeleteCandidate(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.electionCandidate.delete({ where: { id } });
  revalidateAdmin(locale, ["/dashboard/vote", "/admin/elections"]);
}

export async function adminDeleteElection(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.election.delete({ where: { id } });
  revalidateAdmin(locale, ["/dashboard/vote", "/admin/elections"]);
}

// ---------------------------------------------------------------------------
// Suggestions
// ---------------------------------------------------------------------------

export async function adminUpdateSuggestion(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!id || !status) return;
  await prisma.suggestion.update({
    where: { id },
    data: { status, adminNote: str(formData, "adminNote") || null },
  });
  revalidatePath(`/${locale}/admin/suggestions`);
}

export async function adminDeleteSuggestion(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const id = str(formData, "id");
  if (!id) return;
  await prisma.suggestion.delete({ where: { id } });
  revalidatePath(`/${locale}/admin/suggestions`);
}

// ---------------------------------------------------------------------------
// Membership fees
// ---------------------------------------------------------------------------

export async function adminUpdateMembershipFees(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const { setMembershipFee } = await import("./membership-fees");

  const monthly = intOr(formData, "monthly", null);
  const registration = intOr(formData, "registration", null);

  if (monthly != null) await setMembershipFee("monthly", monthly);
  if (registration != null) await setMembershipFee("registration", registration);

  revalidateAdmin(locale, ["/join", "/dashboard", "/dashboard/payments", "/admin/fees", "/admin/members"]);
  redirect(`/${locale}/admin/fees?saved=1`);
}

export async function adminRecordMembershipPayment(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const { generateReference } = await import("./utils");
  const { getMembershipFees } = await import("./membership-fees");

  const memberId = str(formData, "memberId");
  const periodYear = intOr(formData, "periodYear", new Date().getFullYear());
  const periodMonth = intOr(formData, "periodMonth", new Date().getMonth() + 1);
  if (!memberId || !periodYear || !periodMonth) return;

  const fees = await getMembershipFees();
  const amount = intOr(formData, "amount", fees.monthly) ?? fees.monthly;
  const methodRaw = str(formData, "method") || "BANK_TRANSFER";
  const method = ["BANK_TRANSFER", "CASH", "CHEQUE"].includes(methodRaw) ? methodRaw : "BANK_TRANSFER";

  const existing = await prisma.payment.findFirst({
    where: {
      memberId,
      type: "MEMBERSHIP_FEE",
      periodYear,
      periodMonth,
      status: { in: ["PAID", "PENDING"] },
    },
  });
  if (existing?.status === "PAID") {
    redirect(`/${locale}/admin/fees?error=duplicate`);
  }
  if (existing?.status === "PENDING") {
    await prisma.payment.update({
      where: { id: existing.id },
      data: {
        amount,
        method,
        status: "PAID",
        paidAt: dateOrNull(formData, "paidAt") ?? new Date(),
        note: str(formData, "note") || existing.note,
      },
    });
    revalidateAdmin(locale, ["/dashboard", "/dashboard/payments", "/admin/fees", `/admin/members/${memberId}`]);
    redirect(`/${locale}/admin/fees?paid=1`);
  }

  await prisma.payment.create({
    data: {
      receiptNo: generateReference("REC"),
      memberId,
      amount,
      type: "MEMBERSHIP_FEE",
      periodYear,
      periodMonth,
      method,
      status: "PAID",
      paidAt: dateOrNull(formData, "paidAt") ?? new Date(),
      note: str(formData, "note") || null,
    },
  });

  revalidateAdmin(locale, ["/dashboard", "/dashboard/payments", "/admin/fees", `/admin/members/${memberId}`]);
  redirect(`/${locale}/admin/fees?paid=1`);
}

export async function adminConfirmMembershipPayment(formData: FormData) {
  const locale = localeOf(formData);
  await requireAdmin(locale);
  const paymentId = str(formData, "paymentId");
  if (!paymentId) return;

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status !== "PENDING") {
    redirect(`/${locale}/admin/fees?error=duplicate`);
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      note: payment.note
        ? `${payment.note} · Confirmed by office`
        : "Confirmed by office",
    },
  });

  revalidateAdmin(locale, [
    "/dashboard",
    "/dashboard/payments",
    "/admin/fees",
    `/admin/members/${payment.memberId}`,
  ]);
  redirect(`/${locale}/admin/fees?confirmed=1`);
}
