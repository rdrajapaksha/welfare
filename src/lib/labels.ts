import type { Dictionary } from "@/i18n/dictionaries/en";

export function membershipTypeLabel(d: Dictionary, type: string) {
  switch (type) {
    case "LIFE":
      return d.members.typeLife;
    case "HONORARY":
      return d.members.typeHonorary;
    case "JUNIOR":
      return d.members.typeJunior;
    default:
      return d.members.typeOrdinary;
  }
}

export function memberStatusLabel(d: Dictionary, status: string) {
  switch (status) {
    case "PENDING":
      return d.dashboard.statusPending;
    case "SUSPENDED":
      return d.dashboard.statusSuspended;
    case "RESIGNED":
      return d.dashboard.statusResigned;
    default:
      return d.dashboard.statusActive;
  }
}

export function programmeCategoryLabel(d: Dictionary, category: string) {
  switch (category) {
    case "EMERGENCY":
      return d.services.categoryEmergency;
    case "MEMBER_SUPPORT":
      return d.services.categoryMemberSupport;
    case "COMMUNITY":
      return d.services.categoryCommunity;
    default:
      return d.services.categoryWelfare;
  }
}

export function projectStatusLabel(d: Dictionary, status: string) {
  switch (status) {
    case "PLANNED":
      return d.projects.statusPlanned;
    case "COMPLETED":
      return d.projects.statusCompleted;
    default:
      return d.projects.statusOngoing;
  }
}

export function newsCategoryLabel(d: Dictionary, category: string) {
  switch (category) {
    case "ACTIVITY_REPORT":
      return d.news.categoryReport;
    case "PRESS":
      return d.news.categoryPress;
    default:
      return d.news.categoryNews;
  }
}

export function donationPurposeLabel(d: Dictionary, purpose: string) {
  switch (purpose) {
    case "EMERGENCY":
      return d.donations.purposeEmergency;
    case "EDUCATION":
      return d.donations.purposeEducation;
    case "MEDICAL":
      return d.donations.purposeMedical;
    case "PROJECT":
      return d.donations.purposeProject;
    default:
      return d.donations.purposeGeneral;
  }
}

export function donationMethodLabel(d: Dictionary, method: string) {
  switch (method) {
    case "ONLINE_CARD":
      return d.donations.methodCard;
    case "CASH":
      return d.donations.methodCash;
    case "CHEQUE":
      return d.donations.methodCheque;
    default:
      return d.donations.methodBank;
  }
}

export function ticketCategoryLabel(d: Dictionary, category: string) {
  switch (category) {
    case "WELFARE_CLAIM":
      return d.dashboard.ticketCategoryWelfare;
    case "PAYMENT":
      return d.dashboard.ticketCategoryPayment;
    case "PROFILE":
      return d.dashboard.ticketCategoryProfile;
    case "GRIEVANCE":
      return d.dashboard.ticketCategoryGrievance;
    case "EVENT":
      return d.dashboard.ticketCategoryEvent;
    case "TECHNICAL":
      return d.dashboard.ticketCategoryTechnical;
    default:
      return d.dashboard.ticketCategoryOther;
  }
}

export function ticketPriorityLabel(d: Dictionary, priority: string) {
  switch (priority) {
    case "LOW":
      return d.dashboard.priorityLow;
    case "HIGH":
      return d.dashboard.priorityHigh;
    case "URGENT":
      return d.dashboard.priorityUrgent;
    default:
      return d.dashboard.priorityMedium;
  }
}

export function ticketStatusLabel(d: Dictionary, status: string) {
  switch (status) {
    case "IN_PROGRESS":
      return d.dashboard.ticketStatusInProgress;
    case "AWAITING_MEMBER":
      return d.dashboard.ticketStatusAwaiting;
    case "RESOLVED":
      return d.dashboard.ticketStatusResolved;
    case "CLOSED":
      return d.dashboard.ticketStatusClosed;
    default:
      return d.dashboard.ticketStatusOpen;
  }
}

export function claimStatusLabel(d: Dictionary, status: string) {
  switch (status) {
    case "UNDER_REVIEW":
      return d.dashboard.claimStatusReview;
    case "APPROVED":
      return d.dashboard.claimStatusApproved;
    case "PAID":
      return d.dashboard.claimStatusPaid;
    case "REJECTED":
      return d.dashboard.claimStatusRejected;
    default:
      return d.dashboard.claimStatusSubmitted;
  }
}

export function documentCategoryLabel(d: Dictionary, category: string) {
  switch (category) {
    case "CONSTITUTION":
      return d.documents.categoryConstitution;
    case "POLICY":
      return d.documents.categoryPolicy;
    case "FINANCIAL":
      return d.documents.categoryFinancial;
    case "GUIDE":
      return d.documents.categoryGuide;
    case "CIRCULAR":
      return d.documents.categoryCircular;
    default:
      return d.documents.categoryForm;
  }
}

export function faqCategoryLabel(d: Dictionary, category: string) {
  switch (category) {
    case "DONATIONS":
      return d.faq.categoryDonations;
    case "WELFARE":
      return d.faq.categoryWelfare;
    case "VOLUNTEER":
      return d.faq.categoryVolunteer;
    case "GENERAL":
      return d.faq.categoryGeneral;
    default:
      return d.faq.categoryMembership;
  }
}

export function partnerTierLabel(d: Dictionary, tier: string) {
  switch (tier) {
    case "PLATINUM":
      return d.partners.tierPlatinum;
    case "GOLD":
      return d.partners.tierGold;
    case "SILVER":
      return d.partners.tierSilver;
    case "GOVERNMENT":
      return d.partners.tierGovernment;
    default:
      return d.partners.tierPartner;
  }
}

export function galleryCategoryLabel(d: Dictionary, category: string) {
  switch (category) {
    case "COMMUNITY":
      return d.gallery.categoryCommunity;
    case "HIGHLIGHT":
      return d.gallery.categoryHighlight;
    default:
      return d.gallery.categoryEvent;
  }
}

export function volunteerAreaLabel(d: Dictionary, area: string) {
  switch (area) {
    case "MEDICAL":
      return d.volunteer.areaMedical;
    case "EDUCATION":
      return d.volunteer.areaEducation;
    case "FUNDRAISING":
      return d.volunteer.areaFundraising;
    case "MEDIA":
      return d.volunteer.areaMedia;
    case "LOGISTICS":
      return d.volunteer.areaLogistics;
    case "ADMIN":
      return d.volunteer.areaAdmin;
    case "IT":
      return d.volunteer.areaIt;
    default:
      return d.volunteer.areaEvents;
  }
}

export const PARTNER_TIER_ORDER = ["PLATINUM", "GOLD", "SILVER", "PARTNER", "GOVERNMENT"] as const;
