import { registryCatalog } from "@/components/registry/catalog";
import { ogImageContentType, ogImageSize, renderOgImage } from "@/lib/og";
import { siteDescription } from "@/lib/site";

export const alt = "Uai — Open code for web products";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({
    kind: "registry",
    eyebrow: "shadcn",
    position: `${registryCatalog.length} items`,
    title: "Open code for web products",
    description: siteDescription,
  });
}
