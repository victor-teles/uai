"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId } from "react";

export const METRIC_CARD_VARIANTS = ["card", "plain", "compact"] as const;
export type MetricCardVariant = (typeof METRIC_CARD_VARIANTS)[number];
export type MetricCardTrendDirection = "up" | "down" | "flat";
export type MetricCardTrendSentiment = "positive" | "negative" | "neutral";
export type MetricCardProps = ComponentProps<"div"> & { variant?: MetricCardVariant };

type MetricContext = { labelId: string; variant: MetricCardVariant };
const Context = createContext<MetricContext | null>(null);
function useMetric(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within MetricCard`);
  return context;
}

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

export function MetricCard({ variant = "card", style, children, ...props }: MetricCardProps) {
  const labelId = useId();
  return (
    <Context.Provider value={{ labelId, variant }}>
      {/* biome-ignore lint/a11y/useSemanticElements: a fieldset is for form controls; this labels a metric summary. */}
      <div
        role="group"
        aria-labelledby={labelId}
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          alignContent: "start",
          gap: variant === "compact" ? 4 : 6,
          minWidth: 0,
          padding: variant === "plain" ? 0 : variant === "compact" ? 12 : 16,
          border: variant === "plain" ? 0 : "1px solid var(--uai-border)",
          borderRadius: variant === "compact" ? 12 : 14,
          background: variant === "plain" ? "transparent" : "var(--uai-surface)",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

export function MetricCardLabel({ style, ...props }: ComponentProps<"span">) {
  const context = useMetric("MetricCardLabel");
  return (
    <span
      {...props}
      id={context.labelId}
      style={{
        color: "var(--uai-muted)",
        fontSize: context.variant === "compact" ? 12 : 12.5,
        lineHeight: "16px",
        fontWeight: 500,
        ...style,
      }}
    />
  );
}

export function MetricCardValue({ style, ...props }: ComponentProps<"p">) {
  const context = useMetric("MetricCardValue");
  return (
    <p
      {...props}
      style={{
        margin: 0,
        fontSize: context.variant === "compact" ? 20 : 28,
        lineHeight: context.variant === "compact" ? "26px" : "34px",
        fontWeight: 600,
        letterSpacing: context.variant === "compact" ? "-0.015em" : "-0.025em",
        fontVariantNumeric: "tabular-nums",
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

const trendIcons = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight };
const trendWords = { up: "Increased", down: "Decreased", flat: "Unchanged" };
const sentimentTones = {
  positive: {
    color: "var(--uai-success)",
    background: "color-mix(in oklab, var(--uai-success) 14%, transparent)",
  },
  negative: {
    color: "var(--uai-danger)",
    background: "color-mix(in oklab, var(--uai-danger) 14%, transparent)",
  },
  neutral: {
    color: "var(--uai-muted)",
    background: "color-mix(in oklab, var(--uai-text) 7%, transparent)",
  },
};

export function MetricCardTrend({
  direction,
  sentiment = direction === "up" ? "positive" : direction === "down" ? "negative" : "neutral",
  children,
  style,
  ...props
}: ComponentProps<"span"> & {
  direction: MetricCardTrendDirection;
  sentiment?: MetricCardTrendSentiment;
}) {
  useMetric("MetricCardTrend");
  const Icon = trendIcons[direction];
  return (
    <span
      {...props}
      data-direction={direction}
      data-sentiment={sentiment}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        width: "fit-content",
        padding: "2px 8px 2px 5px",
        borderRadius: 999,
        ...sentimentTones[sentiment],
        fontSize: 11.5,
        lineHeight: "16px",
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      <Icon size={13} strokeWidth={2} aria-hidden="true" />
      <span style={srOnly}>{trendWords[direction]} </span>
      {children}
    </span>
  );
}

export function MetricCardComparison({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function MetricCardDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: "4px 0 0",
        paddingTop: 10,
        borderTop: "1px solid var(--uai-border)",
        color: "var(--uai-muted)",
        fontSize: 12.5,
        ...style,
      }}
    />
  );
}

export function MetricCardHeader({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
        ...style,
      }}
    />
  );
}
