/** Shared media paths admins can attach to events, news and albums. */
export const MEDIA_OPTIONS = [
  "/media/hero-primary.svg",
  "/media/hero-secondary.svg",
  "/media/medical-camp.svg",
  "/media/flood-relief.svg",
  "/media/food-distribution.svg",
  "/media/blood-donation.svg",
  "/media/scholarship-award.svg",
  "/media/eye-clinic.svg",
  "/media/elders-day.svg",
  "/media/general-meeting.svg",
  "/media/volunteer-training.svg",
  "/media/housing-project.svg",
  "/media/water-project.svg",
  "/media/community-hall.svg",
  "/media/kids-education.svg",
  "/media/school-supplies.svg",
  "/media/dry-rations.svg",
  "/media/health-awareness.svg",
  "/media/fundraiser-walk.svg",
  "/media/sports-day.svg",
  "/media/committee-meeting.svg",
  "/media/annual-report.svg",
  "/media/transparency.svg",
  "/media/about-team.svg",
] as const;

export type MediaOption = (typeof MEDIA_OPTIONS)[number];
