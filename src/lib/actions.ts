"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, requireAdmin, requireUser, verifyCredentials } from "./auth";
import { prisma } from "./prisma";
import { createSessionCookie, destroySessionCookie } from "./session";
import { generateReference } from "./utils";
import {
  claimSchema,
  contactSchema,
  donationSchema,
  eventRegisterSchema,
  formDataToObject,
  joinSchema,
  loginSchema,
  profileSchema,
  ticketReplySchema,
  ticketSchema,
  volunteerSchema,
} from "./validations";

export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  reference?: string;
};

function fail(error: string, fieldErrors?: Record<string, string>): ActionState {
  return { ok: false, error, fieldErrors };
}

function zodFail(error: { issues: { path: PropertyKey[]; message: string }[] }): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fail("genericError", fieldErrors);
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
    locale: formData.get("locale") || "en",
  });
  if (!parsed.success) return fail("invalidCredentials");

  const result = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return fail(result.reason === "INACTIVE" ? "inactiveAccount" : "invalidCredentials");
  }

  await createSessionCookie(result.session);
  await prisma.user.update({
    where: { id: result.session.userId },
    data: { lastLoginAt: new Date() },
  });

  const locale = parsed.data.locale;
  const nextPath = parsed.data.next && parsed.data.next.startsWith("/") ? parsed.data.next : "";
  if (nextPath) redirect(nextPath);
  if (result.session.role === "ADMIN" || result.session.role === "EDITOR") {
    redirect(`/${locale}/admin`);
  }
  redirect(`/${locale}/dashboard`);
}

export async function logoutAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  await destroySessionCookie();
  redirect(`/${locale}/login`);
}

export async function contactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return zodFail(parsed.error);

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      topic: parsed.data.topic,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });
  return { ok: true };
}

export async function joinAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formDataToObject(formData);
  raw.consent = formData.get("consent") === "on";
  const parsed = joinSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);

  const existing = await prisma.membershipApplication.findFirst({
    where: { nic: parsed.data.nic, status: { in: ["PENDING", "UNDER_REVIEW"] } },
  });
  if (existing) return fail("duplicateNic");

  const emailTaken = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (emailTaken) return fail("duplicateEmail");

  const created = await prisma.membershipApplication.create({
    data: {
      applicationNo: generateReference("APP"),
      fullName: parsed.data.fullName,
      nic: parsed.data.nic,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      gender: parsed.data.gender,
      occupation: parsed.data.occupation || null,
      addressLine1: parsed.data.addressLine1,
      city: parsed.data.city,
      district: parsed.data.district,
      phone: parsed.data.phone,
      email: parsed.data.email.toLowerCase(),
      membershipType: parsed.data.membershipType,
      referredBy: parsed.data.referredBy || null,
      motivation: parsed.data.motivation || null,
    },
  });

  return { ok: true, reference: created.applicationNo };
}

export async function volunteerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formDataToObject(formData);
  raw.interests = formData.getAll("interests").filter((v): v is string => typeof v === "string");
  raw.consent = formData.get("consent") === "on";
  raw.hoursPerMonth = Number(formData.get("hoursPerMonth") || 8);
  const parsed = volunteerSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);

  const created = await prisma.volunteerApplication.create({
    data: {
      reference: generateReference("VOL"),
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      nic: parsed.data.nic || null,
      city: parsed.data.city,
      district: parsed.data.district,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
      interests: parsed.data.interests.join(","),
      skills: parsed.data.skills || null,
      availability: parsed.data.availability,
      hoursPerMonth: parsed.data.hoursPerMonth,
      experience: parsed.data.experience || null,
      motivation: parsed.data.motivation,
    },
  });

  return { ok: true, reference: created.reference };
}

export async function donateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formDataToObject(formData);
  raw.isAnonymous = formData.get("isAnonymous") === "on";
  raw.isRecurring = formData.get("frequency") === "monthly";
  raw.amount = Number(formData.get("amount") || formData.get("customAmount") || 0);
  const parsed = donationSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);

  const user = await getCurrentUser();
  const created = await prisma.donation.create({
    data: {
      reference: generateReference("DON"),
      donorName: parsed.data.donorName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || null,
      amount: parsed.data.amount,
      method: parsed.data.method,
      purpose: parsed.data.purpose,
      message: parsed.data.message || null,
      isAnonymous: parsed.data.isAnonymous,
      isRecurring: parsed.data.isRecurring,
      status: parsed.data.method === "ONLINE_CARD" ? "CONFIRMED" : "PENDING",
      confirmedAt: parsed.data.method === "ONLINE_CARD" ? new Date() : null,
      memberId: user?.memberId ?? null,
    },
  });

  return { ok: true, reference: created.reference };
}

export async function eventRegisterAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = eventRegisterSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return zodFail(parsed.error);

  const event = await prisma.event.findUnique({ where: { id: parsed.data.eventId } });
  if (!event || !event.registrationOpen) return fail("submitFailed");

  const user = await getCurrentUser();
  await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      memberId: user?.memberId ?? null,
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      guests: parsed.data.guests,
      note: parsed.data.note || null,
    },
  });
  await prisma.event.update({
    where: { id: event.id },
    data: { attendeeCount: { increment: 1 + parsed.data.guests } },
  });

  return { ok: true };
}

export async function createTicketAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("loginRequired");

  const parsed = ticketSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return zodFail(parsed.error);

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNo: generateReference("TCK"),
      memberId: user.memberId,
      contactName: user.name,
      email: user.email,
      category: parsed.data.category,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority,
      messages: {
        create: {
          authorId: user.userId,
          authorName: user.name,
          authorRole: user.role === "ADMIN" || user.role === "EDITOR" ? "ADMIN" : "MEMBER",
          body: parsed.data.description,
        },
      },
    },
  });

  return { ok: true, reference: ticket.ticketNo };
}

export async function replyTicketAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("loginRequired");

  const parsed = ticketReplySchema.safeParse({
    ...formDataToObject(formData),
    isInternal: formData.get("isInternal") === "on",
  });
  if (!parsed.success) return zodFail(parsed.error);

  const ticket = await prisma.supportTicket.findUnique({ where: { id: parsed.data.ticketId } });
  if (!ticket) return fail("submitFailed");

  const isStaff = user.role === "ADMIN" || user.role === "EDITOR";
  if (!isStaff && ticket.memberId !== user.memberId) return fail("submitFailed");
  if (parsed.data.isInternal && !isStaff) return fail("adminOnly");

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      authorId: user.userId,
      authorName: user.name,
      authorRole: isStaff ? "ADMIN" : "MEMBER",
      body: parsed.data.body,
      isInternal: parsed.data.isInternal,
    },
  });

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      status: isStaff
        ? ticket.status === "OPEN"
          ? "IN_PROGRESS"
          : ticket.status
        : "AWAITING_MEMBER" === ticket.status
          ? "IN_PROGRESS"
          : "AWAITING_MEMBER",
      updatedAt: new Date(),
    },
  });

  revalidatePath("/");
  return { ok: true };
}

export async function createClaimAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("en");
  if (!user.memberId) return fail("submitFailed");

  const parsed = claimSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return zodFail(parsed.error);

  const created = await prisma.benefitClaim.create({
    data: {
      claimNo: generateReference("CLM"),
      memberId: user.memberId,
      programmeId: parsed.data.programmeId,
      amount: parsed.data.amount,
      reason: parsed.data.reason,
    },
  });

  return { ok: true, reference: created.claimNo };
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user?.memberId) return fail("loginRequired");

  const raw = formDataToObject(formData);
  raw.showInDirectory = formData.get("showInDirectory") === "on";
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return zodFail(parsed.error);

  await prisma.member.update({
    where: { id: user.memberId },
    data: {
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp || null,
      email: parsed.data.email || null,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2 || null,
      city: parsed.data.city,
      occupation: parsed.data.occupation || null,
      bloodGroup: parsed.data.bloodGroup || null,
      emergencyName: parsed.data.emergencyName || null,
      emergencyPhone: parsed.data.emergencyPhone || null,
      bio: parsed.data.bio || null,
      showInDirectory: parsed.data.showInDirectory,
    },
  });

  return { ok: true };
}

export async function adminUpdateTicketStatus(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  await requireAdmin(locale as "en");
  const id = String(formData.get("ticketId") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;
  await prisma.supportTicket.update({
    where: { id },
    data: {
      status,
      resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : null,
    },
  });
  revalidatePath(`/${locale}/admin/tickets`);
}

export async function adminConfirmDonation(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  await requireAdmin(locale as "en");
  const id = String(formData.get("donationId") || "");
  if (!id) return;
  await prisma.donation.update({
    where: { id },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });
  revalidatePath(`/${locale}/admin/donations`);
}

export async function adminDecideApplication(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  await requireAdmin(locale as "en");
  const id = String(formData.get("applicationId") || "");
  const decision = String(formData.get("decision") || "");
  if (!id || (decision !== "APPROVED" && decision !== "REJECTED")) return;

  const application = await prisma.membershipApplication.findUnique({ where: { id } });
  if (!application) return;

  if (decision === "APPROVED") {
    const count = await prisma.member.count();
    const membershipNo = `HLA-${String(1000 + count + 1).padStart(4, "0")}`;
    await prisma.member.create({
      data: {
        membershipNo,
        fullName: application.fullName,
        nameWithInitials: application.fullName
          .split(/\s+/)
          .filter(Boolean)
          .map((p, i, arr) => (i === arr.length - 1 ? p : `${p[0]}.`))
          .join(" "),
        nic: application.nic,
        dateOfBirth: application.dateOfBirth,
        gender: application.gender,
        occupation: application.occupation,
        addressLine1: application.addressLine1,
        city: application.city,
        district: application.district,
        phone: application.phone,
        email: application.email,
        membershipType: application.membershipType,
        status: "ACTIVE",
        showInDirectory: true,
      },
    });
  }

  await prisma.membershipApplication.update({
    where: { id },
    data: { status: decision, decidedAt: new Date() },
  });
  revalidatePath(`/${locale}/admin/applications`);
  revalidatePath(`/${locale}/admin/members`);
}

export async function adminVolunteerStatus(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  await requireAdmin(locale as "en");
  const id = String(formData.get("volunteerId") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;
  await prisma.volunteerApplication.update({
    where: { id },
    data: { status, reviewedAt: new Date() },
  });
  revalidatePath(`/${locale}/admin/volunteers`);
}
