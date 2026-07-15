import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.name,
    description: brand.description,
    start_url: "/",
    display: "standalone",
    background_color: brand.colors.white.main,
    theme_color: brand.colors.brand.main,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32",
        type: "image/x-icon",
      },
      {
        src: "/icon.ico",
        sizes: "16x16 32x32",
        type: "image/x-icon",
      },
      {
        src: "/images/logo.png",
        sizes: "364x357",
        type: "image/png",
      },
    ],
  };
}
