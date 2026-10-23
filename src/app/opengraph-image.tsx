import { ogImageContentType, ogImageSize, renderSiteOgImage } from "@/lib/og";
import { siteTitle } from "@/lib/site";

export const alt = siteTitle;
export const size = ogImageSize;
export const contentType = ogImageContentType;
/** Prerendered at build time, which a static export (`build:workers`) requires. */
export const dynamic = "force-static";

export default function Image() {
  return renderSiteOgImage();
}
