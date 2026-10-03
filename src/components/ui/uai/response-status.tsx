"use client";

import { Check, CircleAlert, CircleDashed, RotateCw, Square } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from "react";

export const RESPONSE_STATUS_VARIANTS = ["inline", "pill", "bar"] as const;
export const RESPONSE_STATUSES = ["queued", "streaming", "stopped", "complete", "failed"] as const;
export type ResponseStatusVariant = (typeof RESPONSE_STATUS_VARIANTS)[number];
export type ResponseStatusValue = (typeof RESPONSE_STATUSES)[number];
export type ResponseStatusProps = ComponentProps<"div"> & {
  variant?: ResponseStatusVariant;
  status?: ResponseStatusValue;
};

type ActionKind = "stop" | "retry";
type ResponseStatusContextValue = {
  id: string;
  variant: ResponseStatusVariant;
  status: ResponseStatusValue;
  active: boolean;
  register: (kind: ActionKind, node: HTMLButtonElement | null) => void;
  setFocused: (kind: ActionKind | null) => void;
};

const ResponseStatusContext = createContext<ResponseStatusContextValue | null>(null);

function useResponseStatus(part: string) {
  const context = useContext(ResponseStatusContext);
  if (!context) throw new Error(`${part} must be used within ResponseStatus`);
  return context;
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const dangerText = "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))";
const defaultLabels: Record<ResponseStatusValue, string> = {
  queued: "Waiting to start…",
  streaming: "Generating response…",
  stopped: "Response stopped",
  complete: "Response complete",
  failed: "Response failed",
};

const responseStatusCss = `
@keyframes uai-response-status-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
[data-uai-response-status][data-status="streaming"] [data-uai-response-status-label],[data-uai-response-status][data-status="queued"] [data-uai-response-status-label]{background-image:linear-gradient(90deg,var(--uai-subtle) 0%,var(--uai-subtle) 35%,var(--uai-text) 50%,var(--uai-subtle) 65%,var(--uai-subtle) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;animation:uai-response-status-shimmer 2s linear infinite}
[data-uai-response-status-action]{transition:background-color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-response-status-action]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))!important}
[data-uai-response-status][data-variant="pill"] [data-uai-response-status-action]:hover{background:var(--uai-surface-raised)!important}
[data-uai-response-status-action]:active{transform:scale(0.97)}
[data-uai-response-status-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@media (prefers-reduced-motion:reduce){[data-uai-response-status] [data-uai-response-status-label]{animation:none!important;background:none!important;color:var(--uai-text)!important}[data-uai-response-status-action]{transition:none}[data-uai-response-status-action]:active{transform:none}}
`;

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function ResponseStatus({
  variant = "inline",
  status = "queued",
  children,
  style,
  ...props
}: ResponseStatusProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const actions = useRef<Partial<Record<ActionKind, HTMLButtonElement>>>({});
  const focused = useRef<ActionKind | null>(null);
  const active = status === "queued" || status === "streaming";
  // When the focused Stop or Retry action unmounts after a status change, keep focus nearby.
  useIsomorphicLayoutEffect(() => {
    const kind = focused.current;
    const lost = !document.activeElement || document.activeElement === document.body;
    if (!kind || actions.current[kind]?.isConnected || !lost) return;
    focused.current = null;
    const next = actions.current[kind === "stop" ? "retry" : "stop"];
    if (next?.isConnected) {
      focused.current = kind === "stop" ? "retry" : "stop";
      next.focus();
    } else rootRef.current?.focus();
  }, [status]);
  const layout: Record<ResponseStatusVariant, CSSProperties> = {
    inline: { display: "inline-flex", gap: 8, minHeight: 28 },
    pill: {
      display: "inline-flex",
      gap: 8,
      minHeight: 32,
      padding: "2px 2px 2px 10px",
      borderRadius: 999,
      background: "var(--uai-surface-raised)",
      boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--uai-text) 5%, transparent)",
    },
    bar: {
      display: "flex",
      gap: 10,
      minHeight: 44,
      padding: "6px 6px 6px 14px",
      borderRadius: 14,
      border: `1px solid ${
        status === "failed"
          ? "color-mix(in oklab, var(--uai-danger) 45%, var(--uai-border))"
          : "var(--uai-border)"
      }`,
      background: "var(--uai-surface)",
    },
  };
  return (
    <ResponseStatusContext.Provider
      value={{
        id,
        variant,
        status,
        active,
        register: (kind, node) => {
          if (node) actions.current[kind] = node;
          else delete actions.current[kind];
        },
        setFocused: (kind) => {
          focused.current = kind;
        },
      }}
    >
      <div
        tabIndex={-1}
        {...props}
        ref={rootRef}
        aria-busy={active || undefined}
        data-variant={variant}
        data-status={status}
        data-uai-response-status=""
        style={{
          alignItems: "center",
          flexWrap: "wrap",
          maxWidth: "100%",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          outline: "none",
          ...layout[variant],
          ...style,
        }}
      >
        <style href="uai-response-status" precedence="default">
          {responseStatusCss}
        </style>
        {children}
      </div>
    </ResponseStatusContext.Provider>
  );
}

function StreamingDots() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const dots = Array.from(ref.current?.children ?? []);
    const animations = dots.map((dot, index) =>
      dot.animate?.([{ opacity: 0.25 }, { opacity: 1 }, { opacity: 0.25 }], {
        duration: 1100,
        delay: index * 160,
        iterations: Number.POSITIVE_INFINITY,
        easing: "ease-in-out",
      }),
    );
    return () => {
      for (const animation of animations) animation?.cancel();
    };
  }, []);
  return (
    <span ref={ref} style={{ display: "inline-flex", gap: 3 }}>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          style={{
            width: 4,
            height: 4,
            borderRadius: 999,
            background: "currentColor",
            opacity: 0.6,
          }}
        />
      ))}
    </span>
  );
}

export function ResponseStatusIndicator({ children, style, ...props }: ComponentProps<"span">) {
  const context = useResponseStatus("ResponseStatusIndicator");
  const icon = {
    queued: <CircleDashed size={14} />,
    streaming: <StreamingDots />,
    stopped: <Square size={11} fill="currentColor" strokeWidth={0} />,
    complete: <Check size={14} />,
    failed: <CircleAlert size={14} />,
  }[context.status];
  const color = {
    queued: "var(--uai-subtle)",
    streaming: "var(--uai-text)",
    stopped: "var(--uai-subtle)",
    complete: "var(--uai-success)",
    failed: dangerText,
  }[context.status];
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        display: "grid",
        placeItems: "center",
        flex: "none",
        width: 18,
        height: 18,
        color,
        transition: "color 200ms ease-out",
        ...style,
      }}
    >
      {children ?? icon}
    </span>
  );
}

export function ResponseStatusLabel({ children, style, ...props }: ComponentProps<"span">) {
  const context = useResponseStatus("ResponseStatusLabel");
  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      {...props}
      id={`${context.id}-label`}
      data-uai-response-status-label=""
      style={{
        minWidth: 0,
        color: context.status === "failed" ? dangerText : "var(--uai-text)",
        fontWeight: 500,
        transition: "color 200ms ease-out",
        ...style,
      }}
    >
      {children ?? defaultLabels[context.status]}
    </span>
  );
}

export function ResponseStatusDetail({ style, ...props }: ComponentProps<"span">) {
  useResponseStatus("ResponseStatusDetail");
  return (
    <span
      {...props}
      style={{
        minWidth: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function ResponseStatusActions({ style, ...props }: ComponentProps<"div">) {
  useResponseStatus("ResponseStatusActions");
  return (
    <div
      {...props}
      style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto", ...style }}
    />
  );
}

function actionStyle(variant: ResponseStatusVariant): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 28,
    padding: "0 12px",
    border: 0,
    borderRadius: 999,
    background: variant === "pill" ? "var(--uai-surface)" : "var(--uai-surface-raised)",
    color: "var(--uai-text)",
    font: "inherit",
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
  };
}

function useAction(kind: ActionKind, part: string) {
  const context = useResponseStatus(part);
  return {
    context,
    ref: (node: HTMLButtonElement | null) => context.register(kind, node),
    onFocus: () => context.setFocused(kind),
    // A blur caused by unmounting keeps the record so the root can restore focus.
    onBlur: (node: HTMLButtonElement) =>
      queueMicrotask(() => {
        if (node.isConnected) context.setFocused(null);
      }),
  };
}

export function ResponseStatusStop({
  children,
  onFocus,
  onBlur,
  style,
  ...props
}: ComponentProps<"button">) {
  const { context, ref, onFocus: track, onBlur: untrack } = useAction("stop", "ResponseStatusStop");
  if (!context.active) return null;
  return (
    <button
      type="button"
      aria-describedby={`${context.id}-label`}
      {...props}
      ref={ref}
      data-uai-response-status-action=""
      onFocus={(event) => {
        onFocus?.(event);
        track();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        untrack(event.currentTarget);
      }}
      style={{ ...actionStyle(context.variant), ...style }}
    >
      {children ?? (
        <>
          <Square size={9} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          Stop
        </>
      )}
    </button>
  );
}

export function ResponseStatusRetry({
  children,
  onFocus,
  onBlur,
  style,
  ...props
}: ComponentProps<"button">) {
  const {
    context,
    ref,
    onFocus: track,
    onBlur: untrack,
  } = useAction("retry", "ResponseStatusRetry");
  if (context.status !== "failed" && context.status !== "stopped") return null;
  return (
    <button
      type="button"
      aria-describedby={`${context.id}-label`}
      {...props}
      ref={ref}
      data-uai-response-status-action=""
      onFocus={(event) => {
        onFocus?.(event);
        track();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        untrack(event.currentTarget);
      }}
      style={{ ...actionStyle(context.variant), ...style }}
    >
      {children ?? (
        <>
          <RotateCw size={12} aria-hidden="true" />
          {context.status === "failed" ? "Retry" : "Regenerate"}
        </>
      )}
    </button>
  );
}
