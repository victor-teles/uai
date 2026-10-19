import { registryCatalog } from "@/components/registry/catalog";
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

/**
 * Approved home hero (17 Oct 2026). The overview `<h1>` and intro, the default title,
 * the meta and social descriptions, the share image, and llms.txt all read these, so
 * the story is told once. The count is the catalog length, as on the home page.
 */
export const heroTitle = "Components that feel finished.";

export const heroDescription = `${registryCatalog.length} shadcn components and blocks with real motion and micro-interactions built in. Copy them with the CLI and own every line.`;

export const siteTitle = `${siteName} — ${heroTitle}`;

export const siteDescription = heroDescription;

/** Absolute URL for a site path such as `/components/thinking`. */
export function absoluteUrl(pathname: string) {
  return new URL(pathname, `${siteUrl}/`).toString();
}

/** Size of every generated share image (the Open Graph 1.91:1 ratio). */
export const shareImageSize = { width: 1200, height: 630 };
