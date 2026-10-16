import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import captures from "@/assets/og/manifest.json";
import {
  type OgSpecimen,
  OgTemplate,
  type OgTemplateProps,
  type OgTheme,
} from "@/components/og/og-template";
import {
  getRegistryItemKind,
  getRegistryPosition,
  type RegistryCatalogItem,
  registryCatalog,
} from "@/components/registry/catalog";
import { shareImageSize, siteUrl } from "@/lib/site";

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

function dataUrl(file: string) {
  return `data:image/png;base64,${readFileSync(file).toString("base64")}`;
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

type Capture = { variant: string | null } & Partial<
  Record<OgTheme, { width: number; height: number }>
>;

function specimenFor(id: string, theme: OgTheme): OgSpecimen | undefined {
  const capture = (captures as Record<string, Capture>)[id];
  const size = capture?.[theme];
  if (!capture || !size) return undefined;
  return {
    src: dataUrl(path.join(assets, "og", `${id}-${theme}.png`)),
    ...size,
    pad: capturePad,
    variant: capture.variant,
    install: id,
  };
}

type OgImageInput = Omit<OgTemplateProps, "host" | "mark" | "theme"> & { theme?: OgTheme };

/** Renders one share image with the pluggable `OgTemplate`. */
export function renderOgImage({ theme = "dark", ...props }: OgImageInput) {
  const host = new URL(siteUrl).host;
  const mark = dataUrl(path.join(assets, "og", "uai-mark.png"));
  return new ImageResponse(<OgTemplate {...props} theme={theme} host={host} mark={mark} />, {
    ...ogImageSize,
    fonts: loadFonts(),
  });
}

/** Share image for `/components/<id>`: copy from the catalog beside the live specimen. */
export function renderRegistryOgImage(item: RegistryCatalogItem) {
  const theme = getOgTheme(item);
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
