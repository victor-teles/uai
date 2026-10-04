"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId } from "react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/uai-utils";

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

const auditLogViewerVariants = cva(
  "grid min-w-0 content-start text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: { sidebar: "gap-4", stacked: "gap-4", compact: "gap-2.5" },
    },
  },
);

const auditLogViewerActionVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 font-medium whitespace-nowrap [transition:filter_120ms_ease-out,box-shadow_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] py-0 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid enabled:active:scale-[0.97] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:enabled:active:scale-100 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      emphasis: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary enabled:hover:shadow-none enabled:hover:brightness-108",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary enabled:hover:shadow-[inset_0_0_0_999px_color-mix(in_oklab,var(--foreground)_9%,transparent)]",
      },
      compact: {
        true: "h-6.5 px-2.75 has-[>svg]:px-2.75 text-[12px]/4",
        false: "h-7.5 px-3.25 has-[>svg]:px-3.25 text-[12.5px]/4",
      },
    },
  },
);

/** Audit review surface: filters, a date range, expandable events, and export. */
export function AuditLogViewer({
  variant = "sidebar",
  className,
  children,
  ...props
}: AuditLogViewerProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="audit-log-viewer"
        data-variant={variant}
        className={cn(auditLogViewerVariants({ variant }), className)}
        {...props}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function AuditLogViewerHeader({ className, ...props }: ComponentProps<"div">) {
  useViewer("AuditLogViewerHeader");
  return (
    <div
      data-slot="audit-log-viewer-header"
      className={cn("flex min-w-0 flex-wrap items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export function AuditLogViewerHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="audit-log-viewer-heading"
      className={cn("grid min-w-0 flex-[1_1_240px] gap-1", className)}
      {...props}
    />
  );
}

export function AuditLogViewerTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useViewer("AuditLogViewerTitle");
  const compact = context.variant === "compact";
  return (
    <h2
      data-slot="audit-log-viewer-title"
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

export function AuditLogViewerDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="audit-log-viewer-description"
      className={cn("m-0 text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export function AuditLogViewerActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="audit-log-viewer-actions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

export function AuditLogViewerAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useViewer("AuditLogViewerAction");
  return (
    <Button
      data-slot="audit-log-viewer-action"
      variant={emphasis === "primary" ? "default" : "secondary"}
      data-emphasis={emphasis}
      type={type}
      className={cn(
        auditLogViewerActionVariants({ emphasis, compact: context.variant === "compact" }),
        className,
      )}
      {...props}
    />
  );
}

/** Places filters beside the log in Sidebar and above it otherwise. */
export function AuditLogViewerBody({ className, ...props }: ComponentProps<"div">) {
  const context = useViewer("AuditLogViewerBody");
  return (
    <div
      data-slot="audit-log-viewer-body"
      className={cn(
        "min-w-0 flex-wrap items-start",
        context.variant === "sidebar" ? "flex" : "grid",
        context.variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

/** Actor, action, and resource filters. Compose Filter Bar parts inside it. */
export function AuditLogViewerFilters({
  "aria-label": label = "Audit filters",
  className,
  ...props
}: Omit<FilterBarProps, "variant">) {
  const context = useViewer("AuditLogViewerFilters");
  return (
    <FilterBar
      role="group"
      aria-label={label}
      className={cn(context.variant === "sidebar" && "flex-[1_1_220px]", className)}
      {...props}
      variant={filterVariants[context.variant]}
    />
  );
}

/** Event date range. Compose Date Range Picker parts inside it. */
export function AuditLogViewerDateRange(props: Omit<DateRangePickerProps, "variant">) {
  const context = useViewer("AuditLogViewerDateRange");
  return <DateRangePicker {...props} variant={rangeVariants[context.variant]} />;
}

export function AuditLogViewerMain({ className, ...props }: ComponentProps<"div">) {
  const context = useViewer("AuditLogViewerMain");
  return (
    <div
      data-slot="audit-log-viewer-main"
      className={cn(
        "grid min-w-0 flex-[999_1_360px] content-start",
        context.variant === "compact" ? "gap-1.5" : "gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

/** The event list. Compose Audit Log parts inside it. */
export function AuditLogViewerLog(props: Omit<AuditLogProps, "variant">) {
  const context = useViewer("AuditLogViewerLog");
  return <AuditLog {...props} variant={logVariants[context.variant]} />;
}

/** Result counts and export confirmations, announced politely. */
export function AuditLogViewerStatus({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      role="status"
      data-slot="audit-log-viewer-status"
      className={cn("m-0 px-0.5 text-[12px] text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}
