"use client";

import { cva } from "class-variance-authority";
import { Play } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/uai-utils";

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

const dataExplorerVariants = cva("grid min-w-0 content-start text-[13px]/[18px] text-foreground", {
  variants: {
    variant: { workbench: "gap-4", stacked: "gap-4", compact: "gap-2.5" },
  },
});

const dataExplorerActionVariants = cva(
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

/** Query workspace: saved views, a query editor, and a results table. */
export function DataExplorer({
  variant = "workbench",
  className,
  children,
  ...props
}: DataExplorerProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="data-explorer"
        data-variant={variant}
        className={cn(dataExplorerVariants({ variant }), className)}
        {...props}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function DataExplorerHeader({ className, ...props }: ComponentProps<"div">) {
  useExplorer("DataExplorerHeader");
  return (
    <div
      data-slot="data-explorer-header"
      className={cn("flex min-w-0 flex-wrap items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export function DataExplorerHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="data-explorer-heading"
      className={cn("grid min-w-0 flex-[1_1_240px] gap-1", className)}
      {...props}
    />
  );
}

export function DataExplorerTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useExplorer("DataExplorerTitle");
  const compact = context.variant === "compact";
  return (
    <h2
      data-slot="data-explorer-title"
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

export function DataExplorerDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="data-explorer-description"
      className={cn("m-0 text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export function DataExplorerActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="data-explorer-actions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

export function DataExplorerAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useExplorer("DataExplorerAction");
  return (
    <Button
      data-slot="data-explorer-action"
      variant={emphasis === "primary" ? "default" : "secondary"}
      data-emphasis={emphasis}
      type={type}
      className={cn(
        dataExplorerActionVariants({ emphasis, compact: context.variant === "compact" }),
        className,
      )}
      {...props}
    />
  );
}

/** Saved views. Compose Page Tabs parts inside it. */
export function DataExplorerViews(props: Omit<PageTabsProps, "variant">) {
  const context = useExplorer("DataExplorerViews");
  return <PageTabs {...props} variant={tabVariants[context.variant]} />;
}

/** Places the query beside the results in Workbench and above them otherwise. */
export function DataExplorerBody({ className, ...props }: ComponentProps<"div">) {
  const context = useExplorer("DataExplorerBody");
  return (
    <div
      data-slot="data-explorer-body"
      className={cn(
        "min-w-0 flex-wrap items-start",
        context.variant === "workbench" ? "flex" : "grid",
        context.variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

/** Query form. Execution stays with the consumer through `onSubmit`. */
export function DataExplorerQuery({
  "aria-label": label = "Query",
  className,
  ...props
}: ComponentProps<"form">) {
  const context = useExplorer("DataExplorerQuery");
  const compact = context.variant === "compact";
  return (
    <form
      aria-label={label}
      data-slot="data-explorer-query"
      className={cn(
        "m-0 grid min-w-0 flex-[1_1_260px] content-start border bg-card shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
        compact ? "gap-1.5 rounded-xl p-2.5" : "gap-2.5 rounded-[14px] p-3",
        className,
      )}
      {...props}
    />
  );
}

export function DataExplorerQueryLabel({ className, children, ...props }: ComponentProps<"label">) {
  const context = useExplorer("DataExplorerQueryLabel");
  return (
    <Label
      data-slot="data-explorer-query-label"
      className={cn(
        "block px-0.5 text-[11.5px]/4 font-medium text-subtle-foreground select-auto",
        className,
      )}
      {...props}
      htmlFor={`${context.id}-query`}
    >
      {children}
    </Label>
  );
}

export function DataExplorerQueryInput({
  className,
  ...props
}: Omit<ComponentProps<"textarea">, "id">) {
  const context = useExplorer("DataExplorerQueryInput");
  const compact = context.variant === "compact";
  return (
    <Textarea
      spellCheck={false}
      rows={compact ? 3 : 5}
      data-slot="data-explorer-query-input"
      className={cn(
        "box-border block field-sizing-fixed min-h-0 w-full min-w-0 resize-y border-0 font-[family-name:var(--font-mono,ui-monospace,monospace)] text-inherit shadow-none transition-shadow duration-120 ease-out placeholder:text-subtle-foreground focus:shadow-[0_0_0_1px_var(--border-strong),0_0_0_4px_color-mix(in_oklab,var(--primary)_22%,transparent)] focus:outline-none focus-visible:ring-0 motion-reduce:transition-none",
        compact
          ? "rounded-lg px-2.5 py-2 text-[11.5px]/[17px] md:text-[11.5px]/[17px]"
          : "rounded-[10px] px-3 py-2.5 text-[12px]/[19px] md:text-[12px]/[19px]",
        context.variant === "workbench"
          ? "bg-background dark:bg-background"
          : "bg-[color-mix(in_oklab,var(--background)_60%,var(--card))] dark:bg-[color-mix(in_oklab,var(--background)_60%,var(--card))]",
        className,
      )}
      {...props}
      id={`${context.id}-query`}
    />
  );
}

export function DataExplorerRun({
  children = "Run query",
  className,
  ...props
}: Omit<ComponentProps<"button">, "type">) {
  const context = useExplorer("DataExplorerRun");
  return (
    <Button
      data-slot="data-explorer-run"
      data-emphasis="primary"
      className={cn(
        dataExplorerActionVariants({ emphasis: "primary", compact: context.variant === "compact" }),
        "justify-self-start",
        className,
      )}
      {...props}
      type="submit"
    >
      <Play strokeWidth={2} fill="currentColor" aria-hidden="true" className="size-3" />
      {children}
    </Button>
  );
}

export function DataExplorerResults({
  "aria-label": label = "Results",
  className,
  ...props
}: ComponentProps<"section">) {
  const context = useExplorer("DataExplorerResults");
  return (
    <section
      aria-label={label}
      data-slot="data-explorer-results"
      className={cn(
        "grid min-w-0 flex-[999_1_380px] content-start",
        context.variant === "compact" ? "gap-1.5" : "gap-2.5",
        className,
      )}
      {...props}
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
  className,
  ...props
}: ComponentProps<"table">) {
  const context = useExplorer("DataExplorerTable");
  const compact = context.variant === "compact";
  return (
    <section
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be reachable by keyboard.
      tabIndex={0}
      data-slot="data-explorer-table-scroll"
      className={cn(
        "min-w-0 overflow-x-auto border bg-card shadow-[0_1px_2px_oklch(0_0_0/0.04)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring *:data-[slot=table-container]:overflow-visible",
        compact ? "rounded-xl px-1 py-0.5" : "rounded-[14px] px-1.5 py-1",
      )}
    >
      <Table
        data-slot="data-explorer-table"
        className={cn(
          "w-full border-collapse",
          compact ? "text-[12px]/[18px]" : "text-[13px]/[18px]",
          className,
        )}
        {...props}
      />
    </section>
  );
}

export function DataExplorerTableHead({ className, ...props }: ComponentProps<"thead">) {
  return (
    <TableHeader
      data-slot="data-explorer-table-head"
      className={cn("bg-transparent [&_tr]:border-b-0", className)}
      {...props}
    />
  );
}

export function DataExplorerTableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <TableBody
      data-slot="data-explorer-table-body"
      className={cn("[&_tr:last-child]:border-t", className)}
      {...props}
    />
  );
}

export function DataExplorerTableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <TableRow
      data-slot="data-explorer-table-row"
      className={cn(
        "border-t border-b-0 border-border/70 hover:bg-transparent [transition:background-color_120ms_ease-out] motion-reduce:transition-none [tbody>&]:animate-[enter_240ms_var(--ease-out-quint)_both] [tbody>&]:fade-in-0 [tbody>&]:slide-in-from-bottom-1 [tbody>&]:hover:bg-foreground/4 [tbody>&]:nth-2:[animation-delay:40ms] [tbody>&]:nth-3:[animation-delay:80ms] [tbody>&]:nth-4:[animation-delay:120ms] [tbody>&]:nth-5:[animation-delay:160ms] [tbody>&]:nth-[n+6]:[animation-delay:200ms] [tbody>&]:motion-reduce:animate-none [tbody>&>td:first-child]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export function DataExplorerHeaderCell({
  align = "start",
  scope = "col",
  className,
  ...props
}: Omit<ComponentProps<"th">, "align"> & { align?: "start" | "end" }) {
  const context = useExplorer("DataExplorerHeaderCell");
  const compact = context.variant === "compact";
  return (
    <TableHead
      scope={scope}
      data-slot="data-explorer-header-cell"
      className={cn(
        "font-medium whitespace-nowrap text-subtle-foreground",
        compact ? "h-7.5 px-2 text-[11.5px]" : "h-8.5 px-2.5 text-[12px]",
        align === "end" ? "text-right" : "text-left",
        className,
      )}
      {...props}
    />
  );
}

export function DataExplorerCell({
  align = "start",
  className,
  ...props
}: Omit<ComponentProps<"td">, "align"> & { align?: "start" | "end" }) {
  const context = useExplorer("DataExplorerCell");
  return (
    <TableCell
      data-slot="data-explorer-cell"
      className={cn(
        "py-0 whitespace-nowrap",
        context.variant === "compact" ? "h-8 px-2" : "h-9.5 px-2.5",
        align === "end" ? "text-right tabular-nums" : "text-left",
        className,
      )}
      {...props}
    />
  );
}

/** Row count, timing, or errors, announced politely. */
export function DataExplorerStatus({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      role="status"
      data-slot="data-explorer-status"
      className={cn("m-0 px-0.5 text-[12px] text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}

/** Shown when a query returns no rows. Compose Empty State parts inside it. */
export function DataExplorerEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = useExplorer("DataExplorerEmpty");
  return <EmptyState {...props} variant={emptyVariants[context.variant]} />;
}
