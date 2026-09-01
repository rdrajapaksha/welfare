export const siteConfig = {
  name: "Heart Link Allianz Welfare Association",
  shortName: "Heart Link Allianz",
  legalName: "Heart Link Allianz Welfare Association",
  registrationNo: "WA/2016/1187",
  foundedYear: 2013,
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),

  contact: {
    phone: process.env.NEXT_PUBLIC_ORG_PHONE ?? "+94112345678",
    phoneDisplay: "+94 11 234 5678",
    hotline: "+94 77 123 4567",
    hotlineDisplay: "+94 77 123 4567",
    email: process.env.NEXT_PUBLIC_ORG_EMAIL ?? "info@heartlinkallianz.lk",
    welfareEmail: "welfare@heartlinkallianz.lk",
    address: {
      street: "No. 142, Temple Road",
      locality: "Nugegoda",
      region: "Western Province",
      postalCode: "10250",
      country: "LK",
      countryName: "Sri Lanka",
    },
    geo: { latitude: 6.8649, longitude: 79.8997 },
    mapEmbed:
      "https://www.google.com/maps?q=Nugegoda,+Sri+Lanka&output=embed",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Nugegoda+Sri+Lanka",
  },

  bank: {
    bankName: "Bank of Ceylon",
    branch: "Nugegoda Branch",
    accountName: "Heart Link Allianz Welfare Association",
    accountNo: "0072 4451 8890",
    swift: "BCEYLKLX",
  },

  fees: {
    registration: 1000,
    monthly: 300,
    life: 25000,
  },

  social: [
    { key: "facebook", label: "Facebook", href: "https://facebook.com/heartlinkallianz" },
    { key: "instagram", label: "Instagram", href: "https://instagram.com/heartlinkallianz" },
    { key: "youtube", label: "YouTube", href: "https://youtube.com/@heartlinkallianz" },
    { key: "whatsapp", label: "WhatsApp", href: "https://wa.me/94771234567" },
  ],

  /** Headline figures shown on the home page. Sourced from the latest audited report. */
  impact: {
    members: 1840,
    familiesAssisted: 6250,
    welfareDisbursed: 48600000,
    projects: 34,
    volunteers: 420,
  },
} as const;

export type SiteConfig = typeof siteConfig;
