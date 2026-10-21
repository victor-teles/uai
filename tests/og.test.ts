import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { findRegistryItem, registryCatalog } from "@/components/registry/catalog";

import { getOgTheme, renderRegistryOgImage, renderSiteOgImage } from "@/lib/og";
import { heroDescription, heroTitle, siteDescription, siteTitle } from "@/lib/site";
import { contains, intersect, overlaps, roundIn, roundOut } from "../scripts/og-clip";

const ogDir = path.join(import.meta.dirname, "..", "src", "assets", "og");

describe("share images", () => {
  test("every catalog item has a dark and light specimen capture", () => {
    for (const item of registryCatalog) {
      const capture = JSON.parse(readFileSync(path.join(ogDir, `${item.id}.json`), "utf8")) as {
        variant: unknown;
      };
      expect(capture.variant === null || typeof capture.variant === "string", item.id).toBe(true);
      for (const theme of ["dark", "light"] as const) {
        expect(existsSync(path.join(ogDir, `${item.id}-${theme}.png`)), `${item.id} ${theme}`).toBe(
          true,
        );
      }
    }
  });

  test("uses light for Brazil and image-led items and dark everywhere else", () => {
    const pix = findRegistryItem("pix-payment");
    const thinking = findRegistryItem("thinking");
    const gallery = findRegistryItem("product-gallery");
    if (!pix || !thinking || !gallery) throw new Error("missing fixture items");
    expect(getOgTheme(pix)).toBe("light");
    expect(getOgTheme(gallery)).toBe("light");
    expect(getOgTheme(thinking)).toBe("dark");
  });

  test("renders a 1200x630 PNG for a component and for the site", async () => {
    const item = findRegistryItem("approval-card");
    if (!item) throw new Error("missing approval-card");
    for (const response of [renderRegistryOgImage(item), renderSiteOgImage()]) {
      expect(response.headers.get("content-type")).toBe("image/png");
      const bytes = new Uint8Array(await response.arrayBuffer());
      const view = new DataView(bytes.buffer);
      expect(view.getUint32(16)).toBe(1200);
      expect(view.getUint32(20)).toBe(630);
    }
  });

  test("renders the 1280x640 GitHub social preview from the same template", async () => {
    const response = renderSiteOgImage({ width: 1280, height: 640, safe: 40 });
    const view = new DataView(await response.arrayBuffer());
    expect(view.getUint32(16)).toBe(1280);
    expect(view.getUint32(20)).toBe(640);
  });

  test("site copy is the approved home hero, verbatim", () => {
    const overview = readFileSync(
      path.join(
        import.meta.dirname,
        "..",
        "src",
        "components",
        "registry",
        "registry-overview.tsx",
      ),
      "utf8",
    ).replace(/\s+/g, " ");
    expect(heroTitle).toBe("Components that feel finished.");
    expect(overview).toContain(`<h1 id="uai-overview-title">${heroTitle}</h1>`);
    expect(heroDescription).toBe(
      `${registryCatalog.length} shadcn components and blocks with real motion and micro-interactions built in. Copy them with the CLI and own every line.`,
    );
    expect(overview).toContain(heroDescription.replace(/^\d+/, "{registryCatalog.length}"));
    expect(siteTitle).toBe("Uai — Components that feel finished.");
    expect(siteTitle.length).toBeLessThanOrEqual(60);
    expect(siteDescription.length).toBeLessThanOrEqual(155);
  });

  test("no specimen capture contains site chrome (the lime signal is site-only)", async () => {
    for (const { id } of registryCatalog) {
      for (const theme of ["dark", "light"] as const) {
        const { data, info } = await sharp(path.join(ogDir, `${id}-${theme}.png`))
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        let signal = 0;
        for (let i = 0; i < data.length; i += info.channels) {
          const r = data[i] ?? 0;
          const g = data[i + 1] ?? 0;
          const b = data[i + 2] ?? 0;
          const a = data[i + 3] ?? 0;
          if (a > 200 && Math.abs(r - 204) < 14 && Math.abs(g - 245) < 14 && Math.abs(b - 65) < 20)
            signal++;
        }
        expect(signal, `${id} ${theme}`).toBeLessThan(20);
      }
    }
  }, 30_000);

  test("a capture rect is clipped to the canvas and never reaches the code dock", () => {
    // Geometry from /components/dashboard-shell at 1440x1000: the block runs 238px
    // below the canvas, over the "Code example" dock.
    const canvas = { x: 248, y: 84.4, width: 866, height: 596.2 };
    const dock = { x: 248, y: 681, width: 866, height: 5592 };
    const block = { x: 272.3, y: 156.6, width: 818.4, height: 762.1 };
    expect(overlaps(roundOut(block), dock)).toBe(true);
    const clip = intersect(roundOut(block), roundIn(canvas));
    if (!clip) throw new Error("no clip");
    expect(clip).toEqual({ x: 272, y: 156, width: 819, height: 524 });
    expect(contains(canvas, clip)).toBe(true);
    expect(overlaps(clip, dock)).toBe(false);
    // A block that fits keeps its whole (rounded-out) box, as an element screenshot does.
    const card = { x: 471.5, y: 252.2, width: 420, height: 276 };
    expect(intersect(roundOut(card), roundIn(canvas))).toEqual(roundOut(card));
    // Nothing on the canvas: no rect.
    expect(intersect({ x: 0, y: 700, width: 10, height: 10 }, roundIn(canvas))).toBeNull();
  });
});
