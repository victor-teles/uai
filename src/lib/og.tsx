import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import {
  type OgSceneCard,
  OgSiteTemplate,
  type OgSpecimen,
  OgTemplate,
  type OgTemplateProps,
  type OgTheme,
  ogColors,
} from "@/components/og/og-template";
import {
  getRegistryItemKind,
  getRegistryPosition,
  type RegistryCatalogItem,
  registryCatalog,
} from "@/components/registry/catalog";
import { heroDescription, heroTitle, shareImageSize, siteUrl } from "@/lib/site";

export const ogImageSize = shareImageSize;

export const ogImageContentType = "image/png";

const assets = path.join(process.cwd(), "src", "assets");

/** Transparent margin `scripts/og-capture.ts` leaves around each capture for its shadow. */
const capturePad = 120;

/**
 * Social feeds are mostly dark and the lime reads best there, so share images are dark
 * by default. Brazil items and image-led items use light (Designer's OG rule).
 */
const lightItems: ReadonlySet<string> = new Set(["product-gallery", "product-listing"]);

export function getOgTheme(item: RegistryCatalogItem): OgTheme {
  return item.category === "Brazil" || lightItems.has(item.id) ? "light" : "dark";
}

/**
 * The uai mark (`uai-mark.svg`, 32x32, `currentColor`) as an SVG data URL filled with
 * the Signal foreground, for the Signal tile.
 */
let markUrl: string | undefined;
function mark() {
  markUrl ??= `data:image/svg+xml;base64,${Buffer.from(
    readFileSync(path.join(assets, "og", "uai-mark.svg"), "utf8").replace(
      'fill="currentColor"',
      `fill="${ogColors.dark.signalForeground}"`,
    ),
  ).toString("base64")}`;
  return markUrl;
}

function font(file: string) {
  return readFileSync(path.join(assets, "fonts", file));
}

let fonts: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"];

function loadFonts() {
  fonts ??= [
    { name: "Inter", data: font("inter-latin-400-normal.woff"), weight: 400, style: "normal" },
    { name: "Inter", data: font("inter-latin-600-normal.woff"), weight: 600, style: "normal" },
    {
      name: "Geist Mono",
      data: font("geist-mono-latin-400-normal.woff"),
      weight: 400,
      style: "normal",
    },
    {
      name: "Geist Mono",
      data: font("geist-mono-latin-500-normal.woff"),
      weight: 500,
      style: "normal",
    },
    {
      name: "Geist Mono",
      data: font("geist-mono-latin-600-normal.woff"),
      weight: 600,
      style: "normal",
    },
  ];
  return fonts;
}

/** `src/assets/og/<id>.json`, written by `scripts/og-capture.ts`: one file per item. */
type Capture = { variant: string | null };

function specimenFor(id: string, theme: OgTheme): OgSpecimen | undefined {
  const capturePath = path.join(assets, "og", `${id}.json`);
  const imagePath = path.join(assets, "og", `${id}-${theme}.png`);
  if (!existsSync(capturePath) || !existsSync(imagePath)) return undefined;
  const capture = JSON.parse(readFileSync(capturePath, "utf8")) as Capture;
  const png = readFileSync(imagePath);
  return {
    src: `data:image/png;base64,${png.toString("base64")}`,
    // The size comes from the PNG's IHDR chunk: width and height at bytes 16 and 20.
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    pad: capturePad,
    variant: capture.variant,
    install: id,
  };
}

type OgImageInput = Omit<OgTemplateProps, "host" | "mark" | "theme"> & { theme?: OgTheme };

/** Renders one share image with the pluggable `OgTemplate`. */
export function renderOgImage({ theme = "dark", ...props }: OgImageInput) {
  const host = new URL(siteUrl).host;
  return new ImageResponse(<OgTemplate {...props} theme={theme} host={host} mark={mark()} />, {
    ...ogImageSize,
    fonts: loadFonts(),
  });
}

/**
 * The home live scene as a staircase on the site panel, in CSS pixels from the panel's
 * top-left corner: the agent thinking, the approval, then the Pix charge running off
 * the bottom edge. Each card only overlaps the padding of the one above it.
 */
const sceneLayout: ReadonlyArray<{ id: string; x: number; y: number; scale: number }> = [
  { id: "thinking", x: 40, y: 56, scale: 1 },
  { id: "approval-card", x: 150, y: 316, scale: 1 },
  { id: "pix-payment", x: 240, y: 444, scale: 1 },
];

function siteScene(theme: OgTheme, offset = { x: 0, y: 0 }): OgSceneCard[] {
  return sceneLayout.flatMap(({ id, x, y, scale }) => {
    const specimen = specimenFor(id, theme);
    return specimen ? [{ ...specimen, x: x + offset.x, y: y + offset.y, scale }] : [];
  });
}

type SiteOgInput = {
  theme?: OgTheme;
  /** 1200×630 for Open Graph (default); 1280×640 with `safe: 40` for the GitHub social preview. */
  width?: number;
  height?: number;
  safe?: number;
};

/** Home and site-wide share image: the approved hero beside the live scene. */
export function renderSiteOgImage({
  theme = "dark",
  width = ogImageSize.width,
  height = ogImageSize.height,
  safe = 0,
}: SiteOgInput = {}) {
  const host = new URL(siteUrl).host;
  return new ImageResponse(
    <OgSiteTemplate
      theme={theme}
      width={width}
      height={height}
      safe={safe}
      kind="shadcn registry"
      eyebrow={`${registryCatalog.length} items`}
      title={heroTitle}
      description={heroDescription}
      host={host}
      mark={mark()}
      scene={siteScene(theme, { x: safe / 2, y: 0 })}
    />,
    { width, height, fonts: loadFonts() },
  );
}

/** Share image for `/components/<id>`: copy from the catalog beside the live specimen. */
export function renderRegistryOgImage(item: RegistryCatalogItem, theme = getOgTheme(item)) {
  return renderOgImage({
    theme,
    kind: getRegistryItemKind(item.id),
    eyebrow: item.category.toLowerCase(),
    position: `${getRegistryPosition(item.id).number}/${registryCatalog.length}`,
    title: item.name,
    description: item.description,
    specimen: specimenFor(item.id, theme),
  });
}
