"use client";

import { Check } from "lucide-react";
import { type ComponentProps, type CSSProperties, createContext, useContext, useId } from "react";
import { TrustPanelBadge, TrustPanelBadges } from "@/components/ui/uai/trust-panel";

export const CALL_TO_ACTION_VARIANTS = ["banner", "centered", "split"] as const;
export type CallToActionVariant = (typeof CALL_TO_ACTION_VARIANTS)[number];
export type CallToActionProps = ComponentProps<"section"> & { variant?: CallToActionVariant };

type CtaContext = { id: string; variant: CallToActionVariant };
const Context = createContext<CtaContext | null>(null);
function useCta(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within CallToAction`);
  return context;
}

const layoutCss = `
[data-uai-cta-layout]{display:grid;gap:20px;min-width:0}
@container (min-width: 640px){
  [data-uai-cta="split"]>[data-uai-cta-layout]{grid-template-columns:minmax(0,1fr) auto;align-items:center;column-gap:32px}
  [data-uai-cta="split"]>[data-uai-cta-layout]>[data-uai-cta-reassurance]{grid-column:1 / -1}
}
[data-uai-cta-action]{transition:filter 120ms ease-out,text-decoration-color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-cta-action="primary"]:hover{filter:brightness(1.08)}
[data-uai-cta-action="secondary"]:hover{text-decoration-color:currentColor}
[data-uai-cta-action]:active{transform:scale(0.97)}
[data-uai-cta-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@media (prefers-reduced-motion:reduce){[data-uai-cta-action]{transition:none}[data-uai-cta-action]:active{transform:none}}
`;

const shells: Record<CallToActionVariant, CSSProperties> = {
  banner: {
    padding: "clamp(24px, 5cqi, 44px)",
    borderRadius: 14,
    background: "color-mix(in oklab, var(--uai-surface-raised) 75%, var(--uai-surface))",
  },
  centered: { padding: "24px 0", textAlign: "center" },
  split: {
    padding: "clamp(20px, 4cqi, 32px)",
    border: "1px solid var(--uai-border)",
    borderRadius: 14,
    background: "var(--uai-surface)",
    boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)",
  },
};

/** A closing section with one goal, supporting copy, and reassurance. Split stacks below 640px. */
export function CallToAction({ variant = "banner", children, style, ...props }: CallToActionProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-cta={variant}
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
        <div data-uai-cta-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function CallToActionContent({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useCta("CallToActionContent");
  const centered = variant === "centered";
  return (
    <div
      {...props}
      style={{
        display: "grid",
        justifyItems: centered ? "center" : "start",
        gap: 10,
        minWidth: 0,
        maxWidth: centered ? 560 : 640,
        margin: centered ? "0 auto" : undefined,
        ...style,
      }}
    />
  );
}

export function CallToActionTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useCta("CallToActionTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "split" ? 22 : "clamp(22px, 2.5cqi + 12px, 30px)",
        fontWeight: 500,
        lineHeight: 1.15,
        letterSpacing: variant === "split" ? "-0.02em" : "-0.025em",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function CallToActionDescription({ style, ...props }: ComponentProps<"p">) {
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

export function CallToActionActions({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useCta("CallToActionActions");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: variant === "centered" ? "center" : "flex-start",
        gap: 8,
        ...style,
      }}
    />
  );
}

export type CallToActionActionProps = ComponentProps<"a"> & {
  priority?: "primary" | "secondary";
};

export function CallToActionAction({
  priority = "primary",
  style,
  ...props
}: CallToActionActionProps) {
  const primary = priority === "primary";
  return (
    <a
      {...props}
      data-priority={priority}
      data-uai-cta-action={priority}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 36,
        padding: primary ? "0 16px" : "0 12px",
        borderRadius: 999,
        background: primary ? "var(--uai-accent)" : "transparent",
        color: primary ? "var(--uai-accent-foreground)" : "var(--uai-text)",
        fontSize: 13,
        fontWeight: 500,
        lineHeight: "18px",
        textDecoration: primary ? "none" : "underline",
        textDecorationColor: "var(--uai-border-strong)",
        textUnderlineOffset: 3,
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

/** Reassurance points rendered as Trust Panel badges. Pass an aria-label that names the list. */
export function CallToActionReassurance({ style, ...props }: ComponentProps<"ul">) {
  const { variant } = useCta("CallToActionReassurance");
  return (
    <TrustPanelBadges
      {...props}
      data-uai-cta-reassurance=""
      style={{ justifyContent: variant === "centered" ? "center" : "flex-start", ...style }}
    />
  );
}

export function CallToActionReassuranceItem({
  icon = <Check size={14} strokeWidth={2} aria-hidden="true" />,
  ...props
}: ComponentProps<typeof TrustPanelBadge>) {
  useCta("CallToActionReassuranceItem");
  return <TrustPanelBadge {...props} icon={icon} />;
}
