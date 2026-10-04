"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useId,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/uai-utils";

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
const recordStatusVariants = cva(
  "inline-flex h-5 items-center rounded-full px-2 text-[11.5px]/4 font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        success: "bg-success/14 text-success",
        warning: "bg-warning/14 text-warning",
        danger: "bg-destructive/14 text-destructive",
      },
    },
  },
);

const resourceManagerVariants = cva(
  "grid min-w-0 content-start text-[13px]/[18px] text-foreground",
  { variants: { variant: { split: "gap-4", stacked: "gap-4", compact: "gap-2.5" } } },
);

/** Record management surface: a list of domain records beside an inspector. */
export function ResourceManager({
  variant = "split",
  value,
  defaultValue = "",
  onValueChange,
  className,
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
        data-slot="resource-manager"
        className={cn(resourceManagerVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function ResourceManagerHeader({ className, ...props }: ComponentProps<"div">) {
  useManager("ResourceManagerHeader");
  return (
    <div
      data-slot="resource-manager-header"
      className={cn("flex min-w-0 flex-wrap items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export function ResourceManagerHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="resource-manager-heading"
      className={cn("grid min-w-0 flex-[1_1_240px] gap-1", className)}
      {...props}
    />
  );
}

export function ResourceManagerTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useManager("ResourceManagerTitle");
  return (
    <h2
      data-slot="resource-manager-title"
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

export function ResourceManagerDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="resource-manager-description"
      className={cn("m-0 text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export function ResourceManagerActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="resource-manager-actions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

const resourceManagerActionVariants = cva(
  [
    "cursor-pointer gap-1.5 rounded-full border-0 py-0",
    "transition-[filter,box-shadow,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)]",
    "enabled:active:scale-97 focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
  ],
  {
    variants: {
      emphasis: {
        primary: "bg-primary text-primary-foreground hover:bg-primary enabled:hover:brightness-108",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary enabled:hover:shadow-[inset_0_0_0_999px_color-mix(in_oklab,var(--foreground)_9%,transparent)]",
      },
      compact: {
        true: "h-[26px] px-[11px] text-[12px]/4 has-[>svg]:px-[11px]",
        false: "h-[30px] px-[13px] text-[12.5px]/4 has-[>svg]:px-[13px]",
      },
    },
  },
);

export function ResourceManagerAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useManager("ResourceManagerAction");
  return (
    <Button
      data-slot="resource-manager-action"
      variant={emphasis === "primary" ? "default" : "secondary"}
      className={cn(
        resourceManagerActionVariants({ emphasis, compact: context.variant === "compact" }),
        className,
      )}
      {...props}
      type={type}
      data-emphasis={emphasis}
    />
  );
}

/** Search, column, and bulk controls. Compose Data Table Toolbar parts inside it. */
export function ResourceManagerToolbar(props: Omit<DataTableToolbarProps, "variant">) {
  const context = useManager("ResourceManagerToolbar");
  return (
    <DataTableToolbar
      data-slot="resource-manager-toolbar"
      {...props}
      variant={toolbarVariants[context.variant]}
    />
  );
}

/** Places the record list and inspector side by side, stacking when space runs out. */
export function ResourceManagerBody({ className, ...props }: ComponentProps<"div">) {
  const context = useManager("ResourceManagerBody");
  return (
    <div
      data-slot="resource-manager-body"
      className={cn(
        "min-w-0 flex-wrap items-start",
        context.variant === "split" ? "flex" : "grid",
        context.variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

/** The record list. Arrow keys, Home, and End move between records. */
export function ResourceManagerList({
  "aria-label": label = "Records",
  className,
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
      data-slot="resource-manager-list"
      className={cn(
        "m-0 grid min-w-0 flex-[999_1_320px] list-none border bg-card shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
        compact ? "gap-0.5 rounded-xl p-1" : "gap-1 rounded-[14px] p-1.5",
        className,
      )}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) move(event);
      }}
    />
  );
}

export function ResourceManagerRecord({
  value,
  children,
  onClick,
  className,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: string }) {
  const context = useManager("ResourceManagerRecord");
  const selected = context.value === value;
  const compact = context.variant === "compact";
  return (
    <li
      className={cn(
        "min-w-0 animate-in fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint fill-mode-both motion-reduce:animate-none",
        "nth-2:[animation-delay:40ms] nth-3:[animation-delay:80ms] nth-4:[animation-delay:120ms] nth-5:[animation-delay:160ms] nth-[n+6]:[animation-delay:200ms]",
      )}
    >
      <button
        data-slot="resource-manager-record"
        className={cn(
          "flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-0.5 border-0 text-left text-inherit",
          "[transition:background-color_120ms_ease-out,box-shadow_120ms_ease-out] motion-reduce:transition-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          compact ? "min-h-8 rounded-lg px-2 py-1" : "min-h-11 rounded-[10px] px-3 py-2",
          selected
            ? "bg-accent"
            : "bg-transparent hover:shadow-[inset_0_0_0_999px_color-mix(in_oklab,var(--foreground)_4%,transparent)]",
          className,
        )}
        {...props}
        type="button"
        data-record=""
        aria-current={selected ? "true" : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) context.select(value);
        }}
      >
        {children}
      </button>
    </li>
  );
}

export function ResourceManagerRecordTitle({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="resource-manager-record-title"
      className={cn("min-w-0 flex-[1_1_160px] font-medium wrap-anywhere", className)}
      {...props}
    />
  );
}

export function ResourceManagerRecordMeta({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="resource-manager-record-meta"
      className={cn("text-[12px] text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export function ResourceManagerRecordStatus({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: ResourceManagerRecordTone }) {
  return (
    <span
      data-slot="resource-manager-record-status"
      className={cn(recordStatusVariants({ tone }), className)}
      {...props}
      data-tone={tone}
    />
  );
}

const inspectorVariants = cva(
  [
    "grid min-w-0 flex-[1_1_280px] content-start shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
    "animate-in fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint fill-mode-both motion-reduce:animate-none",
  ],
  {
    variants: {
      variant: {
        split: "gap-3 rounded-[14px] border bg-card p-4",
        stacked:
          "gap-3 rounded-[14px] border-0 bg-[color-mix(in_oklab,var(--muted)_70%,var(--card))] p-4",
        compact: "gap-2 rounded-xl border bg-card p-3",
      },
    },
  },
);

/** Details for the selected record. Labelled by its title. */
export function ResourceManagerInspector({ className, ...props }: ComponentProps<"section">) {
  const context = useManager("ResourceManagerInspector");
  return (
    <section
      aria-labelledby={`${context.id}-inspector-title`}
      data-slot="resource-manager-inspector"
      className={cn(inspectorVariants({ variant: context.variant }), className)}
      {...props}
    />
  );
}

export function ResourceManagerInspectorHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="resource-manager-inspector-header"
      className={cn("flex min-w-0 flex-wrap items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

export function ResourceManagerInspectorTitle({ className, ...props }: ComponentProps<"h3">) {
  const context = useManager("ResourceManagerInspectorTitle");
  return (
    <h3
      data-slot="resource-manager-inspector-title"
      className={cn("m-0 text-[15px]/5 font-medium tracking-[-0.01em] wrap-anywhere", className)}
      {...props}
      id={`${context.id}-inspector-title`}
    />
  );
}

/** Record facts. Compose Description List parts inside it. */
export function ResourceManagerDetails(props: Omit<DescriptionListProps, "variant">) {
  const context = useManager("ResourceManagerDetails");
  return (
    <DescriptionList
      data-slot="resource-manager-details"
      {...props}
      variant={detailsVariants[context.variant]}
    />
  );
}

/** Edit form for the selected record. Saving stays with the consumer. */
export function ResourceManagerForm({ className, ...props }: ComponentProps<"form">) {
  const context = useManager("ResourceManagerForm");
  return (
    <form
      data-slot="resource-manager-form"
      className={cn(
        "m-0 grid min-w-0",
        context.variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

/** Shown when no record matches. Compose Empty State parts inside it. */
export function ResourceManagerEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = useManager("ResourceManagerEmpty");
  return (
    <EmptyState
      data-slot="resource-manager-empty"
      {...props}
      variant={emptyVariants[context.variant]}
    />
  );
}

/** Destructive confirmation. Compose Confirmation Dialog parts inside it. */
export function ResourceManagerDelete(props: Omit<ConfirmationDialogProps, "variant">) {
  const context = useManager("ResourceManagerDelete");
  return (
    <ConfirmationDialog
      data-slot="resource-manager-delete"
      {...props}
      variant={dialogVariants[context.variant]}
    />
  );
}
