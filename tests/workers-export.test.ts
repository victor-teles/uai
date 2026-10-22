import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";

import { headerRules, renderHeaders, renderRedirects } from "../scripts/workers-export";

const shareImages = ["/opengraph-image", "/components/:id/opengraph-image-abc123"];

describe("Cloudflare Workers export", () => {
  test("registry documents are JSON with a cache, on every /r path", () => {
    const registry = headerRules(shareImages).find((rule) => rule.path === "/r/*");
    expect(registry?.headers["Content-Type"]).toBe("application/json; charset=utf-8");
    expect(registry?.headers["Cache-Control"]).toContain("public");
  });

  test("share images and Markdown routes keep the types Vercel serves", () => {
    const headers = renderHeaders(headerRules(shareImages));
    expect(headers).toContain("/components/:id/opengraph-image-abc123\n  Content-Type: image/png");
    expect(headers).toContain("/llms.txt\n  Content-Type: text/markdown; charset=utf-8");
    expect(headers).toContain("/*\n  Access-Control-Allow-Origin: *");
  });

  test("HTML pages, component Markdown and robots.txt declare utf-8, as on Vercel", () => {
    const headers = renderHeaders(headerRules(shareImages, ["/", "/components/:id", "/theming"]));
    expect(headers).toContain("/\n  Content-Type: text/html; charset=utf-8");
    expect(headers).toContain("/components/:id\n  Content-Type: text/html; charset=utf-8");
    expect(headers).toContain(
      "/components/:id.md\n  ! Content-Type\n  Content-Type: text/markdown; charset=utf-8",
    );
    expect(headers).toContain(
      "/components/:id.txt\n  ! Content-Type\n  Content-Type: text/plain\n",
    );
    expect(headers).toContain("/robots.txt\n  Content-Type: text/plain; charset=utf-8");
    // The overrides must follow the broader page rule, or the page type would win.
    expect(headers.indexOf("/components/:id.md")).toBeGreaterThan(
      headers.indexOf("/components/:id\n"),
    );
  });

  test("without component pages, no component overrides are written", () => {
    const paths = headerRules(shareImages, ["/"]).map((rule) => rule.path);
    expect(paths).not.toContain("/components/:id.md");
  });

  test("stays inside the Workers limit of 100 header rules", () => {
    expect(headerRules(shareImages, ["/", "/components/:id", "/theming"]).length).toBeLessThan(100);
  });

  test("a trailing slash redirects to the bare path with a 308", () => {
    expect(renderRedirects(2)).toBe("/:s1/ /:s1 308\n/:s1/:s2/ /:s1/:s2 308\n");
  });

  test("wrangler serves the export as static assets only, with no secrets", () => {
    const config = readFileSync(path.join(import.meta.dirname, "..", "wrangler.jsonc"), "utf8");
    expect(config).toContain('"directory": "./out"');
    expect(config).not.toMatch(/"main"\s*:/);
    expect(config).not.toMatch(/"account_id"|"api_token"/);
  });
});
