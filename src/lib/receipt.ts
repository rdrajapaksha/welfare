import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { prisma } from "./prisma";
import { siteConfig } from "./site";
import { sendMail } from "./mail";
import { formatCurrency } from "./utils";

const PURPOSE_LABEL: Record<string, string> = {
  GENERAL: "General welfare fund",
  EMERGENCY: "Emergency relief",
  EDUCATION: "Education / scholarships",
  MEDICAL: "Medical assistance",
  PROJECT: "Community project",
};

async function loadLogoBytes(): Promise<Uint8Array | null> {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    return new Uint8Array(await readFile(logoPath));
  } catch {
    return null;
  }
}

export async function generateDonationReceiptPdf(donationId: string): Promise<string | null> {
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation || donation.status !== "CONFIRMED") return null;

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const brandRed = rgb(0.925, 0.165, 0.169);
  const ink = rgb(0.08, 0.08, 0.08);
  const muted = rgb(0.35, 0.35, 0.35);

  const logoBytes = await loadLogoBytes();
  if (logoBytes) {
    try {
      const logo = await pdf.embedPng(logoBytes);
      const logoW = 72;
      const logoH = (logo.height / logo.width) * logoW;
      page.drawImage(logo, { x: 48, y: height - 48 - logoH, width: logoW, height: logoH });
    } catch {
      // non-PNG or corrupt — skip logo
    }
  }

  page.drawText(siteConfig.name, {
    x: 140,
    y: height - 70,
    size: 12,
    font: fontBold,
    color: ink,
    maxWidth: width - 200,
  });
  page.drawText("Official Donation Receipt", {
    x: 140,
    y: height - 90,
    size: 11,
    font,
    color: brandRed,
  });

  page.drawRectangle({
    x: 48,
    y: height - 130,
    width: width - 96,
    height: 2,
    color: brandRed,
  });

  const rows: [string, string][] = [
    ["Receipt / Reference", donation.reference],
    ["Date confirmed", (donation.confirmedAt ?? donation.createdAt).toISOString().slice(0, 10)],
    ["Donor", donation.isAnonymous ? "Anonymous donor" : donation.donorName],
    ["Email", donation.email || "—"],
    ["Amount", formatCurrency(donation.amount, "en")],
    ["Purpose", PURPOSE_LABEL[donation.purpose] ?? donation.purpose],
    ["Payment method", donation.method.replace(/_/g, " ")],
  ];

  let y = height - 170;
  for (const [label, value] of rows) {
    page.drawText(label, { x: 56, y, size: 9, font, color: muted });
    page.drawText(value, { x: 220, y, size: 10, font: fontBold, color: ink, maxWidth: 300 });
    y -= 28;
  }

  y -= 20;
  page.drawText("Thank you for supporting our welfare programmes.", {
    x: 56,
    y,
    size: 10,
    font,
    color: ink,
  });
  y -= 18;
  page.drawText("This receipt is computer-generated and valid without a signature.", {
    x: 56,
    y,
    size: 8,
    font,
    color: muted,
  });

  y = 80;
  page.drawText(`${siteConfig.legalName} · Reg. ${siteConfig.registrationNo}`, {
    x: 56,
    y,
    size: 8,
    font,
    color: muted,
  });
  page.drawText(`${siteConfig.contact.email} · ${siteConfig.contact.phoneDisplay}`, {
    x: 56,
    y: y - 14,
    size: 8,
    font,
    color: muted,
  });

  const bytes = await pdf.save();
  const dir = path.join(process.cwd(), "public", "receipts");
  await mkdir(dir, { recursive: true });
  const filename = `${donation.reference}.pdf`;
  await writeFile(path.join(dir, filename), bytes);

  const receiptUrl = `/receipts/${filename}`;
  await prisma.donation.update({
    where: { id: donation.id },
    data: { receiptUrl },
  });

  if (donation.email) {
    const absPath = path.join(dir, filename);
    await sendMail({
      to: donation.email,
      subject: `Donation receipt ${donation.reference} — ${siteConfig.shortName}`,
      text: [
        `Dear ${donation.isAnonymous ? "Donor" : donation.donorName},`,
        "",
        `Thank you for your donation of ${formatCurrency(donation.amount, "en")}.`,
        `Reference: ${donation.reference}`,
        "",
        "Your official PDF receipt is attached.",
        "",
        siteConfig.name,
      ].join("\n"),
      html: `<p>Dear ${donation.isAnonymous ? "Donor" : donation.donorName},</p>
        <p>Thank you for your donation of <strong>${formatCurrency(donation.amount, "en")}</strong>.</p>
        <p>Reference: <strong>${donation.reference}</strong></p>
        <p>Your official PDF receipt is attached.</p>
        <p>${siteConfig.name}</p>`,
      attachments: [
        {
          filename,
          path: absPath,
          contentType: "application/pdf",
        },
      ],
    });
  }

  return receiptUrl;
}
