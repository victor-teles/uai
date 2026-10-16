import { ImageResponse } from "next/og";

import { OgTemplate, type OgTemplateProps } from "@/components/og/og-template";
import { shareImageSize, siteUrl } from "@/lib/site";

export const ogImageSize = shareImageSize;

export const ogImageContentType = "image/png";

type OgImageInput = Omit<OgTemplateProps, "url"> & {
  /** Site-relative path of the page the image represents. */
  path: string;
};

/** Renders the share image for one page with the pluggable `OgTemplate`. */
export function renderOgImage({ path, ...props }: OgImageInput) {
  const host = new URL(siteUrl).host;
  const url = path === "/" ? host : `${host}${path}`;
  return new ImageResponse(<OgTemplate {...props} url={url} />, { ...ogImageSize });
}
