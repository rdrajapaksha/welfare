import { z } from "zod";
import { SRI_LANKA_DISTRICTS, VOLUNTEER_AREAS, AVAILABILITY_OPTIONS, CONTACT_TOPICS, DONATION_PURPOSES, DONATION_METHODS, MEMBERSHIP_TYPES, TICKET_CATEGORIES, TICKET_PRIORITIES } from "./constants";

export const sriLankaPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(0\d{9}|\+94\d{9})$/.test(v), "phone");

export const nicSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v) => /^(\d{9}[VX]|\d{12})$/.test(v), "nic");

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  next: z.string().optional(),
  locale: z.string().default("en"),
});

export const newsletterSchema = z.object({
  email: z.email(),
  locale: z.enum(["en", "si", "ta"]).default("en"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  topic: z.enum(CONTACT_TOPICS).default("GENERAL"),
  subject: z.string().trim().min(3).max(140),
  message: z.string().trim().min(10).max(4000),
});

export const joinSchema = z.object({
  fullName: z.string().trim().min(3).max(80),
  nic: nicSchema,
  dateOfBirth: z.string().min(8),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  occupation: z.string().trim().max(80).optional().or(z.literal("")),
  addressLine1: z.string().trim().min(4).max(120),
  city: z.string().trim().min(2).max(60),
  district: z.enum(SRI_LANKA_DISTRICTS),
  phone: sriLankaPhone,
  email: z.email(),
  membershipType: z.enum(MEMBERSHIP_TYPES).default("ORDINARY"),
  referredBy: z.string().trim().max(80).optional().or(z.literal("")),
  motivation: z.string().trim().max(1000).optional().or(z.literal("")),
  consent: z.literal(true),
});

export const volunteerSchema = z.object({
  fullName: z.string().trim().min(3).max(80),
  email: z.email(),
  phone: sriLankaPhone,
  nic: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2).max(60),
  district: z.enum(SRI_LANKA_DISTRICTS),
  dateOfBirth: z.string().optional().or(z.literal("")),
  interests: z.array(z.enum(VOLUNTEER_AREAS)).min(1),
  skills: z.string().trim().max(400).optional().or(z.literal("")),
  availability: z.enum(AVAILABILITY_OPTIONS),
  hoursPerMonth: z.coerce.number().int().min(2).max(160),
  experience: z.string().trim().max(1000).optional().or(z.literal("")),
  motivation: z.string().trim().min(10).max(1500),
  consent: z.literal(true),
});

export const suggestionSchema = z.object({
  category: z.enum(["SUGGESTION", "GRIEVANCE", "IDEA"]).default("SUGGESTION"),
  subject: z.string().trim().min(3).max(140),
  body: z.string().trim().min(10).max(4000),
  isAnonymous: z.boolean().default(false),
});

export const voteSchema = z.object({
  electionId: z.string().min(1),
  candidateId: z.string().min(1),
});

export const donationSchema = z.object({
  amount: z.coerce.number().int().min(100).max(10_000_000),
  purpose: z.enum(DONATION_PURPOSES).default("GENERAL"),
  method: z.enum(DONATION_METHODS).default("BANK_TRANSFER"),
  donorName: z.string().trim().min(2).max(80),
  email: z.email(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  isAnonymous: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
});

export const eventRegisterSchema = z.object({
  eventId: z.string().min(1),
  fullName: z.string().trim().min(2).max(80),
  email: z.email(),
  phone: sriLankaPhone,
  guests: z.coerce.number().int().min(0).max(8),
  note: z.string().trim().max(400).optional().or(z.literal("")),
});

export const ticketSchema = z.object({
  category: z.enum(TICKET_CATEGORIES),
  priority: z.enum(TICKET_PRIORITIES).default("MEDIUM"),
  subject: z.string().trim().min(4).max(140),
  description: z.string().trim().min(10).max(4000),
});

export const ticketReplySchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().trim().min(2).max(4000),
  isInternal: z.boolean().default(false),
});

export const claimSchema = z.object({
  programmeId: z.string().min(1),
  amount: z.coerce.number().int().min(500).max(500_000),
  reason: z.string().trim().min(10).max(2000),
});

export const profileSchema = z.object({
  phone: sriLankaPhone,
  whatsapp: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.email().optional().or(z.literal("")),
  addressLine1: z.string().trim().min(4).max(120),
  addressLine2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(60),
  occupation: z.string().trim().max(80).optional().or(z.literal("")),
  bloodGroup: z.string().trim().max(4).optional().or(z.literal("")),
  emergencyName: z.string().trim().max(80).optional().or(z.literal("")),
  emergencyPhone: z.string().trim().max(20).optional().or(z.literal("")),
  bio: z.string().trim().max(400).optional().or(z.literal("")),
  showInDirectory: z.boolean().default(true),
});

export function formDataToObject(formData: FormData) {
  const data: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.endsWith("[]")) {
      const clean = key.slice(0, -2);
      const existing = data[clean];
      const next = typeof value === "string" ? value : "";
      data[clean] = Array.isArray(existing) ? [...existing, next] : [next];
    } else if (value === "on") {
      data[key] = true;
    } else if (typeof value === "string") {
      data[key] = value;
    }
  }
  return data;
}
