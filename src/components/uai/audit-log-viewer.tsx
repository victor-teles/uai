"use client";

import { type ComponentProps, type CSSProperties, createContext, useContext, useId } from "react";
import { AuditLog, type AuditLogProps, type AuditLogVariant } from "@/components/ui/uai/audit-log";
import {
  DateRangePicker,
  type DateRangePickerProps,
  type DateRangePickerVariant,
} from "@/components/ui/uai/date-range-picker";
import {
  FilterBar,
  type FilterBarProps,
  type FilterBarVariant,
} from "@/components/ui/uai/filter-bar";

export const AUDIT_LOG_VIEWER_VARIANTS = ["sidebar", "stacked", "compact"] as const;
export type AuditLogViewerVariant = (typeof AUDIT_LOG_VIEWER_VARIANTS)[number];
export type AuditLogViewerProps = ComponentProps<"section"> & { variant?: AuditLogViewerVariant };

type ViewerContext = { id: string; variant: AuditLogViewerVariant };
const Context = createContext<ViewerContext | null>(null);
function useViewer(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within AuditLogViewer`);
  return context;
}

const filterVariants: Record<AuditLogViewerVariant, FilterBarVariant> = {
  sidebar: "panel",
  stacked: "toolbar",
  compact: "compact",
};
const rangeVariants: Record<AuditLogViewerVariant, DateRangePickerVariant> = {
  sidebar: "compact",
  stacked: "split",
  compact: "compact",
};
const logVariants: Record<AuditLogViewerVariant, AuditLogVariant> = {
  sidebar: "card",
  stacked: "timeline",
  compact: "compact",
};

const viewerCss = `
[data-uai-audit-log-viewer-action]{transition:filter 120ms ease-out,box-shadow 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-audit-log-viewer-action]:hover:not(:disabled){box-shadow:inset 0 0 0 999px color-mix(in oklab,var(--uai-text) 9%,transparent)}
[data-uai-audit-log-viewer-action][data-uai-audit-log-viewer-action="primary"]:hover:not(:disabled){box-shadow:none;filter:brightness(1.08)}
[data-uai-audit-log-viewer-action]:active:not(:disabled){transform:scale(0.97)}
[data-uai-audit-log-viewer-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@media (prefers-reduced-motion:reduce){[data-uai-audit-log-viewer-action]{transition:none}[data-uai-audit-log-viewer-action]:active:not(:disabled){transform:none}}
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

/** Audit review surface: filters, a date range, expandable events, and export. */
export function AuditLogViewer({
  variant = "sidebar",
  style,
  children,
  ...props
}: AuditLogViewerProps) {
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
        <style>{viewerCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function AuditLogViewerHeader({ style, ...props }: ComponentProps<"div">) {
  useViewer("AuditLogViewerHeader");
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

export function AuditLogViewerHeading({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 4, flex: "1 1 240px", minWidth: 0, ...style }} />
  );
}

export function AuditLogViewerTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useViewer("AuditLogViewerTitle");
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

export function AuditLogViewerDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-muted)", fontVariantNumeric: "tabular-nums", ...style }}
    />
  );
}

export function AuditLogViewerActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, ...style }}
    />
  );
}

export function AuditLogViewerAction({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useViewer("AuditLogViewerAction");
  return (
    <button
      {...props}
      type={type}
      data-uai-audit-log-viewer-action={emphasis}
      style={{
        ...actionStyle(context.variant === "compact", emphasis === "primary", props.disabled),
        ...style,
      }}
    />
  );
}

/** Places filters beside the log in Sidebar and above it otherwise. */
export function AuditLogViewerBody({ style, ...props }: ComponentProps<"div">) {
  const context = useViewer("AuditLogViewerBody");
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

/** Actor, action, and resource filters. Compose Filter Bar parts inside it. */
export function AuditLogViewerFilters({
  "aria-label": label = "Audit filters",
  style,
  ...props
}: Omit<FilterBarProps, "variant">) {
  const context = useViewer("AuditLogViewerFilters");
  return (
    <FilterBar
      role="group"
      aria-label={label}
      {...props}
      variant={filterVariants[context.variant]}
      style={{ flex: context.variant === "sidebar" ? "1 1 220px" : undefined, ...style }}
    />
  );
}

/** Event date range. Compose Date Range Picker parts inside it. */
export function AuditLogViewerDateRange(props: Omit<DateRangePickerProps, "variant">) {
  const context = useViewer("AuditLogViewerDateRange");
  return <DateRangePicker {...props} variant={rangeVariants[context.variant]} />;
}

export function AuditLogViewerMain({ style, ...props }: ComponentProps<"div">) {
  const context = useViewer("AuditLogViewerMain");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: context.variant === "compact" ? 6 : 10,
        flex: "999 1 360px",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** The event list. Compose Audit Log parts inside it. */
export function AuditLogViewerLog(props: Omit<AuditLogProps, "variant">) {
  const context = useViewer("AuditLogViewerLog");
  return <AuditLog {...props} variant={logVariants[context.variant]} />;
}

/** Result counts and export confirmations, announced politely. */
export function AuditLogViewerStatus({ style, ...props }: ComponentProps<"p">) {
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
