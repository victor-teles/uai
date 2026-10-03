"use client";

import { Check, Circle, LoaderCircle } from "lucide-react";
import { type ComponentProps, createContext, type ReactNode, useContext } from "react";

import { cn } from "@/lib/uai-utils";

export const TASK_LIST_VARIANTS = ["card", "timeline", "compact"] as const;
export const TASK_LIST_STATUSES = ["complete", "active", "pending"] as const;

export type TaskListVariant = (typeof TASK_LIST_VARIANTS)[number];
export type TaskStatus = (typeof TASK_LIST_STATUSES)[number];

const statusCopy: Record<TaskStatus, string> = {
  complete: "Complete",
  active: "In progress",
  pending: "Pending",
};

const statusChrome: Record<
  TaskStatus,
  { markerClass: string; statusClass: string; icon: typeof Check }
> = {
  complete: {
    markerClass:
      "border-transparent bg-[color-mix(in_oklab,var(--uai-success)_16%,transparent)] text-[color-mix(in_oklab,var(--uai-success)_85%,var(--uai-text))]",
    statusClass:
      "bg-[color-mix(in_oklab,var(--uai-success)_14%,transparent)] text-[color-mix(in_oklab,var(--uai-success)_85%,var(--uai-text))]",
    icon: Check,
  },
  active: {
    markerClass: "border-transparent bg-[var(--uai-surface-raised)] text-[var(--uai-text)]",
    statusClass: "bg-[var(--uai-surface-raised)] text-[var(--uai-text)]",
    icon: LoaderCircle,
  },
  pending: {
    markerClass:
      "border-dashed border-[color-mix(in_oklab,var(--uai-subtle)_70%,transparent)] bg-transparent text-transparent",
    statusClass: "bg-transparent text-[var(--uai-subtle)]",
    icon: Circle,
  },
};

function taskListChrome(variant: TaskListVariant) {
  const timeline = variant === "timeline";
  const compact = variant === "compact";

  return {
    rootClass: timeline
      ? "grid bg-transparent"
      : "divide-y divide-[var(--uai-border)] overflow-hidden border border-[var(--uai-border)] bg-[var(--uai-surface)] [&>li]:transition-[background-color,opacity,translate] [&>li:hover]:bg-[color-mix(in_oklab,var(--uai-surface-raised)_45%,transparent)]",
    rootStyle: { borderRadius: compact ? 12 : variant === "card" ? 14 : 0 },
    itemClass: timeline
      ? "relative grid grid-cols-[24px_minmax(0,1fr)_auto] items-start gap-x-3 pb-6 last:pb-0"
      : compact
        ? "grid min-h-12 grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2.5 px-3 py-2"
        : "grid min-h-16 grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3",
    markerClass: compact ? "size-5 rounded-full" : "size-6 rounded-full",
    iconClass: compact ? "size-3" : "size-3.5",
    connectorClass: timeline
      ? "absolute top-8 bottom-1 left-[11.5px] block w-px bg-[var(--uai-border)]"
      : "hidden",
    contentClass: timeline ? "min-w-0 pt-[3px]" : "min-w-0",
    titleClass: compact ? "text-[12.5px] leading-[17px]" : "text-[13px] leading-[18px]",
    descriptionClass: compact
      ? "mt-px text-[11.5px] leading-4"
      : "mt-0.5 text-[12px] leading-[17px]",
    statusClass: compact
      ? "min-h-5 px-1.5 text-[11px] leading-4"
      : "min-h-[22px] px-2 text-[11.5px] leading-4",
  };
}

type TaskListContextValue = {
  chrome: ReturnType<typeof taskListChrome>;
};

const TaskListContext = createContext<TaskListContextValue | null>(null);

function useTaskList(name: string) {
  const context = useContext(TaskListContext);
  if (!context) throw new Error(`${name} must be used within TaskList`);
  return context;
}

export type TaskListProps = ComponentProps<"ol"> & {
  variant?: TaskListVariant;
};

export function TaskList({
  variant = "card",
  className,
  children,
  style,
  ...props
}: TaskListProps) {
  const chrome = taskListChrome(variant);

  return (
    <TaskListContext.Provider value={{ chrome }}>
      <ol
        className={cn(
          "m-0 w-full list-none p-0 text-[var(--uai-text)]",
          chrome.rootClass,
          className,
        )}
        style={{ ...chrome.rootStyle, ...style }}
        data-variant={variant}
        {...props}
      >
        {children}
      </ol>
    </TaskListContext.Provider>
  );
}

export type TaskListItemProps = ComponentProps<"li"> & {
  status: TaskStatus;
  statusLabel?: ReactNode;
};

export function TaskListItem({
  status,
  statusLabel,
  className,
  children,
  "aria-current": ariaCurrent,
  ...props
}: TaskListItemProps) {
  const context = useTaskList("TaskListItem");
  const state = statusChrome[status];
  const StatusIcon = state.icon;

  return (
    <li
      className={cn(
        "[&:last-child>span:first-child]:hidden",
        "transition-[opacity,translate,background-color] duration-[240ms] ease-[cubic-bezier(0.23,1,0.32,1)] starting:translate-y-1 starting:opacity-0 nth-2:delay-[40ms] nth-3:delay-[80ms] nth-4:delay-[120ms] nth-5:delay-[160ms] nth-6:delay-[200ms] motion-reduce:transition-none",
        context.chrome.itemClass,
        className,
      )}
      data-status={status}
      aria-current={ariaCurrent ?? (status === "active" ? "step" : undefined)}
      {...props}
    >
      <span className={context.chrome.connectorClass} aria-hidden="true" />
      <span
        className={cn(
          "relative z-10 inline-flex shrink-0 items-center justify-center border transition-colors duration-200",
          context.chrome.markerClass,
          state.markerClass,
        )}
        aria-hidden="true"
      >
        <StatusIcon
          strokeWidth={status === "complete" ? 2.5 : 2}
          className={cn(
            context.chrome.iconClass,
            status === "active" && "motion-safe:animate-spin",
          )}
        />
      </span>
      <span className={context.chrome.contentClass}>{children}</span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded-full font-medium whitespace-nowrap tabular-nums",
          context.chrome.statusClass,
          state.statusClass,
        )}
      >
        {statusLabel ?? statusCopy[status]}
      </span>
    </li>
  );
}

export type TaskListTitleProps = ComponentProps<"span"> & { children: ReactNode };

export function TaskListTitle({ className, children, ...props }: TaskListTitleProps) {
  const context = useTaskList("TaskListTitle");

  return (
    <span
      className={cn(
        "block font-medium [overflow-wrap:anywhere] in-data-[status=pending]:text-[var(--uai-muted)]",
        context.chrome.titleClass,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export type TaskListDescriptionProps = ComponentProps<"span"> & { children: ReactNode };

export function TaskListDescription({ className, children, ...props }: TaskListDescriptionProps) {
  const context = useTaskList("TaskListDescription");

  return (
    <span
      className={cn(
        "block text-[var(--uai-subtle)] [overflow-wrap:anywhere]",
        context.chrome.descriptionClass,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
