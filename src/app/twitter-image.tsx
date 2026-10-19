import { ogImageContentType, ogImageSize, renderSiteOgImage } from "@/lib/og";
import { siteTitle } from "@/lib/site";

export const alt = siteTitle;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function Image() {
  return renderSiteOgImage();
}
