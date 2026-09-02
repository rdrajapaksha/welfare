import QRCode from "qrcode";
import { siteConfig } from "./site";

/** Payload scanned at events for future attendance marking. */
export function memberQrPayload(membershipNo: string, memberId: string) {
  return JSON.stringify({
    v: 1,
    org: "HLA",
    membershipNo,
    memberId,
    site: siteConfig.url,
  });
}

export async function memberQrDataUrl(membershipNo: string, memberId: string) {
  return QRCode.toDataURL(memberQrPayload(membershipNo, memberId), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 280,
    color: { dark: "#111111", light: "#ffffff" },
  });
}
