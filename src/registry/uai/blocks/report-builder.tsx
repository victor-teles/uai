"use client";

import { type ComponentProps, type CSSProperties, createContext, useContext, useId } from "react";
import {
  FilterBar,
  type FilterBarProps,
  type FilterBarVariant,
} from "@/components/ui/uai/filter-bar";
import {
  MetricCard,
  type MetricCardProps,
  type MetricCardVariant,
} from "@/components/ui/uai/metric-card";

export const REPORT_BUILDER_VARIANTS = ["sidebar", "stacked", "compact"] as const;
export type ReportBuilderVariant = (typeof REPORT_BUILDER_VARIANTS)[number];
export type ReportBuilderChartOrientation = "horizontal" | "vertical";
export type ReportBuilderProps = ComponentProps<"section"> & { variant?: ReportBuilderVariant };

type BuilderContext = { id: string; variant: ReportBuilderVariant };
const Context = createContext<BuilderContext | null>(null);
function useBuilder(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ReportBuilder`);
  return context;
}
type ChartContext = { max: number; orientation: ReportBuilderChartOrientation };
const ChartCtx = createContext<ChartContext | null>(null);
function useChart(part: string) {
  const context = useContext(ChartCtx);
  if (!context) throw new Error(`${part} must be used within ReportBuilderChart`);
  return context;
}
const BarContext = createContext<number | null>(null);

const filterVariants: Record<ReportBuilderVariant, FilterBarVariant> = {
  sidebar: "compact",
  stacked: "toolbar",
  compact: "compact",
};
const metricVariants: Record<ReportBuilderVariant, MetricCardVariant> = {
  sidebar: "plain",
  stacked: "plain",
  compact: "compact",
};
const builderCss = `
[data-uai-report-builder-action]{transition:filter 120ms ease-out,box-shadow 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-report-builder-action]:hover:not(:disabled){box-shadow:inset 0 0 0 999px color-mix(in oklab,var(--uai-text) 9%,transparent)}
[data-uai-report-builder-action][data-uai-report-builder-action="primary"]:hover:not(:disabled){box-shadow:none;filter:brightness(1.08)}
[data-uai-report-builder-action]:active:not(:disabled){transform:scale(0.97)}
[data-uai-report-builder-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-report-builder__option{transition:background-color 120ms ease-out,color 120ms ease-out,box-shadow 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-report-builder__option:not([data-checked]):hover{color:var(--uai-text);box-shadow:inset 0 0 0 1px var(--uai-border-strong)}
.uai-report-builder__option:active{transform:scale(0.97)}
.uai-report-builder__option:has(:focus-visible){outline:2px solid var(--uai-accent);outline-offset:1px}
[data-uai-report-builder-fill]{animation:uai-report-builder-grow-x 400ms cubic-bezier(0.23,1,0.32,1) both;transform-origin:left center}
[data-orientation="vertical"] [data-uai-report-builder-fill]{animation-name:uai-report-builder-grow-y;transform-origin:center bottom}
@keyframes uai-report-builder-grow-x{from{transform:scaleX(0)}}
@keyframes uai-report-builder-grow-y{from{transform:scaleY(0)}}
@media (prefers-reduced-motion:reduce){[data-uai-report-builder-action]{transition:none}[data-uai-report-builder-action]:active:not(:disabled){transform:none}.uai-report-builder__option{transition:none}.uai-report-builder__option:active{transform:none}[data-uai-report-builder-fill]{animation:none}}
`;

function actionStyle(compact: boolean, primary: boolean, disabled?: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: compact ? 26 : 30,
    padding: compact ? "0 11px" : "0 13px",
    border: 0,
    borderRadius: 999,
    background: primary ? "var(--uai-accent)" : "var(--uai-surface-raised)",
    color: primary ? "var(--uai-accent-foreground)" : "var(--uai-text)",
    fontSize: compact ? 12 : 12.5,
    fontWeight: 500,
    lineHeight: "16px",
    whiteSpace: "nowrap",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}

/** Report composer: metrics, dimensions, filters, visualization, and export format. */
export function ReportBuilder({
  variant = "sidebar",
  style,
  children,
  ...props
}: ReportBuilderProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          alignContent: "start",
          gap: variant === "compact" ? 10 : 16,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{builderCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function ReportBuilderHeader({ style, ...props }: ComponentProps<"div">) {
  useBuilder("ReportBuilderHeader");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function ReportBuilderHeading({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 4, flex: "1 1 240px", minWidth: 0, ...style }} />
  );
}

export function ReportBuilderTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useBuilder("ReportBuilderTitle");
  const compact = context.variant === "compact";
  return (
    <h2
      {...props}
      id={`${context.id}-title`}
      style={{
        margin: 0,
        fontSize: compact ? 15 : 18,
        lineHeight: compact ? "20px" : "24px",
        fontWeight: 600,
        letterSpacing: "-0.015em",
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function ReportBuilderDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-muted)", fontVariantNumeric: "tabular-nums", ...style }}
    />
  );
}

export function ReportBuilderActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, ...style }}
    />
  );
}

export function ReportBuilderAction({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useBuilder("ReportBuilderAction");
  return (
    <button
      {...props}
      type={type}
      data-uai-report-builder-action={emphasis}
      style={{
        ...actionStyle(context.variant === "compact", emphasis === "primary", props.disabled),
        ...style,
      }}
    />
  );
}

/** Places settings beside the canvas in Sidebar and above it otherwise. */
export function ReportBuilderBody({ style, ...props }: ComponentProps<"div">) {
  const context = useBuilder("ReportBuilderBody");
  return (
    <div
      {...props}
      style={{
        display: context.variant === "sidebar" ? "flex" : "grid",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: context.variant === "compact" ? 8 : 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** Report settings form. Saving and querying stay with the consumer. */
export function ReportBuilderConfig({
  "aria-label": label = "Report settings",
  style,
  ...props
}: ComponentProps<"form">) {
  const context = useBuilder("ReportBuilderConfig");
  const compact = context.variant === "compact";
  const stacked = context.variant === "stacked";
  return (
    <form
      aria-label={label}
      {...props}
      style={{
        display: stacked ? "flex" : "grid",
        flexWrap: "wrap",
        alignContent: "start",
        gap: compact ? 10 : 16,
        flex: "1 1 240px",
        minWidth: 0,
        margin: 0,
        padding: compact ? 12 : 16,
        border: 0,
        borderRadius: compact ? 12 : 14,
        background: "color-mix(in oklab, var(--uai-surface-raised) 70%, var(--uai-surface))",
        ...style,
      }}
    />
  );
}

export function ReportBuilderSection({ style, ...props }: ComponentProps<"fieldset">) {
  const context = useBuilder("ReportBuilderSection");
  return (
    <fieldset
      {...props}
      style={{
        display: "grid",
        gap: context.variant === "compact" ? 6 : 8,
        flex: "1 1 200px",
        minWidth: 0,
        margin: 0,
        padding: 0,
        border: 0,
        ...style,
      }}
    />
  );
}

export function ReportBuilderSectionTitle({ style, ...props }: ComponentProps<"legend">) {
  return (
    <legend
      {...props}
      style={{
        padding: 0,
        marginBottom: 6,
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: "16px",
        ...style,
      }}
    />
  );
}

export function ReportBuilderOptions({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "flex", flexWrap: "wrap", gap: 6, ...style }} />;
}

/** A checkbox or radio styled as a pill. Native inputs keep arrow-key and Space behavior. */
export function ReportBuilderOption({
  type = "checkbox",
  children,
  style,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { type?: "checkbox" | "radio" }) {
  const context = useBuilder("ReportBuilderOption");
  const checked = Boolean(props.checked ?? props.defaultChecked);
  return (
    <label
      className="uai-report-builder__option"
      data-checked={checked || undefined}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        height: context.variant === "compact" ? 24 : 28,
        padding: context.variant === "compact" ? "0 10px" : "0 12px",
        border: 0,
        borderRadius: 999,
        background: checked
          ? "color-mix(in oklab, var(--uai-accent) 16%, var(--uai-surface))"
          : "var(--uai-surface)",
        boxShadow: checked
          ? "inset 0 0 0 1px color-mix(in oklab, var(--uai-accent) 40%, transparent)"
          : "inset 0 0 0 1px var(--uai-border)",
        color: checked
          ? "color-mix(in oklab, var(--uai-accent) 55%, var(--uai-text))"
          : "var(--uai-muted)",
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <input
        {...props}
        type={type}
        style={{ position: "absolute", inset: 0, margin: 0, opacity: 0, cursor: "inherit" }}
      />
      {children}
    </label>
  );
}

/** Report filters. Compose Filter Bar parts inside it. */
export function ReportBuilderFilters(props: Omit<FilterBarProps, "variant">) {
  const context = useBuilder("ReportBuilderFilters");
  return <FilterBar {...props} variant={filterVariants[context.variant]} />;
}

/** The live preview of the report. */
export function ReportBuilderCanvas({ style, ...props }: ComponentProps<"section">) {
  const context = useBuilder("ReportBuilderCanvas");
  const compact = context.variant === "compact";
  return (
    <section
      aria-labelledby={`${context.id}-canvas-title`}
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: compact ? 10 : 14,
        flex: "999 1 360px",
        minWidth: 0,
        padding: compact ? 12 : 16,
        border: "1px solid var(--uai-border)",
        borderRadius: compact ? 12 : 14,
        background: "var(--uai-surface)",
        boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)",
        ...style,
      }}
    />
  );
}

export function ReportBuilderCanvasTitle({ style, ...props }: ComponentProps<"h3">) {
  const context = useBuilder("ReportBuilderCanvasTitle");
  return (
    <h3
      {...props}
      id={`${context.id}-canvas-title`}
      style={{ margin: 0, fontSize: 13, lineHeight: "18px", fontWeight: 500, ...style }}
    />
  );
}

/** A single-figure visualization. Compose Metric Card parts inside it. */
export function ReportBuilderMetric(props: Omit<MetricCardProps, "variant">) {
  const context = useBuilder("ReportBuilderMetric");
  return <MetricCard {...props} variant={metricVariants[context.variant]} />;
}

/** A bar chart rendered as a list, so every value is available as text. */
export function ReportBuilderChart({
  max,
  orientation = "horizontal",
  style,
  ...props
}: ComponentProps<"ul"> & { max: number; orientation?: ReportBuilderChartOrientation }) {
  const context = useBuilder("ReportBuilderChart");
  const vertical = orientation === "vertical";
  return (
    <ChartCtx.Provider value={{ max: Math.max(max, 1), orientation }}>
      <ul
        {...props}
        data-orientation={orientation}
        style={{
          display: vertical ? "flex" : "grid",
          alignItems: vertical ? "stretch" : undefined,
          gap: vertical ? 8 : context.variant === "compact" ? 6 : 10,
          minWidth: 0,
          margin: 0,
          padding: 0,
          listStyle: "none",
          overflowX: vertical ? "auto" : undefined,
          ...style,
        }}
      />
    </ChartCtx.Provider>
  );
}

export function ReportBuilderBar({
  value,
  style,
  children,
  ...props
}: Omit<ComponentProps<"li">, "value"> & { value: number }) {
  const chart = useChart("ReportBuilderBar");
  const builder = useBuilder("ReportBuilderBar");
  const percent = Math.min(Math.max(value / chart.max, 0), 1) * 100;
  const vertical = chart.orientation === "vertical";
  return (
    <BarContext.Provider value={value}>
      <li
        {...props}
        style={{
          display: "grid",
          gridTemplateAreas: vertical ? '"value" "bar" "label"' : '"label bar value"',
          gridTemplateColumns: vertical
            ? "minmax(48px, 1fr)"
            : "minmax(72px, 30%) minmax(0, 1fr) auto",
          gridTemplateRows: vertical
            ? `auto ${builder.variant === "compact" ? 96 : 140}px auto`
            : undefined,
          alignItems: "center",
          columnGap: 10,
          rowGap: 4,
          flex: vertical ? "1 1 0" : undefined,
          minWidth: 0,
          ...style,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            gridArea: "bar",
            display: "flex",
            alignItems: "flex-end",
            alignSelf: "stretch",
            height: vertical ? "100%" : builder.variant === "compact" ? 8 : 10,
            borderRadius: 999,
            background: "var(--uai-surface-raised)",
            overflow: "hidden",
          }}
        >
          <span
            data-uai-report-builder-fill=""
            style={{
              width: vertical ? "100%" : `${percent}%`,
              height: vertical ? `${percent}%` : "100%",
              borderRadius: vertical ? 6 : 999,
              background: "color-mix(in oklab, var(--uai-accent) 85%, var(--uai-text))",
            }}
          />
        </span>
        {children}
      </li>
    </BarContext.Provider>
  );
}

export function ReportBuilderBarLabel({ style, ...props }: ComponentProps<"span">) {
  const chart = useChart("ReportBuilderBarLabel");
  const vertical = chart.orientation === "vertical";
  return (
    <span
      {...props}
      style={{
        gridArea: "label",
        minWidth: 0,
        color: "var(--uai-muted)",
        fontSize: vertical ? 12 : 13,
        textAlign: vertical ? "center" : undefined,
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function ReportBuilderBarValue({ style, children, ...props }: ComponentProps<"span">) {
  const chart = useChart("ReportBuilderBarValue");
  const value = useContext(BarContext);
  return (
    <span
      {...props}
      style={{
        gridArea: "value",
        fontSize: 12,
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        textAlign: chart.orientation === "vertical" ? "center" : "right",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children ?? value}
    </span>
  );
}

/** Row counts, refresh times, or export confirmations, announced politely. */
export function ReportBuilderStatus({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      role="status"
      {...props}
      style={{
        margin: 0,
        padding: "0 2px",
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}
