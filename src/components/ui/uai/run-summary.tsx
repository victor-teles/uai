"use client";

import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  type LucideIcon,
  Minus,
  PencilLine,
  Plus,
  TriangleAlert,
} from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useId,
} from "react";

export const RUN_SUMMARY_VARIANTS = ["card", "plain", "compact"] as const;
export const RUN_SUMMARY_OUTCOMES = ["success", "partial", "failed"] as const;
export type RunSummaryVariant = (typeof RUN_SUMMARY_VARIANTS)[number];
export type RunSummaryOutcome = (typeof RUN_SUMMARY_OUTCOMES)[number];
export type RunSummaryProps = ComponentProps<"section"> & {
  variant?: RunSummaryVariant;
  outcome?: RunSummaryOutcome;
};

type RunSummaryContextValue = {
  id: string;
  variant: RunSummaryVariant;
  outcome: RunSummaryOutcome;
};

const RunSummaryContext = createContext<RunSummaryContextValue | null>(null);

function useRunSummary(part: string) {
  const context = useContext(RunSummaryContext);
  if (!context) throw new Error(`${part} must be used within RunSummary`);
  return context;
}

const dangerText = "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))";
const outcomeDetails: Record<
  RunSummaryOutcome,
  { label: string; icon: LucideIcon; color: string }
> = {
  success: { label: "Completed", icon: CircleCheck, color: "var(--uai-success)" },
  partial: { label: "Completed with warnings", icon: TriangleAlert, color: "var(--uai-warning)" },
  failed: { label: "Failed", icon: CircleAlert, color: dangerText },
};

const outcomeTint: Record<RunSummaryOutcome, string> = {
  success: "color-mix(in oklab, var(--uai-success) 14%, transparent)",
  partial: "color-mix(in oklab, var(--uai-warning) 14%, transparent)",
  failed: "color-mix(in oklab, var(--uai-danger) 14%, transparent)",
};

const runSummaryCss = `
@keyframes uai-run-summary-in{from{opacity:0;transform:translateY(4px)}}
[data-uai-run-summary]>*{animation:uai-run-summary-in 240ms cubic-bezier(0.23,1,0.32,1) backwards}
[data-uai-run-summary]>:nth-child(2){animation-delay:40ms}
[data-uai-run-summary]>:nth-child(3){animation-delay:80ms}
[data-uai-run-summary]>:nth-child(4){animation-delay:120ms}
[data-uai-run-summary]>:nth-child(5){animation-delay:160ms}
[data-uai-run-summary]>:nth-child(n+6){animation-delay:200ms}
[data-uai-run-summary-artifact]{transition:background-color 120ms ease-out}
[data-uai-run-summary-artifact]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 50%,transparent)}
[data-uai-run-summary-action]{transition:background-color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-run-summary-action="secondary"]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))!important}
[data-uai-run-summary-action="primary"]:hover{filter:brightness(1.08)}
[data-uai-run-summary-action]:active{transform:scale(0.97)}
[data-uai-run-summary-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@media (prefers-reduced-motion:reduce){[data-uai-run-summary]>*{animation:none}[data-uai-run-summary-artifact],[data-uai-run-summary-action]{transition:none}[data-uai-run-summary-action]:active{transform:none}}
`;

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function RunSummary({
  variant = "card",
  outcome = "success",
  children,
  style,
  ...props
}: RunSummaryProps) {
  const id = useId();
  const chrome = variant !== "plain";
  return (
    <RunSummaryContext.Provider value={{ id, variant, outcome }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-outcome={outcome}
        data-uai-run-summary=""
        style={{
          display: "grid",
          gap: variant === "compact" ? 12 : 18,
          minWidth: 0,
          padding: chrome ? (variant === "compact" ? 12 : 16) : 0,
          border: chrome ? "1px solid var(--uai-border)" : 0,
          borderRadius: variant === "compact" ? 12 : 14,
          background: chrome ? "var(--uai-surface)" : "transparent",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style href="uai-run-summary" precedence="default">
          {runSummaryCss}
        </style>
        {children}
      </section>
    </RunSummaryContext.Provider>
  );
}

export function RunSummaryHeader({ children, style, ...props }: ComponentProps<"div">) {
  const context = useRunSummary("RunSummaryHeader");
  const { icon: Icon, color, label } = outcomeDetails[context.outcome];
  const size = context.variant === "compact" ? 24 : 28;
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: context.variant === "compact" ? 10 : 12,
        minWidth: 0,
        ...style,
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          flex: "none",
          width: size,
          height: size,
          borderRadius: context.variant === "compact" ? 8 : 10,
          background: outcomeTint[context.outcome],
          color,
        }}
      >
        <Icon
          size={context.variant === "compact" ? 13 : 15}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span style={visuallyHidden}>{label}</span>
      </span>
      <div style={{ display: "grid", gap: 2, flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

export function RunSummaryTitle({ style, ...props }: ComponentProps<"h3">) {
  const context = useRunSummary("RunSummaryTitle");
  return (
    <h3
      {...props}
      id={`${context.id}-title`}
      style={{
        margin: 0,
        paddingTop: context.variant === "compact" ? 2 : 4,
        fontSize: context.variant === "compact" ? 13.5 : 14.5,
        lineHeight: "20px",
        fontWeight: 500,
        letterSpacing: "-0.005em",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function RunSummaryDescription({ style, ...props }: ComponentProps<"p">) {
  useRunSummary("RunSummaryDescription");
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 12.5,
        lineHeight: "18px",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function RunSummaryStats({ style, ...props }: ComponentProps<"dl">) {
  const context = useRunSummary("RunSummaryStats");
  return (
    <dl
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
        gap: context.variant === "compact" ? 4 : 6,
        margin: 0,
        ...style,
      }}
    />
  );
}

export type RunSummaryStatProps = ComponentProps<"div"> & { label: ReactNode };

export function RunSummaryStat({ label, children, style, ...props }: RunSummaryStatProps) {
  const context = useRunSummary("RunSummaryStat");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: context.variant === "compact" ? "6px 10px" : "10px 12px",
        borderRadius: context.variant === "compact" ? 8 : 10,
        background:
          context.variant === "plain"
            ? "var(--uai-surface-raised)"
            : "color-mix(in oklab, var(--uai-surface-raised) 60%, transparent)",
        ...style,
      }}
    >
      <dt style={{ color: "var(--uai-subtle)", fontSize: 11.5, lineHeight: "16px" }}>{label}</dt>
      <dd
        style={{
          margin: 0,
          fontSize: context.variant === "compact" ? 14 : 17,
          lineHeight: context.variant === "compact" ? "20px" : "24px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {children}
      </dd>
    </div>
  );
}

export type RunSummaryListProps = ComponentProps<"div"> & {
  /** Heading for the list. */
  label?: ReactNode;
};

function SummaryList({
  part,
  defaultLabel,
  ordered = false,
  label,
  children,
  style,
  ...props
}: RunSummaryListProps & { part: string; defaultLabel: string; ordered?: boolean }) {
  const context = useRunSummary(part);
  const headingId = useId();
  const List = ordered ? "ol" : "ul";
  return (
    <div {...props} style={{ display: "grid", gap: 6, minWidth: 0, ...style }}>
      <h4
        id={headingId}
        style={{
          margin: 0,
          color: "var(--uai-subtle)",
          fontSize: 11.5,
          lineHeight: "16px",
          fontWeight: 500,
        }}
      >
        {label ?? defaultLabel}
      </h4>
      <List
        aria-labelledby={headingId}
        style={{
          display: "grid",
          gap: context.variant === "compact" ? 0 : 2,
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {children}
      </List>
    </div>
  );
}

export function RunSummaryArtifacts(props: RunSummaryListProps) {
  return <SummaryList {...props} part="RunSummaryArtifacts" defaultLabel="Changed files" />;
}

export type RunSummaryArtifactChange = "added" | "modified" | "deleted";
const changeDetails: Record<
  RunSummaryArtifactChange,
  { label: string; icon: LucideIcon; color: string }
> = {
  added: { label: "Added", icon: Plus, color: "var(--uai-success)" },
  modified: { label: "Modified", icon: PencilLine, color: "var(--uai-muted)" },
  deleted: { label: "Deleted", icon: Minus, color: dangerText },
};

export type RunSummaryArtifactProps = ComponentProps<"li"> & {
  change?: RunSummaryArtifactChange;
};

export function RunSummaryArtifact({
  change = "modified",
  children,
  style,
  ...props
}: RunSummaryArtifactProps) {
  const context = useRunSummary("RunSummaryArtifact");
  const { icon: Icon, color, label } = changeDetails[change];
  return (
    <li
      {...props}
      data-change={change}
      data-uai-run-summary-artifact=""
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
        minHeight: context.variant === "compact" ? 26 : 30,
        margin: "0 -8px",
        padding: "0 8px",
        borderRadius: 8,
        ...style,
      }}
    >
      <Icon size={13} strokeWidth={2} aria-hidden="true" style={{ flex: "none", color }} />
      <span style={visuallyHidden}>{label}: </span>
      <span
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          flex: 1,
          minWidth: 0,
          textDecoration: change === "deleted" ? "line-through" : undefined,
          textDecorationColor: "var(--uai-border-strong)",
        }}
      >
        {children}
      </span>
    </li>
  );
}

export function RunSummaryArtifactName({ style, ...props }: ComponentProps<"span">) {
  useRunSummary("RunSummaryArtifactName");
  return (
    <span
      {...props}
      style={{
        minWidth: 0,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        fontSize: 12,
        ...style,
      }}
    />
  );
}

export function RunSummaryArtifactMeta({ style, ...props }: ComponentProps<"span">) {
  useRunSummary("RunSummaryArtifactMeta");
  return (
    <span
      {...props}
      style={{
        flex: "none",
        marginLeft: "auto",
        color: "var(--uai-subtle)",
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        fontSize: 11.5,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function RunSummaryWarnings(props: RunSummaryListProps) {
  return <SummaryList {...props} part="RunSummaryWarnings" defaultLabel="Warnings" />;
}

export function RunSummaryWarning({ children, style, ...props }: ComponentProps<"li">) {
  useRunSummary("RunSummaryWarning");
  return (
    <li
      {...props}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 10,
        background: "color-mix(in oklab, var(--uai-warning) 10%, transparent)",
        fontSize: 12.5,
        lineHeight: "18px",
        ...style,
      }}
    >
      <TriangleAlert
        size={14}
        aria-hidden="true"
        style={{ flex: "none", marginTop: 2, color: "var(--uai-warning)" }}
      />
      <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{children}</span>
    </li>
  );
}

export function RunSummaryNextSteps(props: RunSummaryListProps) {
  return <SummaryList {...props} part="RunSummaryNextSteps" defaultLabel="Next steps" ordered />;
}

export function RunSummaryNextStep({ children, style, ...props }: ComponentProps<"li">) {
  useRunSummary("RunSummaryNextStep");
  return (
    <li
      {...props}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        minWidth: 0,
        padding: "3px 0",
        ...style,
      }}
    >
      <ArrowRight
        size={13}
        strokeWidth={1.75}
        aria-hidden="true"
        style={{ flex: "none", marginTop: 3, color: "var(--uai-subtle)" }}
      />
      <span style={{ minWidth: 0 }}>{children}</span>
    </li>
  );
}

export function RunSummaryActions({ style, ...props }: ComponentProps<"div">) {
  useRunSummary("RunSummaryActions");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        gap: 8,
        paddingTop: 2,
        ...style,
      }}
    />
  );
}

export type RunSummaryActionProps = ComponentProps<"button"> & {
  /** Primary actions use the accent fill. */
  primary?: boolean;
};

export function RunSummaryAction({ primary = false, style, ...props }: RunSummaryActionProps) {
  const context = useRunSummary("RunSummaryAction");
  return (
    <button
      type="button"
      data-uai-run-summary-action={primary ? "primary" : "secondary"}
      {...props}
      style={{
        height: context.variant === "compact" ? 28 : 32,
        padding: context.variant === "compact" ? "0 12px" : "0 14px",
        border: 0,
        borderRadius: 999,
        background: primary ? "var(--uai-accent)" : "var(--uai-surface-raised)",
        color: primary ? "var(--uai-accent-foreground)" : "var(--uai-text)",
        font: "inherit",
        fontSize: context.variant === "compact" ? 12.5 : 13,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    />
  );
}
