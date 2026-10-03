"use client";

import { type ComponentProps, createContext, useContext, useId, useState } from "react";
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
import { cn } from "@/lib/uai-utils";

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

/** Review queue of pending decisions, grouped by a consumer-chosen key. */
export function ApprovalQueue({
  variant = "grouped",
  className,
  children,
  ...props
}: ApprovalQueueProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="approval-queue"
        className={cn(
          "grid min-w-0 content-start text-[13px]/[18px] text-foreground",
          variant === "compact" ? "gap-2.5" : "gap-4",
          className,
        )}
        {...props}
        data-variant={variant}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function ApprovalQueueHeader({ className, ...props }: ComponentProps<"div">) {
  useQueue("ApprovalQueueHeader");
  return (
    <div
      data-slot="approval-queue-header"
      className={cn("flex min-w-0 flex-wrap items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export function ApprovalQueueHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="approval-queue-heading"
      className={cn("grid min-w-0 flex-[1_1_240px] gap-1", className)}
      {...props}
    />
  );
}

export function ApprovalQueueTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useQueue("ApprovalQueueTitle");
  const compact = context.variant === "compact";
  return (
    <h2
      data-slot="approval-queue-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.015em] wrap-anywhere",
        compact ? "text-[15px]/5" : "text-lg/6",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function ApprovalQueueDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="approval-queue-description"
      className={cn("m-0 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function ApprovalQueueActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="approval-queue-actions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

export function ApprovalQueueAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useQueue("ApprovalQueueAction");
  const compact = context.variant === "compact";
  return (
    <button
      data-slot="approval-queue-action"
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 font-medium whitespace-nowrap [transition:filter_120ms_ease-out,box-shadow_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring not-disabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:not-disabled:active:scale-100",
        compact ? "h-6.5 px-2.75 text-[12px]/4" : "h-7.5 px-3.25 text-[12.5px]/4",
        emphasis === "primary"
          ? "bg-primary text-primary-foreground not-disabled:hover:brightness-108"
          : "bg-secondary text-foreground not-disabled:hover:shadow-[inset_0_0_0_999px_color-mix(in_oklab,var(--foreground)_9%,transparent)]",
        className,
      )}
      {...props}
      type={type}
      data-emphasis={emphasis}
    />
  );
}

/** Queue totals. Metric cards reflow from four columns to one. */
export function ApprovalQueueSummary({ className, ...props }: ComponentProps<"div">) {
  const context = useQueue("ApprovalQueueSummary");
  const compact = context.variant === "compact";
  return (
    <div
      data-slot="approval-queue-summary"
      className={cn(
        "grid min-w-0",
        compact
          ? "grid-cols-[repeat(auto-fit,minmax(min(100%,130px),1fr))] gap-2"
          : "grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-3",
        className,
      )}
      {...props}
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
  className,
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
        data-slot="approval-queue-group-by"
        className={cn(
          "m-0 flex flex-wrap items-center gap-0.5 rounded-full border-0 bg-card p-0.75 shadow-[inset_0_0_0_1px_var(--border)]",
          className,
        )}
        {...props}
      >
        <legend className="float-left pr-1.5 pl-2.5 text-[12px] text-subtle-foreground">
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
  className,
  ...props
}: Omit<ComponentProps<"input">, "value" | "type" | "name" | "checked"> & { value: string }) {
  const group = useContext(GroupByCtx);
  if (!group)
    throw new Error("ApprovalQueueGroupByOption must be used within ApprovalQueueGroupBy");
  const checked = group.value === value;
  return (
    <label
      data-slot="approval-queue-group-by-option"
      data-checked={checked || undefined}
      className={cn(
        "relative inline-flex h-6 cursor-pointer items-center rounded-full px-2.5 text-[12px] font-medium [transition:background-color_160ms_cubic-bezier(0.23,1,0.32,1),color_120ms_ease-out,box-shadow_160ms_cubic-bezier(0.23,1,0.32,1)] has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-ring motion-reduce:transition-none",
        checked
          ? "bg-accent text-foreground shadow-[0_1px_2px_oklch(0_0_0/0.08)]"
          : "bg-transparent text-subtle-foreground hover:text-foreground",
        className,
      )}
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
        className="absolute inset-0 m-0 cursor-pointer opacity-0"
      />
      {children}
    </label>
  );
}

/** Lays out groups as stacked sections, or as board columns in Board. */
export function ApprovalQueueGroups({ className, ...props }: ComponentProps<"div">) {
  const context = useQueue("ApprovalQueueGroups");
  return (
    <div
      data-slot="approval-queue-groups"
      className={cn(
        "grid min-w-0 items-start",
        context.variant === "board"
          ? "grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))]"
          : "grid-cols-[minmax(0,1fr)]",
        context.variant === "compact" ? "gap-3" : "gap-4",
        className,
      )}
      {...props}
    />
  );
}

export function ApprovalQueueGroup({ className, ...props }: ComponentProps<"section">) {
  const context = useQueue("ApprovalQueueGroup");
  const id = useId();
  const board = context.variant === "board";
  return (
    <GroupContext.Provider value={id}>
      <section
        aria-labelledby={id}
        data-slot="approval-queue-group"
        className={cn(
          "grid min-w-0 content-start",
          context.variant === "compact" ? "gap-1.5" : "gap-2.5",
          board
            ? "rounded-[14px] bg-[color-mix(in_oklab,var(--muted)_45%,var(--card))] p-2"
            : "rounded-none bg-transparent p-0",
          className,
        )}
        {...props}
      />
    </GroupContext.Provider>
  );
}

export function ApprovalQueueGroupHeader({ className, ...props }: ComponentProps<"div">) {
  useGroup("ApprovalQueueGroupHeader");
  return (
    <div
      data-slot="approval-queue-group-header"
      className={cn("flex flex-wrap items-center gap-2 px-1 py-0.5", className)}
      {...props}
    />
  );
}

export function ApprovalQueueGroupTitle({ className, ...props }: ComponentProps<"h3">) {
  const id = useGroup("ApprovalQueueGroupTitle");
  return (
    <h3
      data-slot="approval-queue-group-title"
      className={cn("m-0 text-[13px]/[18px] font-medium", className)}
      {...props}
      id={id}
    />
  );
}

export function ApprovalQueueGroupCount({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="approval-queue-group-count"
      className={cn(
        "min-w-5 rounded-full bg-muted px-1.5 text-center text-[11.5px]/[18px] font-medium text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export function ApprovalQueueItems({ className, ...props }: ComponentProps<"ul">) {
  const id = useGroup("ApprovalQueueItems");
  const context = useQueue("ApprovalQueueItems");
  return (
    <ul
      aria-labelledby={id}
      data-slot="approval-queue-items"
      className={cn(
        "m-0 grid min-w-0 list-none p-0",
        context.variant === "compact" ? "gap-1.5" : "gap-2",
        className,
      )}
      {...props}
    />
  );
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type ApprovalQueueItemProps = DistributiveOmit<ApprovalCardProps, "variant">;

/** One pending decision. Compose Approval Card parts inside it. */
export function ApprovalQueueItem(props: ApprovalQueueItemProps) {
  const context = useQueue("ApprovalQueueItem");
  return (
    <li
      data-slot="approval-queue-item"
      className="min-w-0 animate-in duration-240 ease-out-quint fade-in-0 slide-in-from-bottom-1 fill-mode-both nth-2:[animation-delay:40ms] nth-3:[animation-delay:80ms] nth-4:[animation-delay:120ms] nth-5:[animation-delay:160ms] nth-[n+6]:[animation-delay:200ms] motion-reduce:animate-none"
    >
      <ApprovalCard {...(props as ApprovalCardProps)} variant={cardVariants[context.variant]} />
    </li>
  );
}

/** Shown when nothing is waiting. Compose Empty State parts inside it. */
export function ApprovalQueueEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = useQueue("ApprovalQueueEmpty");
  return <EmptyState {...props} variant={emptyVariants[context.variant]} />;
}
