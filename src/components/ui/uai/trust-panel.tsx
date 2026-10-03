"use client";

import { ShieldCheck, Star } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useId,
} from "react";

export const TRUST_PANEL_VARIANTS = ["card", "plain", "compact"] as const;
export type TrustPanelVariant = (typeof TRUST_PANEL_VARIANTS)[number];
export type TrustPanelProps = ComponentProps<"section"> & { variant?: TrustPanelVariant };
type TrustContext = { id: string; variant: TrustPanelVariant };
const Context = createContext<TrustContext | null>(null);
function useTrust(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within TrustPanel`);
  return context;
}
const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};
const shells: Record<TrustPanelVariant, CSSProperties> = {
  card: {
    gap: 20,
    padding: 20,
    border: "1px solid var(--uai-border)",
    borderRadius: 14,
    background: "var(--uai-surface)",
  },
  plain: { gap: 16 },
  compact: {
    gap: 12,
    padding: 12,
    border: "1px solid var(--uai-border)",
    borderRadius: 12,
    background: "var(--uai-surface)",
  },
};

const trustCss = `
.uai-trust-logo{color:var(--uai-muted);transition:color 120ms ease-out,background-color 120ms ease-out}
.uai-trust-logo:hover{color:var(--uai-text)}
.uai-trust-panel[data-variant=plain] .uai-trust-logo{color:var(--uai-subtle)}
.uai-trust-panel[data-variant=plain] .uai-trust-logo:hover{color:var(--uai-text)}
@media (prefers-reduced-motion: reduce){.uai-trust-logo{transition:none}}
`;

export function TrustPanel({
  variant = "card",
  className,
  style,
  children,
  ...props
}: TrustPanelProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        className={["uai-trust-panel", className].filter(Boolean).join(" ")}
        style={{
          boxSizing: "border-box",
          display: "grid",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...shells[variant],
          ...style,
        }}
      >
        <style>{trustCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function TrustPanelTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useTrust("TrustPanelTitle");
  return (
    <h2
      {...props}
      id={`${context.id}-title`}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: context.variant === "compact" ? 12 : 13,
        fontWeight: 500,
        lineHeight: "18px",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function TrustPanelLogos({ style, ...props }: ComponentProps<"ul">) {
  const context = useTrust("TrustPanelLogos");
  const compact = context.variant === "compact";
  return (
    <ul
      {...props}
      style={{
        display: compact ? "flex" : "grid",
        flexWrap: "wrap",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: compact ? 6 : context.variant === "plain" ? 4 : 6,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
    />
  );
}

export function TrustPanelLogo({
  name,
  children,
  className,
  style,
  ...props
}: ComponentProps<"li"> & { name: string; children?: ReactNode }) {
  const context = useTrust("TrustPanelLogo");
  const compact = context.variant === "compact";
  const plain = context.variant === "plain";
  return (
    <li
      {...props}
      className={["uai-trust-logo", className].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: plain ? "flex-start" : "center",
        gap: 6,
        height: compact ? 28 : plain ? 32 : 44,
        padding: compact ? "0 10px" : plain ? 0 : "0 12px",
        borderRadius: compact ? 999 : 10,
        background: plain ? "transparent" : "var(--uai-surface-raised)",
        fontSize: compact ? 12 : 13,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span aria-hidden="true" style={{ display: "contents" }}>
        {children}
      </span>
      <span style={visuallyHidden}>{name}</span>
    </li>
  );
}

export function TrustPanelRating({
  value,
  max = 5,
  children,
  style,
  ...props
}: ComponentProps<"p"> & { value: number; max?: number }) {
  const filled = Math.round(Math.min(Math.max(value, 0), max));
  return (
    <p
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
        margin: 0,
        ...style,
      }}
    >
      <span aria-hidden="true" style={{ display: "inline-flex", gap: 2 }}>
        {Array.from({ length: max }, (_, index) => (
          <Star
            // biome-ignore lint/suspicious/noArrayIndexKey: stars are positional and static.
            key={index}
            size={14}
            strokeWidth={1.75}
            fill={index < filled ? "currentColor" : "none"}
            style={{ color: index < filled ? "var(--uai-warning)" : "var(--uai-border-strong)" }}
          />
        ))}
      </span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>
        <strong style={{ fontWeight: 500 }}>{value.toFixed(1)}</strong>
        <span style={{ color: "var(--uai-muted)" }}> out of {max}</span>
      </span>
      {children ? (
        <span style={{ color: "var(--uai-subtle)", fontSize: 12 }}>{children}</span>
      ) : null}
    </p>
  );
}

export function TrustPanelBadges({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
    />
  );
}

export function TrustPanelBadge({
  icon = <ShieldCheck size={14} strokeWidth={1.75} aria-hidden="true" />,
  children,
  style,
  ...props
}: ComponentProps<"li"> & { icon?: ReactNode }) {
  return (
    <li
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 26,
        padding: "0 10px 0 8px",
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-muted)",
        fontSize: 12,
        lineHeight: "16px",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{ display: "inline-flex", flex: "none", color: "var(--uai-success)" }}
      >
        {icon}
      </span>
      {children}
    </li>
  );
}
