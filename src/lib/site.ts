import registry from "../../registry.json";

/**
 * Canonical origin of the public site, used for canonical links, Open Graph URLs,
 * robots.txt, and the sitemap.
 *
 * It follows the `homepage` in `registry.json`, the same origin every registry
 * dependency URL points at, so search engines never see a preview or localhost URL.
 * Update `homepage` when the site moves.
 */
export const siteUrl = registry.homepage.replace(/\/$/, "");

export const siteName = "Uai";

export const siteTitle = "Uai — Open code for web products";

export const siteDescription =
  "Open-code React patterns for websites and web applications, distributed through the shadcn CLI.";

/** Absolute URL for a site path such as `/components/thinking`. */
export function absoluteUrl(pathname: string) {
  return new URL(pathname, `${siteUrl}/`).toString();
}

/** Size of every generated share image (the Open Graph 1.91:1 ratio). */
export const shareImageSize = { width: 1200, height: 630 };
