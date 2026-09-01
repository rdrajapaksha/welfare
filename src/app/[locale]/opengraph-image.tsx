import { ImageResponse } from "next/og";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Heart Link Allianz Welfare Association";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "en";
  const d = await getDictionary(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0a0a 0%, #141414 55%, #1a1a1a 100%)",
          color: "white",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#ec2a2b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            ♥
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{d.brand.name}</div>
            <div style={{ fontSize: 18, opacity: 0.8 }}>{d.brand.tagline}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 920 }}>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1 }}>{d.brand.full}</div>
          <div style={{ fontSize: 24, opacity: 0.88, lineHeight: 1.4 }}>{d.meta.description}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, opacity: 0.75 }}>
          <span>{d.brand.regNo}</span>
          <span>heartlinkallianz.lk</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
