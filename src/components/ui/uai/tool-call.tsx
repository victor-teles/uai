"use client";

import {
  Check,
  ChevronDown,
  CircleAlert,
  CircleDashed,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export const TOOL_CALL_VARIANTS = ["card", "inline", "compact"] as const;
export const TOOL_CALL_STATUSES = ["queued", "running", "success", "error"] as const;
export type ToolCallVariant = (typeof TOOL_CALL_VARIANTS)[number];
export type ToolCallStatus = (typeof TOOL_CALL_STATUSES)[number];
export type ToolCallProps = ComponentProps<"div"> & {
  variant?: ToolCallVariant;
  status?: ToolCallStatus;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type ToolCallContextValue = {
  id: string;
  variant: ToolCallVariant;
  status: ToolCallStatus;
  open: boolean;
  toggle: () => void;
};

const ToolCallContext = createContext<ToolCallContextValue | null>(null);

function useToolCall(part: string) {
  const context = useContext(ToolCallContext);
  if (!context) throw new Error(`${part} must be used within ToolCall`);
  return context;
}

const dangerText = "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))";
const statusDetails: Record<
  ToolCallStatus,
  { label: string; icon: LucideIcon; color: string; tint: string }
> = {
  queued: {
    label: "Queued",
    icon: CircleDashed,
    color: "var(--uai-subtle)",
    tint: "transparent",
  },
  running: {
    label: "Running",
    icon: LoaderCircle,
    color: "var(--uai-text)",
    tint: "var(--uai-surface-raised)",
  },
  success: {
    label: "Succeeded",
    icon: Check,
    color: "var(--uai-success)",
    tint: "color-mix(in oklab, var(--uai-success) 14%, transparent)",
  },
  error: {
    label: "Failed",
    icon: CircleAlert,
    color: dangerText,
    tint: "color-mix(in oklab, var(--uai-danger) 14%, transparent)",
  },
};

const toolCallCss = `
@keyframes uai-tool-call-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
@keyframes uai-tool-call-reveal{from{opacity:0;transform:translateY(-4px)}}
[data-uai-tool-call-trigger]{transition:background-color 120ms ease-out}
[data-uai-tool-call-trigger]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 50%,transparent)!important}
[data-uai-tool-call-trigger]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:-2px}
[data-uai-tool-call-trigger]:hover [data-uai-tool-call-chevron]{color:var(--uai-text)!important}
[data-uai-tool-call][data-status="running"] [data-uai-tool-call-status]{background-image:linear-gradient(90deg,var(--uai-subtle) 0%,var(--uai-subtle) 35%,var(--uai-text) 50%,var(--uai-subtle) 65%,var(--uai-subtle) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;animation:uai-tool-call-shimmer 2s linear infinite}
[data-uai-tool-call-content]:not([hidden]){animation:uai-tool-call-reveal 240ms cubic-bezier(0.23,1,0.32,1)}
@media (prefers-reduced-motion:reduce){[data-uai-tool-call-trigger],[data-uai-tool-call-content]{transition:none;animation:none!important}[data-uai-tool-call][data-status="running"] [data-uai-tool-call-status]{animation:none;background:none;color:var(--uai-text)!important}}
`;

export function ToolCall({
  variant = "card",
  status = "queued",
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  style,
  ...props
}: ToolCallProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const visible = open ?? internal;
  const chrome = variant !== "inline";
  return (
    <ToolCallContext.Provider
      value={{
        id,
        variant,
        status,
        open: visible,
        toggle: () => {
          if (open === undefined) setInternal(!visible);
          onOpenChange?.(!visible);
        },
      }}
    >
      <div
        {...props}
        aria-busy={status === "running" || undefined}
        data-variant={variant}
        data-status={status}
        data-state={visible ? "open" : "closed"}
        data-uai-tool-call=""
        style={{
          minWidth: 0,
          overflow: "hidden",
          border: chrome
            ? `1px solid ${
                status === "error"
                  ? "color-mix(in oklab, var(--uai-danger) 45%, var(--uai-border))"
                  : "var(--uai-border)"
              }`
            : 0,
          borderRadius: variant === "compact" ? 12 : 14,
          background: chrome ? "var(--uai-surface)" : "transparent",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style href="uai-tool-call" precedence="default">
          {toolCallCss}
        </style>
        {children}
      </div>
    </ToolCallContext.Provider>
  );
}

export function ToolCallHeader({ style, ...props }: ComponentProps<"div">) {
  const context = useToolCall("ToolCallHeader");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
        paddingRight: context.variant === "inline" ? 4 : context.variant === "compact" ? 8 : 12,
        ...style,
      }}
    />
  );
}

function StatusIcon({ status, size }: { status: ToolCallStatus; size: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (status !== "running") return;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const animation = ref.current?.animate?.(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
      { duration: 900, iterations: Number.POSITIVE_INFINITY },
    );
    return () => animation?.cancel();
  }, [status]);
  const { icon: Icon, color } = statusDetails[status];
  return (
    <Icon
      ref={ref}
      size={size}
      strokeWidth={2}
      aria-hidden="true"
      style={{ flex: "none", color }}
    />
  );
}

export function ToolCallTrigger({ children, onClick, style, ...props }: ComponentProps<"button">) {
  const context = useToolCall("ToolCallTrigger");
  const compact = context.variant === "compact";
  const inline = context.variant === "inline";
  return (
    <button
      type="button"
      {...props}
      aria-expanded={context.open}
      aria-controls={`${context.id}-content`}
      data-uai-tool-call-trigger=""
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.toggle();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flex: "1 1 auto",
        minWidth: 0,
        minHeight: compact ? 34 : 44,
        padding: inline ? "0 6px" : compact ? "0 8px" : "0 12px",
        border: 0,
        borderRadius: inline ? 10 : 0,
        outline: "none",
        background: "transparent",
        color: "inherit",
        font: "inherit",
        textAlign: "left",
        cursor: "pointer",
        ...style,
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          flex: "none",
          width: compact ? 20 : 24,
          height: compact ? 20 : 24,
          borderRadius: compact ? 6 : 8,
          background: statusDetails[context.status].tint,
          boxShadow: context.status === "queued" ? "inset 0 0 0 1px var(--uai-border)" : undefined,
          transition: "background-color 200ms ease-out",
        }}
      >
        <StatusIcon status={context.status} size={compact ? 12 : 13} />
      </span>
      <span style={{ display: "flex", alignItems: "baseline", gap: 8, flex: 1, minWidth: 0 }}>
        {children}
      </span>
      <ChevronDown
        size={14}
        aria-hidden="true"
        data-uai-tool-call-chevron=""
        style={{
          flex: "none",
          color: "var(--uai-subtle)",
          transform: context.open ? "rotate(180deg)" : undefined,
          transition: "transform 180ms cubic-bezier(0.23, 1, 0.32, 1), color 120ms ease-out",
        }}
      />
    </button>
  );
}

export function ToolCallName({ style, ...props }: ComponentProps<"span">) {
  useToolCall("ToolCallName");
  return (
    <span
      {...props}
      style={{
        flex: "none",
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

export function ToolCallSummary({ style, ...props }: ComponentProps<"span">) {
  useToolCall("ToolCallSummary");
  return (
    <span
      {...props}
      style={{
        minWidth: 0,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        color: "var(--uai-muted)",
        fontSize: 12.5,
        ...style,
      }}
    />
  );
}

export function ToolCallStatus({ children, style, ...props }: ComponentProps<"span">) {
  const context = useToolCall("ToolCallStatus");
  const details = statusDetails[context.status];
  return (
    <span
      role="status"
      data-uai-tool-call-status=""
      {...props}
      style={{
        flex: "none",
        padding: context.status === "success" || context.status === "error" ? "2px 8px" : "2px 0",
        borderRadius: 999,
        background:
          context.status === "success" || context.status === "error" ? details.tint : undefined,
        color:
          context.status === "queued"
            ? "var(--uai-subtle)"
            : context.status === "running"
              ? "var(--uai-text)"
              : details.color,
        fontSize: 11.5,
        lineHeight: "16px",
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children ?? details.label}
    </span>
  );
}

export function ToolCallContent({ style, ...props }: ComponentProps<"div">) {
  const context = useToolCall("ToolCallContent");
  const inline = context.variant === "inline";
  return (
    <div
      {...props}
      id={`${context.id}-content`}
      hidden={!context.open}
      data-uai-tool-call-content=""
      style={{
        display: context.open ? "grid" : "none",
        gap: 10,
        padding: inline ? "6px 0 4px 38px" : context.variant === "compact" ? 8 : 12,
        borderTop: inline ? 0 : "1px solid var(--uai-border)",
        ...style,
      }}
    />
  );
}

export type ToolCallPayloadProps = ComponentProps<"div"> & {
  /** Heading shown above the payload. */
  label?: ReactNode;
};

function Payload({
  part,
  defaultLabel,
  label,
  children,
  style,
  ...props
}: ToolCallPayloadProps & { part: string; defaultLabel: string }) {
  const context = useToolCall(part);
  const labelId = `${context.id}-${defaultLabel.toLowerCase()}`;
  const code: CSSProperties = {
    margin: 0,
    maxHeight: 220,
    overflow: "auto",
    padding: "8px 10px",
    borderRadius: context.variant === "compact" ? 8 : 10,
    background: context.variant === "inline" ? "var(--uai-surface-raised)" : "var(--uai-canvas)",
    color: "color-mix(in oklab, var(--uai-text) 88%, var(--uai-muted))",
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
    fontSize: 11.5,
    lineHeight: "18px",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  };
  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled group keeps the payload heading lightweight inside chat logs.
    <div
      role="group"
      aria-labelledby={labelId}
      {...props}
      style={{ display: "grid", gap: 4, ...style }}
    >
      <span id={labelId} style={{ color: "var(--uai-subtle)", fontSize: 11.5, lineHeight: "16px" }}>
        {label ?? defaultLabel}
      </span>
      <pre style={code}>{children}</pre>
    </div>
  );
}

export function ToolCallInput(props: ToolCallPayloadProps) {
  return <Payload {...props} part="ToolCallInput" defaultLabel="Input" />;
}

export function ToolCallOutput(props: ToolCallPayloadProps) {
  const context = useToolCall("ToolCallOutput");
  if (context.status === "queued" || context.status === "error") return null;
  return <Payload {...props} part="ToolCallOutput" defaultLabel="Output" />;
}

export function ToolCallError({ children, style, ...props }: ComponentProps<"p">) {
  const context = useToolCall("ToolCallError");
  if (context.status !== "error") return null;
  return (
    <p
      {...props}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        margin: 0,
        padding: "8px 10px",
        borderRadius: 10,
        background: "color-mix(in oklab, var(--uai-danger) 10%, transparent)",
        color: dangerText,
        fontSize: 12.5,
        ...style,
      }}
    >
      <CircleAlert size={14} aria-hidden="true" style={{ flex: "none", marginTop: 2 }} />
      <span>{children ?? "The tool returned an error."}</span>
    </p>
  );
}
