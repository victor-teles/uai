/**
 * Share image template rendered by `next/og` (Satori) for every `opengraph-image`
 * and `twitter-image` route. It ports Designer's OG template
 * (`showcase/og/og-template.md`): a 520px text column beside a specimen panel that
 * repeats the site canvas (3% tint, 24px grid, Signal Ink crop marks, variant label,
 * install pill).
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

export type OgTemplateProps = {
  theme: OgTheme;
  /** First eyebrow word in Signal Ink, such as `component`, `block`, or `registry`. */
  kind: string;
  /** Muted eyebrow label, such as the component category. */
  eyebrow: string;
  /** Catalog position such as `07/108`; omitted on site pages. */
  position?: string;
  title: string;
  description: string;
  /** Host shown in the footer, such as `uaiblocks.vercel.app`. */
  host: string;
  /** Data URL of the uai mark tinted for the Signal tile. */
  mark: string;
  specimen?: OgSpecimen;
};

/** Site tokens from `global.css` in sRGB. */
export const ogColors = {
  dark: {
    canvas: "#1b1c1e",
    panel: "#202123",
    grid: "rgba(48, 49, 53, 0.55)",
    border: "#303135",
    text: "#f2f3f4",
    muted: "#a5a8ad",
    subtle: "#83868c",
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
    muted: "#585b61",
    subtle: "#6e7278",
    signal: "#ccf541",
    signalForeground: "#14180d",
    signalInk: "#4d7002",
  },
} as const;

const size = { width: 1200, height: 630 };
const column = 520;
const panelInset = 40;
const panel = {
  width: size.width - column - panelInset,
  height: size.height - panelInset * 2,
};

/**
 * Display size of a 2x capture: like an `<img>` with `max-width: 86%; max-height: 78%`,
 * the specimen grows up to its 2x pixel size until it meets the panel cap.
 */
function specimenBox(specimen: OgSpecimen) {
  const contentWidth = (specimen.width - specimen.pad * 2) / 2;
  const contentHeight = (specimen.height - specimen.pad * 2) / 2;
  const scale = Math.min(
    2,
    (panel.width * 0.86) / contentWidth,
    (panel.height * 0.78) / contentHeight,
  );
  return {
    width: Math.round((specimen.width / 2) * scale),
    height: Math.round((specimen.height / 2) * scale),
  };
}

function CropMark({ color, corner }: { color: string; corner: "tl" | "tr" | "bl" | "br" }) {
  const top = corner === "tl" || corner === "tr";
  const left = corner === "tl" || corner === "bl";
  return (
    <div
      style={{
        position: "absolute",
        width: 18,
        height: 18,
        ...(top
          ? { top: 20, borderTop: `2px solid ${color}` }
          : { bottom: 20, borderBottom: `2px solid ${color}` }),
        ...(left
          ? { left: 20, borderLeft: `2px solid ${color}` }
          : { right: 20, borderRight: `2px solid ${color}` }),
      }}
    />
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
        <div
          style={{
            marginTop: 22,
            fontSize: title.length > 24 ? 56 : 64,
            lineHeight: 1.02,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            textWrap: "balance",
            maxWidth: 456,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "block",
            marginTop: 20,
            maxWidth: 440,
            fontSize: 24,
            lineHeight: "33px",
            color: color.muted,
            lineClamp: 3,
            overflow: "hidden",
          }}
        >
          {description}
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "Geist Mono",
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "-0.03em",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: color.signal,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* biome-ignore lint/performance/noImgElement: Satori renders plain img elements only. */}
              <img src={mark} width={22} height={22} alt="" />
            </div>
            uai
          </div>
          <span style={{ fontFamily: "Geist Mono", fontSize: 17, color: color.subtle }}>
            {host}
          </span>
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
            display: "flex",
            alignItems: "center",
          }}
        >
          add {specimen ? specimen.install : "uai-theme"}
        </div>
      </div>
    </div>
  );
}
