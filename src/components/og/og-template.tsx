/**
 * Share image template rendered by `next/og` (Satori) for every `opengraph-image`
 * and `twitter-image` route.
 *
 * This is the pluggable part: replace the markup below with the final design and
 * every route picks it up. Satori only supports inline styles and flexbox, so this
 * file is the one place in the site that styles with `style` objects. Keep the
 * props stable, or update `src/lib/og.tsx` alongside them.
 */
export type OgTemplateProps = {
  /** Small label above the title, such as the component category. */
  eyebrow: string;
  title: string;
  description: string;
  /** Host and path shown in the footer, such as `uaiblocks.vercel.app/components/thinking`. */
  url: string;
};

const colors = {
  background: "#17181c",
  text: "#f4f5f6",
  muted: "#a1a3aa",
  hairline: "#2c2e34",
  signal: "#d4f046",
} as const;

export function OgTemplate({ eyebrow, title, description, url }: OgTemplateProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: colors.background,
        color: colors.text,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: colors.signal,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>Uai</div>
        <div style={{ display: "flex", fontSize: 26, color: colors.muted, marginLeft: 8 }}>
          {eyebrow}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 600, lineHeight: 1.05 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: colors.muted, lineHeight: 1.35 }}>
          {description}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          borderTop: `1px solid ${colors.hairline}`,
          paddingTop: 24,
          fontSize: 24,
          color: colors.muted,
        }}
      >
        {url}
      </div>
    </div>
  );
}
