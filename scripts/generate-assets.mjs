/**
 * Generates the static asset set that ships with the site:
 *  - public/media/*.svg      abstract cover artwork used where photography will go
 *  - public/partners/*.svg   sponsor logo placeholders
 *  - public/documents/*.pdf  real, valid PDFs so the download centre works offline
 *
 * Run with: npm run assets
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

function ensure(dir) {
  mkdirSync(dir, { recursive: true });
}

/* ------------------------------------------------------------------ */
/* Deterministic pseudo-random                                         */
/* ------------------------------------------------------------------ */

function makeRng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Cover artwork                                                       */
/* ------------------------------------------------------------------ */

const PALETTES = [
  ["#b81340", "#f03a68", "#ffc7d5", "#4a0619"],
  ["#12274a", "#365488", "#9db3d5", "#0a172e"],
  ["#1d6660", "#2c9f92", "#afe9db", "#1a4442"],
  ["#93551b", "#d59526", "#f3df9f", "#68391d"],
  ["#9a143a", "#486ba3", "#ebc766", "#12274a"],
  ["#208076", "#b81340", "#ffe1e8", "#1c524e"],
];

function coverSvg(seed, width = 1600, height = 1000) {
  const rng = makeRng(seed);
  const palette = PALETTES[Math.floor(rng() * PALETTES.length)];
  const [c1, c2, c3, c4] = palette;
  const angle = Math.floor(rng() * 60) + 15;

  const blobs = Array.from({ length: 5 }, (_, i) => {
    const cx = Math.floor(rng() * width);
    const cy = Math.floor(rng() * height);
    const r = Math.floor(rng() * (width * 0.32)) + width * 0.12;
    const fill = [c1, c2, c3, c4][i % 4];
    const opacity = (0.18 + rng() * 0.34).toFixed(2);
    return `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(0)}" fill="${fill}" opacity="${opacity}" />`;
  }).join("");

  const rings = Array.from({ length: 3 }, (_, i) => {
    const cx = Math.floor(rng() * width);
    const cy = Math.floor(rng() * height);
    const r = Math.floor(rng() * (width * 0.22)) + width * 0.1;
    return `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(0)}" fill="none" stroke="${c3}" stroke-opacity="${(
      0.25 +
      i * 0.08
    ).toFixed(2)}" stroke-width="${(1.5 + rng() * 2.5).toFixed(1)}" />`;
  }).join("");

  // Interlocking hearts motif — the association's visual signature.
  const hx = width * (0.62 + rng() * 0.18);
  const hy = height * (0.28 + rng() * 0.3);
  const hs = (width * 0.00028).toFixed(4);
  const heart = `<g transform="translate(${hx.toFixed(0)} ${hy.toFixed(0)}) scale(${hs})" opacity="0.16">
      <path fill="#ffffff" d="M0 260C-140 150-300 60-300-70c0-90 70-160 160-160 60 0 110 32 140 82 30-50 80-82 140-82 90 0 160 70 160 160C300 60 140 150 0 260Z"/>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Abstract cover artwork">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${c4}"/>
      <stop offset="55%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <filter id="b" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="${Math.floor(width * 0.045)}"/>
    </filter>
    <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill="#ffffff" opacity="0.16"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <g filter="url(#b)">${blobs}</g>
  ${rings}
  ${heart}
  <rect width="${width}" height="${height}" fill="url(#dots)"/>
  <rect width="${width}" height="${height}" fill="#0a172e" opacity="0.12"/>
</svg>`;
}

const COVERS = [
  "medical-camp",
  "school-supplies",
  "dry-rations",
  "housing-project",
  "scholarship-award",
  "general-meeting",
  "flood-relief",
  "elders-day",
  "blood-donation",
  "water-project",
  "sports-day",
  "volunteer-training",
  "food-distribution",
  "health-awareness",
  "annual-report",
  "community-hall",
  "eye-clinic",
  "kids-education",
  "fundraiser-walk",
  "committee-meeting",
  "hero-primary",
  "hero-secondary",
  "about-team",
  "transparency",
];

/* ------------------------------------------------------------------ */
/* Logo + partner marks                                               */
/* ------------------------------------------------------------------ */

const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Heart Link Allianz">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f03a68"/>
      <stop offset="60%" stop-color="#b81340"/>
      <stop offset="100%" stop-color="#831536"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#lg)"/>
  <path d="M32 47.5C22.4 40.6 14 34.8 14 26.9c0-5.4 4.3-9.7 9.6-9.7 3.4 0 6.4 1.8 8.4 4.6 2-2.8 5-4.6 8.4-4.6 5.3 0 9.6 4.3 9.6 9.7 0 7.9-8.4 13.7-18 20.6Z" fill="#fff" opacity="0.95"/>
  <circle cx="23.6" cy="27" r="3.1" fill="#b81340"/>
  <circle cx="40.4" cy="27" r="3.1" fill="#b81340"/>
  <path d="M23.6 27h16.8" stroke="#b81340" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

const ICON = LOGO;

const PARTNERS = [
  { slug: "ceylon-trust-bank", name: "Ceylon Trust Bank", color: "#12274a" },
  { slug: "lanka-medicare", name: "Lanka Medicare", color: "#208076" },
  { slug: "serendib-foods", name: "Serendib Foods", color: "#b8741d" },
  { slug: "nawaloka-builders", name: "Nawaloka Builders", color: "#b81340" },
  { slug: "orient-telecom", name: "Orient Telecom", color: "#365488" },
  { slug: "divisional-secretariat", name: "Divisional Secretariat", color: "#1d6660" },
  { slug: "kandy-textiles", name: "Kandy Textiles", color: "#9a143a" },
  { slug: "green-agro-lanka", name: "Green Agro Lanka", color: "#2c9f92" },
  { slug: "metro-insurance", name: "Metro Insurance", color: "#2d446e" },
  { slug: "sunrise-pharma", name: "Sunrise Pharma", color: "#d59526" },
];

function partnerSvg({ name, color }) {
  const words = name.split(" ");
  const mark = words
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  const label = name.length > 20 ? `${name.slice(0, 19)}…` : name;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 88" width="260" height="88" role="img" aria-label="${name}">
  <rect width="260" height="88" rx="12" fill="#ffffff"/>
  <rect x="16" y="20" width="48" height="48" rx="12" fill="${color}"/>
  <text x="40" y="52" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle">${mark}</text>
  <text x="78" y="48" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="650" fill="#12274a">${label}</text>
  <text x="78" y="66" font-family="Inter, Arial, sans-serif" font-size="11" letter-spacing="1.6" fill="#6b8bbc">PARTNER</text>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Minimal valid PDF writer                                           */
/* ------------------------------------------------------------------ */

function escapePdf(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdf({ title, subtitle, lines }) {
  const content = [];
  content.push("BT /F2 22 Tf 1 1 1 rg 56 762 Td (" + escapePdf(title) + ") Tj ET");
  content.push("BT /F1 11 Tf 1 1 1 rg 56 738 Td (" + escapePdf(subtitle) + ") Tj ET");
  let y = 660;
  for (const line of lines) {
    const font = line.startsWith("#") ? "/F2 13" : "/F1 11";
    const text = line.startsWith("#") ? line.slice(1).trim() : line;
    content.push(`BT ${font} Tf 0.07 0.15 0.29 rg 56 ${y} Td (${escapePdf(text)}) Tj ET`);
    y -= line.startsWith("#") ? 30 : 20;
    if (y < 90) break;
  }

  const stream = [
    "0.72 0.07 0.25 rg 0 700 595 142 re f",
    "0.04 0.09 0.18 rg 0 700 595 6 re f",
    ...content,
    "0.55 0.65 0.78 RG 0.6 w 56 70 m 539 70 l S",
    "BT /F1 9 Tf 0.42 0.52 0.66 rg 56 54 Td (Heart Link Allianz Welfare Association  |  Reg. No. WA/2016/1187  |  heartlinkallianz.lk) Tj ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    `<< /Title (${escapePdf(title)}) /Author (Heart Link Allianz Welfare Association) /Producer (HLA Asset Builder) >>`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}

const REPORT_YEARS = [2021, 2022, 2023, 2024, 2025];

const FINANCIALS = {
  2021: { income: 12_450_000, expenditure: 10_980_000, welfare: 6_820_000, projects: 2_910_000, admin: 1_250_000, members: 1180 },
  2022: { income: 15_720_000, expenditure: 14_150_000, welfare: 8_640_000, projects: 3_960_000, admin: 1_550_000, members: 1340 },
  2023: { income: 19_880_000, expenditure: 17_640_000, welfare: 10_720_000, projects: 5_130_000, admin: 1_790_000, members: 1520 },
  2024: { income: 24_360_000, expenditure: 21_580_000, welfare: 13_180_000, projects: 6_420_000, admin: 1_980_000, members: 1690 },
  2025: { income: 28_940_000, expenditure: 25_460_000, welfare: 15_640_000, projects: 7_640_000, admin: 2_180_000, members: 1840 },
};

const lkr = (n) => `Rs. ${n.toLocaleString("en-US")}`;

const DOCUMENTS = [
  {
    file: "constitution.pdf",
    title: "Constitution of the Association",
    subtitle: "Adopted 2013 · Amended at the 2024 Annual General Meeting",
    lines: [
      "# Article 1 — Name and registered office",
      "The association shall be called the Heart Link Allianz Welfare Association,",
      "registered under the Voluntary Social Service Organisations Act.",
      "# Article 2 — Objects",
      "(a) To provide welfare assistance to members and their dependants.",
      "(b) To operate emergency relief for families affected by disaster or illness.",
      "(c) To award scholarships to children of members and the wider community.",
      "(d) To undertake community development projects.",
      "# Article 3 — Membership",
      "Ordinary, Life, Junior and Honorary categories are recognised. Applicants",
      "must be over eighteen years of age and resident in Sri Lanka.",
      "# Article 4 — Governance",
      "An Executive Committee of eleven members is elected annually by secret",
      "ballot at the Annual General Meeting.",
      "# Article 5 — Funds and audit",
      "All funds shall be held in the name of the association. The accounts shall",
      "be audited annually by an independent chartered accountant and published.",
    ],
  },
  {
    file: "membership-application-form.pdf",
    title: "Membership Application Form",
    subtitle: "Form HLA/M-01 · Version 3.2",
    lines: [
      "# Section A — Applicant details",
      "Full name ............................................................",
      "Name with initials ..................................................",
      "National Identity Card number ......................................",
      "Date of birth ............... Gender ............ Civil status .....",
      "# Section B — Contact",
      "Address ..............................................................",
      "City ..................... District ..................................",
      "Telephone ................ WhatsApp ................ Email ..........",
      "# Section C — Membership category",
      "[ ] Ordinary   [ ] Life   [ ] Junior",
      "# Section D — Declaration",
      "I declare the above particulars are true and agree to abide by the",
      "constitution of the association.",
      "Signature ........................ Date ............................",
      "# For office use only",
      "Application no. .......... Received .......... Approved ..........",
    ],
  },
  {
    file: "welfare-claim-form.pdf",
    title: "Welfare Benefit Claim Form",
    subtitle: "Form HLA/W-04 · Submit with supporting documents",
    lines: [
      "# Claimant details",
      "Membership number .......... Full name ..............................",
      "# Claim details",
      "Programme claimed under .............................................",
      "Amount claimed (Rs.) ................................................",
      "Reason for claim ....................................................",
      "# Supporting documents attached",
      "[ ] Medical report   [ ] Death certificate   [ ] Police report",
      "[ ] Bills / receipts [ ] Other ......................................",
      "# Declaration",
      "I certify that the information provided is accurate and that I have not",
      "claimed for the same event from any other fund of the association.",
      "Signature ........................ Date ............................",
      "# Committee decision",
      "Approved / Rejected .......... Amount sanctioned ....................",
      "Secretary .................... Treasurer ...........................",
    ],
  },
  {
    file: "volunteer-handbook.pdf",
    title: "Volunteer Handbook",
    subtitle: "Everything a new volunteer needs to know",
    lines: [
      "# Welcome",
      "Thank you for offering your time. This handbook explains how our camps",
      "and distributions run, and what we expect of every volunteer.",
      "# Before a camp",
      "Report to the site coordinator thirty minutes before opening. Collect",
      "your identification tag and duty allocation sheet.",
      "# Safeguarding",
      "Volunteers must never be alone with a child or vulnerable adult. Report",
      "any concern to the coordinator immediately.",
      "# Handling donations",
      "Never accept cash directly. Direct all donors to the treasurer's desk",
      "where an official receipt is issued.",
      "# Photography consent",
      "Ask before photographing beneficiaries. Written consent is required for",
      "any image used on the website or social media.",
      "# Reimbursement",
      "Travel costs are reimbursed on production of receipts within 14 days.",
    ],
  },
  {
    file: "child-protection-policy.pdf",
    title: "Child Protection & Safeguarding Policy",
    subtitle: "Approved by the Executive Committee, March 2025",
    lines: [
      "# Purpose",
      "This policy sets out how the association protects children and",
      "vulnerable adults who come into contact with our programmes.",
      "# Scope",
      "Applies to all committee members, staff, volunteers and contractors.",
      "# Core commitments",
      "1. The welfare of the child is the paramount consideration.",
      "2. All allegations are taken seriously and acted upon within 24 hours.",
      "3. Two-adult rule at all activities involving minors.",
      "# Reporting procedure",
      "Concerns must be reported to the designated safeguarding officer, who",
      "will record the concern and notify the National Child Protection",
      "Authority where required.",
      "# Review",
      "This policy is reviewed every two years by the Executive Committee.",
    ],
  },
  {
    file: "grievance-procedure.pdf",
    title: "Member Grievance Procedure",
    subtitle: "How complaints and disputes are handled",
    lines: [
      "# Stage 1 — Informal resolution",
      "Raise the matter with the office or open a support ticket from your",
      "member dashboard. Most issues are settled within five working days.",
      "# Stage 2 — Formal complaint",
      "If unresolved, submit a written complaint to the Secretary. You will",
      "receive an acknowledgement within three working days.",
      "# Stage 3 — Grievance sub-committee",
      "A panel of three committee members, none of whom is connected to the",
      "matter, reviews the complaint and issues a written decision.",
      "# Stage 4 — Appeal to the general membership",
      "A member may appeal to the Annual General Meeting. The decision of the",
      "general membership is final.",
      "# Records",
      "All grievances are logged in the ticketing system with outcomes",
      "reported in anonymised form in the annual report.",
    ],
  },
  {
    file: "scholarship-guidelines.pdf",
    title: "Scholarship Scheme Guidelines",
    subtitle: "Academic year 2026 · Grade 5, O/L and A/L categories",
    lines: [
      "# Eligibility",
      "Open to children of members in good standing and to children from",
      "families identified by the welfare sub-committee.",
      "# Award values",
      "Grade 5 scholarship holders  Rs. 24,000 per year",
      "O/L category                 Rs. 36,000 per year",
      "A/L category                 Rs. 60,000 per year",
      "# Selection criteria",
      "Academic performance (50%), household income (35%), and a short",
      "interview with the education sub-committee (15%).",
      "# Conditions",
      "Recipients must maintain satisfactory attendance and submit term",
      "reports. Awards are paid in three instalments.",
      "# Application",
      "Submit form HLA/S-02 with the previous year's report and a certified",
      "income statement before 31 March.",
    ],
  },
  {
    file: "circular-2026-01-subscriptions.pdf",
    title: "Circular 2026/01 — Subscription Revision",
    subtitle: "Issued by the Honorary Secretary, January 2026",
    lines: [
      "# Decision",
      "At the 2025 Annual General Meeting the membership resolved to revise",
      "the monthly subscription from Rs. 250 to Rs. 300 with effect from",
      "1 February 2026.",
      "# Reason",
      "The revision funds the expanded medical assistance ceiling approved in",
      "the same resolution (from Rs. 50,000 to Rs. 75,000 per member).",
      "# What members must do",
      "Members paying by standing order should instruct their bank to amend",
      "the amount. No action is needed for members paying at the office.",
      "# Life members",
      "Life members are unaffected by this revision.",
      "# Queries",
      "Contact the treasurer or open a support ticket from your dashboard.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Write everything                                                    */
/* ------------------------------------------------------------------ */

ensure(join(publicDir, "media"));
ensure(join(publicDir, "partners"));
ensure(join(publicDir, "documents"));

for (const slug of COVERS) {
  writeFileSync(join(publicDir, "media", `${slug}.svg`), coverSvg(slug), "utf8");
}

writeFileSync(join(publicDir, "logo.svg"), LOGO, "utf8");
writeFileSync(join(publicDir, "icon.svg"), ICON, "utf8");

for (const partner of PARTNERS) {
  writeFileSync(join(publicDir, "partners", `${partner.slug}.svg`), partnerSvg(partner), "utf8");
}

for (const year of REPORT_YEARS) {
  const f = FINANCIALS[year];
  const surplus = f.income - f.expenditure;
  const ratio = Math.round(((f.welfare + f.projects) / f.expenditure) * 100);
  writeFileSync(
    join(publicDir, "documents", `annual-report-${year}.pdf`),
    buildPdf({
      title: `Annual Report & Audited Accounts ${year}`,
      subtitle: "Heart Link Allianz Welfare Association",
      lines: [
        "# Statement of income and expenditure",
        `Total income                          ${lkr(f.income)}`,
        `Total expenditure                     ${lkr(f.expenditure)}`,
        `Surplus carried to reserves           ${lkr(surplus)}`,
        "# Expenditure breakdown",
        `Welfare grants and relief             ${lkr(f.welfare)}`,
        `Community development projects        ${lkr(f.projects)}`,
        `Administration and governance         ${lkr(f.admin)}`,
        `Programme spend ratio                 ${ratio}% of expenditure`,
        "# Membership",
        `Members on the register at 31 December ${f.members}`,
        "# Auditor's opinion",
        "In our opinion the financial statements give a true and fair view of",
        "the state of affairs of the association as at 31 December " + year + ",",
        "and of its income and expenditure for the year then ended.",
        "Perera & Associates, Chartered Accountants",
      ],
    }),
  );
}

for (const doc of DOCUMENTS) {
  writeFileSync(join(publicDir, "documents", doc.file), buildPdf(doc));
}

console.log(
  `Generated ${COVERS.length} covers, ${PARTNERS.length} partner marks, ` +
    `${REPORT_YEARS.length + DOCUMENTS.length} PDFs.`,
);
