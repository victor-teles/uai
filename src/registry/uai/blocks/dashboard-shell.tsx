"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId } from "react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/uai-utils";

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

const dashboardShellVariants = cva(
  "flex min-w-0 flex-wrap items-stretch text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        split: "gap-4 rounded-none bg-transparent p-0",
        inset: "gap-2 rounded-[20px] bg-muted p-1.5",
        compact: "gap-2 rounded-none bg-transparent p-0",
      },
    },
  },
);

const dashboardShellActionVariants = cva(
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 font-medium whitespace-nowrap [transition:background-color_120ms_ease-out,filter_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] py-0 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid enabled:active:scale-[0.97] motion-reduce:transition-none motion-reduce:enabled:active:scale-100 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      emphasis: {
        primary: "bg-primary text-primary-foreground hover:bg-primary enabled:hover:brightness-108",
        secondary:
          "bg-secondary text-secondary-foreground enabled:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
      },
      compact: {
        true: "h-[26px] px-2.5 has-[>svg]:px-2.5 text-[12px]",
        false: "h-7.5 px-[13px] has-[>svg]:px-[13px] text-[12.5px]",
      },
    },
  },
);

/** Page frame: global navigation beside a labelled main region. Wraps below the sidebar on narrow screens. */
export function DashboardShell({
  variant = "split",
  className,
  children,
  ...props
}: DashboardShellProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <div
        data-slot="dashboard-shell"
        className={cn(dashboardShellVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

/** Global navigation. Compose App Sidebar parts inside it. */
export function DashboardShellSidebar({ className, ...props }: Omit<AppSidebarProps, "variant">) {
  const context = useShell("DashboardShellSidebar");
  return (
    <AppSidebar
      {...props}
      variant={sidebarVariants[context.variant]}
      className={cn("h-auto shrink-0", className)}
    />
  );
}

export function DashboardShellMain({ className, ...props }: ComponentProps<"section">) {
  const context = useShell("DashboardShellMain");
  const { variant } = context;
  return (
    <section
      data-slot="dashboard-shell-main"
      aria-labelledby={`${context.id}-title`}
      className={cn(
        "grid min-w-0 flex-[1_1_360px] content-start border-0",
        variant === "compact" ? "gap-3" : "gap-5",
        variant === "inset"
          ? "rounded-[14px] bg-card px-[22px] py-5 ring-1 ring-border"
          : cn("rounded-none bg-transparent px-0", variant === "compact" ? "py-1" : "py-2"),
        className,
      )}
      {...props}
    />
  );
}

/** Page hierarchy and page actions. Actions wrap below the heading on narrow widths. */
export function DashboardShellHeader({ className, ...props }: ComponentProps<"div">) {
  useShell("DashboardShellHeader");
  return (
    <div
      data-slot="dashboard-shell-header"
      className={cn("flex min-w-0 flex-wrap items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export function DashboardShellHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dashboard-shell-heading"
      className={cn("grid min-w-0 flex-[1_1_240px] gap-1", className)}
      {...props}
    />
  );
}

export function DashboardShellBreadcrumb({
  className,
  ...props
}: Omit<BreadcrumbTrailProps, "variant">) {
  const context = useShell("DashboardShellBreadcrumb");
  return (
    <BreadcrumbTrail
      {...props}
      variant={breadcrumbVariants[context.variant]}
      className={cn("-ml-1.5", className)}
    />
  );
}

export function DashboardShellTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useShell("DashboardShellTitle");
  return (
    <h2
      data-slot="dashboard-shell-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em] wrap-anywhere",
        context.variant === "compact" ? "text-[15px]/5" : "text-[18px]/6",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function DashboardShellDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="dashboard-shell-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DashboardShellActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dashboard-shell-actions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

export function DashboardShellAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useShell("DashboardShellAction");
  return (
    <Button
      data-slot="dashboard-shell-action"
      variant={emphasis === "primary" ? "default" : "secondary"}
      data-emphasis={emphasis}
      className={cn(
        dashboardShellActionVariants({ emphasis, compact: context.variant === "compact" }),
        className,
      )}
      {...props}
      type={type}
    />
  );
}

/** Key figures. Cards reflow from four columns to one without media queries. */
export function DashboardShellMetrics({ className, ...props }: ComponentProps<"div">) {
  const context = useShell("DashboardShellMetrics");
  const compact = context.variant === "compact";
  return (
    <div
      data-slot="dashboard-shell-metrics"
      className={cn(
        "grid min-w-0",
        compact
          ? "grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-2"
          : "grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function DashboardShellMetric(props: Omit<MetricCardProps, "variant">) {
  const context = useShell("DashboardShellMetric");
  return <MetricCard {...props} variant={metricVariants[context.variant]} />;
}

export function DashboardShellContent({ className, ...props }: ComponentProps<"div">) {
  const context = useShell("DashboardShellContent");
  return (
    <div
      data-slot="dashboard-shell-content"
      className={cn(
        "grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))]",
        context.variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function DashboardShellPanel({ className, ...props }: ComponentProps<"section">) {
  const context = useShell("DashboardShellPanel");
  const labelId = useId();
  const compact = context.variant === "compact";
  return (
    <PanelContext.Provider value={labelId}>
      <section
        data-slot="dashboard-shell-panel"
        aria-labelledby={labelId}
        className={cn(
          "grid min-w-0 content-start border-0",
          compact ? "gap-2 rounded-xl p-3" : "gap-3 rounded-[14px] p-4",
          context.variant === "inset"
            ? "bg-[color-mix(in_oklab,var(--muted)_55%,var(--card))]"
            : "bg-card ring-1 ring-border",
          className,
        )}
        {...props}
      />
    </PanelContext.Provider>
  );
}

export function DashboardShellPanelTitle({ className, ...props }: ComponentProps<"h3">) {
  const labelId = useContext(PanelContext);
  if (!labelId) throw new Error("DashboardShellPanelTitle must be used within DashboardShellPanel");
  return (
    <h3
      data-slot="dashboard-shell-panel-title"
      className={cn("m-0 text-[13px]/[18px] font-medium", className)}
      {...props}
      id={labelId}
    />
  );
}
