"use client";

import { type ComponentProps, type CSSProperties, createContext, useContext, useId } from "react";
import {
  ActivityTimeline,
  type ActivityTimelineVariant,
} from "@/components/ui/uai/activity-timeline";
import {
  DescriptionList,
  type DescriptionListProps,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";
import {
  MetricCard,
  type MetricCardProps,
  type MetricCardVariant,
} from "@/components/ui/uai/metric-card";
import {
  StatusBanner,
  type StatusBannerProps,
  type StatusBannerVariant,
} from "@/components/ui/uai/status-banner";

export const INCIDENT_DASHBOARD_VARIANTS = ["overview", "split", "compact"] as const;
export type IncidentDashboardVariant = (typeof INCIDENT_DASHBOARD_VARIANTS)[number];
export type IncidentDashboardSeverityLevel = "critical" | "major" | "minor";
export type IncidentDashboardProps = ComponentProps<"section"> & {
  variant?: IncidentDashboardVariant;
};

type DashboardContext = { id: string; variant: IncidentDashboardVariant };
const Context = createContext<DashboardContext | null>(null);
function useDashboard(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within IncidentDashboard`);
  return context;
}
const PanelContext = createContext<string | null>(null);
const UpdateContext = createContext<string | null>(null);
function useUpdate(part: string) {
  const id = useContext(UpdateContext);
  if (!id) throw new Error(`${part} must be used within IncidentDashboardUpdate`);
  return id;
}

const bannerVariants: Record<IncidentDashboardVariant, StatusBannerVariant> = {
  overview: "card",
  split: "tinted",
  compact: "tinted",
};
const metricVariants: Record<IncidentDashboardVariant, MetricCardVariant> = {
  overview: "card",
  split: "card",
  compact: "compact",
};
const timelineVariants: Record<IncidentDashboardVariant, ActivityTimelineVariant> = {
  overview: "rail",
  split: "rail",
  compact: "compact",
};
const impactVariants: Record<IncidentDashboardVariant, DescriptionListVariant> = {
  overview: "grid",
  split: "inline",
  compact: "stacked",
};
const severityColors: Record<IncidentDashboardSeverityLevel, string> = {
  critical: "var(--uai-danger)",
  major: "var(--uai-warning)",
  minor: "var(--uai-muted)",
};

const dashboardCss = `
[data-uai-incident-dashboard-action]{transition:filter 120ms ease-out,box-shadow 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-incident-dashboard-action]:hover:not(:disabled){box-shadow:inset 0 0 0 999px color-mix(in oklab,var(--uai-text) 9%,transparent)}
[data-uai-incident-dashboard-action][data-uai-incident-dashboard-action="primary"]:hover:not(:disabled){box-shadow:none;filter:brightness(1.08)}
[data-uai-incident-dashboard-action]:active:not(:disabled){transform:scale(0.97)}
[data-uai-incident-dashboard-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
[data-uai-incident-dashboard-input]{transition:box-shadow 120ms ease-out}
[data-uai-incident-dashboard-input]:focus{outline:none;box-shadow:0 0 0 1px var(--uai-border-strong),0 0 0 4px color-mix(in oklab,var(--uai-accent) 22%,transparent)}
[data-uai-incident-dashboard-input]::placeholder{color:var(--uai-subtle)}
[data-uai-incident-dashboard-pulse]{animation:uai-incident-dashboard-pulse 2s cubic-bezier(0.23,1,0.32,1) infinite}
@keyframes uai-incident-dashboard-pulse{0%{box-shadow:0 0 0 0 color-mix(in oklab,currentColor 45%,transparent)}70%,100%{box-shadow:0 0 0 5px transparent}}
@media (prefers-reduced-motion:reduce){[data-uai-incident-dashboard-action]{transition:none}[data-uai-incident-dashboard-action]:active:not(:disabled){transform:none}[data-uai-incident-dashboard-input]{transition:none}[data-uai-incident-dashboard-pulse]{animation:none}}
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

/** Live incident view: status, impact, metrics, timeline, responders, and updates. */
export function IncidentDashboard({
  variant = "overview",
  style,
  children,
  ...props
}: IncidentDashboardProps) {
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
        <style>{dashboardCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function IncidentDashboardHeader({ style, ...props }: ComponentProps<"div">) {
  useDashboard("IncidentDashboardHeader");
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

export function IncidentDashboardHeading({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 4, flex: "1 1 240px", minWidth: 0, ...style }} />
  );
}

export function IncidentDashboardTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useDashboard("IncidentDashboardTitle");
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

export function IncidentDashboardDescription({ style, ...props }: ComponentProps<"p">) {
  return <p {...props} style={{ margin: 0, color: "var(--uai-muted)", ...style }} />;
}

/** Severity label. Color reinforces the text and is never the only signal. */
export function IncidentDashboardSeverity({
  level = "major",
  style,
  children,
  ...props
}: ComponentProps<"span"> & { level?: IncidentDashboardSeverityLevel }) {
  return (
    <span
      {...props}
      data-level={level}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        width: "fit-content",
        height: 20,
        padding: "0 8px 0 7px",
        borderRadius: 999,
        background: `color-mix(in oklab, ${severityColors[level]} 14%, transparent)`,
        color: severityColors[level],
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: "16px",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        data-uai-incident-dashboard-pulse={level === "critical" ? "" : undefined}
        style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }}
      />
      {children}
    </span>
  );
}

export function IncidentDashboardActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, ...style }}
    />
  );
}

export function IncidentDashboardAction({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useDashboard("IncidentDashboardAction");
  return (
    <button
      {...props}
      type={type}
      data-uai-incident-dashboard-action={emphasis}
      style={{
        ...actionStyle(context.variant === "compact", emphasis === "primary", props.disabled),
        ...style,
      }}
    />
  );
}

/** Current state of the incident. Compose Status Banner parts inside it. */
export function IncidentDashboardStatus(props: Omit<StatusBannerProps, "variant">) {
  const context = useDashboard("IncidentDashboardStatus");
  return <StatusBanner {...props} variant={bannerVariants[context.variant]} />;
}

export function IncidentDashboardMetrics({ style, ...props }: ComponentProps<"div">) {
  const context = useDashboard("IncidentDashboardMetrics");
  const compact = context.variant === "compact";
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${compact ? 130 : 160}px), 1fr))`,
        gap: compact ? 8 : 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function IncidentDashboardMetric(props: Omit<MetricCardProps, "variant">) {
  const context = useDashboard("IncidentDashboardMetric");
  return <MetricCard {...props} variant={metricVariants[context.variant]} />;
}

/** Panels in equal columns (Overview), a wide main column (Split), or one column (Compact). */
export function IncidentDashboardBody({ style, ...props }: ComponentProps<"div">) {
  const context = useDashboard("IncidentDashboardBody");
  const columns = {
    overview: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
    split: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
    compact: "minmax(0, 1fr)",
  }[context.variant];
  return (
    <div
      {...props}
      style={{
        display: context.variant === "split" ? "flex" : "grid",
        flexWrap: "wrap",
        gridTemplateColumns: columns,
        alignItems: "start",
        gap: context.variant === "compact" ? 8 : 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** A dashboard panel. `span="wide"` takes the larger column in Split. */
export function IncidentDashboardPanel({
  span = "narrow",
  style,
  ...props
}: ComponentProps<"section"> & { span?: "wide" | "narrow" }) {
  const context = useDashboard("IncidentDashboardPanel");
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
          flex: span === "wide" ? "999 1 360px" : "1 1 240px",
          minWidth: 0,
          padding: compact ? 12 : 16,
          border: "1px solid var(--uai-border)",
          borderRadius: compact ? 12 : 14,
          background: "var(--uai-surface)",
          boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)",
          ...style,
        }}
      />
    </PanelContext.Provider>
  );
}

export function IncidentDashboardPanelTitle({ style, ...props }: ComponentProps<"h3">) {
  const labelId = useContext(PanelContext);
  if (!labelId)
    throw new Error("IncidentDashboardPanelTitle must be used within IncidentDashboardPanel");
  return (
    <h3
      {...props}
      id={labelId}
      style={{ margin: 0, fontSize: 13, lineHeight: "18px", fontWeight: 500, ...style }}
    />
  );
}

/** Customer and system impact. Compose Description List parts inside it. */
export function IncidentDashboardImpact(props: Omit<DescriptionListProps, "variant">) {
  const context = useDashboard("IncidentDashboardImpact");
  return <DescriptionList {...props} variant={impactVariants[context.variant]} />;
}

/** Incident updates and events. Compose Activity Timeline parts inside it. */
export function IncidentDashboardTimeline(
  props: Omit<ComponentProps<typeof ActivityTimeline>, "variant">,
) {
  const context = useDashboard("IncidentDashboardTimeline");
  return <ActivityTimeline {...props} variant={timelineVariants[context.variant]} />;
}

export function IncidentDashboardResponders({ style, ...props }: ComponentProps<"ul">) {
  const context = useDashboard("IncidentDashboardResponders");
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gap: context.variant === "compact" ? 6 : 10,
        margin: 0,
        padding: 0,
        listStyle: "none",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function IncidentDashboardResponder({ style, ...props }: ComponentProps<"li">) {
  return (
    <li
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        alignItems: "center",
        columnGap: 10,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** Initials avatar. Decorative because the name is always present as text. */
export function IncidentDashboardResponderAvatar({ style, ...props }: ComponentProps<"span">) {
  const context = useDashboard("IncidentDashboardResponderAvatar");
  const size = context.variant === "compact" ? 24 : 28;
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        display: "grid",
        placeItems: "center",
        gridRow: "span 2",
        width: size,
        height: size,
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        boxShadow: "0 0 0 1px oklch(1 0 0 / 0.08)",
        color: "var(--uai-muted)",
        fontSize: context.variant === "compact" ? 10 : 10.5,
        fontWeight: 500,
        letterSpacing: "0.01em",
        ...style,
      }}
    />
  );
}

export function IncidentDashboardResponderName({ style, ...props }: ComponentProps<"span">) {
  return <span {...props} style={{ fontWeight: 500, overflowWrap: "anywhere", ...style }} />;
}

export function IncidentDashboardResponderRole({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{ color: "var(--uai-subtle)", fontSize: 12, lineHeight: "16px", ...style }}
    />
  );
}

/** Post an update. Publishing stays with the consumer through `onSubmit`. */
export function IncidentDashboardUpdate({ style, ...props }: ComponentProps<"form">) {
  const context = useDashboard("IncidentDashboardUpdate");
  const id = useId();
  return (
    <UpdateContext.Provider value={id}>
      <form
        {...props}
        style={{
          display: "grid",
          gap: context.variant === "compact" ? 6 : 8,
          minWidth: 0,
          margin: 0,
          ...style,
        }}
      />
    </UpdateContext.Provider>
  );
}

export function IncidentDashboardUpdateLabel({
  style,
  children,
  ...props
}: ComponentProps<"label">) {
  const id = useUpdate("IncidentDashboardUpdateLabel");
  return (
    <label
      {...props}
      htmlFor={id}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: "16px",
        ...style,
      }}
    >
      {children}
    </label>
  );
}

export function IncidentDashboardUpdateInput({
  style,
  ...props
}: Omit<ComponentProps<"textarea">, "id">) {
  const id = useUpdate("IncidentDashboardUpdateInput");
  return (
    <textarea
      rows={3}
      {...props}
      id={id}
      data-uai-incident-dashboard-input=""
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        padding: "9px 11px",
        border: 0,
        borderRadius: 10,
        background: "var(--uai-canvas)",
        color: "inherit",
        font: "inherit",
        fontSize: 13,
        lineHeight: "18px",
        resize: "vertical",
        ...style,
      }}
    />
  );
}

export function IncidentDashboardUpdateSubmit({
  children = "Post update",
  style,
  ...props
}: Omit<ComponentProps<"button">, "type">) {
  useUpdate("IncidentDashboardUpdateSubmit");
  const context = useDashboard("IncidentDashboardUpdateSubmit");
  return (
    <button
      {...props}
      type="submit"
      data-uai-incident-dashboard-action="primary"
      style={{
        ...actionStyle(context.variant === "compact", true, props.disabled),
        justifySelf: "end",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
