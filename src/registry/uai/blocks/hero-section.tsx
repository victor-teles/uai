"use client";

import { type ComponentProps, type CSSProperties, createContext, useContext, useId } from "react";
import {
  TrustPanel,
  type TrustPanelProps,
  type TrustPanelVariant,
} from "@/components/ui/uai/trust-panel";

export const HERO_SECTION_VARIANTS = ["split", "centered", "framed"] as const;
export type HeroSectionVariant = (typeof HERO_SECTION_VARIANTS)[number];
export type HeroSectionProps = ComponentProps<"section"> & { variant?: HeroSectionVariant };

type HeroContext = { id: string; variant: HeroSectionVariant };
const Context = createContext<HeroContext | null>(null);
function useHero(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within HeroSection`);
  return context;
}

const layoutCss = `
[data-uai-hero-layout]{display:grid;gap:32px;align-items:center;min-width:0}
@container (min-width: 720px){
  [data-uai-hero="split"]>[data-uai-hero-layout],
  [data-uai-hero="framed"]>[data-uai-hero-layout]{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:48px}
}
[data-uai-hero-content]>*,[data-uai-hero-media]{animation:uai-hero-in 400ms cubic-bezier(0.23,1,0.32,1) both}
[data-uai-hero-content]>:nth-child(2){animation-delay:40ms}
[data-uai-hero-content]>:nth-child(3){animation-delay:80ms}
[data-uai-hero-content]>:nth-child(4){animation-delay:120ms}
[data-uai-hero-content]>:nth-child(n+5){animation-delay:160ms}
[data-uai-hero-media]{animation-delay:120ms}
[data-uai-hero-action]{transition:filter 120ms ease-out,box-shadow 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-hero-action="secondary"]:hover{box-shadow:inset 0 0 0 999px color-mix(in oklab,var(--uai-text) 9%,transparent)}
[data-uai-hero-action="primary"]:hover{filter:brightness(1.08)}
[data-uai-hero-action]:active{transform:scale(0.97)}
[data-uai-hero-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@keyframes uai-hero-in{from{opacity:0;transform:translateY(6px)}}
@media (prefers-reduced-motion:reduce){[data-uai-hero-content]>*,[data-uai-hero-media]{animation:none}[data-uai-hero-action]{transition:none}[data-uai-hero-action]:active{transform:none}}
`;

const shells: Record<HeroSectionVariant, CSSProperties> = {
  split: { padding: "8px 0" },
  centered: { padding: "8px 0", textAlign: "center" },
  framed: {
    padding: "clamp(24px, 5cqi, 48px)",
    border: "1px solid var(--uai-border)",
    borderRadius: 14,
    background: "var(--uai-surface)",
    boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)",
  },
};

/** Opening section with positioning copy, actions, proof, and media. Split and Framed stack below 720px. */
export function HeroSection({ variant = "split", children, style, ...props }: HeroSectionProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-hero={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...shells[variant],
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-hero-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function HeroSectionContent({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useHero("HeroSectionContent");
  const centered = variant === "centered";
  return (
    <div
      {...props}
      data-uai-hero-content=""
      style={{
        display: "grid",
        justifyItems: centered ? "center" : "start",
        gap: 18,
        minWidth: 0,
        maxWidth: centered ? 640 : undefined,
        margin: centered ? "0 auto" : undefined,
        ...style,
      }}
    />
  );
}

export function HeroSectionEyebrow({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 24,
        margin: 0,
        padding: "0 10px",
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-muted)",
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "16px",
        ...style,
      }}
    />
  );
}

export function HeroSectionTitle({ style, ...props }: ComponentProps<"h1">) {
  const { id } = useHero("HeroSectionTitle");
  return (
    <h1
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: "clamp(28px, 4.5cqi + 8px, 44px)",
        fontWeight: 500,
        lineHeight: 1.08,
        letterSpacing: "-0.03em",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function HeroSectionDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        maxWidth: "56ch",
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 15,
        lineHeight: "23px",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

export function HeroSectionActions({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useHero("HeroSectionActions");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: variant === "centered" ? "center" : "flex-start",
        gap: 8,
        paddingTop: 4,
        ...style,
      }}
    />
  );
}

export type HeroSectionActionProps = ComponentProps<"a"> & { priority?: "primary" | "secondary" };

export function HeroSectionAction({
  priority = "primary",
  style,
  ...props
}: HeroSectionActionProps) {
  const primary = priority === "primary";
  return (
    <a
      {...props}
      data-priority={priority}
      data-uai-hero-action={priority}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 36,
        padding: "0 16px",
        borderRadius: 999,
        background: primary ? "var(--uai-accent)" : "var(--uai-surface-raised)",
        color: primary ? "var(--uai-accent-foreground)" : "var(--uai-text)",
        fontSize: 13,
        fontWeight: 500,
        lineHeight: "18px",
        textDecoration: "none",
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

/** Supporting proof rendered as a Trust Panel. Compose TrustPanelTitle, logos, rating, and badges inside. */
export function HeroSectionProof({ variant, style, ...props }: TrustPanelProps) {
  const hero = useHero("HeroSectionProof");
  const panelVariant: TrustPanelVariant =
    variant ?? (hero.variant === "framed" ? "compact" : "plain");
  return (
    <TrustPanel
      {...props}
      variant={panelVariant}
      style={{
        gap: 12,
        width: "100%",
        marginTop: 8,
        justifyItems: hero.variant === "centered" ? "center" : "start",
        ...style,
      }}
    />
  );
}

export function HeroSectionMedia({ style, ...props }: ComponentProps<"figure">) {
  const { variant } = useHero("HeroSectionMedia");
  return (
    <figure
      {...props}
      data-uai-hero-media=""
      style={{
        position: "relative",
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
        aspectRatio: variant === "centered" ? "16 / 9" : "4 / 3",
        margin: 0,
        overflow: "hidden",
        border: variant === "framed" ? 0 : "1px solid var(--uai-border)",
        borderRadius: variant === "framed" ? 12 : 14,
        background: variant === "framed" ? "var(--uai-canvas)" : "var(--uai-surface)",
        ...style,
      }}
    />
  );
}
