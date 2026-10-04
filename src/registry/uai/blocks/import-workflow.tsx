"use client";

import { cva } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import {
  FileUpload,
  type FileUploadProps,
  type FileUploadVariant,
} from "@/components/ui/uai/file-upload";
import {
  ProgressSummary,
  type ProgressSummaryProps,
  type ProgressSummaryVariant,
} from "@/components/ui/uai/progress-summary";
import {
  StatusBanner,
  type StatusBannerProps,
  type StatusBannerVariant,
} from "@/components/ui/uai/status-banner";
import {
  StepIndicator,
  type StepIndicatorStatus,
  StepIndicatorStep,
  type StepIndicatorVariant,
} from "@/components/ui/uai/step-indicator";
import { cn } from "@/lib/uai-utils";

export const IMPORT_WORKFLOW_VARIANTS = ["wizard", "sidebar", "compact"] as const;
export type ImportWorkflowVariant = (typeof IMPORT_WORKFLOW_VARIANTS)[number];
export type ImportWorkflowProps = Omit<ComponentProps<"section">, "defaultValue"> & {
  variant?: ImportWorkflowVariant;
  /** The current step. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type WorkflowContext = {
  id: string;
  variant: ImportWorkflowVariant;
  value: string;
  select: (value: string) => void;
};
const Context = createContext<WorkflowContext | null>(null);
function useWorkflow(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ImportWorkflow`);
  return context;
}
const PanelContext = createContext<string | null>(null);
const MappingRowContext = createContext<string | null>(null);
function useMappingRow(part: string) {
  const id = useContext(MappingRowContext);
  if (!id) throw new Error(`${part} must be used within ImportWorkflowMappingRow`);
  return id;
}

const stepVariants: Record<ImportWorkflowVariant, StepIndicatorVariant> = {
  wizard: "horizontal",
  sidebar: "vertical",
  compact: "compact",
};
const uploadVariants: Record<ImportWorkflowVariant, FileUploadVariant> = {
  wizard: "dropzone",
  sidebar: "dropzone",
  compact: "compact",
};
const bannerVariants: Record<ImportWorkflowVariant, StatusBannerVariant> = {
  wizard: "card",
  sidebar: "tinted",
  compact: "tinted",
};
const progressVariants: Record<ImportWorkflowVariant, ProgressSummaryVariant> = {
  wizard: "card",
  sidebar: "card",
  compact: "compact",
};

const importWorkflowVariants = cva(
  "grid min-w-0 content-start border bg-card text-[13px]/[18px] text-card-foreground shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
  {
    variants: {
      variant: {
        wizard: "gap-4 rounded-[14px] p-5",
        sidebar: "gap-4 rounded-[14px] p-5",
        compact: "gap-2.5 rounded-xl p-3.5",
      },
    },
  },
);

const focusRing =
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const importWorkflowActionVariants = cva(
  "cursor-pointer gap-1.5 rounded-full border-0 py-0 transition-[filter,box-shadow,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
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

/** Multi-step import: file selection, column mapping, validation, preview, and completion. */
export function ImportWorkflow({
  variant = "wizard",
  value,
  defaultValue = "",
  onValueChange,
  className,
  children,
  ...props
}: ImportWorkflowProps) {
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
        data-slot="import-workflow"
        data-variant={variant}
        className={cn(importWorkflowVariants({ variant }), className)}
        {...props}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function ImportWorkflowHeader({ className, ...props }: ComponentProps<"div">) {
  useWorkflow("ImportWorkflowHeader");
  return (
    <div
      data-slot="import-workflow-header"
      className={cn("flex min-w-0 flex-wrap items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export function ImportWorkflowHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="import-workflow-heading"
      className={cn("grid min-w-0 flex-[1_1_240px] gap-1", className)}
      {...props}
    />
  );
}

export function ImportWorkflowTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useWorkflow("ImportWorkflowTitle");
  return (
    <h2
      data-slot="import-workflow-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.015em] wrap-anywhere",
        context.variant === "compact" ? "text-[15px]/5" : "text-lg/6",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function ImportWorkflowDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="import-workflow-description"
      className={cn("m-0 text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Places the steps above the panel, or beside it in Sidebar. */
export function ImportWorkflowBody({ className, ...props }: ComponentProps<"div">) {
  const context = useWorkflow("ImportWorkflowBody");
  return (
    <div
      data-slot="import-workflow-body"
      className={cn(
        "min-w-0 flex-wrap items-start",
        context.variant === "sidebar" ? "flex" : "grid",
        context.variant === "compact" ? "gap-2.5" : "gap-4",
        className,
      )}
      {...props}
    />
  );
}

export function ImportWorkflowSteps({
  "aria-label": label = "Import progress",
  className,
  ...props
}: ComponentProps<"ol">) {
  const context = useWorkflow("ImportWorkflowSteps");
  return (
    <StepIndicator
      aria-label={label}
      {...props}
      variant={stepVariants[context.variant]}
      className={cn(context.variant === "sidebar" && "flex-[1_1_180px]", className)}
    />
  );
}

/** A step. It is current when its value matches the workflow; otherwise it uses `status`. */
export function ImportWorkflowStep({
  value,
  status = "upcoming",
  ...props
}: Omit<ComponentProps<typeof StepIndicatorStep>, "value" | "status"> & {
  value: string;
  status?: Exclude<StepIndicatorStatus, "current">;
}) {
  const context = useWorkflow("ImportWorkflowStep");
  return <StepIndicatorStep {...props} status={context.value === value ? "current" : status} />;
}

/** Content for one step. Only the current step renders. */
export function ImportWorkflowPanel({
  value,
  className,
  ...props
}: Omit<ComponentProps<"section">, "value"> & { value: string }) {
  const context = useWorkflow("ImportWorkflowPanel");
  const titleId = useId();
  if (context.value !== value) return null;
  return (
    <PanelContext.Provider value={titleId}>
      <section
        aria-labelledby={titleId}
        data-slot="import-workflow-panel"
        className={cn(
          "grid min-w-0 flex-[999_1_360px] animate-in content-start fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint fill-mode-both motion-reduce:animate-none",
          context.variant === "compact" ? "gap-2.5" : "gap-3.5",
          className,
        )}
        {...props}
        data-step={value}
      />
    </PanelContext.Provider>
  );
}

export function ImportWorkflowPanelTitle({ className, ...props }: ComponentProps<"h3">) {
  const titleId = useContext(PanelContext);
  if (!titleId) throw new Error("ImportWorkflowPanelTitle must be used within ImportWorkflowPanel");
  return (
    <h3
      data-slot="import-workflow-panel-title"
      className={cn("m-0 text-sm/5 font-medium tracking-[-0.005em]", className)}
      {...props}
      id={titleId}
    />
  );
}

/** File selection. Compose File Upload parts inside it. */
export function ImportWorkflowUpload(props: Omit<FileUploadProps, "variant">) {
  const context = useWorkflow("ImportWorkflowUpload");
  return <FileUpload {...props} variant={uploadVariants[context.variant]} />;
}

/** Column mapping: each row pairs a source column with a destination field. */
export function ImportWorkflowMapping({ className, ...props }: ComponentProps<"div">) {
  const context = useWorkflow("ImportWorkflowMapping");
  return (
    <div
      data-slot="import-workflow-mapping"
      className={cn(
        "grid min-w-0 gap-0.5 bg-[color-mix(in_oklab,var(--muted)_55%,var(--card))]",
        context.variant === "compact" ? "rounded-xl p-0.75" : "rounded-[14px] p-1",
        className,
      )}
      {...props}
    />
  );
}

export function ImportWorkflowMappingRow({ className, ...props }: ComponentProps<"div">) {
  const context = useWorkflow("ImportWorkflowMappingRow");
  const id = useId();
  return (
    <MappingRowContext.Provider value={id}>
      <div
        data-slot="import-workflow-mapping-row"
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-2.5 transition-[background-color] duration-120 ease-out hover:bg-foreground/4 motion-reduce:transition-none",
          context.variant === "compact" ? "rounded-lg px-2 py-[5px]" : "rounded-[10px] px-2.5 py-2",
          className,
        )}
        {...props}
      />
    </MappingRowContext.Provider>
  );
}

export function ImportWorkflowMappingSource({
  className,
  children,
  ...props
}: ComponentProps<"label">) {
  const id = useMappingRow("ImportWorkflowMappingSource");
  return (
    <>
      <Label
        data-slot="import-workflow-mapping-source"
        className={cn(
          "grid min-w-0 flex-[1_1_160px] gap-px text-[length:inherit] leading-[inherit] font-medium wrap-anywhere select-auto",
          className,
        )}
        {...props}
        htmlFor={id}
      >
        {children}
      </Label>
      <ArrowRight
        size={14}
        aria-hidden="true"
        strokeWidth={1.75}
        className="shrink-0 text-subtle-foreground size-3.5"
      />
    </>
  );
}

/** Secondary text inside a source label, such as a sample value. */
export function ImportWorkflowMappingSample({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="import-workflow-mapping-sample"
      className={cn("font-mono text-[11.5px]/4 font-normal text-subtle-foreground", className)}
      {...props}
    />
  );
}

export type ImportWorkflowMappingTargetProps = Omit<
  ComponentProps<typeof SelectTrigger>,
  "id" | "size" | "value" | "defaultValue" | "onChange" | "name"
> & {
  /** Target field. An empty string means the column is skipped. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  /** Shown while no target is chosen. */
  placeholder?: string;
};

// Radix Select forbids empty item values, so the skip option ("") maps to this private value.
const SKIP_VALUE = "__uai-import-skip__";

/** A select of target fields for one column. Compose ImportWorkflowMappingOption items inside. */
export function ImportWorkflowMappingTarget({
  value,
  defaultValue,
  onValueChange,
  name,
  placeholder,
  className,
  children,
  ...props
}: ImportWorkflowMappingTargetProps) {
  const id = useMappingRow("ImportWorkflowMappingTarget");
  const context = useWorkflow("ImportWorkflowMappingTarget");
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  return (
    <Select
      name={name}
      value={current === "" ? SKIP_VALUE : (current ?? "")}
      onValueChange={(next) => {
        const target = next === SKIP_VALUE ? "" : next;
        if (value === undefined) setInternal(target);
        onValueChange?.(target);
      }}
    >
      <SelectTrigger
        data-slot="import-workflow-mapping-target"
        data-skipped={current === "" ? "" : undefined}
        className={cn(
          "w-auto min-w-0 flex-[1_1_160px] cursor-pointer gap-1.5 rounded-lg border-0 bg-card py-0 pr-1.5 pl-2 text-inherit shadow-none inset-ring-1 inset-ring-border transition-shadow duration-120 ease-out hover:inset-ring-border-strong focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid motion-reduce:transition-none data-[placeholder]:text-subtle-foreground data-skipped:text-subtle-foreground dark:bg-card dark:hover:bg-card [&_svg]:size-3.5",
          context.variant === "compact"
            ? "text-[12px]/[18px] data-[size=default]:h-[26px]"
            : "text-[13px]/[18px] data-[size=default]:h-[30px]",
          className,
        )}
        {...props}
        id={id}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="rounded-[14px] border-0 bg-popover text-popover-foreground shadow-[0_0_0_1px_var(--border-strong),0_12px_28px_-10px_oklch(0_0_0/0.32),0_2px_6px_-2px_oklch(0_0_0/0.12)] duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:zoom-out-96 data-[state=open]:zoom-in-96 data-[state=open]:[--tw-enter-translate-x:0]! data-[state=open]:[--tw-enter-translate-y:0]! motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none"
      >
        {children}
      </SelectContent>
    </Select>
  );
}

export type ImportWorkflowMappingOptionProps = Omit<ComponentProps<typeof SelectItem>, "value"> & {
  /** Target field. Use an empty string for the "skip this column" option. */
  value: string;
};

/** One target field inside ImportWorkflowMappingTarget. */
export function ImportWorkflowMappingOption({
  value,
  className,
  ...props
}: ImportWorkflowMappingOptionProps) {
  const context = useWorkflow("ImportWorkflowMappingOption");
  return (
    <SelectItem
      data-slot="import-workflow-mapping-option"
      className={cn(
        "cursor-pointer rounded-[10px] text-foreground focus:bg-accent focus:text-foreground",
        value === "" && "text-subtle-foreground",
        context.variant === "compact"
          ? "min-h-7 py-1 pr-7 pl-2 text-[12px]/[18px]"
          : "min-h-8 py-1.5 pr-8 pl-2.5 text-[13px]/[18px]",
        className,
      )}
      {...props}
      value={value === "" ? SKIP_VALUE : value}
    />
  );
}

/** Validation results. Compose Status Banner parts inside it. */
export function ImportWorkflowIssues(props: Omit<StatusBannerProps, "variant">) {
  const context = useWorkflow("ImportWorkflowIssues");
  return <StatusBanner {...props} variant={bannerVariants[context.variant]} />;
}

/** Scrollable preview of parsed rows. The wrapper is focusable so keyboard users can scroll it. */
export function ImportWorkflowTable({
  "aria-label": label = "Import preview",
  className,
  ...props
}: ComponentProps<"table">) {
  const context = useWorkflow("ImportWorkflowTable");
  return (
    <section
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be reachable by keyboard.
      tabIndex={0}
      className={cn(
        "min-w-0 overflow-x-auto border px-1.5 py-0.5 [&>[data-slot=table-container]]:overflow-visible",
        context.variant === "compact" ? "rounded-xl" : "rounded-[14px]",
        focusRing,
      )}
    >
      <Table
        data-slot="import-workflow-table"
        className={cn(
          "w-full border-collapse",
          context.variant === "compact" ? "text-[12px]/[18px]" : "text-[12.5px]/[18px]",
          className,
        )}
        {...props}
      />
    </section>
  );
}

export function ImportWorkflowTableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <TableRow
      data-slot="import-workflow-table-row"
      className={cn(
        "border-t border-b-0 border-border/70 hover:bg-transparent [tbody>&>td:first-child]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export function ImportWorkflowHeaderCell({
  scope = "col",
  className,
  ...props
}: ComponentProps<"th">) {
  return (
    <TableHead
      scope={scope}
      data-slot="import-workflow-header-cell"
      className={cn(
        "h-8 px-2.5 text-left text-[12px] font-medium whitespace-nowrap text-subtle-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** A preview cell. `tone="error"` marks a value that failed validation; include the reason as text. */
export function ImportWorkflowCell({
  tone = "default",
  className,
  ...props
}: ComponentProps<"td"> & { tone?: "default" | "error" }) {
  return (
    <TableCell
      data-slot="import-workflow-cell"
      className={cn(
        "h-9 px-2.5 py-0 whitespace-nowrap",
        tone === "error" &&
          "bg-destructive/10 text-[color-mix(in_oklab,var(--destructive)_80%,var(--foreground))]",
        className,
      )}
      {...props}
      data-tone={tone}
    />
  );
}

/** Import progress and completion. Compose Progress Summary parts inside it. */
export function ImportWorkflowProgress(props: Omit<ProgressSummaryProps, "variant">) {
  const context = useWorkflow("ImportWorkflowProgress");
  return <ProgressSummary {...props} variant={progressVariants[context.variant]} />;
}

/** Back and continue controls. */
export function ImportWorkflowFooter({ className, ...props }: ComponentProps<"div">) {
  const context = useWorkflow("ImportWorkflowFooter");
  return (
    <div
      data-slot="import-workflow-footer"
      className={cn(
        "flex flex-wrap items-center justify-end gap-1.5",
        context.variant === "compact" ? "pt-0.5" : "pt-1",
        className,
      )}
      {...props}
    />
  );
}

export function ImportWorkflowAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useWorkflow("ImportWorkflowAction");
  return (
    <Button
      data-slot="import-workflow-action"
      variant={emphasis === "primary" ? "default" : "secondary"}
      data-emphasis={emphasis}
      className={cn(
        importWorkflowActionVariants({ emphasis, compact: context.variant === "compact" }),
        focusRing,
        className,
      )}
      {...props}
      type={type}
    />
  );
}
