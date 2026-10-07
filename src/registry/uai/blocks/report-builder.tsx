"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type RefObject,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/uai-utils";

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
const reportBuilderActionVariants = cva(
  "gap-1.5 rounded-full border-0 py-0 transition-[filter,box-shadow,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:cursor-pointer enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
  {
    variants: {
      emphasis: {
        primary: "bg-primary text-primary-foreground hover:bg-primary enabled:hover:brightness-108",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary enabled:hover:shadow-[inset_0_0_0_999px_color-mix(in_oklab,var(--foreground)_9%,transparent)]",
      },
      compact: {
        true: "h-[26px] px-[11px] text-[12px]/4 has-[>svg]:px-[11px]",
        false: "h-[30px] px-[13px] text-[12.5px]/4 has-[>svg]:px-[13px]",
      },
    },
  },
);

const reportBuilderVariants = cva("grid min-w-0 content-start text-[13px]/[18px] text-foreground", {
  variants: { variant: { sidebar: "gap-4", stacked: "gap-4", compact: "gap-2.5" } },
});

/** Report composer: metrics, dimensions, filters, visualization, and export format. */
export function ReportBuilder({
  variant = "sidebar",
  className,
  children,
  ...props
}: ReportBuilderProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="report-builder"
        className={cn(reportBuilderVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function ReportBuilderHeader({ className, ...props }: ComponentProps<"div">) {
  useBuilder("ReportBuilderHeader");
  return (
    <div
      data-slot="report-builder-header"
      className={cn("flex min-w-0 flex-wrap items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export function ReportBuilderHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="report-builder-heading"
      className={cn("grid min-w-0 flex-[1_1_240px] gap-1", className)}
      {...props}
    />
  );
}

export function ReportBuilderTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useBuilder("ReportBuilderTitle");
  return (
    <h2
      data-slot="report-builder-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.015em] wrap-anywhere",
        context.variant === "compact" ? "text-[15px]/5" : "text-lg/6",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function ReportBuilderDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="report-builder-description"
      className={cn("m-0 text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export function ReportBuilderActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="report-builder-actions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

export function ReportBuilderAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useBuilder("ReportBuilderAction");
  return (
    <Button
      data-slot="report-builder-action"
      variant={emphasis === "primary" ? "default" : "secondary"}
      className={cn(
        reportBuilderActionVariants({ emphasis, compact: context.variant === "compact" }),
        className,
      )}
      {...props}
      type={type}
      data-emphasis={emphasis}
    />
  );
}

/** Places settings beside the canvas in Sidebar and above it otherwise. */
export function ReportBuilderBody({ className, ...props }: ComponentProps<"div">) {
  const context = useBuilder("ReportBuilderBody");
  return (
    <div
      data-slot="report-builder-body"
      className={cn(
        "min-w-0 flex-wrap items-start",
        context.variant === "sidebar" ? "flex" : "grid",
        context.variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

/** Report settings form. Saving and querying stay with the consumer. */
export function ReportBuilderConfig({
  "aria-label": label = "Report settings",
  className,
  ...props
}: ComponentProps<"form">) {
  const context = useBuilder("ReportBuilderConfig");
  const compact = context.variant === "compact";
  return (
    <form
      aria-label={label}
      data-slot="report-builder-config"
      className={cn(
        "m-0 min-w-0 flex-[1_1_240px] flex-wrap content-start border-0 bg-[color-mix(in_oklab,var(--muted)_70%,var(--card))]",
        context.variant === "stacked" ? "flex" : "grid",
        compact ? "gap-2.5 rounded-xl p-3" : "gap-4 rounded-[14px] p-4",
        className,
      )}
      {...props}
    />
  );
}

export function ReportBuilderSection({ className, ...props }: ComponentProps<"fieldset">) {
  const context = useBuilder("ReportBuilderSection");
  return (
    <fieldset
      data-slot="report-builder-section"
      className={cn(
        "m-0 grid min-w-0 flex-[1_1_200px] border-0 p-0",
        context.variant === "compact" ? "gap-1.5" : "gap-2",
        className,
      )}
      {...props}
    />
  );
}

export function ReportBuilderSectionTitle({ className, ...props }: ComponentProps<"legend">) {
  return (
    <legend
      data-slot="report-builder-section-title"
      className={cn("mb-1.5 p-0 text-[11.5px]/4 font-medium text-subtle-foreground", className)}
      {...props}
    />
  );
}

export function ReportBuilderOptions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="report-builder-options"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    />
  );
}

/** A checkbox or radio styled as a pill. Native inputs keep arrow-key and Space behavior. */
export function ReportBuilderOption({
  type = "checkbox",
  children,
  className,
  style,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { type?: "checkbox" | "radio" }) {
  const context = useBuilder("ReportBuilderOption");
  // Styling reads the live input through has-checked, so uncontrolled options update on click.
  return (
    <label
      data-slot="report-builder-option"
      data-checked={props.checked || undefined}
      className={cn(
        "relative inline-flex items-center rounded-full border-0 text-[12px] font-medium whitespace-nowrap transition-[background-color,color,box-shadow,scale] duration-[120ms,120ms,120ms,140ms] ease-[ease-out,ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-ring motion-reduce:transition-none motion-reduce:active:scale-100",
        context.variant === "compact" ? "h-6 px-2.5" : "h-7 px-3",
        "bg-card text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] not-has-checked:hover:text-foreground not-has-checked:hover:shadow-[inset_0_0_0_1px_var(--border-strong)]",
        "has-checked:bg-[color-mix(in_oklab,var(--primary)_16%,var(--card))] has-checked:text-[color-mix(in_oklab,var(--primary)_55%,var(--foreground))] has-checked:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_40%,transparent)]",
        props.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
      style={style}
    >
      <input {...props} type={type} className="absolute inset-0 m-0 cursor-[inherit] opacity-0" />
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
export function ReportBuilderCanvas({ className, ...props }: ComponentProps<"section">) {
  const context = useBuilder("ReportBuilderCanvas");
  return (
    <section
      aria-labelledby={`${context.id}-canvas-title`}
      data-slot="report-builder-canvas"
      className={cn(
        "grid min-w-0 flex-[999_1_360px] content-start border bg-card shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
        context.variant === "compact" ? "gap-2.5 rounded-xl p-3" : "gap-3.5 rounded-[14px] p-4",
        className,
      )}
      {...props}
    />
  );
}

export function ReportBuilderCanvasTitle({ className, ...props }: ComponentProps<"h3">) {
  const context = useBuilder("ReportBuilderCanvasTitle");
  return (
    <h3
      data-slot="report-builder-canvas-title"
      className={cn("m-0 text-[13px]/[18px] font-medium", className)}
      {...props}
      id={`${context.id}-canvas-title`}
    />
  );
}

/** A single-figure visualization. Compose Metric Card parts inside it. */
export function ReportBuilderMetric(props: Omit<MetricCardProps, "variant">) {
  const context = useBuilder("ReportBuilderMetric");
  return <MetricCard {...props} variant={metricVariants[context.variant]} />;
}

/** A bar chart rendered as a list, so every value is available as text. */
type ScrollEdges = { start: boolean; end: boolean };

/** Tracks which ends of a horizontal scroller hide content, so those edges can fade. */
function useScrollEdges(ref: RefObject<HTMLElement | null>) {
  const [edges, setEdges] = useState<ScrollEdges>({ start: false, end: false });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const offset = Math.abs(element.scrollLeft);
      const room = element.scrollWidth - element.clientWidth;
      const start = offset > 1;
      const end = room - offset > 1;
      setEdges((previous) =>
        previous.start === start && previous.end === end ? previous : { start, end },
      );
    };
    measure();
    element.addEventListener("scroll", measure, { passive: true });
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    observer?.observe(element);
    for (const child of element.children) observer?.observe(child);
    return () => {
      element.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, [ref]);
  return edges;
}

export function ReportBuilderChart({
  max,
  orientation = "horizontal",
  className,
  ...props
}: ComponentProps<"ul"> & { max: number; orientation?: ReportBuilderChartOrientation }) {
  const context = useBuilder("ReportBuilderChart");
  const vertical = orientation === "vertical";
  const ref = useRef<HTMLUListElement>(null);
  const edges = useScrollEdges(ref);
  return (
    <ChartCtx.Provider value={{ max: Math.max(max, 1), orientation }}>
      <ul
        ref={ref}
        data-slot="report-builder-chart"
        data-overflow-start={edges.start ? "" : undefined}
        data-overflow-end={edges.end ? "" : undefined}
        className={cn(
          "m-0 min-w-0 list-none p-0",
          vertical
            ? "flex items-stretch gap-2 overflow-x-auto data-overflow-start:mask-l-from-[calc(100%-24px)] data-overflow-end:mask-r-from-[calc(100%-24px)]"
            : cn("grid", context.variant === "compact" ? "gap-1.5" : "gap-2.5"),
          className,
        )}
        {...props}
        data-orientation={orientation}
      />
    </ChartCtx.Provider>
  );
}

export function ReportBuilderBar({
  value,
  className,
  children,
  ...props
}: Omit<ComponentProps<"li">, "value"> & { value: number }) {
  const chart = useChart("ReportBuilderBar");
  const builder = useBuilder("ReportBuilderBar");
  const percent = Math.min(Math.max(value / chart.max, 0), 1) * 100;
  const vertical = chart.orientation === "vertical";
  const compact = builder.variant === "compact";
  return (
    <BarContext.Provider value={value}>
      <li
        data-slot="report-builder-bar"
        className={cn(
          "grid min-w-0 items-center gap-x-2.5 gap-y-1",
          vertical
            ? cn(
                "flex-[1_1_0] grid-cols-[minmax(48px,1fr)] [grid-template-areas:'value'_'bar'_'label']",
                compact ? "grid-rows-[auto_96px_auto]" : "grid-rows-[auto_140px_auto]",
              )
            : "grid-cols-[minmax(72px,30%)_minmax(0,1fr)_auto] [grid-template-areas:'label_bar_value']",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex items-end self-stretch overflow-hidden rounded-full bg-muted [grid-area:bar]",
            vertical ? "h-full" : compact ? "h-2" : "h-2.5",
          )}
        >
          <span
            data-slot="report-builder-bar-fill"
            // A full-size fill slides by `translate`, so value changes animate without touching
            // width or height. The mount entrance slides in from the track start via `transform`.
            className={cn(
              "size-full bg-[color-mix(in_oklab,var(--primary)_85%,var(--foreground))] transition-[translate] duration-300 ease-out-quint animate-in animation-duration-400 motion-reduce:animate-none motion-reduce:transition-none",
              vertical
                ? "translate-y-(--fill-offset) slide-in-from-bottom rounded-md"
                : "translate-x-(--fill-offset) slide-in-from-left rounded-full",
            )}
            style={
              { "--fill-offset": `${vertical ? 100 - percent : percent - 100}%` } as CSSProperties
            }
          />
        </span>
        {children}
      </li>
    </BarContext.Provider>
  );
}

export function ReportBuilderBarLabel({ className, ...props }: ComponentProps<"span">) {
  const chart = useChart("ReportBuilderBarLabel");
  const vertical = chart.orientation === "vertical";
  return (
    <span
      data-slot="report-builder-bar-label"
      className={cn(
        "min-w-0 text-muted-foreground wrap-anywhere [grid-area:label]",
        vertical ? "text-center text-[12px]" : "text-[13px]",
        className,
      )}
      {...props}
    />
  );
}

export function ReportBuilderBarValue({ className, children, ...props }: ComponentProps<"span">) {
  const chart = useChart("ReportBuilderBarValue");
  const value = useContext(BarContext);
  return (
    <span
      data-slot="report-builder-bar-value"
      className={cn(
        "text-[12px] font-medium whitespace-nowrap tabular-nums [grid-area:value]",
        chart.orientation === "vertical" ? "text-center" : "text-right",
        className,
      )}
      {...props}
    >
      {children ?? value}
    </span>
  );
}

/** Row counts, refresh times, or export confirmations, announced politely. */
export function ReportBuilderStatus({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      role="status"
      data-slot="report-builder-status"
      className={cn("m-0 px-0.5 text-[12px] text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}
