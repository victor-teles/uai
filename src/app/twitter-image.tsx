import { ogImageContentType, ogImageSize, renderOgImage } from "@/lib/og";
import { siteDescription } from "@/lib/site";

export const alt = "Uai — Open code for web products";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "shadcn registry",
    title: "Open code for web products",
    description: siteDescription,
    path: "/",
  });
}
