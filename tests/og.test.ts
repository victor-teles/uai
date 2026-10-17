import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import path from "node:path";

import captures from "@/assets/og/manifest.json";
import { findRegistryItem, registryCatalog } from "@/components/registry/catalog";
import { getOgTheme, renderOgImage, renderRegistryOgImage } from "@/lib/og";

const ogDir = path.join(import.meta.dirname, "..", "src", "assets", "og");
const manifest = captures as Record<
  string,
  { variant: string | null; dark?: { width: number }; light?: { width: number } }
>;

describe("share images", () => {
  test("every catalog item has a dark and light specimen capture", () => {
    for (const item of registryCatalog) {
      const capture = manifest[item.id];
      expect(capture, item.id).toBeDefined();
      for (const theme of ["dark", "light"] as const) {
        expect(capture?.[theme]?.width, `${item.id} ${theme}`).toBeGreaterThan(0);
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
    for (const response of [
      renderRegistryOgImage(item),
      renderOgImage({
        kind: "registry",
        eyebrow: "shadcn",
        title: "Open code for web products",
        description: "Open-code React patterns.",
      }),
    ]) {
      expect(response.headers.get("content-type")).toBe("image/png");
      const bytes = new Uint8Array(await response.arrayBuffer());
      const view = new DataView(bytes.buffer);
      expect(view.getUint32(16)).toBe(1200);
      expect(view.getUint32(20)).toBe(630);
    }
  });
});
