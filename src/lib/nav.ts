import type { Dictionary } from "@/i18n/dictionaries/en";

export type NavChild = { label: string; href: string; description?: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

/**
 * Main navigation mirrors the approved site flow chart:
 * HOME | ABOUT US | OUR SERVICES | NEWS & EVENTS | MEMBERS | GALLERY | DONATIONS | CONTACT US
 */
export function mainNav(d: Dictionary): NavItem[] {
  return [
    { label: d.nav.home, href: "/" },
    {
      label: d.nav.about,
      href: "/about",
      children: [
        { label: d.nav.aboutAssociation, href: "/about" },
        { label: d.nav.visionMission, href: "/about#vision" },
        { label: d.nav.history, href: "/about#history" },
        { label: d.nav.committee, href: "/about/committee" },
        { label: d.nav.partners, href: "/partners" },
      ],
    },
    {
      label: d.nav.services,
      href: "/services",
      children: [
        { label: d.nav.welfareProgrammes, href: "/services?category=WELFARE" },
        { label: d.nav.emergencyAssistance, href: "/services?category=EMERGENCY" },
        { label: d.nav.memberSupport, href: "/services?category=MEMBER_SUPPORT" },
        { label: d.nav.communityProjects, href: "/projects" },
      ],
    },
    {
      label: d.nav.news,
      href: "/news",
      children: [
        { label: d.nav.newsUpdates, href: "/news" },
        { label: d.nav.activityReports, href: "/news?category=ACTIVITY_REPORT" },
        { label: d.nav.upcomingEvents, href: "/events" },
        { label: d.nav.pastEvents, href: "/events?filter=past" },
      ],
    },
    {
      label: d.nav.members,
      href: "/members",
      children: [
        { label: d.nav.memberDirectory, href: "/members" },
        { label: d.nav.committee, href: "/about/committee" },
        { label: d.nav.join, href: "/join" },
        { label: d.nav.volunteer, href: "/volunteer" },
      ],
    },
    {
      label: d.nav.gallery,
      href: "/gallery",
      children: [
        { label: d.nav.photoGallery, href: "/gallery?type=PHOTO" },
        { label: d.nav.videoGallery, href: "/gallery?type=VIDEO" },
      ],
    },
    {
      label: d.nav.donations,
      href: "/donations",
      children: [
        { label: d.nav.donateNow, href: "/donations" },
        { label: d.nav.bankDetails, href: "/donations#bank" },
        { label: d.nav.donationUpdates, href: "/donations/updates" },
        { label: d.nav.annualReports, href: "/transparency" },
      ],
    },
    {
      label: d.nav.contact,
      href: "/contact",
      children: [
        { label: d.nav.contact, href: "/contact" },
        { label: d.nav.faq, href: "/faq" },
        { label: d.nav.documents, href: "/documents" },
      ],
    },
  ];
}

export function footerNav(d: Dictionary) {
  return [
    {
      title: d.footer.quickLinks,
      links: [
        { label: d.nav.aboutAssociation, href: "/about" },
        { label: d.nav.committee, href: "/about/committee" },
        { label: d.nav.news, href: "/news" },
        { label: d.nav.upcomingEvents, href: "/events" },
        { label: d.nav.gallery, href: "/gallery" },
        { label: d.nav.contact, href: "/contact" },
      ],
    },
    {
      title: d.footer.ourWork,
      links: [
        { label: d.nav.welfareProgrammes, href: "/services?category=WELFARE" },
        { label: d.nav.emergencyAssistance, href: "/services?category=EMERGENCY" },
        { label: d.nav.memberSupport, href: "/services?category=MEMBER_SUPPORT" },
        { label: d.nav.communityProjects, href: "/projects" },
        { label: d.nav.donationUpdates, href: "/donations/updates" },
      ],
    },
    {
      title: d.footer.getInvolved,
      links: [
        { label: d.nav.join, href: "/join" },
        { label: d.nav.donateNow, href: "/donations" },
        { label: d.nav.volunteer, href: "/volunteer" },
        { label: d.nav.partners, href: "/partners" },
        { label: d.nav.login, href: "/login" },
      ],
    },
    {
      title: d.footer.resources,
      links: [
        { label: d.nav.annualReports, href: "/transparency" },
        { label: d.nav.documents, href: "/documents" },
        { label: d.nav.faq, href: "/faq" },
        { label: d.nav.memberDirectory, href: "/members" },
      ],
    },
  ];
}

export function memberNav(d: Dictionary) {
  return [
    { label: d.dashboard.overview, href: "/dashboard", icon: "LayoutDashboard" },
    { label: d.dashboard.digitalId, href: "/dashboard/id", icon: "IdCard" },
    { label: d.dashboard.profile, href: "/dashboard/profile", icon: "UserRound" },
    { label: d.dashboard.benefits, href: "/dashboard/benefits", icon: "HeartHandshake" },
    { label: d.dashboard.payments, href: "/dashboard/payments", icon: "Wallet" },
    { label: d.dashboard.events, href: "/dashboard/events", icon: "CalendarDays" },
    { label: d.dashboard.eVoting, href: "/dashboard/vote", icon: "Vote" },
    { label: d.dashboard.suggestions, href: "/dashboard/suggestions", icon: "MessageSquareQuote" },
    { label: d.dashboard.announcements, href: "/dashboard/announcements", icon: "Megaphone" },
    { label: d.dashboard.tickets, href: "/dashboard/tickets", icon: "LifeBuoy" },
    { label: d.dashboard.documents, href: "/dashboard/documents", icon: "FolderOpen" },
  ];
}

export function adminNav(d: Dictionary) {
  return [
    { label: d.admin.overview, href: "/admin", icon: "LayoutDashboard" },
    { label: d.admin.analytics, href: "/admin/analytics", icon: "ChartLine" },
    { label: d.admin.members, href: "/admin/members", icon: "Users" },
    { label: d.admin.applications, href: "/admin/applications", icon: "FileCheck" },
    { label: d.admin.donations, href: "/admin/donations", icon: "HandCoins" },
    { label: d.admin.events, href: "/admin/events", icon: "CalendarDays" },
    { label: d.admin.elections, href: "/admin/elections", icon: "Vote" },
    { label: d.admin.news, href: "/admin/news", icon: "Newspaper" },
    { label: d.admin.gallery, href: "/admin/gallery", icon: "Images" },
    { label: d.admin.tickets, href: "/admin/tickets", icon: "LifeBuoy" },
    { label: d.admin.suggestions, href: "/admin/suggestions", icon: "MessageSquareQuote" },
    { label: d.admin.volunteers, href: "/admin/volunteers", icon: "HeartHandshake" },
    { label: d.admin.messages, href: "/admin/messages", icon: "Mail" },
    { label: d.admin.announcements, href: "/admin/announcements", icon: "Megaphone" },
    { label: d.admin.content, href: "/admin/content", icon: "Settings" },
  ];
}
