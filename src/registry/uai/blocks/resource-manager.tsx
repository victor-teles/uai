"use client";

import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  useContext,
  useId,
  useState,
} from "react";
import {
  ConfirmationDialog,
  type ConfirmationDialogProps,
  type ConfirmationDialogVariant,
} from "@/components/ui/uai/confirmation-dialog";
import {
  DataTableToolbar,
  type DataTableToolbarProps,
  type DataTableToolbarVariant,
} from "@/components/ui/uai/data-table-toolbar";
import {
  DescriptionList,
  type DescriptionListProps,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";
import {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateVariant,
} from "@/components/ui/uai/empty-state";

export const RESOURCE_MANAGER_VARIANTS = ["split", "stacked", "compact"] as const;
export type ResourceManagerVariant = (typeof RESOURCE_MANAGER_VARIANTS)[number];
export type ResourceManagerRecordTone = "neutral" | "success" | "warning" | "danger";
export type ResourceManagerProps = Omit<ComponentProps<"section">, "defaultValue"> & {
  variant?: ResourceManagerVariant;
  /** The inspected record. An empty string means nothing is selected. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type ManagerContext = {
  id: string;
  variant: ResourceManagerVariant;
  value: string;
  select: (value: string) => void;
};
const Context = createContext<ManagerContext | null>(null);
function useManager(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ResourceManager`);
  return context;
}

const toolbarVariants: Record<ResourceManagerVariant, DataTableToolbarVariant> = {
  split: "toolbar",
  stacked: "stacked",
  compact: "compact",
};
const detailsVariants: Record<ResourceManagerVariant, DescriptionListVariant> = {
  split: "inline",
  stacked: "grid",
  compact: "stacked",
};
const emptyVariants: Record<ResourceManagerVariant, EmptyStateVariant> = {
  split: "card",
  stacked: "card",
  compact: "compact",
};
const dialogVariants: Record<ResourceManagerVariant, ConfirmationDialogVariant> = {
  split: "centered",
  stacked: "sheet",
  compact: "compact",
};
const toneColors: Record<ResourceManagerRecordTone, string> = {
  neutral: "var(--uai-muted)",
  success: "var(--uai-success)",
  warning: "var(--uai-warning)",
  danger: "var(--uai-danger)",
};
const toneFills: Record<ResourceManagerRecordTone, string> = {
  neutral: "var(--uai-surface-raised)",
  success: "color-mix(in oklab, var(--uai-success) 14%, transparent)",
  warning: "color-mix(in oklab, var(--uai-warning) 14%, transparent)",
  danger: "color-mix(in oklab, var(--uai-danger) 14%, transparent)",
};
const managerCss = `
[data-uai-resource-manager-action]{transition:filter 120ms ease-out,box-shadow 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-resource-manager-action]:hover:not(:disabled){box-shadow:inset 0 0 0 999px color-mix(in oklab,var(--uai-text) 9%,transparent)}
[data-uai-resource-manager-action="primary"]:hover:not(:disabled){box-shadow:none;filter:brightness(1.08)}
[data-uai-resource-manager-action]:active:not(:disabled){transform:scale(0.97)}
[data-uai-resource-manager-action]:focus-visible,[data-uai-resource-manager-record]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
[data-uai-resource-manager-record]{transition:background-color 120ms ease-out,box-shadow 120ms ease-out;animation:uai-resource-manager-in 240ms cubic-bezier(0.23,1,0.32,1) both}
[data-uai-resource-manager-record]:not([aria-current]):hover{box-shadow:inset 0 0 0 999px color-mix(in oklab,var(--uai-text) 4%,transparent)}
li:nth-child(2)>[data-uai-resource-manager-record]{animation-delay:40ms}
li:nth-child(3)>[data-uai-resource-manager-record]{animation-delay:80ms}
li:nth-child(4)>[data-uai-resource-manager-record]{animation-delay:120ms}
li:nth-child(5)>[data-uai-resource-manager-record]{animation-delay:160ms}
li:nth-child(n+6)>[data-uai-resource-manager-record]{animation-delay:200ms}
[data-uai-resource-manager-inspector]{animation:uai-resource-manager-in 240ms cubic-bezier(0.23,1,0.32,1) both}
@keyframes uai-resource-manager-in{from{opacity:0;transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){[data-uai-resource-manager-action],[data-uai-resource-manager-record],[data-uai-resource-manager-inspector]{transition:none;animation:none}[data-uai-resource-manager-action]:active:not(:disabled){transform:none}}
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

/** Record management surface: a list of domain records beside an inspector. */
export function ResourceManager({
  variant = "split",
  value,
  defaultValue = "",
  onValueChange,
  style,
  children,
  ...props
}: ResourceManagerProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  return (
    <Context.Provider
      value={{
        id,
        variant,
        value: current,
        select: (next) => {
          if (next === current) return;
          if (value === undefined) setInternal(next);
          onValueChange?.(next);
        },
      }}
    >
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
        <style>{managerCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function ResourceManagerHeader({ style, ...props }: ComponentProps<"div">) {
  useManager("ResourceManagerHeader");
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

export function ResourceManagerHeading({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 4, flex: "1 1 240px", minWidth: 0, ...style }} />
  );
}

export function ResourceManagerTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useManager("ResourceManagerTitle");
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

export function ResourceManagerDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-muted)", fontVariantNumeric: "tabular-nums", ...style }}
    />
  );
}

export function ResourceManagerActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, ...style }}
    />
  );
}

export function ResourceManagerAction({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useManager("ResourceManagerAction");
  return (
    <button
      {...props}
      type={type}
      data-uai-resource-manager-action={emphasis}
      style={{
        ...actionStyle(context.variant === "compact", emphasis === "primary", props.disabled),
        ...style,
      }}
    />
  );
}

/** Search, column, and bulk controls. Compose Data Table Toolbar parts inside it. */
export function ResourceManagerToolbar(props: Omit<DataTableToolbarProps, "variant">) {
  const context = useManager("ResourceManagerToolbar");
  return <DataTableToolbar {...props} variant={toolbarVariants[context.variant]} />;
}

/** Places the record list and inspector side by side, stacking when space runs out. */
export function ResourceManagerBody({ style, ...props }: ComponentProps<"div">) {
  const context = useManager("ResourceManagerBody");
  const split = context.variant === "split";
  return (
    <div
      {...props}
      style={{
        display: split ? "flex" : "grid",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: context.variant === "compact" ? 8 : 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** The record list. Arrow keys, Home, and End move between records. */
export function ResourceManagerList({
  "aria-label": label = "Records",
  style,
  onKeyDown,
  ...props
}: ComponentProps<"ul">) {
  const context = useManager("ResourceManagerList");
  const compact = context.variant === "compact";
  const move = (event: KeyboardEvent<HTMLUListElement>) => {
    const records = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-record]:not(:disabled)"),
    );
    const index = records.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;
    const target = {
      ArrowDown: records[Math.min(index + 1, records.length - 1)],
      ArrowUp: records[Math.max(index - 1, 0)],
      Home: records[0],
      End: records[records.length - 1],
    }[event.key];
    if (!target) return;
    event.preventDefault();
    target.focus();
  };
  return (
    <ul
      aria-label={label}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) move(event);
      }}
      style={{
        display: "grid",
        gap: compact ? 2 : 4,
        flex: "999 1 320px",
        minWidth: 0,
        margin: 0,
        padding: compact ? 4 : 6,
        listStyle: "none",
        border: "1px solid var(--uai-border)",
        borderRadius: compact ? 12 : 14,
        background: "var(--uai-surface)",
        boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)",
        ...style,
      }}
    />
  );
}

export function ResourceManagerRecord({
  value,
  children,
  onClick,
  style,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: string }) {
  const context = useManager("ResourceManagerRecord");
  const selected = context.value === value;
  const compact = context.variant === "compact";
  return (
    <li style={{ minWidth: 0 }}>
      <button
        {...props}
        type="button"
        data-record=""
        data-uai-resource-manager-record=""
        aria-current={selected ? "true" : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) context.select(value);
        }}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          columnGap: 12,
          rowGap: 2,
          width: "100%",
          minHeight: compact ? 32 : 44,
          padding: compact ? "4px 8px" : "8px 12px",
          border: 0,
          borderRadius: compact ? 8 : 10,
          background: selected ? "var(--uai-surface-raised)" : "transparent",
          color: "inherit",
          font: "inherit",
          textAlign: "left",
          cursor: "pointer",
          ...style,
        }}
      >
        {children}
      </button>
    </li>
  );
}

export function ResourceManagerRecordTitle({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        flex: "1 1 160px",
        minWidth: 0,
        fontWeight: 500,
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function ResourceManagerRecordMeta({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function ResourceManagerRecordStatus({
  tone = "neutral",
  style,
  ...props
}: ComponentProps<"span"> & { tone?: ResourceManagerRecordTone }) {
  return (
    <span
      {...props}
      data-tone={tone}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 8px",
        borderRadius: 999,
        background: toneFills[tone],
        color: toneColors[tone],
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: "16px",
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

/** Details for the selected record. Labelled by its title. */
export function ResourceManagerInspector({ style, ...props }: ComponentProps<"section">) {
  const context = useManager("ResourceManagerInspector");
  const compact = context.variant === "compact";
  return (
    <section
      aria-labelledby={`${context.id}-inspector-title`}
      {...props}
      data-uai-resource-manager-inspector=""
      style={{
        display: "grid",
        alignContent: "start",
        gap: compact ? 8 : 12,
        flex: "1 1 280px",
        minWidth: 0,
        padding: compact ? 12 : 16,
        border: context.variant === "stacked" ? 0 : "1px solid var(--uai-border)",
        borderRadius: compact ? 12 : 14,
        background:
          context.variant === "stacked"
            ? "color-mix(in oklab, var(--uai-surface-raised) 70%, var(--uai-surface))"
            : "var(--uai-surface)",
        boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)",
        ...style,
      }}
    />
  );
}

export function ResourceManagerInspectorHeader({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function ResourceManagerInspectorTitle({ style, ...props }: ComponentProps<"h3">) {
  const context = useManager("ResourceManagerInspectorTitle");
  return (
    <h3
      {...props}
      id={`${context.id}-inspector-title`}
      style={{
        margin: 0,
        fontSize: 15,
        lineHeight: "20px",
        fontWeight: 500,
        letterSpacing: "-0.01em",
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

/** Record facts. Compose Description List parts inside it. */
export function ResourceManagerDetails(props: Omit<DescriptionListProps, "variant">) {
  const context = useManager("ResourceManagerDetails");
  return <DescriptionList {...props} variant={detailsVariants[context.variant]} />;
}

/** Edit form for the selected record. Saving stays with the consumer. */
export function ResourceManagerForm({ style, ...props }: ComponentProps<"form">) {
  const context = useManager("ResourceManagerForm");
  return (
    <form
      {...props}
      style={{
        display: "grid",
        gap: context.variant === "compact" ? 8 : 12,
        minWidth: 0,
        margin: 0,
        ...style,
      }}
    />
  );
}

/** Shown when no record matches. Compose Empty State parts inside it. */
export function ResourceManagerEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = useManager("ResourceManagerEmpty");
  return <EmptyState {...props} variant={emptyVariants[context.variant]} />;
}

/** Destructive confirmation. Compose Confirmation Dialog parts inside it. */
export function ResourceManagerDelete(props: Omit<ConfirmationDialogProps, "variant">) {
  const context = useManager("ResourceManagerDelete");
  return <ConfirmationDialog {...props} variant={dialogVariants[context.variant]} />;
}
