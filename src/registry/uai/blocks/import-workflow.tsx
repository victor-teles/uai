"use client";

import { ArrowRight } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useId,
  useState,
} from "react";
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

const workflowCss = `
[data-uai-import-workflow-action]{transition:filter 120ms ease-out,box-shadow 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-import-workflow-action]:hover:not(:disabled){box-shadow:inset 0 0 0 999px color-mix(in oklab,var(--uai-text) 9%,transparent)}
[data-uai-import-workflow-action][data-uai-import-workflow-action="primary"]:hover:not(:disabled){box-shadow:none;filter:brightness(1.08)}
[data-uai-import-workflow-action]:active:not(:disabled){transform:scale(0.97)}
[data-uai-import-workflow-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
[data-uai-import-workflow-panel]{animation:uai-import-workflow-in 240ms cubic-bezier(0.23,1,0.32,1) both}
[data-uai-import-workflow-mapping-row]{transition:background-color 120ms ease-out}
[data-uai-import-workflow-mapping-row]:hover{background:color-mix(in oklab,var(--uai-text) 4%,transparent)}
[data-uai-import-workflow-select]{transition:box-shadow 120ms ease-out}
[data-uai-import-workflow-select]:hover{box-shadow:inset 0 0 0 1px var(--uai-border-strong)}
[data-uai-import-workflow-select]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:1px}
[data-uai-import-workflow-scroll]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
tbody>[data-uai-import-workflow-row]>td:first-child{font-weight:500}
@keyframes uai-import-workflow-in{from{opacity:0;transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){[data-uai-import-workflow-action]{transition:none}[data-uai-import-workflow-action]:active:not(:disabled){transform:none}[data-uai-import-workflow-panel]{animation:none}[data-uai-import-workflow-mapping-row],[data-uai-import-workflow-select]{transition:none}}
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

/** Multi-step import: file selection, column mapping, validation, preview, and completion. */
export function ImportWorkflow({
  variant = "wizard",
  value,
  defaultValue = "",
  onValueChange,
  style,
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
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          alignContent: "start",
          gap: variant === "compact" ? 10 : 16,
          minWidth: 0,
          padding: variant === "compact" ? 14 : 20,
          border: "1px solid var(--uai-border)",
          borderRadius: variant === "compact" ? 12 : 14,
          background: "var(--uai-surface)",
          boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{workflowCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function ImportWorkflowHeader({ style, ...props }: ComponentProps<"div">) {
  useWorkflow("ImportWorkflowHeader");
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

export function ImportWorkflowHeading({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 4, flex: "1 1 240px", minWidth: 0, ...style }} />
  );
}

export function ImportWorkflowTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useWorkflow("ImportWorkflowTitle");
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

export function ImportWorkflowDescription({ style, ...props }: ComponentProps<"p">) {
  return <p {...props} style={{ margin: 0, color: "var(--uai-muted)", ...style }} />;
}

/** Places the steps above the panel, or beside it in Sidebar. */
export function ImportWorkflowBody({ style, ...props }: ComponentProps<"div">) {
  const context = useWorkflow("ImportWorkflowBody");
  return (
    <div
      {...props}
      style={{
        display: context.variant === "sidebar" ? "flex" : "grid",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: context.variant === "compact" ? 10 : 16,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function ImportWorkflowSteps({
  "aria-label": label = "Import progress",
  style,
  ...props
}: ComponentProps<"ol">) {
  const context = useWorkflow("ImportWorkflowSteps");
  return (
    <StepIndicator
      aria-label={label}
      {...props}
      variant={stepVariants[context.variant]}
      style={{ flex: context.variant === "sidebar" ? "1 1 180px" : undefined, ...style }}
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
  style,
  ...props
}: Omit<ComponentProps<"section">, "value"> & { value: string }) {
  const context = useWorkflow("ImportWorkflowPanel");
  const titleId = useId();
  if (context.value !== value) return null;
  return (
    <PanelContext.Provider value={titleId}>
      <section
        aria-labelledby={titleId}
        {...props}
        data-step={value}
        data-uai-import-workflow-panel=""
        style={{
          display: "grid",
          alignContent: "start",
          gap: context.variant === "compact" ? 10 : 14,
          flex: "999 1 360px",
          minWidth: 0,
          ...style,
        }}
      />
    </PanelContext.Provider>
  );
}

export function ImportWorkflowPanelTitle({ style, ...props }: ComponentProps<"h3">) {
  const titleId = useContext(PanelContext);
  if (!titleId) throw new Error("ImportWorkflowPanelTitle must be used within ImportWorkflowPanel");
  return (
    <h3
      {...props}
      id={titleId}
      style={{
        margin: 0,
        fontSize: 14,
        lineHeight: "20px",
        fontWeight: 500,
        letterSpacing: "-0.005em",
        ...style,
      }}
    />
  );
}

/** File selection. Compose File Upload parts inside it. */
export function ImportWorkflowUpload(props: Omit<FileUploadProps, "variant">) {
  const context = useWorkflow("ImportWorkflowUpload");
  return <FileUpload {...props} variant={uploadVariants[context.variant]} />;
}

/** Column mapping: each row pairs a source column with a destination field. */
export function ImportWorkflowMapping({ style, ...props }: ComponentProps<"div">) {
  const context = useWorkflow("ImportWorkflowMapping");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: 2,
        minWidth: 0,
        padding: context.variant === "compact" ? 3 : 4,
        borderRadius: context.variant === "compact" ? 12 : 14,
        background: "color-mix(in oklab, var(--uai-surface-raised) 55%, var(--uai-surface))",
        ...style,
      }}
    />
  );
}

export function ImportWorkflowMappingRow({ style, ...props }: ComponentProps<"div">) {
  const context = useWorkflow("ImportWorkflowMappingRow");
  const id = useId();
  return (
    <MappingRowContext.Provider value={id}>
      <div
        {...props}
        data-uai-import-workflow-mapping-row=""
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
          padding: context.variant === "compact" ? "5px 8px" : "8px 10px",
          borderRadius: context.variant === "compact" ? 8 : 10,
          ...style,
        }}
      />
    </MappingRowContext.Provider>
  );
}

export function ImportWorkflowMappingSource({
  style,
  children,
  ...props
}: ComponentProps<"label">) {
  const id = useMappingRow("ImportWorkflowMappingSource");
  return (
    <>
      <label
        {...props}
        htmlFor={id}
        style={{
          display: "grid",
          gap: 1,
          flex: "1 1 160px",
          minWidth: 0,
          fontWeight: 500,
          overflowWrap: "anywhere",
          ...style,
        }}
      >
        {children}
      </label>
      <ArrowRight
        size={14}
        aria-hidden="true"
        strokeWidth={1.75}
        style={{ flexShrink: 0, color: "var(--uai-subtle)" }}
      />
    </>
  );
}

/** Secondary text inside a source label, such as a sample value. */
export function ImportWorkflowMappingSample({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        fontSize: 11.5,
        fontWeight: 400,
        lineHeight: "16px",
        ...style,
      }}
    />
  );
}

export function ImportWorkflowMappingTarget({
  style,
  ...props
}: Omit<ComponentProps<"select">, "id">) {
  const id = useMappingRow("ImportWorkflowMappingTarget");
  const context = useWorkflow("ImportWorkflowMappingTarget");
  return (
    <select
      {...props}
      id={id}
      data-uai-import-workflow-select=""
      style={{
        flex: "1 1 160px",
        minWidth: 0,
        height: context.variant === "compact" ? 26 : 30,
        padding: "0 8px",
        border: 0,
        borderRadius: 8,
        background: "var(--uai-surface)",
        boxShadow: "inset 0 0 0 1px var(--uai-border)",
        color: props.value === "" ? "var(--uai-subtle)" : "inherit",
        fontSize: context.variant === "compact" ? 12 : 13,
        cursor: "pointer",
        ...style,
      }}
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
  style,
  ...props
}: ComponentProps<"table">) {
  const context = useWorkflow("ImportWorkflowTable");
  return (
    <section
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be reachable by keyboard.
      tabIndex={0}
      data-uai-import-workflow-scroll=""
      style={{
        minWidth: 0,
        overflowX: "auto",
        padding: "2px 6px",
        border: "1px solid var(--uai-border)",
        borderRadius: context.variant === "compact" ? 12 : 14,
      }}
    >
      <table
        {...props}
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: context.variant === "compact" ? 12 : 12.5,
          lineHeight: "18px",
          ...style,
        }}
      />
    </section>
  );
}

export function ImportWorkflowTableRow({ style, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      {...props}
      data-uai-import-workflow-row=""
      style={{
        borderTop: "1px solid color-mix(in oklab, var(--uai-border) 70%, transparent)",
        ...style,
      }}
    />
  );
}

export function ImportWorkflowHeaderCell({ scope = "col", style, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope={scope}
      {...props}
      style={{
        height: 32,
        padding: "0 10px",
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontWeight: 500,
        textAlign: "left",
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

/** A preview cell. `tone="error"` marks a value that failed validation; include the reason as text. */
export function ImportWorkflowCell({
  tone = "default",
  style,
  ...props
}: ComponentProps<"td"> & { tone?: "default" | "error" }) {
  const error = tone === "error";
  return (
    <td
      {...props}
      data-tone={tone}
      style={{
        height: 36,
        padding: "0 10px",
        background: error ? "color-mix(in oklab, var(--uai-danger) 10%, transparent)" : undefined,
        color: error ? "color-mix(in oklab, var(--uai-danger) 80%, var(--uai-text))" : undefined,
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

/** Import progress and completion. Compose Progress Summary parts inside it. */
export function ImportWorkflowProgress(props: Omit<ProgressSummaryProps, "variant">) {
  const context = useWorkflow("ImportWorkflowProgress");
  return <ProgressSummary {...props} variant={progressVariants[context.variant]} />;
}

/** Back and continue controls. */
export function ImportWorkflowFooter({ style, ...props }: ComponentProps<"div">) {
  const context = useWorkflow("ImportWorkflowFooter");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 6,
        paddingTop: context.variant === "compact" ? 2 : 4,
        ...style,
      }}
    />
  );
}

export function ImportWorkflowAction({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = useWorkflow("ImportWorkflowAction");
  return (
    <button
      {...props}
      type={type}
      data-uai-import-workflow-action={emphasis}
      style={{
        ...actionStyle(context.variant === "compact", emphasis === "primary", props.disabled),
        ...style,
      }}
    />
  );
}
