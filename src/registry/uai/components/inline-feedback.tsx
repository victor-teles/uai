"use client";

import { cva } from "class-variance-authority";
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
import { cn } from "@/lib/uai-utils";

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
const inlineFeedbackVariants = cva(
  "inline-flex min-w-0 flex-wrap items-center gap-2.5 text-[13px]/[18px] text-foreground",
  { variants: { variant: { text: "", pill: "", outlined: "" } } },
);

export function InlineFeedback({
  variant = "text",
  status,
  defaultStatus = "idle",
  onStatusChange,
  duration,
  className,
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
        data-slot="inline-feedback"
        className={cn(inlineFeedbackVariants({ variant }), className)}
        {...props}
        data-variant={variant}
        data-status={current}
      >
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
      data-slot="inline-feedback-action"
      className={cn(
        "h-7 cursor-pointer rounded-full border-0 bg-secondary px-3 text-[12.5px]/4 font-medium whitespace-nowrap text-secondary-foreground [transition:background-color_120ms_ease-out,scale_140ms_var(--ease-out-quint)] hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] aria-busy:cursor-progress motion-reduce:transition-none motion-reduce:active:scale-100",
        className,
      )}
      {...props}
      disabled={disabled}
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
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

export function InlineFeedbackStatus({ className, children, ...props }: ComponentProps<"span">) {
  const context = useFeedback("InlineFeedbackStatus");
  const visible = context.status !== "idle";
  const { status, variant } = context;
  return (
    <span
      role="status"
      aria-live="polite"
      data-slot="inline-feedback-status"
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 text-[12.5px]",
        variant === "text" ? "font-normal" : "font-medium",
        status === "error"
          ? "text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]"
          : status === "success" && variant === "pill"
            ? "text-success"
            : "text-muted-foreground",
        visible &&
          variant === "pill" &&
          cn(
            "rounded-full py-0.5 pr-2.5 pl-2",
            status === "error"
              ? "bg-destructive/14"
              : status === "success"
                ? "bg-success/14"
                : "bg-muted",
          ),
        visible &&
          variant === "outlined" &&
          cn(
            "rounded-full border py-px pr-2.25 pl-1.75",
            status === "error"
              ? "border-destructive/32"
              : status === "success"
                ? "border-success/32"
                : "border-border",
          ),
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function InlineFeedbackMessage({
  status,
  children,
  className,
  ...props
}: ComponentProps<"span"> & { status: Exclude<InlineFeedbackStatus, "idle"> }) {
  const context = useFeedback("InlineFeedbackMessage");
  if (context.status !== status) return null;
  const Icon = status === "success" ? Check : status === "error" ? X : LoaderCircle;
  const pending = status === "pending";
  return (
    <span
      data-slot="inline-feedback-message"
      className={cn(
        "inline-flex origin-left animate-in items-center gap-1.5 duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] fade-in-0 zoom-in-96 fill-mode-both motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <Icon
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className={cn(
          "flex-none",
          status === "success" && "text-success",
          pending &&
            "animate-[spin_900ms_linear_infinite] text-subtle-foreground motion-reduce:animate-none",
        )}
      />
      <span className={pending ? "shimmer-text motion-reduce:text-inherit!" : undefined}>
        {children}
      </span>
    </span>
  );
}
