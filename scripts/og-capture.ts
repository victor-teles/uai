/**
 * Captures the live specimen of every registry item for its share image.
 *
 * Run against a production server (`bun run build && bun run start`), then commit the
 * output: `bun run og:capture` (set OG_BASE_URL to use another origin). For each item
 * and theme it opens `/components/<id>`, waits for the resting state, and screenshots
 * the `[data-slot="<id>"]` element inside the live preview at 2x with a transparent
 * background. The images land in `src/assets/og/<id>-<theme>.png`, and
 * `src/assets/og/manifest.json` records the default variant shown on the canvas.
 *
 * Pass item ids as arguments to capture only those items.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import sharp from "sharp";

import {
  useTheme as applyTheme,
  componentIds,
  openComponent,
  PREVIEW,
  settle,
  THEMES,
  type Theme,
} from "../e2e/helpers";

const baseURL = process.env.OG_BASE_URL ?? "http://127.0.0.1:3100";
const outDir = path.join(import.meta.dirname, "..", "src", "assets", "og");
const manifestPath = path.join(outDir, "manifest.json");

/** Captures fit inside the specimen panel (86% x 78% of 640 x 550) at 2x. */
const maxSize = { width: 1100, height: 860 };

/**
 * Satori has no `drop-shadow` filter, so the `0 20px 40px` shadow is baked into the
 * image at 2x: the capture sits `shadowPad` pixels from every edge.
 */
const shadowPad = 120;
const shadowOffset = 40;
const shadowSigma = 26;
const shadowAlpha = 0.25;

/** Clears the canvas grid and fills behind the specimen so rounded corners stay transparent. */
const transparentCanvas = `
  html, body, .uai-site, .uai-site-main, .uai-bench, .uai-bench__workspace, .uai-bench__canvas, .uai-registry-specimen,
  .uai-registry-specimen__world { background: transparent !important; background-image: none !important; }
  .uai-registry-specimen::before, .uai-registry-specimen::after,
  .uai-registry-specimen__world::before, .uai-registry-specimen__world::after,
  .uai-registry-specimen__marks { display: none !important; }
  /* Site chrome that floats over the canvas (variant switch, zoom controls) must never
     land in a capture; the lime signal is site-only. */
  .uai-registry-variants, .uai-canvas-controls { visibility: hidden !important; }
`;

type Size = { width: number; height: number };
type Manifest = Record<string, { variant: string | null } & Partial<Record<Theme, Size>>>;

const only = process.argv.slice(2);
const ids = only.length > 0 ? componentIds.filter((id) => only.includes(id)) : componentIds;

function readManifest(): Manifest {
  try {
    return JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  } catch {
    return {};
  }
}

/**
 * The item's own root when it renders visibly on the canvas, otherwise the preview's
 * top element (dialogs and sheets render a trigger until they open).
 */
async function captureSpecimen(page: Page, id: string) {
  const candidates = [
    page.locator(`${PREVIEW} [data-slot="${id}"]:visible`).first(),
    page
      .locator(`${PREVIEW} .uai-registry-specimen__world > :not(.uai-registry-specimen__marks)`)
      .first(),
  ];
  for (const candidate of candidates) {
    if ((await candidate.count()) === 0) continue;
    try {
      return await candidate.screenshot({
        omitBackground: true,
        animations: "disabled",
        timeout: 5_000,
      });
    } catch {
      // Not visible or not an element box; try the next candidate.
    }
  }
  throw new Error(`No visible specimen for ${id}`);
}

/** Fits the capture to the panel and composites it over its soft shadow. */
async function withShadow(shot: Buffer, file: string): Promise<Size> {
  const card = await sharp(shot)
    .resize({ ...maxSize, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = card.info;
  const shadow = await sharp(card.data)
    .ensureAlpha()
    .linear([0, 0, 0, shadowAlpha], [0, 0, 0, 0])
    .extend({
      top: shadowPad + shadowOffset,
      bottom: shadowPad - shadowOffset,
      left: shadowPad,
      right: shadowPad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .blur(shadowSigma)
    .png()
    .toBuffer();
  await sharp(shadow)
    .composite([{ input: card.data, left: shadowPad, top: shadowPad }])
    .png({ compressionLevel: 9, effort: 10, palette: true, quality: 92, dither: 0.5 })
    .toFile(file);
  return { width: width + shadowPad * 2, height: height + shadowPad * 2 };
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const manifest = readManifest();
  const browser = await chromium.launch();

  for (const theme of THEMES) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await applyTheme(page, theme);

    for (const id of ids) {
      await openComponent(page, id);
      await settle(page);
      const variant = await page
        .locator(".uai-bench__toolbar-variant")
        .textContent()
        .catch(() => null);
      await page.addStyleTag({ content: transparentCanvas });
      const shot = await captureSpecimen(page, id);
      const size = await withShadow(shot, path.join(outDir, `${id}-${theme}.png`));
      manifest[id] = {
        ...manifest[id],
        variant: variant?.match(/"(.*)"/)?.[1] ?? null,
        [theme]: size,
      };
      console.log(`${theme} ${id}`);
    }
    await context.close();
  }

  await browser.close();
  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
}

await main();
