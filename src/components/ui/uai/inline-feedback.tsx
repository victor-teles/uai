"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type MouseEvent,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";

export const INLINE_FEEDBACK_VARIANTS = ["text", "pill", "outlined"] as const;
export type InlineFeedbackVariant = (typeof INLINE_FEEDBACK_VARIANTS)[number];
export type InlineFeedbackStatus = "idle" | "pending" | "success" | "error";
export type InlineFeedbackProps = ComponentProps<"div"> & {
  variant?: InlineFeedbackVariant;
  status?: InlineFeedbackStatus;
  defaultStatus?: InlineFeedbackStatus;
  onStatusChange?: (status: InlineFeedbackStatus) => void;
  /** Milliseconds before success or error returns to idle. Omit to keep the message. */
  duration?: number;
};
type FeedbackContext = {
  variant: InlineFeedbackVariant;
  status: InlineFeedbackStatus;
  change: (status: InlineFeedbackStatus) => void;
};
const Context = createContext<FeedbackContext | null>(null);
function useFeedback(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within InlineFeedback`);
  return context;
}
const dangerText = "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))";
const feedbackCss = `
@keyframes uai-inline-feedback-in{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:none}}
@keyframes uai-inline-feedback-spin{to{transform:rotate(360deg)}}
@keyframes uai-inline-feedback-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
.uai-inline-feedback__action{height:28px;padding:0 12px;border:0;border-radius:999px;background:var(--uai-surface-raised);color:var(--uai-text);font:inherit;font-size:12.5px;font-weight:500;line-height:16px;white-space:nowrap;cursor:pointer;transition:background-color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-inline-feedback__action:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-inline-feedback__action:active{transform:scale(0.97)}
.uai-inline-feedback__action:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-inline-feedback__action[aria-busy="true"]{cursor:progress}
.uai-inline-feedback__message{animation:uai-inline-feedback-in 180ms cubic-bezier(0.16,1,0.3,1) both;transform-origin:left center}
.uai-inline-feedback__spinner{animation:uai-inline-feedback-spin 900ms linear infinite}
.uai-inline-feedback__shimmer{background-image:linear-gradient(90deg,var(--uai-subtle) 0%,var(--uai-subtle) 35%,var(--uai-text) 50%,var(--uai-subtle) 65%,var(--uai-subtle) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:uai-inline-feedback-shimmer 2s linear infinite}
@media (prefers-reduced-motion: reduce){.uai-inline-feedback__message,.uai-inline-feedback__spinner,.uai-inline-feedback__shimmer{animation:none}.uai-inline-feedback__shimmer{background-image:none;color:inherit}.uai-inline-feedback__action{transition:none}.uai-inline-feedback__action:active{transform:none}}
`;

export function InlineFeedback({
  variant = "text",
  status,
  defaultStatus = "idle",
  onStatusChange,
  duration,
  style,
  children,
  ...props
}: InlineFeedbackProps) {
  const [internal, setInternal] = useState(defaultStatus);
  const current = status ?? internal;
  const change = (next: InlineFeedbackStatus) => {
    if (status === undefined) setInternal(next);
    onStatusChange?.(next);
  };
  const reset = useEffectEvent(() => change("idle"));
  useEffect(() => {
    if (duration === undefined || (current !== "success" && current !== "error")) return;
    const timer = window.setTimeout(reset, duration);
    return () => window.clearTimeout(timer);
  }, [current, duration]);
  return (
    <Context.Provider value={{ variant, status: current, change }}>
      <div
        {...props}
        data-variant={variant}
        data-status={current}
        style={{
          display: "inline-flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{feedbackCss}</style>
        {children}
      </div>
    </Context.Provider>
  );
}

export type InlineFeedbackActionProps = Omit<ComponentProps<"button">, "onClick"> & {
  /** Runs the local action. Resolve for success, throw or reject for error. */
  onAction?: (event: MouseEvent<HTMLButtonElement>) => unknown;
};

export function InlineFeedbackAction({
  onAction,
  disabled,
  className,
  ...props
}: InlineFeedbackActionProps) {
  const context = useFeedback("InlineFeedbackAction");
  const pending = context.status === "pending";
  return (
    <button
      type="button"
      {...props}
      disabled={disabled}
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      className={["uai-inline-feedback__action", className].filter(Boolean).join(" ")}
      onClick={async (event) => {
        if (pending || !onAction) return;
        context.change("pending");
        try {
          await onAction(event);
          context.change("success");
        } catch {
          context.change("error");
        }
      }}
    />
  );
}

export function InlineFeedbackStatus({ style, children, ...props }: ComponentProps<"span">) {
  const context = useFeedback("InlineFeedbackStatus");
  const visible = context.status !== "idle";
  const tone =
    context.status === "error"
      ? "var(--uai-danger)"
      : context.status === "success"
        ? "var(--uai-success)"
        : null;
  const chrome =
    context.variant === "pill"
      ? {
          padding: "2px 10px 2px 8px",
          borderRadius: 999,
          background: tone
            ? `color-mix(in oklab, ${tone} 14%, transparent)`
            : "var(--uai-surface-raised)",
        }
      : context.variant === "outlined"
        ? {
            padding: "1px 9px 1px 7px",
            borderRadius: 999,
            border: `1px solid ${
              tone ? `color-mix(in oklab, ${tone} 32%, transparent)` : "var(--uai-border)"
            }`,
          }
        : {};
  return (
    <span
      role="status"
      aria-live="polite"
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 24,
        fontSize: 12.5,
        fontWeight: context.variant === "text" ? 400 : 500,
        color:
          context.status === "error"
            ? dangerText
            : context.status === "success" && context.variant === "pill"
              ? "var(--uai-success)"
              : "var(--uai-muted)",
        ...(visible ? chrome : {}),
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function InlineFeedbackMessage({
  status,
  children,
  style,
  ...props
}: ComponentProps<"span"> & { status: Exclude<InlineFeedbackStatus, "idle"> }) {
  const context = useFeedback("InlineFeedbackMessage");
  if (context.status !== status) return null;
  const Icon = status === "success" ? Check : status === "error" ? X : LoaderCircle;
  const pending = status === "pending";
  return (
    <span
      {...props}
      className={["uai-inline-feedback__message", props.className].filter(Boolean).join(" ")}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, ...style }}
    >
      <Icon
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className={pending ? "uai-inline-feedback__spinner" : undefined}
        style={{
          flex: "none",
          color:
            status === "success" ? "var(--uai-success)" : pending ? "var(--uai-subtle)" : undefined,
        }}
      />
      <span className={pending ? "uai-inline-feedback__shimmer" : undefined}>{children}</span>
    </span>
  );
}
