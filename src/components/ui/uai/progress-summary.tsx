"use client";

import { type ComponentProps, createContext, useContext, useId } from "react";

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
const dangerText = "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))";
const summaryCss = `
@keyframes uai-progress-summary-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
@keyframes uai-progress-summary-indeterminate{from{transform:translateX(-100%)}to{transform:translateX(290%)}}
.uai-progress-summary__shimmer{background-image:linear-gradient(90deg,var(--uai-subtle) 0%,var(--uai-subtle) 35%,var(--uai-text) 50%,var(--uai-subtle) 65%,var(--uai-subtle) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;animation:uai-progress-summary-shimmer 2s linear infinite}
.uai-progress-summary__fill{transition:transform 300ms cubic-bezier(0.23,1,0.32,1),background-color 200ms ease-out,opacity 200ms ease-out}
.uai-progress-summary__fill[data-indeterminate]{animation:uai-progress-summary-indeterminate 1.4s cubic-bezier(0.65,0,0.35,1) infinite}
.uai-progress-summary__cancel{height:28px;padding:0 12px;border:0;border-radius:999px;background:var(--uai-surface-raised);color:var(--uai-text);font:inherit;font-size:12.5px;font-weight:500;line-height:16px;white-space:nowrap;cursor:pointer;transition:background-color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-progress-summary__cancel:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-progress-summary__cancel:active:not(:disabled){transform:scale(0.97)}
.uai-progress-summary__cancel:disabled{cursor:not-allowed;color:var(--uai-subtle)}
.uai-progress-summary__cancel:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-progress-summary[data-variant="compact"] .uai-progress-summary__cancel{height:24px;padding:0 10px;font-size:12px}
@media (prefers-reduced-motion: reduce){.uai-progress-summary__shimmer,.uai-progress-summary__fill[data-indeterminate]{animation:none}.uai-progress-summary__shimmer{background-image:none;color:var(--uai-muted)!important}.uai-progress-summary__fill,.uai-progress-summary__cancel{transition:none}}
`;

export function ProgressSummary({
  variant = "card",
  value,
  max = 100,
  status = "running",
  children,
  className,
  style,
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
        {...props}
        className={["uai-progress-summary", className].filter(Boolean).join(" ")}
        data-variant={variant}
        data-status={status}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          alignItems: "center",
          columnGap: 12,
          rowGap: variant === "compact" ? 8 : 14,
          minWidth: 0,
          padding: variant === "inline" ? 0 : variant === "compact" ? "10px 12px" : 18,
          border: variant === "inline" ? 0 : "1px solid var(--uai-border)",
          borderRadius: variant === "compact" ? 12 : 14,
          background: variant === "inline" ? "transparent" : "var(--uai-surface)",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{summaryCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function ProgressSummaryHeader({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "grid", gap: 2, minWidth: 0, ...style }} />;
}

export function ProgressSummaryTitle({ style, ...props }: ComponentProps<"h3">) {
  const context = useSummary("ProgressSummaryTitle");
  return (
    <h3
      {...props}
      id={`${context.id}-title`}
      style={{
        margin: 0,
        fontSize: 13,
        lineHeight: "18px",
        fontWeight: 500,
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function ProgressSummaryStatusText({
  children,
  className,
  style,
  ...props
}: ComponentProps<"p">) {
  const context = useSummary("ProgressSummaryStatusText");
  const running = context.status === "running";
  return (
    <p
      role="status"
      {...props}
      className={[running ? "uai-progress-summary__shimmer" : undefined, className]
        .filter(Boolean)
        .join(" ")}
      style={{
        justifySelf: "start",
        margin: 0,
        fontSize: 12,
        lineHeight: "16px",
        fontVariantNumeric: "tabular-nums",
        color:
          context.status === "error"
            ? dangerText
            : context.status === "complete"
              ? "var(--uai-success)"
              : "var(--uai-subtle)",
        ...style,
      }}
    >
      {children ?? statusCopy[context.status]}
    </p>
  );
}

export function ProgressSummaryValue({ children, style, ...props }: ComponentProps<"span">) {
  const context = useSummary("ProgressSummaryValue");
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        fontSize: context.variant === "compact" ? 13 : 22,
        lineHeight: context.variant === "compact" ? "18px" : "26px",
        fontWeight: context.variant === "compact" ? 500 : 600,
        letterSpacing: context.variant === "compact" ? undefined : "-0.02em",
        fontVariantNumeric: "tabular-nums",
        justifySelf: "end",
        ...style,
      }}
    >
      {children ?? (context.percent === undefined ? "—" : `${context.percent}%`)}
    </span>
  );
}

export function ProgressSummaryBar({
  "aria-valuetext": valueText,
  style,
  ...props
}: ComponentProps<"div">) {
  const context = useSummary("ProgressSummaryBar");
  const fill =
    context.status === "error"
      ? "var(--uai-danger)"
      : context.status === "complete"
        ? "var(--uai-success)"
        : context.status === "running"
          ? "var(--uai-accent)"
          : "var(--uai-muted)";
  const indeterminate = context.percent === undefined;
  return (
    <div
      role="progressbar"
      aria-labelledby={`${context.id}-title`}
      aria-valuemin={0}
      aria-valuemax={context.max}
      aria-valuenow={context.value}
      aria-valuetext={
        valueText ??
        (context.percent === undefined
          ? statusCopy[context.status]
          : `${context.percent}% · ${statusCopy[context.status]}`)
      }
      {...props}
      style={{
        gridColumn: "1 / -1",
        position: "relative",
        height: context.variant === "compact" ? 4 : 6,
        overflow: "hidden",
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        ...style,
      }}
    >
      <span
        className="uai-progress-summary__fill"
        data-indeterminate={indeterminate || undefined}
        style={{
          position: "absolute",
          inset: 0,
          width: indeterminate ? "35%" : "100%",
          borderRadius: 999,
          background: fill,
          transform: indeterminate ? undefined : `translateX(${(context.percent ?? 0) - 100}%)`,
          opacity: context.status === "paused" || context.status === "cancelled" ? 0.5 : 1,
        }}
      />
    </div>
  );
}

export function ProgressSummaryStats({ style, ...props }: ComponentProps<"dl">) {
  const context = useSummary("ProgressSummaryStats");
  return (
    <dl
      {...props}
      style={{
        gridColumn: "1 / -1",
        display: context.variant === "compact" ? "flex" : "grid",
        flexWrap: "wrap",
        gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
        gap: context.variant === "compact" ? "4px 14px" : 12,
        paddingTop: context.variant === "card" ? 2 : 0,
        margin: 0,
        ...style,
      }}
    />
  );
}

export function ProgressSummaryStat({ style, ...props }: ComponentProps<"div">) {
  const context = useSummary("ProgressSummaryStat");
  return (
    <div
      {...props}
      style={{
        display: context.variant === "compact" ? "flex" : "grid",
        alignItems: "baseline",
        gap: context.variant === "compact" ? 4 : 2,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function ProgressSummaryStatLabel({ style, ...props }: ComponentProps<"dt">) {
  return (
    <dt
      {...props}
      style={{ color: "var(--uai-subtle)", fontSize: 11.5, lineHeight: "16px", ...style }}
    />
  );
}

export function ProgressSummaryStatValue({ style, ...props }: ComponentProps<"dd">) {
  return (
    <dd
      {...props}
      style={{ margin: 0, fontVariantNumeric: "tabular-nums", fontWeight: 500, ...style }}
    />
  );
}

export function ProgressSummaryActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        gridColumn: "1 / -1",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        gap: 6,
        ...style,
      }}
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
    <button
      {...props}
      type="button"
      disabled={disabled ?? finished}
      className={["uai-progress-summary__cancel", className].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}
