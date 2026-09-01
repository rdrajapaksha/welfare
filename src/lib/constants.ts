export const SRI_LANKA_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
] as const;

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;

export const MEMBERSHIP_TYPES = ["ORDINARY", "LIFE", "HONORARY", "JUNIOR"] as const;
export const MEMBER_STATUSES = ["ACTIVE", "PENDING", "SUSPENDED", "RESIGNED"] as const;

export const PROGRAMME_CATEGORIES = [
  "WELFARE",
  "EMERGENCY",
  "MEMBER_SUPPORT",
  "COMMUNITY",
] as const;

export const DONATION_PURPOSES = [
  "GENERAL",
  "EMERGENCY",
  "EDUCATION",
  "MEDICAL",
  "PROJECT",
] as const;

export const DONATION_METHODS = [
  "BANK_TRANSFER",
  "ONLINE_CARD",
  "CASH",
  "CHEQUE",
] as const;

export const DONATION_STATUSES = ["PENDING", "CONFIRMED", "FAILED", "REFUNDED"] as const;

export const TICKET_CATEGORIES = [
  "WELFARE_CLAIM",
  "PAYMENT",
  "PROFILE",
  "GRIEVANCE",
  "EVENT",
  "TECHNICAL",
  "OTHER",
] as const;

export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "AWAITING_MEMBER",
  "RESOLVED",
  "CLOSED",
] as const;

export const CLAIM_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "PAID",
  "REJECTED",
] as const;

export const DOCUMENT_CATEGORIES = [
  "APPLICATION_FORM",
  "CONSTITUTION",
  "POLICY",
  "FINANCIAL",
  "GUIDE",
  "CIRCULAR",
] as const;

export const PARTNER_TIERS = [
  "PLATINUM",
  "GOLD",
  "SILVER",
  "PARTNER",
  "GOVERNMENT",
] as const;

export const FAQ_CATEGORIES = [
  "MEMBERSHIP",
  "DONATIONS",
  "WELFARE",
  "VOLUNTEER",
  "GENERAL",
] as const;

export const VOLUNTEER_AREAS = [
  "EVENTS",
  "MEDICAL",
  "EDUCATION",
  "FUNDRAISING",
  "MEDIA",
  "LOGISTICS",
  "ADMIN",
  "IT",
] as const;

export const AVAILABILITY_OPTIONS = [
  "WEEKENDS",
  "WEEKDAYS",
  "EVENINGS",
  "FLEXIBLE",
] as const;

export const CONTACT_TOPICS = [
  "GENERAL",
  "MEMBERSHIP",
  "DONATION",
  "WELFARE",
  "VOLUNTEER",
  "SPONSORSHIP",
  "COMPLAINT",
] as const;

export const DONATION_PRESETS = [1000, 2500, 5000, 10000, 25000] as const;

export type District = (typeof SRI_LANKA_DISTRICTS)[number];
export type MembershipType = (typeof MEMBERSHIP_TYPES)[number];
export type ProgrammeCategory = (typeof PROGRAMME_CATEGORIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type VolunteerArea = (typeof VOLUNTEER_AREAS)[number];
