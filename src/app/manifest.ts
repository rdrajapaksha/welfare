import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description:
      "Registered Sri Lankan welfare association — emergency relief, member welfare, scholarships and community projects.",
    start_url: "/en",
    display: "standalone",
    background_color: "#f7f7f8",
    theme_color: "#ec2a2b",
    lang: "en-LK",
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "726x726", type: "image/png", purpose: "maskable" },
    ],
  };
}
