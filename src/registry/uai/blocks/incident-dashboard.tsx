"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId } from "react";
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
import { cn } from "@/lib/uai-utils";

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
const severityClasses: Record<IncidentDashboardSeverityLevel, string> = {
  critical: "bg-destructive/14 text-destructive",
  major: "bg-warning/14 text-warning",
  minor: "bg-muted-foreground/14 text-muted-foreground",
};

const incidentDashboardActionVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 font-medium whitespace-nowrap [transition:filter_120ms_ease-out,box-shadow_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
  {
    variants: {
      emphasis: {
        primary: "bg-primary text-primary-foreground enabled:hover:brightness-108",
        secondary:
          "bg-secondary text-secondary-foreground enabled:hover:shadow-[inset_0_0_0_999px_color-mix(in_oklab,var(--foreground)_9%,transparent)]",
      },
      compact: {
        true: "h-[26px] px-[11px] text-[12px]/4",
        false: "h-7.5 px-[13px] text-[12.5px]/4",
      },
    },
  },
);

/** Live incident view: status, impact, metrics, timeline, responders, and updates. */
export function IncidentDashboard({
  variant = "overview",
  className,
  children,
  ...props
}: IncidentDashboardProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        data-slot="incident-dashboard"
        aria-labelledby={`${id}-title`}
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

export function IncidentDashboardHeader({ className, ...props }: ComponentProps<"div">) {
  useDashboard("IncidentDashboardHeader");
  return (
    <div
      data-slot="incident-dashboard-header"
      className={cn("flex min-w-0 flex-wrap items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export function IncidentDashboardHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="incident-dashboard-heading"
      className={cn("grid min-w-0 flex-[1_1_240px] gap-1", className)}
      {...props}
    />
  );
}

export function IncidentDashboardTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useDashboard("IncidentDashboardTitle");
  return (
    <h2
      data-slot="incident-dashboard-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.015em] wrap-anywhere",
        context.variant === "compact" ? "text-[15px]/5" : "text-[18px]/6",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function IncidentDashboardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="incident-dashboard-description"
      className={cn("m-0 text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Severity label. Color reinforces the text and is never the only signal. */
export function IncidentDashboardSeverity({
  level = "major",
  className,
  children,
  ...props
}: ComponentProps<"span"> & { level?: IncidentDashboardSeverityLevel }) {
  return (
    <span
      data-slot="incident-dashboard-severity"
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1.5 rounded-full pr-2 pl-[7px] text-[11.5px]/4 font-medium",
        severityClasses[level],
        className,
      )}
      {...props}
      data-level={level}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full bg-current",
          level === "critical" &&
            "animate-[ring-pulse_2s_cubic-bezier(0.23,1,0.32,1)_infinite] motion-reduce:animate-none",
        )}
      />
      {children}
    </span>
  );
}

export function IncidentDashboardActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="incident-dashboard-actions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

export function IncidentDashboardAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useDashboard("IncidentDashboardAction");
  return (
    <button
      data-slot="incident-dashboard-action"
      data-emphasis={emphasis}
      className={cn(
        incidentDashboardActionVariants({ emphasis, compact: context.variant === "compact" }),
        className,
      )}
      {...props}
      type={type}
    />
  );
}

/** Current state of the incident. Compose Status Banner parts inside it. */
export function IncidentDashboardStatus(props: Omit<StatusBannerProps, "variant">) {
  const context = useDashboard("IncidentDashboardStatus");
  return <StatusBanner {...props} variant={bannerVariants[context.variant]} />;
}

export function IncidentDashboardMetrics({ className, ...props }: ComponentProps<"div">) {
  const context = useDashboard("IncidentDashboardMetrics");
  const compact = context.variant === "compact";
  return (
    <div
      data-slot="incident-dashboard-metrics"
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

export function IncidentDashboardMetric(props: Omit<MetricCardProps, "variant">) {
  const context = useDashboard("IncidentDashboardMetric");
  return <MetricCard {...props} variant={metricVariants[context.variant]} />;
}

const incidentDashboardBodyVariants = cva("min-w-0 items-start", {
  variants: {
    variant: {
      overview: "grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-3",
      split: "flex flex-wrap gap-3",
      compact: "grid grid-cols-[minmax(0,1fr)] gap-2",
    },
  },
});

/** Panels in equal columns (Overview), a wide main column (Split), or one column (Compact). */
export function IncidentDashboardBody({ className, ...props }: ComponentProps<"div">) {
  const context = useDashboard("IncidentDashboardBody");
  return (
    <div
      data-slot="incident-dashboard-body"
      className={cn(incidentDashboardBodyVariants({ variant: context.variant }), className)}
      {...props}
    />
  );
}

/** A dashboard panel. `span="wide"` takes the larger column in Split. */
export function IncidentDashboardPanel({
  span = "narrow",
  className,
  ...props
}: ComponentProps<"section"> & { span?: "wide" | "narrow" }) {
  const context = useDashboard("IncidentDashboardPanel");
  const labelId = useId();
  const compact = context.variant === "compact";
  return (
    <PanelContext.Provider value={labelId}>
      <section
        data-slot="incident-dashboard-panel"
        data-span={span}
        aria-labelledby={labelId}
        className={cn(
          "grid min-w-0 content-start border bg-card shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
          span === "wide" ? "flex-[999_1_360px]" : "flex-[1_1_240px]",
          compact ? "gap-2 rounded-xl p-3" : "gap-3 rounded-[14px] p-4",
          className,
        )}
        {...props}
      />
    </PanelContext.Provider>
  );
}

export function IncidentDashboardPanelTitle({ className, ...props }: ComponentProps<"h3">) {
  const labelId = useContext(PanelContext);
  if (!labelId)
    throw new Error("IncidentDashboardPanelTitle must be used within IncidentDashboardPanel");
  return (
    <h3
      data-slot="incident-dashboard-panel-title"
      className={cn("m-0 text-[13px]/[18px] font-medium", className)}
      {...props}
      id={labelId}
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

export function IncidentDashboardResponders({ className, ...props }: ComponentProps<"ul">) {
  const context = useDashboard("IncidentDashboardResponders");
  return (
    <ul
      data-slot="incident-dashboard-responders"
      className={cn(
        "m-0 grid min-w-0 list-none p-0",
        context.variant === "compact" ? "gap-1.5" : "gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

export function IncidentDashboardResponder({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="incident-dashboard-responder"
      className={cn(
        "grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5",
        className,
      )}
      {...props}
    />
  );
}

/** Initials avatar. Decorative because the name is always present as text. */
export function IncidentDashboardResponderAvatar({ className, ...props }: ComponentProps<"span">) {
  const context = useDashboard("IncidentDashboardResponderAvatar");
  const compact = context.variant === "compact";
  return (
    <span
      data-slot="incident-dashboard-responder-avatar"
      aria-hidden="true"
      className={cn(
        "row-span-2 grid place-items-center rounded-full bg-muted font-medium tracking-[0.01em] text-muted-foreground shadow-[0_0_0_1px_oklch(1_0_0/0.08)]",
        compact ? "size-6 text-[10px]" : "size-7 text-[10.5px]",
        className,
      )}
      {...props}
    />
  );
}

export function IncidentDashboardResponderName({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="incident-dashboard-responder-name"
      className={cn("font-medium wrap-anywhere", className)}
      {...props}
    />
  );
}

export function IncidentDashboardResponderRole({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="incident-dashboard-responder-role"
      className={cn("text-[12px]/4 text-subtle-foreground", className)}
      {...props}
    />
  );
}

/** Post an update. Publishing stays with the consumer through `onSubmit`. */
export function IncidentDashboardUpdate({ className, ...props }: ComponentProps<"form">) {
  const context = useDashboard("IncidentDashboardUpdate");
  const id = useId();
  return (
    <UpdateContext.Provider value={id}>
      <form
        data-slot="incident-dashboard-update"
        className={cn(
          "m-0 grid min-w-0",
          context.variant === "compact" ? "gap-1.5" : "gap-2",
          className,
        )}
        {...props}
      />
    </UpdateContext.Provider>
  );
}

export function IncidentDashboardUpdateLabel({
  className,
  children,
  ...props
}: ComponentProps<"label">) {
  const id = useUpdate("IncidentDashboardUpdateLabel");
  return (
    <label
      data-slot="incident-dashboard-update-label"
      className={cn("text-[11.5px]/4 font-medium text-subtle-foreground", className)}
      {...props}
      htmlFor={id}
    >
      {children}
    </label>
  );
}

export function IncidentDashboardUpdateInput({
  className,
  ...props
}: Omit<ComponentProps<"textarea">, "id">) {
  const id = useUpdate("IncidentDashboardUpdateInput");
  return (
    <textarea
      data-slot="incident-dashboard-update-input"
      rows={3}
      className={cn(
        "box-border w-full min-w-0 resize-y rounded-[10px] border-0 bg-background px-[11px] py-[9px] text-[13px]/[18px] text-inherit transition-[box-shadow] duration-120 ease-out placeholder:text-subtle-foreground focus:shadow-[0_0_0_1px_var(--border-strong),0_0_0_4px_color-mix(in_oklab,var(--primary)_22%,transparent)] focus:outline-none motion-reduce:transition-none",
        className,
      )}
      {...props}
      id={id}
    />
  );
}

export function IncidentDashboardUpdateSubmit({
  children = "Post update",
  className,
  ...props
}: Omit<ComponentProps<"button">, "type">) {
  useUpdate("IncidentDashboardUpdateSubmit");
  const context = useDashboard("IncidentDashboardUpdateSubmit");
  return (
    <button
      data-slot="incident-dashboard-update-submit"
      className={cn(
        incidentDashboardActionVariants({
          emphasis: "primary",
          compact: context.variant === "compact",
        }),
        "justify-self-end",
        className,
      )}
      {...props}
      type="submit"
    >
      {children}
    </button>
  );
}
