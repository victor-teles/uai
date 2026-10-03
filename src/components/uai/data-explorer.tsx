"use client";

import { Play } from "lucide-react";
import { type ComponentProps, type CSSProperties, createContext, useContext, useId } from "react";
import {
  DataTableToolbar,
  type DataTableToolbarProps,
  type DataTableToolbarVariant,
} from "@/components/ui/uai/data-table-toolbar";
import {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateVariant,
} from "@/components/ui/uai/empty-state";
import { PageTabs, type PageTabsProps, type PageTabsVariant } from "@/components/ui/uai/page-tabs";

export const DATA_EXPLORER_VARIANTS = ["workbench", "stacked", "compact"] as const;
export type DataExplorerVariant = (typeof DATA_EXPLORER_VARIANTS)[number];
export type DataExplorerProps = ComponentProps<"section"> & { variant?: DataExplorerVariant };

type ExplorerContext = { id: string; variant: DataExplorerVariant };
const Context = createContext<ExplorerContext | null>(null);
function useExplorer(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within DataExplorer`);
  return context;
}

const tabVariants: Record<DataExplorerVariant, PageTabsVariant> = {
  workbench: "underline",
  stacked: "pill",
  compact: "segmented",
};
const toolbarVariants: Record<DataExplorerVariant, DataTableToolbarVariant> = {
  workbench: "toolbar",
  stacked: "toolbar",
  compact: "compact",
};
const emptyVariants: Record<DataExplorerVariant, EmptyStateVariant> = {
  workbench: "plain",
  stacked: "plain",
  compact: "compact",
};

const explorerCss = `
[data-uai-data-explorer-action]{transition:filter 120ms ease-out,box-shadow 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-data-explorer-action]:hover:not(:disabled){box-shadow:inset 0 0 0 999px color-mix(in oklab,var(--uai-text) 9%,transparent)}
[data-uai-data-explorer-action][data-uai-data-explorer-action="primary"]:hover:not(:disabled){box-shadow:none;filter:brightness(1.08)}
[data-uai-data-explorer-action]:active:not(:disabled){transform:scale(0.97)}
[data-uai-data-explorer-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
[data-uai-data-explorer-input]{transition:box-shadow 120ms ease-out}
[data-uai-data-explorer-input]:focus{outline:none;box-shadow:0 0 0 1px var(--uai-border-strong),0 0 0 4px color-mix(in oklab,var(--uai-accent) 22%,transparent)}
[data-uai-data-explorer-input]::placeholder{color:var(--uai-subtle)}
[data-uai-data-explorer-scroll]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
[data-uai-data-explorer-row]{transition:background-color 120ms ease-out}
tbody>[data-uai-data-explorer-row]:hover{background:color-mix(in oklab,var(--uai-text) 4%,transparent)}
tbody>[data-uai-data-explorer-row]>td:first-child{font-weight:500}
tbody>[data-uai-data-explorer-row]{animation:uai-data-explorer-in 240ms cubic-bezier(0.23,1,0.32,1) both}
tbody>[data-uai-data-explorer-row]:nth-child(2){animation-delay:40ms}
tbody>[data-uai-data-explorer-row]:nth-child(3){animation-delay:80ms}
tbody>[data-uai-data-explorer-row]:nth-child(4){animation-delay:120ms}
tbody>[data-uai-data-explorer-row]:nth-child(5){animation-delay:160ms}
tbody>[data-uai-data-explorer-row]:nth-child(n+6){animation-delay:200ms}
@keyframes uai-data-explorer-in{from{opacity:0;transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){[data-uai-data-explorer-action]{transition:none}[data-uai-data-explorer-action]:active:not(:disabled){transform:none}[data-uai-data-explorer-row],[data-uai-data-explorer-input]{transition:none;animation:none}}
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

/** Query workspace: saved views, a query editor, and a results table. */
export function DataExplorer({
  variant = "workbench",
  style,
  children,
  ...props
}: DataExplorerProps) {
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
        <style>{explorerCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function DataExplorerHeader({ style, ...props }: ComponentProps<"div">) {
  useExplorer("DataExplorerHeader");
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

export function DataExplorerHeading({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 4, flex: "1 1 240px", minWidth: 0, ...style }} />
  );
}

export function DataExplorerTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useExplorer("DataExplorerTitle");
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

export function DataExplorerDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-muted)", fontVariantNumeric: "tabular-nums", ...style }}
    />
  );
}

export function DataExplorerActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, ...style }}
    />
  );
}

export function DataExplorerAction({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useExplorer("DataExplorerAction");
  return (
    <button
      {...props}
      type={type}
      data-uai-data-explorer-action={emphasis}
      style={{
        ...actionStyle(context.variant === "compact", emphasis === "primary", props.disabled),
        ...style,
      }}
    />
  );
}

/** Saved views. Compose Page Tabs parts inside it. */
export function DataExplorerViews(props: Omit<PageTabsProps, "variant">) {
  const context = useExplorer("DataExplorerViews");
  return <PageTabs {...props} variant={tabVariants[context.variant]} />;
}

/** Places the query beside the results in Workbench and above them otherwise. */
export function DataExplorerBody({ style, ...props }: ComponentProps<"div">) {
  const context = useExplorer("DataExplorerBody");
  return (
    <div
      {...props}
      style={{
        display: context.variant === "workbench" ? "flex" : "grid",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: context.variant === "compact" ? 8 : 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** Query form. Execution stays with the consumer through `onSubmit`. */
export function DataExplorerQuery({
  "aria-label": label = "Query",
  style,
  ...props
}: ComponentProps<"form">) {
  const context = useExplorer("DataExplorerQuery");
  const compact = context.variant === "compact";
  return (
    <form
      aria-label={label}
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: compact ? 6 : 10,
        flex: "1 1 260px",
        minWidth: 0,
        margin: 0,
        padding: compact ? 10 : 12,
        border: "1px solid var(--uai-border)",
        borderRadius: compact ? 12 : 14,
        background: "var(--uai-surface)",
        boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)",
        ...style,
      }}
    />
  );
}

export function DataExplorerQueryLabel({ style, children, ...props }: ComponentProps<"label">) {
  const context = useExplorer("DataExplorerQueryLabel");
  return (
    <label
      {...props}
      htmlFor={`${context.id}-query`}
      style={{
        padding: "0 2px",
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

export function DataExplorerQueryInput({
  style,
  ...props
}: Omit<ComponentProps<"textarea">, "id">) {
  const context = useExplorer("DataExplorerQueryInput");
  const compact = context.variant === "compact";
  return (
    <textarea
      spellCheck={false}
      rows={compact ? 3 : 5}
      {...props}
      id={`${context.id}-query`}
      data-uai-data-explorer-input=""
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        padding: compact ? "8px 10px" : "10px 12px",
        border: 0,
        borderRadius: compact ? 8 : 10,
        background:
          context.variant === "workbench"
            ? "var(--uai-canvas)"
            : "color-mix(in oklab, var(--uai-canvas) 60%, var(--uai-surface))",
        color: "inherit",
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        fontSize: compact ? 11.5 : 12,
        lineHeight: compact ? "17px" : "19px",
        resize: "vertical",
        ...style,
      }}
    />
  );
}

export function DataExplorerRun({
  children = "Run query",
  style,
  ...props
}: Omit<ComponentProps<"button">, "type">) {
  const context = useExplorer("DataExplorerRun");
  return (
    <button
      {...props}
      type="submit"
      data-uai-data-explorer-action="primary"
      style={{
        ...actionStyle(context.variant === "compact", true, props.disabled),
        justifySelf: "start",
        ...style,
      }}
    >
      <Play size={12} strokeWidth={2} fill="currentColor" aria-hidden="true" />
      {children}
    </button>
  );
}

export function DataExplorerResults({
  "aria-label": label = "Results",
  style,
  ...props
}: ComponentProps<"section">) {
  const context = useExplorer("DataExplorerResults");
  return (
    <section
      aria-label={label}
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: context.variant === "compact" ? 6 : 10,
        flex: "999 1 380px",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** Result controls such as export. Compose Data Table Toolbar parts inside it. */
export function DataExplorerToolbar(props: Omit<DataTableToolbarProps, "variant">) {
  const context = useExplorer("DataExplorerToolbar");
  return <DataTableToolbar {...props} variant={toolbarVariants[context.variant]} />;
}

/** Scrollable results table. The wrapper is focusable so keyboard users can scroll it. */
export function DataExplorerTable({
  "aria-label": label = "Query results",
  style,
  ...props
}: ComponentProps<"table">) {
  const context = useExplorer("DataExplorerTable");
  const compact = context.variant === "compact";
  return (
    <section
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be reachable by keyboard.
      tabIndex={0}
      data-uai-data-explorer-scroll=""
      style={{
        minWidth: 0,
        overflowX: "auto",
        padding: compact ? "2px 4px" : "4px 6px",
        border: "1px solid var(--uai-border)",
        borderRadius: compact ? 12 : 14,
        background: "var(--uai-surface)",
        boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)",
      }}
    >
      <table
        {...props}
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: compact ? 12 : 13,
          lineHeight: "18px",
          ...style,
        }}
      />
    </section>
  );
}

export function DataExplorerTableHead({ style, ...props }: ComponentProps<"thead">) {
  return <thead {...props} style={{ background: "transparent", ...style }} />;
}

export function DataExplorerTableBody(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

export function DataExplorerTableRow({ style, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      {...props}
      data-uai-data-explorer-row=""
      style={{
        borderTop: "1px solid color-mix(in oklab, var(--uai-border) 70%, transparent)",
        ...style,
      }}
    />
  );
}

export function DataExplorerHeaderCell({
  align = "start",
  scope = "col",
  style,
  ...props
}: Omit<ComponentProps<"th">, "align"> & { align?: "start" | "end" }) {
  const context = useExplorer("DataExplorerHeaderCell");
  return (
    <th
      scope={scope}
      {...props}
      style={{
        height: context.variant === "compact" ? 30 : 34,
        padding: context.variant === "compact" ? "0 8px" : "0 10px",
        color: "var(--uai-subtle)",
        fontSize: context.variant === "compact" ? 11.5 : 12,
        fontWeight: 500,
        textAlign: align === "end" ? "right" : "left",
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

export function DataExplorerCell({
  align = "start",
  style,
  ...props
}: Omit<ComponentProps<"td">, "align"> & { align?: "start" | "end" }) {
  const context = useExplorer("DataExplorerCell");
  return (
    <td
      {...props}
      style={{
        height: context.variant === "compact" ? 32 : 38,
        padding: context.variant === "compact" ? "0 8px" : "0 10px",
        textAlign: align === "end" ? "right" : "left",
        fontVariantNumeric: align === "end" ? "tabular-nums" : undefined,
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

/** Row count, timing, or errors, announced politely. */
export function DataExplorerStatus({ style, ...props }: ComponentProps<"p">) {
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

/** Shown when a query returns no rows. Compose Empty State parts inside it. */
export function DataExplorerEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = useExplorer("DataExplorerEmpty");
  return <EmptyState {...props} variant={emptyVariants[context.variant]} />;
}
