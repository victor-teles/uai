import { describe, expect, test } from "bun:test";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { registryCatalog } from "@/components/registry/catalog";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl, siteUrl } from "@/lib/site";
import registry from "../registry.json";

describe("robots.txt", () => {
  test("allows every crawler and points at the sitemap on the canonical origin", () => {
    const result = robots();
    expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(result.sitemap).toBe(`${registry.homepage}/sitemap.xml`);
  });
});

describe("sitemap.xml", () => {
  test("lists the overview, the theming guide, and every registry item page once", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain(`${siteUrl}/`);
    expect(urls).toContain(`${siteUrl}/theming`);
    for (const item of registryCatalog) {
      expect(urls).toContain(`${siteUrl}/components/${item.id}`);
    }
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url.startsWith(`${siteUrl}/`))).toBe(true);
  });
});

describe("page metadata", () => {
  test("sets title, description, canonical, Open Graph, and Twitter tags", () => {
    const metadata = pageMetadata({
      title: "Thinking",
      description: "A disclosure.",
      path: "/components/thinking",
    });
    expect(metadata.title).toBe("Thinking");
    expect(metadata.description).toBe("A disclosure.");
    expect(metadata.alternates?.canonical).toBe("/components/thinking");
    expect(metadata.openGraph).toMatchObject({
      url: "/components/thinking",
      title: "Thinking — Uai",
      description: "A disclosure.",
      images: [expect.objectContaining({ url: "/opengraph-image" })],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Thinking — Uai",
      images: [expect.objectContaining({ url: "/twitter-image" })],
    });
  });

  test("leaves the share image to the route's own image file when asked", () => {
    const metadata = pageMetadata({
      title: "Thinking",
      description: "A disclosure.",
      path: "/components/thinking",
      shareImage: "route",
    });
    expect(metadata.openGraph).not.toHaveProperty("images");
    expect(metadata.twitter).not.toHaveProperty("images");
  });

  test("resolves site paths against the registry homepage", () => {
    expect(absoluteUrl("/theming")).toBe(`${registry.homepage}/theming`);
  });
});
