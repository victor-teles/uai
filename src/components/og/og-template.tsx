/**
 * Share image templates rendered by `next/og` (Satori) for every `opengraph-image`
 * and `twitter-image` route, and for the GitHub social preview export.
 *
 * - `OgTemplate`: one registry item. A 520px text column beside a specimen panel
 *   that repeats the site canvas (3% tint, 24px grid, Signal Ink crop marks, variant
 *   label, install pill).
 * - `OgSiteTemplate`: the home and site-wide image. The approved hero copy beside a
 *   ruled panel that bleeds off the right and bottom edges and holds the four
 *   components of the home live scene (Prompt Composer, Thinking, Approval Card,
 *   Pix Payment) as a staircase, so the card shows the real product.
 *
 * Satori only supports inline styles and flexbox, so this file is the one place in
 * the site that styles with `style` objects. Colors are the site tokens converted to
 * sRGB, because Satori does not parse `oklch()`. Keep the props stable, or update
 * `src/lib/og.tsx` alongside them.
 */
export type OgTheme = "dark" | "light";

export type OgSpecimen = {
  /** Data URL of the capture from `scripts/og-capture.ts`, shadow included. */
  src: string;
  /** Pixel size of the capture (2x, including `pad` on every side). */
  width: number;
  height: number;
  /** Transparent margin around the specimen that holds the baked shadow, in capture pixels. */
  pad: number;
  /** Default canvas variant, shown as `variant="…"`. */
  variant: string | null;
  /** Registry item name for the install pill, such as `thinking`. */
  install: string;
};

type OgBrand = {
  /** Host shown in the footer, such as `uaiblocks.dev`. */
  host: string;
  /** Data URL of the uai mark (SVG) filled with the Signal foreground. */
  mark: string;
};

export type OgTemplateProps = OgBrand & {
  theme: OgTheme;
  /** First eyebrow word in Signal Ink, such as `component`, `block`, or `registry`. */
  kind: string;
  /** Muted eyebrow label, such as the component category. */
  eyebrow: string;
  /** Catalog position such as `07/108`; omitted on site pages. */
  position?: string;
  title: string;
  description: string;
  specimen?: OgSpecimen;
};

/**
 * 66px for short names, 56px above 18 characters or when one word reaches 12 (a single
 * "Documentation" or "Announcement" at 66px runs into the specimen panel).
 */
function titleSize(title: string) {
  const longestWord = Math.max(...title.split(/\s+/).map((word) => word.length));
  return title.length > 18 || longestWord >= 12 ? 56 : 66;
}

/** Site tokens from `global.css` (after the contrast pass, #18) in sRGB. */
export const ogColors = {
  dark: {
    canvas: "#1b1c1e",
    panel: "#202123",
    grid: "rgba(48, 49, 53, 0.55)",
    border: "#303135",
    text: "#f2f3f4",
    muted: "#b8bbc0",
    subtle: "#989ba2",
    signal: "#ccf541",
    signalForeground: "#14180d",
    signalInk: "#ccf541",
  },
  light: {
    canvas: "#f6f7f7",
    panel: "#efeff0",
    grid: "rgba(226, 227, 229, 0.55)",
    border: "#e2e3e5",
    text: "#1f2124",
    muted: "#4d5055",
    subtle: "#66696f",
    signal: "#ccf541",
    signalForeground: "#14180d",
    signalInk: "#4d7002",
  },
} as const;

type Palette = (typeof ogColors)[OgTheme];

const size = { width: 1200, height: 630 };
const column = 520;
const panelInset = 40;
const panel = {
  width: size.width - column - panelInset,
  height: size.height - panelInset * 2,
};

/**
 * Display size of a 2x capture: like an `<img>` with `max-width: 90%; max-height: 66%`,
 * the specimen grows up to its 2x pixel size until it meets the panel cap. The height
 * cap keeps tall blocks clear of the variant label (top) and install pill (bottom).
 */
function specimenBox(specimen: OgSpecimen) {
  const contentWidth = (specimen.width - specimen.pad * 2) / 2;
  const contentHeight = (specimen.height - specimen.pad * 2) / 2;
  const scale = Math.min(
    2,
    (panel.width * 0.9) / contentWidth,
    (panel.height * 0.66) / contentHeight,
  );
  return {
    width: Math.round((specimen.width / 2) * scale),
    height: Math.round((specimen.height / 2) * scale),
  };
}

function CropMark({
  color,
  corner,
  inset = 20,
}: {
  color: string;
  corner: "tl" | "tr" | "bl" | "br";
  inset?: number;
}) {
  const top = corner === "tl" || corner === "tr";
  const left = corner === "tl" || corner === "bl";
  return (
    <div
      style={{
        position: "absolute",
        width: 18,
        height: 18,
        ...(top
          ? { top: inset, borderTop: `2px solid ${color}` }
          : { bottom: inset, borderBottom: `2px solid ${color}` }),
        ...(left
          ? { left: inset, borderLeft: `2px solid ${color}` }
          : { right: inset, borderRight: `2px solid ${color}` }),
      }}
    />
  );
}

/** Mono eyebrow: Signal Ink kind · muted label · subtle position. */
function Eyebrow({
  color,
  kind,
  eyebrow,
  position,
}: {
  color: Palette;
  kind: string;
  eyebrow: string;
  position?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "Geist Mono",
        fontSize: 18,
        color: color.muted,
      }}
    >
      <span style={{ fontWeight: 500, color: color.signalInk }}>{kind}</span>
      <span style={{ color: color.subtle }}>·</span>
      <span>{eyebrow}</span>
      {position ? <span style={{ color: color.subtle }}>{position}</span> : null}
    </div>
  );
}

/**
 * The site lockup: the Signal tile draws the "U", the mono wordmark adds "ai"
 * (PRODUCT.md, Brand commitments; same as the top bar), then the host.
 */
function Lockup({ color, mark, host }: { color: Palette } & OgBrand) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "Geist Mono",
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: color.text,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: color.signal,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: Satori renders plain img elements only. */}
          <img src={mark} width={24} height={24} alt="" />
        </div>
        ai
      </div>
      <div style={{ width: 1, height: 22, background: color.border }} />
      <span style={{ fontFamily: "Geist Mono", fontSize: 18, color: color.subtle }}>{host}</span>
    </div>
  );
}

export function OgTemplate({
  theme,
  kind,
  eyebrow,
  position,
  title,
  description,
  host,
  mark,
  specimen,
}: OgTemplateProps) {
  const color = ogColors[theme];
  const box = specimen ? specimenBox(specimen) : null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: color.canvas,
        color: color.text,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          width: column,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          padding: "56px 0 48px 64px",
        }}
      >
        <Eyebrow color={color} kind={kind} eyebrow={eyebrow} position={position} />
        <div
          style={{
            marginTop: 24,
            fontSize: titleSize(title),
            lineHeight: 1.02,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            textWrap: "balance",
            maxWidth: 440,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "block",
            marginTop: 20,
            maxWidth: 420,
            fontSize: 24,
            lineHeight: "33px",
            color: color.muted,
            lineClamp: 3,
            overflow: "hidden",
          }}
        >
          {description}
        </div>
        <div style={{ marginTop: "auto", display: "flex" }}>
          <Lockup color={color} mark={mark} host={host} />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: panel.width,
          height: panel.height,
          marginTop: panelInset,
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: color.panel,
          backgroundImage: `linear-gradient(${color.grid} 1px, transparent 1px), linear-gradient(90deg, ${color.grid} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          boxShadow: `inset 0 0 0 1px ${color.border}`,
        }}
      >
        <CropMark color={color.signalInk} corner="tl" />
        <CropMark color={color.signalInk} corner="tr" />
        <CropMark color={color.signalInk} corner="bl" />
        <CropMark color={color.signalInk} corner="br" />
        {specimen?.variant ? (
          <div
            style={{
              position: "absolute",
              left: 48,
              top: 44,
              display: "flex",
              fontFamily: "Geist Mono",
              fontSize: 15,
              color: color.muted,
            }}
          >
            variant="
            <span style={{ fontWeight: 500, color: color.signalInk }}>{specimen.variant}</span>"
          </div>
        ) : null}
        {specimen && box ? (
          // biome-ignore lint/performance/noImgElement: Satori renders plain img elements only.
          <img src={specimen.src} width={box.width} height={box.height} alt="" />
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 30,
              background: color.signal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* biome-ignore lint/performance/noImgElement: Satori renders plain img elements only. */}
            <img src={mark} width={72} height={72} alt="" />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            right: 48,
            bottom: 44,
            height: 36,
            padding: "0 14px",
            borderRadius: 999,
            background: color.signal,
            color: color.signalForeground,
            fontFamily: "Geist Mono",
            fontSize: 15,
            fontWeight: 500,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
          }}
        >
          {`add ${specimen ? specimen.install : "uai-theme"}`}
        </div>
      </div>
    </div>
  );
}

/** One capture placed on the site panel, in CSS pixels relative to the panel. */
export type OgSceneCard = OgSpecimen & { x: number; y: number; scale: number };

export type OgSiteTemplateProps = OgBrand & {
  theme: OgTheme;
  /** Canvas size: 1200×630 for Open Graph, 1280×640 for the GitHub social preview. */
  width: number;
  height: number;
  /** Mono eyebrow, for example `registry · shadcn · 108 items`. */
  kind: string;
  eyebrow: string;
  position?: string;
  /** Approved hero title and subtitle, verbatim. */
  title: string;
  description: string;
  /** Live scene captures, painted in order (later cards sit on top). */
  scene: OgSceneCard[];
  /**
   * Extra inset on every side so the design survives GitHub's crop of the social
   * preview (40px). Open Graph uses 0.
   */
  safe?: number;
};

export function OgSiteTemplate({
  theme,
  width,
  height,
  kind,
  eyebrow,
  position,
  title,
  description,
  host,
  mark,
  scene,
  safe = 0,
}: OgSiteTemplateProps) {
  const color = ogColors[theme];
  const textColumn = 560 + safe;
  const panelLeft = textColumn + 40;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        background: color.canvas,
        color: color.text,
        fontFamily: "Inter",
        overflow: "hidden",
      }}
    >
      {/* The ruled panel bleeds off the right and bottom edges: the site canvas, cropped. */}
      <div
        style={{
          position: "absolute",
          left: panelLeft,
          top: 40 + safe,
          width: width - panelLeft + 40,
          height: height,
          borderRadius: 24,
          overflow: "hidden",
          display: "flex",
          backgroundColor: color.panel,
          backgroundImage: `linear-gradient(${color.grid} 1px, transparent 1px), linear-gradient(90deg, ${color.grid} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          boxShadow: `inset 0 0 0 1px ${color.border}`,
        }}
      >
        <CropMark color={color.signalInk} corner="tl" />
        {scene.map((card) => {
          const w = Math.round((card.width / 2) * card.scale);
          const h = Math.round((card.height / 2) * card.scale);
          const pad = (card.pad / 2) * card.scale;
          return (
            // biome-ignore lint/performance/noImgElement: Satori renders plain img elements only.
            <img
              key={card.install}
              src={card.src}
              width={w}
              height={h}
              alt=""
              style={{ position: "absolute", left: card.x - pad, top: card.y - pad }}
            />
          );
        })}
      </div>

      <div
        style={{
          width: textColumn,
          height: "100%",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          padding: `${56 + safe / 2}px 0 ${48 + safe}px ${64 + safe}px`,
        }}
      >
        <Eyebrow color={color} kind={kind} eyebrow={eyebrow} position={position} />
        <div
          style={{
            marginTop: 26,
            fontSize: 76,
            lineHeight: 0.98,
            fontWeight: 600,
            letterSpacing: "-0.045em",
            maxWidth: 470,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "block",
            marginTop: 24,
            maxWidth: 476,
            fontSize: 22,
            lineHeight: "31px",
            color: color.muted,
          }}
        >
          {description}
        </div>
        <div style={{ marginTop: "auto", display: "flex" }}>
          <Lockup color={color} mark={mark} host={host} />
        </div>
      </div>
    </div>
  );
}
