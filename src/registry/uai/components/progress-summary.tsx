"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/uai-utils";

export const PROGRESS_SUMMARY_VARIANTS = ["card", "inline", "compact"] as const;
export type ProgressSummaryVariant = (typeof PROGRESS_SUMMARY_VARIANTS)[number];
export type ProgressSummaryStatus = "running" | "paused" | "complete" | "cancelled" | "error";
export type ProgressSummaryProps = ComponentProps<"section"> & {
  variant?: ProgressSummaryVariant;
  /** Completed units. Omit for indeterminate progress. */
  value?: number;
  max?: number;
  status?: ProgressSummaryStatus;
};
type SummaryContext = {
  id: string;
  variant: ProgressSummaryVariant;
  value?: number;
  max: number;
  percent?: number;
  status: ProgressSummaryStatus;
};
const Context = createContext<SummaryContext | null>(null);
function useSummary(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ProgressSummary`);
  return context;
}
const statusCopy: Record<ProgressSummaryStatus, string> = {
  running: "In progress",
  paused: "Paused",
  complete: "Complete",
  cancelled: "Cancelled",
  error: "Failed",
};
const progressSummaryVariants = cva(
  "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        card: "gap-y-3.5 rounded-[14px] border bg-card p-4.5",
        inline: "gap-y-3.5 rounded-[14px] border-0 bg-transparent p-0",
        compact: "gap-y-2 rounded-xl border bg-card px-3 py-2.5",
      },
    },
  },
);
const statusTextClass: Record<ProgressSummaryStatus, string> = {
  running: "shimmer-text motion-reduce:text-muted-foreground",
  paused: "text-subtle-foreground",
  complete: "text-success",
  cancelled: "text-subtle-foreground",
  error: "text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]",
};
const fillClass: Record<ProgressSummaryStatus, string> = {
  running:
    "*:data-[slot=progress-indicator]:bg-primary *:data-[slot=progress-indicator]:opacity-100",
  paused:
    "*:data-[slot=progress-indicator]:bg-muted-foreground *:data-[slot=progress-indicator]:opacity-50",
  complete:
    "*:data-[slot=progress-indicator]:bg-success *:data-[slot=progress-indicator]:opacity-100",
  cancelled:
    "*:data-[slot=progress-indicator]:bg-muted-foreground *:data-[slot=progress-indicator]:opacity-50",
  error:
    "*:data-[slot=progress-indicator]:bg-destructive *:data-[slot=progress-indicator]:opacity-100",
};

export function ProgressSummary({
  variant = "card",
  value,
  max = 100,
  status = "running",
  children,
  className,
  ...props
}: ProgressSummaryProps) {
  const id = useId();
  const clamped = value === undefined ? undefined : Math.min(Math.max(value, 0), max);
  const percent =
    clamped === undefined ? undefined : Math.round((clamped / Math.max(max, 1)) * 100);
  return (
    <Context.Provider value={{ id, variant, value: clamped, max, percent, status }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="progress-summary"
        className={cn(progressSummaryVariants({ variant }), className)}
        {...props}
        data-variant={variant}
        data-status={status}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function ProgressSummaryHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="progress-summary-header"
      className={cn("grid min-w-0 gap-0.5", className)}
      {...props}
    />
  );
}

export function ProgressSummaryTitle({ className, ...props }: ComponentProps<"h3">) {
  const context = useSummary("ProgressSummaryTitle");
  return (
    <h3
      data-slot="progress-summary-title"
      className={cn("m-0 text-[13px]/[18px] font-medium wrap-anywhere", className)}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function ProgressSummaryStatusText({ children, className, ...props }: ComponentProps<"p">) {
  const context = useSummary("ProgressSummaryStatusText");
  return (
    <p
      role="status"
      data-slot="progress-summary-status-text"
      className={cn(
        "m-0 justify-self-start text-xs/4 tabular-nums",
        statusTextClass[context.status],
        className,
      )}
      {...props}
    >
      {children ?? statusCopy[context.status]}
    </p>
  );
}

export function ProgressSummaryValue({ children, className, ...props }: ComponentProps<"span">) {
  const context = useSummary("ProgressSummaryValue");
  return (
    <span
      aria-hidden="true"
      data-slot="progress-summary-value"
      className={cn(
        "justify-self-end tabular-nums",
        context.variant === "compact"
          ? "text-[13px]/[18px] font-medium"
          : "text-[22px]/[26px] font-semibold tracking-[-0.02em]",
        className,
      )}
      {...props}
    >
      {children ?? (context.percent === undefined ? "—" : `${context.percent}%`)}
    </span>
  );
}

export function ProgressSummaryBar({
  "aria-valuetext": valueText,
  className,
  ...props
}: ComponentProps<"div">) {
  const context = useSummary("ProgressSummaryBar");
  const indeterminate = context.percent === undefined;
  return (
    <Progress
      aria-labelledby={`${context.id}-title`}
      aria-valuemax={context.max}
      aria-valuenow={context.value}
      aria-valuetext={
        valueText ??
        (context.percent === undefined
          ? statusCopy[context.status]
          : `${context.percent}% · ${statusCopy[context.status]}`)
      }
      data-slot="progress-summary-bar"
      data-indeterminate={indeterminate || undefined}
      value={context.percent ?? null}
      className={cn(
        "col-span-full bg-muted",
        "*:data-[slot=progress-indicator]:rounded-full *:data-[slot=progress-indicator]:[transition:transform_300ms_cubic-bezier(0.23,1,0.32,1),background-color_200ms_ease-out,opacity_200ms_ease-out] motion-reduce:*:data-[slot=progress-indicator]:transition-none",
        "data-indeterminate:*:data-[slot=progress-indicator]:w-[35%] data-indeterminate:*:data-[slot=progress-indicator]:animate-indeterminate motion-reduce:data-indeterminate:*:data-[slot=progress-indicator]:animate-none motion-reduce:data-indeterminate:*:data-[slot=progress-indicator]:transform-none!",
        fillClass[context.status],
        context.variant === "compact" ? "h-1" : "h-1.5",
        className,
      )}
      {...props}
    />
  );
}

export function ProgressSummaryStats({ className, ...props }: ComponentProps<"dl">) {
  const context = useSummary("ProgressSummaryStats");
  return (
    <dl
      data-slot="progress-summary-stats"
      className={cn(
        "col-span-full m-0",
        context.variant === "compact"
          ? "flex flex-wrap gap-x-3.5 gap-y-1"
          : "grid grid-cols-[repeat(auto-fit,minmax(96px,1fr))] gap-3",
        context.variant === "card" ? "pt-0.5" : "pt-0",
        className,
      )}
      {...props}
    />
  );
}

export function ProgressSummaryStat({ className, ...props }: ComponentProps<"div">) {
  const context = useSummary("ProgressSummaryStat");
  return (
    <div
      data-slot="progress-summary-stat"
      className={cn(
        "min-w-0 items-baseline",
        context.variant === "compact" ? "flex gap-1" : "grid gap-0.5",
        className,
      )}
      {...props}
    />
  );
}

export function ProgressSummaryStatLabel({ className, ...props }: ComponentProps<"dt">) {
  return (
    <dt
      data-slot="progress-summary-stat-label"
      className={cn("text-[11.5px]/4 text-subtle-foreground", className)}
      {...props}
    />
  );
}

export function ProgressSummaryStatValue({ className, ...props }: ComponentProps<"dd">) {
  return (
    <dd
      data-slot="progress-summary-stat-value"
      className={cn("m-0 font-medium tabular-nums", className)}
      {...props}
    />
  );
}

export function ProgressSummaryActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="progress-summary-actions"
      className={cn("col-span-full flex flex-wrap justify-end gap-1.5", className)}
      {...props}
    />
  );
}

export function ProgressSummaryCancel({
  children = "Cancel",
  disabled,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useSummary("ProgressSummaryCancel");
  const finished = context.status !== "running" && context.status !== "paused";
  return (
    <Button
      data-slot="progress-summary-cancel"
      variant="secondary"
      className={cn(
        "cursor-pointer rounded-full py-0 text-foreground [transition:background-color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] not-disabled:active:scale-[0.97] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:text-subtle-foreground disabled:opacity-100 motion-reduce:transition-none",
        context.variant === "compact"
          ? "h-6 px-2.5 text-xs/4 has-[>svg]:px-2.5"
          : "h-7 px-3 text-[12.5px]/4 has-[>svg]:px-3",
        className,
      )}
      {...props}
      type="button"
      disabled={disabled ?? finished}
    >
      {children}
    </Button>
  );
}
