"use client";

import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useId,
  useState,
} from "react";
import {
  ApprovalCard,
  type ApprovalCardProps,
  type ApprovalCardVariant,
} from "@/components/ui/uai/approval-card";
import {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateVariant,
} from "@/components/ui/uai/empty-state";
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

export const APPROVAL_QUEUE_VARIANTS = ["grouped", "board", "compact"] as const;
export type ApprovalQueueVariant = (typeof APPROVAL_QUEUE_VARIANTS)[number];
export type ApprovalQueueProps = ComponentProps<"section"> & { variant?: ApprovalQueueVariant };

type QueueContext = { id: string; variant: ApprovalQueueVariant };
const Context = createContext<QueueContext | null>(null);
function useQueue(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ApprovalQueue`);
  return context;
}
type GroupByContext = { name: string; value: string; select: (value: string) => void };
const GroupByCtx = createContext<GroupByContext | null>(null);
const GroupContext = createContext<string | null>(null);
function useGroup(part: string) {
  const id = useContext(GroupContext);
  if (!id) throw new Error(`${part} must be used within ApprovalQueueGroup`);
  return id;
}

const metricVariants: Record<ApprovalQueueVariant, MetricCardVariant> = {
  grouped: "card",
  board: "card",
  compact: "compact",
};
const filterVariants: Record<ApprovalQueueVariant, FilterBarVariant> = {
  grouped: "toolbar",
  board: "toolbar",
  compact: "compact",
};
const cardVariants: Record<ApprovalQueueVariant, ApprovalCardVariant> = {
  grouped: "detailed",
  board: "compact",
  compact: "compact",
};
const emptyVariants: Record<ApprovalQueueVariant, EmptyStateVariant> = {
  grouped: "card",
  board: "card",
  compact: "compact",
};

const queueCss = `
[data-uai-approval-queue-action]{transition:filter 120ms ease-out,box-shadow 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-approval-queue-action]:hover:not(:disabled){box-shadow:inset 0 0 0 999px color-mix(in oklab,var(--uai-text) 9%,transparent)}
[data-uai-approval-queue-action][data-uai-approval-queue-action="primary"]:hover:not(:disabled){box-shadow:none;filter:brightness(1.08)}
[data-uai-approval-queue-action]:active:not(:disabled){transform:scale(0.97)}
[data-uai-approval-queue-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-approval-queue__option{transition:background-color 160ms cubic-bezier(0.23,1,0.32,1),color 120ms ease-out,box-shadow 160ms cubic-bezier(0.23,1,0.32,1)}
.uai-approval-queue__option:not([data-checked]):hover{color:var(--uai-text)}
.uai-approval-queue__option:has(:focus-visible){outline:2px solid var(--uai-accent);outline-offset:1px}
[data-uai-approval-queue-item]{animation:uai-approval-queue-in 240ms cubic-bezier(0.23,1,0.32,1) both}
[data-uai-approval-queue-item]:nth-child(2){animation-delay:40ms}
[data-uai-approval-queue-item]:nth-child(3){animation-delay:80ms}
[data-uai-approval-queue-item]:nth-child(4){animation-delay:120ms}
[data-uai-approval-queue-item]:nth-child(5){animation-delay:160ms}
[data-uai-approval-queue-item]:nth-child(n+6){animation-delay:200ms}
@keyframes uai-approval-queue-in{from{opacity:0;transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){[data-uai-approval-queue-action]{transition:none}[data-uai-approval-queue-action]:active:not(:disabled){transform:none}.uai-approval-queue__option{transition:none}[data-uai-approval-queue-item]{animation:none}}
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

/** Review queue of pending decisions, grouped by a consumer-chosen key. */
export function ApprovalQueue({
  variant = "grouped",
  style,
  children,
  ...props
}: ApprovalQueueProps) {
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
        <style>{queueCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function ApprovalQueueHeader({ style, ...props }: ComponentProps<"div">) {
  useQueue("ApprovalQueueHeader");
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

export function ApprovalQueueHeading({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 4, flex: "1 1 240px", minWidth: 0, ...style }} />
  );
}

export function ApprovalQueueTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useQueue("ApprovalQueueTitle");
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

export function ApprovalQueueDescription({ style, ...props }: ComponentProps<"p">) {
  return <p {...props} style={{ margin: 0, color: "var(--uai-muted)", ...style }} />;
}

export function ApprovalQueueActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, ...style }}
    />
  );
}

export function ApprovalQueueAction({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useQueue("ApprovalQueueAction");
  return (
    <button
      {...props}
      type={type}
      data-uai-approval-queue-action={emphasis}
      style={{
        ...actionStyle(context.variant === "compact", emphasis === "primary", props.disabled),
        ...style,
      }}
    />
  );
}

/** Queue totals. Metric cards reflow from four columns to one. */
export function ApprovalQueueSummary({ style, ...props }: ComponentProps<"div">) {
  const context = useQueue("ApprovalQueueSummary");
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

export function ApprovalQueueMetric(props: Omit<MetricCardProps, "variant">) {
  const context = useQueue("ApprovalQueueMetric");
  return <MetricCard {...props} variant={metricVariants[context.variant]} />;
}

/** Filters. Compose Filter Bar parts inside it. */
export function ApprovalQueueFilters(props: Omit<FilterBarProps, "variant">) {
  const context = useQueue("ApprovalQueueFilters");
  return <FilterBar {...props} variant={filterVariants[context.variant]} />;
}

export type ApprovalQueueGroupByProps = Omit<ComponentProps<"fieldset">, "defaultValue"> & {
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

/** A radio group that chooses the grouping key, such as risk, age, owner, or impact. */
export function ApprovalQueueGroupBy({
  label = "Group by",
  value,
  defaultValue = "",
  onValueChange,
  style,
  children,
  ...props
}: ApprovalQueueGroupByProps) {
  useQueue("ApprovalQueueGroupBy");
  const name = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  return (
    <GroupByCtx.Provider
      value={{
        name,
        value: current,
        select: (next) => {
          if (value === undefined) setInternal(next);
          onValueChange?.(next);
        },
      }}
    >
      <fieldset
        {...props}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          margin: 0,
          padding: 3,
          border: 0,
          borderRadius: 999,
          background: "var(--uai-surface)",
          boxShadow: "inset 0 0 0 1px var(--uai-border)",
          ...style,
        }}
      >
        <legend
          style={{
            float: "left",
            padding: "0 6px 0 10px",
            color: "var(--uai-subtle)",
            fontSize: 12,
          }}
        >
          {label}
        </legend>
        {children}
      </fieldset>
    </GroupByCtx.Provider>
  );
}

export function ApprovalQueueGroupByOption({
  value,
  children,
  style,
  ...props
}: Omit<ComponentProps<"input">, "value" | "type" | "name" | "checked"> & { value: string }) {
  const group = useContext(GroupByCtx);
  if (!group)
    throw new Error("ApprovalQueueGroupByOption must be used within ApprovalQueueGroupBy");
  const checked = group.value === value;
  return (
    <label
      className="uai-approval-queue__option"
      data-checked={checked || undefined}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        height: 24,
        padding: "0 10px",
        borderRadius: 999,
        background: checked ? "var(--uai-surface-raised)" : "transparent",
        boxShadow: checked ? "0 1px 2px oklch(0 0 0 / 0.08)" : undefined,
        color: checked ? "var(--uai-text)" : "var(--uai-subtle)",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    >
      <input
        {...props}
        type="radio"
        name={group.name}
        value={value}
        checked={checked}
        onChange={(event) => {
          props.onChange?.(event);
          if (!event.defaultPrevented) group.select(value);
        }}
        style={{ position: "absolute", inset: 0, margin: 0, opacity: 0, cursor: "pointer" }}
      />
      {children}
    </label>
  );
}

/** Lays out groups as stacked sections, or as board columns in Board. */
export function ApprovalQueueGroups({ style, ...props }: ComponentProps<"div">) {
  const context = useQueue("ApprovalQueueGroups");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns:
          context.variant === "board"
            ? "repeat(auto-fit, minmax(min(100%, 260px), 1fr))"
            : "minmax(0, 1fr)",
        alignItems: "start",
        gap: context.variant === "compact" ? 12 : 16,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function ApprovalQueueGroup({ style, ...props }: ComponentProps<"section">) {
  const context = useQueue("ApprovalQueueGroup");
  const id = useId();
  const board = context.variant === "board";
  return (
    <GroupContext.Provider value={id}>
      <section
        aria-labelledby={id}
        {...props}
        style={{
          display: "grid",
          alignContent: "start",
          gap: context.variant === "compact" ? 6 : 10,
          minWidth: 0,
          padding: board ? 8 : 0,
          borderRadius: board ? 14 : 0,
          background: board
            ? "color-mix(in oklab, var(--uai-surface-raised) 45%, var(--uai-surface))"
            : "transparent",
          ...style,
        }}
      />
    </GroupContext.Provider>
  );
}

export function ApprovalQueueGroupHeader({ style, ...props }: ComponentProps<"div">) {
  useGroup("ApprovalQueueGroupHeader");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
        padding: "2px 4px",
        ...style,
      }}
    />
  );
}

export function ApprovalQueueGroupTitle({ style, ...props }: ComponentProps<"h3">) {
  const id = useGroup("ApprovalQueueGroupTitle");
  return (
    <h3
      {...props}
      id={id}
      style={{ margin: 0, fontSize: 13, lineHeight: "18px", fontWeight: 500, ...style }}
    />
  );
}

export function ApprovalQueueGroupCount({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        minWidth: 20,
        padding: "0 6px",
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-muted)",
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: "18px",
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function ApprovalQueueItems({ style, ...props }: ComponentProps<"ul">) {
  const id = useGroup("ApprovalQueueItems");
  const context = useQueue("ApprovalQueueItems");
  return (
    <ul
      aria-labelledby={id}
      {...props}
      style={{
        display: "grid",
        gap: context.variant === "compact" ? 6 : 8,
        margin: 0,
        padding: 0,
        listStyle: "none",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type ApprovalQueueItemProps = DistributiveOmit<ApprovalCardProps, "variant">;

/** One pending decision. Compose Approval Card parts inside it. */
export function ApprovalQueueItem(props: ApprovalQueueItemProps) {
  const context = useQueue("ApprovalQueueItem");
  return (
    <li data-uai-approval-queue-item="" style={{ minWidth: 0 }}>
      <ApprovalCard {...(props as ApprovalCardProps)} variant={cardVariants[context.variant]} />
    </li>
  );
}

/** Shown when nothing is waiting. Compose Empty State parts inside it. */
export function ApprovalQueueEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = useQueue("ApprovalQueueEmpty");
  return <EmptyState {...props} variant={emptyVariants[context.variant]} />;
}
