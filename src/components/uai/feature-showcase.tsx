"use client";

import { type ComponentProps, createContext, useContext, useId } from "react";
import {
  DescriptionList,
  type DescriptionListProps,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";

export const FEATURE_SHOWCASE_VARIANTS = ["alternating", "stacked", "cards"] as const;
export type FeatureShowcaseVariant = (typeof FEATURE_SHOWCASE_VARIANTS)[number];
export type FeatureShowcaseProps = ComponentProps<"section"> & {
  variant?: FeatureShowcaseVariant;
};

type ShowcaseContext = { id: string; variant: FeatureShowcaseVariant };
const Context = createContext<ShowcaseContext | null>(null);
function useShowcase(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within FeatureShowcase`);
  return context;
}

const layoutCss = `
[data-uai-feature-list]{display:grid;gap:40px;margin:0;padding:0;list-style:none;min-width:0}
[data-uai-feature-item]{display:grid;gap:20px;align-items:center;min-width:0}
[data-uai-feature="stacked"] [data-uai-feature-media],
[data-uai-feature="cards"] [data-uai-feature-media]{order:-1}
[data-uai-feature="stacked"] [data-uai-feature-list]{max-width:640px;margin:0 auto}
[data-uai-feature="cards"] [data-uai-feature-list]{gap:12px}
[data-uai-feature="cards"] [data-uai-feature-item]{align-content:start;gap:16px;padding:8px 8px 18px;border:1px solid var(--uai-border);border-radius:14px;background:var(--uai-surface);box-shadow:0 1px 2px oklch(0 0 0 / 0.04);transition:border-color 120ms ease-out,transform 240ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-feature="cards"] [data-uai-feature-item]>:not([data-uai-feature-media]){padding:0 8px}
[data-uai-feature="cards"] [data-uai-feature-item]:hover{border-color:var(--uai-border-strong)}
[data-uai-feature-item]{animation:uai-feature-in 400ms cubic-bezier(0.23,1,0.32,1) both}
[data-uai-feature-item]:nth-child(2){animation-delay:40ms}
[data-uai-feature-item]:nth-child(3){animation-delay:80ms}
[data-uai-feature-item]:nth-child(n+4){animation-delay:120ms}
@keyframes uai-feature-in{from{opacity:0;transform:translateY(6px)}}
@media (prefers-reduced-motion:reduce){[data-uai-feature-item]{animation:none;transition:none}}
@container (min-width: 720px){
  [data-uai-feature="alternating"] [data-uai-feature-item]{grid-template-columns:repeat(2,minmax(0,1fr));gap:48px}
  [data-uai-feature="alternating"] [data-uai-feature-item]:nth-child(even)>[data-uai-feature-media]{order:-1}
  [data-uai-feature="cards"] [data-uai-feature-list]{grid-template-columns:repeat(2,minmax(0,1fr))}
}`;

const detailVariants: Record<FeatureShowcaseVariant, DescriptionListVariant> = {
  alternating: "inline",
  stacked: "inline",
  cards: "stacked",
};

/** Benefits as alternating copy and media. Rows stack below 720px with media first in Stacked and Cards. */
export function FeatureShowcase({
  variant = "alternating",
  children,
  style,
  ...props
}: FeatureShowcaseProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-feature={variant}
        style={{
          boxSizing: "border-box",
          display: "grid",
          gap: 40,
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function FeatureShowcaseHeader({ style, ...props }: ComponentProps<"header">) {
  const { variant } = useShowcase("FeatureShowcaseHeader");
  const centered = variant !== "alternating";
  return (
    <header
      {...props}
      style={{
        display: "grid",
        justifyItems: centered ? "center" : "start",
        gap: 8,
        maxWidth: 640,
        margin: centered ? "0 auto" : undefined,
        textAlign: centered ? "center" : "start",
        ...style,
      }}
    />
  );
}

export function FeatureShowcaseTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id } = useShowcase("FeatureShowcaseTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: "clamp(22px, 2.5cqi + 12px, 30px)",
        fontWeight: 500,
        lineHeight: 1.15,
        letterSpacing: "-0.025em",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function FeatureShowcaseDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
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

export function FeatureShowcaseList(props: ComponentProps<"ul">) {
  useShowcase("FeatureShowcaseList");
  return <ul {...props} data-uai-feature-list="" />;
}

export function FeatureShowcaseItem(props: ComponentProps<"li">) {
  useShowcase("FeatureShowcaseItem");
  return <li {...props} data-uai-feature-item="" />;
}

export function FeatureShowcaseContent({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "grid", gap: 10, minWidth: 0, ...style }} />;
}

export function FeatureShowcaseLabel({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "16px",
        ...style,
      }}
    />
  );
}

export function FeatureShowcaseItemTitle({ style, ...props }: ComponentProps<"h3">) {
  const { variant } = useShowcase("FeatureShowcaseItemTitle");
  return (
    <h3
      {...props}
      style={{
        margin: 0,
        fontSize: variant === "cards" ? 15 : 18,
        fontWeight: 500,
        lineHeight: variant === "cards" ? "20px" : "24px",
        letterSpacing: variant === "cards" ? "-0.01em" : "-0.015em",
        ...style,
      }}
    />
  );
}

export function FeatureShowcaseItemDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        maxWidth: "52ch",
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 13.5,
        lineHeight: "20px",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

/** Supporting facts rendered as a Description List. Compose DescriptionListItem children inside. */
export function FeatureShowcaseDetails({ variant, style, ...props }: DescriptionListProps) {
  const showcase = useShowcase("FeatureShowcaseDetails");
  return (
    <DescriptionList
      {...props}
      variant={variant ?? detailVariants[showcase.variant]}
      style={{ marginTop: 4, ...style }}
    />
  );
}

export function FeatureShowcaseMedia({ style, ...props }: ComponentProps<"figure">) {
  const { variant } = useShowcase("FeatureShowcaseMedia");
  return (
    <figure
      {...props}
      data-uai-feature-media=""
      style={{
        position: "relative",
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
        aspectRatio: variant === "alternating" ? "4 / 3" : "16 / 9",
        margin: 0,
        overflow: "hidden",
        border: variant === "cards" ? 0 : "1px solid var(--uai-border)",
        borderRadius: variant === "cards" ? 8 : 14,
        background: variant === "cards" ? "var(--uai-canvas)" : "var(--uai-surface)",
        ...style,
      }}
    />
  );
}
