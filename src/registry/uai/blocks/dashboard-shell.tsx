"use client";

import { type ComponentProps, createContext, useContext, useId } from "react";
import {
  AppSidebar,
  type AppSidebarProps,
  type AppSidebarVariant,
} from "@/components/ui/uai/app-sidebar";
import {
  BreadcrumbTrail,
  type BreadcrumbTrailProps,
  type BreadcrumbTrailVariant,
} from "@/components/ui/uai/breadcrumb-trail";
import {
  MetricCard,
  type MetricCardProps,
  type MetricCardVariant,
} from "@/components/ui/uai/metric-card";

export const DASHBOARD_SHELL_VARIANTS = ["split", "inset", "compact"] as const;
export type DashboardShellVariant = (typeof DASHBOARD_SHELL_VARIANTS)[number];
export type DashboardShellProps = ComponentProps<"div"> & { variant?: DashboardShellVariant };

type ShellContext = { id: string; variant: DashboardShellVariant };
const Context = createContext<ShellContext | null>(null);
function useShell(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within DashboardShell`);
  return context;
}
const PanelContext = createContext<string | null>(null);

const sidebarVariants: Record<DashboardShellVariant, AppSidebarVariant> = {
  split: "panel",
  inset: "inset",
  compact: "compact",
};
const breadcrumbVariants: Record<DashboardShellVariant, BreadcrumbTrailVariant> = {
  split: "chevron",
  inset: "chevron",
  compact: "slash",
};
const metricVariants: Record<DashboardShellVariant, MetricCardVariant> = {
  split: "card",
  inset: "card",
  compact: "compact",
};

const interactionCss = `
[data-uai-dashboard-action]{transition:background-color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-dashboard-action="primary"]{background:var(--uai-accent);color:var(--uai-accent-foreground)}
[data-uai-dashboard-action="secondary"]{background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-dashboard-action="primary"]:hover:not(:disabled){filter:brightness(1.08)}
[data-uai-dashboard-action="secondary"]:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
[data-uai-dashboard-action]:active:not(:disabled){transform:scale(0.97)}
[data-uai-dashboard-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@media (prefers-reduced-motion: reduce){[data-uai-dashboard-action]{transition:none}[data-uai-dashboard-action]:active:not(:disabled){transform:none}}`;

/** Page frame: global navigation beside a labelled main region. Wraps below the sidebar on narrow screens. */
export function DashboardShell({
  variant = "split",
  children,
  style,
  ...props
}: DashboardShellProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <div
        {...props}
        data-variant={variant}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          gap: variant === "split" ? 16 : 8,
          minWidth: 0,
          padding: variant === "inset" ? 6 : 0,
          borderRadius: variant === "inset" ? 20 : 0,
          background: variant === "inset" ? "var(--uai-surface-raised)" : "transparent",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{interactionCss}</style>
        {children}
      </div>
    </Context.Provider>
  );
}

/** Global navigation. Compose App Sidebar parts inside it. */
export function DashboardShellSidebar({ style, ...props }: Omit<AppSidebarProps, "variant">) {
  const context = useShell("DashboardShellSidebar");
  return (
    <AppSidebar
      {...props}
      variant={sidebarVariants[context.variant]}
      style={{ flexShrink: 0, height: "auto", ...style }}
    />
  );
}

export function DashboardShellMain({ style, ...props }: ComponentProps<"section">) {
  const context = useShell("DashboardShellMain");
  const { variant } = context;
  return (
    <section
      aria-labelledby={`${context.id}-title`}
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: variant === "compact" ? 12 : 20,
        flex: "1 1 360px",
        minWidth: 0,
        padding: variant === "inset" ? "20px 22px" : variant === "compact" ? "4px 0" : "8px 0",
        border: 0,
        borderRadius: variant === "inset" ? 14 : 0,
        background: variant === "inset" ? "var(--uai-surface)" : "transparent",
        boxShadow: variant === "inset" ? "0 0 0 1px var(--uai-border)" : undefined,
        ...style,
      }}
    />
  );
}

/** Page hierarchy and page actions. Actions wrap below the heading on narrow widths. */
export function DashboardShellHeader({ style, ...props }: ComponentProps<"div">) {
  useShell("DashboardShellHeader");
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

export function DashboardShellHeading({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 4, flex: "1 1 240px", minWidth: 0, ...style }} />
  );
}

export function DashboardShellBreadcrumb({
  style,
  ...props
}: Omit<BreadcrumbTrailProps, "variant">) {
  const context = useShell("DashboardShellBreadcrumb");
  return (
    <BreadcrumbTrail
      {...props}
      variant={breadcrumbVariants[context.variant]}
      style={{ marginLeft: -6, ...style }}
    />
  );
}

export function DashboardShellTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useShell("DashboardShellTitle");
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
        letterSpacing: "-0.01em",
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function DashboardShellDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

export function DashboardShellActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, ...style }}
    />
  );
}

export function DashboardShellAction({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useShell("DashboardShellAction");
  const primary = emphasis === "primary";
  return (
    <button
      {...props}
      type={type}
      data-uai-dashboard-action={primary ? "primary" : "secondary"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: context.variant === "compact" ? 26 : 30,
        padding: context.variant === "compact" ? "0 10px" : "0 13px",
        border: 0,
        borderRadius: 999,
        font: "inherit",
        fontSize: context.variant === "compact" ? 12 : 12.5,
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: "pointer",
        ...style,
      }}
    />
  );
}

/** Key figures. Cards reflow from four columns to one without media queries. */
export function DashboardShellMetrics({ style, ...props }: ComponentProps<"div">) {
  const context = useShell("DashboardShellMetrics");
  const compact = context.variant === "compact";
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${compact ? 150 : 180}px), 1fr))`,
        gap: compact ? 8 : 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function DashboardShellMetric(props: Omit<MetricCardProps, "variant">) {
  const context = useShell("DashboardShellMetric");
  return <MetricCard {...props} variant={metricVariants[context.variant]} />;
}

export function DashboardShellContent({ style, ...props }: ComponentProps<"div">) {
  const context = useShell("DashboardShellContent");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
        gap: context.variant === "compact" ? 8 : 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function DashboardShellPanel({ style, ...props }: ComponentProps<"section">) {
  const context = useShell("DashboardShellPanel");
  const labelId = useId();
  const compact = context.variant === "compact";
  return (
    <PanelContext.Provider value={labelId}>
      <section
        aria-labelledby={labelId}
        {...props}
        style={{
          display: "grid",
          alignContent: "start",
          gap: compact ? 8 : 12,
          minWidth: 0,
          padding: compact ? 12 : 16,
          border: 0,
          borderRadius: compact ? 12 : 14,
          background:
            context.variant === "inset"
              ? "color-mix(in oklab, var(--uai-surface-raised) 55%, var(--uai-surface))"
              : "var(--uai-surface)",
          boxShadow: context.variant === "inset" ? undefined : "0 0 0 1px var(--uai-border)",
          ...style,
        }}
      />
    </PanelContext.Provider>
  );
}

export function DashboardShellPanelTitle({ style, ...props }: ComponentProps<"h3">) {
  const labelId = useContext(PanelContext);
  if (!labelId) throw new Error("DashboardShellPanelTitle must be used within DashboardShellPanel");
  return (
    <h3
      {...props}
      id={labelId}
      style={{ margin: 0, fontSize: 13, lineHeight: "18px", fontWeight: 500, ...style }}
    />
  );
}
