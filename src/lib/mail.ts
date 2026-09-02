import nodemailer from "nodemailer";
import { siteConfig } from "./site";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: { filename: string; path?: string; content?: Buffer; contentType?: string }[];
};

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/** Sends email when SMTP env vars are set; otherwise no-ops (PDF still saved). */
export async function sendMail(payload: MailPayload): Promise<{ sent: boolean; reason?: string }> {
  if (!isMailConfigured()) {
    return { sent: false, reason: "SMTP not configured" };
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"${siteConfig.shortName}" <${siteConfig.contact.email}>`,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    attachments: payload.attachments,
  });

  return { sent: true };
}
