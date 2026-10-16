import type { Metadata } from "next";

import { shareImageSize, siteName, siteTitle } from "@/lib/site";

const siteShareImage = {
  openGraph: { url: "/opengraph-image", ...shareImageSize, alt: siteTitle },
  twitter: { url: "/twitter-image", ...shareImageSize, alt: siteTitle },
};

type PageMetadataInput = {
  /** Page title. Rendered through the root `%s — Uai` template unless `absoluteTitle` is set. */
  title: string;
  description: string;
  /** Site-relative path, resolved against `metadataBase` in the root layout. */
  path: string;
  /** Use the title as-is, without the root template. */
  absoluteTitle?: boolean;
  /** Extra alternate representations, such as the Markdown version of a page. */
  alternateTypes?: Record<string, string>;
  /**
   * `site` points at the site-wide image from `app/opengraph-image.tsx`. `route` leaves
   * the image to an `opengraph-image.tsx` / `twitter-image.tsx` in the page's own
   * segment, which Next.js only applies when the page sets no image itself.
   */
  shareImage?: "site" | "route";
};

/**
 * Title, description, canonical URL, and Open Graph and Twitter tags for one page.
 *
 * Metadata objects merge shallowly, so every page sets the whole `openGraph` and
 * `twitter` objects here, including the share image (see `shareImage`).
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  alternateTypes,
  shareImage = "site",
}: PageMetadataInput): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} — ${siteName}`;
  const siteImage = shareImage === "site";

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path, ...(alternateTypes ? { types: alternateTypes } : {}) },
    openGraph: {
      type: "website",
      siteName,
      locale: "en_US",
      url: path,
      title: socialTitle,
      description,
      ...(siteImage ? { images: [siteShareImage.openGraph] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      ...(siteImage ? { images: [siteShareImage.twitter] } : {}),
    },
  };
}
