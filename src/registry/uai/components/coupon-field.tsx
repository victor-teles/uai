"use client";

import { CheckCircle2, CircleAlert, LoaderCircle, X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";

import { cn } from "@/lib/uai-utils";

export const COUPON_FIELD_STATUSES = ["idle", "applying", "applied", "error"] as const;
export const COUPON_FIELD_VARIANTS = ["rounded", "pill", "compact"] as const;

export type CouponFieldStatus = (typeof COUPON_FIELD_STATUSES)[number];
export type CouponFieldVariant = (typeof COUPON_FIELD_VARIANTS)[number];

export type CouponFieldProps = Omit<ComponentProps<"div">, "onChange"> & {
  variant?: CouponFieldVariant;
  status?: CouponFieldStatus;
  appliedCode?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onApply?: (code: string) => void;
  disabled?: boolean;
};

function couponFieldChrome(variant: CouponFieldVariant) {
  const compact = variant === "compact";
  const pill = variant === "pill";

  return {
    labelClass: compact ? "mb-1 text-[11.5px] leading-4" : "mb-1.5 text-[12px] leading-4",
    controlClass: compact ? "gap-0.5 p-0.5" : "gap-1 p-1",
    controlRadius: pill ? 999 : compact ? 12 : 14,
    inputClass: compact
      ? "h-7 px-2 text-[12.5px] leading-4"
      : "h-8 px-2.5 text-[13px] leading-[18px]",
    applyClass: compact
      ? "h-7 min-w-[64px] px-3 text-[12px] leading-4"
      : "h-8 min-w-[76px] px-3.5 text-[12.5px] leading-4",
    applyRadius: 999,
    feedbackClass: compact
      ? "mt-1.5 min-h-6 gap-1.5 px-0.5 text-[11.5px] leading-4"
      : "mt-2 min-h-7 gap-2 px-1 text-[12px] leading-4",
    removeClass: compact ? "-mt-0.5 h-[22px] px-1.5" : "-mt-1 h-6 px-2",
    iconClass: compact ? "size-3" : "size-3.5",
  };
}

const couponFieldMotionCss = `
@keyframes uai-coupon-field-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes uai-coupon-field-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
.uai-coupon-field-feedback{animation:uai-coupon-field-in 240ms cubic-bezier(0.23,1,0.32,1) both}
.uai-coupon-field-shimmer{background-image:linear-gradient(90deg,var(--uai-subtle) 0%,var(--uai-subtle) 35%,var(--uai-text) 50%,var(--uai-subtle) 65%,var(--uai-subtle) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:uai-coupon-field-shimmer 2s linear infinite}
@media (prefers-reduced-motion: reduce){.uai-coupon-field-feedback,.uai-coupon-field-shimmer{animation:none}.uai-coupon-field-shimmer{background-image:none;color:var(--uai-muted)}}
`;

type CouponFieldContextValue = {
  status: CouponFieldStatus;
  appliedCode?: string;
  draft: string;
  setDraft: (value: string) => void;
  apply: () => void;
  clear: () => void;
  canApply: boolean;
  isReplacing: boolean;
  disabled: boolean;
  inputId: string;
  labelId: string;
  feedbackId: string;
  chrome: ReturnType<typeof couponFieldChrome>;
};

const CouponFieldContext = createContext<CouponFieldContextValue | null>(null);

function useCouponField(name: string) {
  const context = useContext(CouponFieldContext);
  if (!context) throw new Error(`${name} must be used within CouponField`);
  return context;
}

export function CouponField({
  variant = "rounded",
  status = "idle",
  appliedCode,
  defaultValue = "",
  value,
  onValueChange,
  onApply,
  disabled = false,
  children,
  className,
  ...props
}: CouponFieldProps) {
  const inputId = useId();
  const labelId = useId();
  const feedbackId = useId();
  const chrome = couponFieldChrome(variant);
  const [internalValue, setInternalValue] = useState(defaultValue || appliedCode || "");
  const draft = value ?? internalValue;
  const normalizedDraft = draft.trim();
  const normalizedAppliedCode = appliedCode?.trim();
  const isReplacing = Boolean(
    normalizedAppliedCode && normalizedDraft && normalizedDraft !== normalizedAppliedCode,
  );
  const canApply = Boolean(
    normalizedDraft &&
      status !== "applying" &&
      !disabled &&
      normalizedDraft !== normalizedAppliedCode,
  );

  useEffect(() => {
    if (value === undefined && status === "applied" && appliedCode !== undefined) {
      setInternalValue(appliedCode);
    }
  }, [appliedCode, status, value]);

  const setDraft = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  const context: CouponFieldContextValue = {
    status,
    appliedCode,
    draft,
    setDraft,
    apply: () => {
      if (canApply) onApply?.(normalizedDraft);
    },
    clear: () => setDraft(""),
    canApply,
    isReplacing,
    disabled,
    inputId,
    labelId,
    feedbackId,
    chrome,
  };

  return (
    <CouponFieldContext.Provider value={context}>
      <div
        {...props}
        className={cn("w-full text-[var(--uai-text)]", disabled && "opacity-55", className)}
        data-variant={variant}
        data-status={status}
        aria-busy={status === "applying"}
      >
        <style>{couponFieldMotionCss}</style>
        {children}
      </div>
    </CouponFieldContext.Provider>
  );
}

export type CouponFieldLabelProps = ComponentProps<"label">;

export function CouponFieldLabel({
  children = "Coupon code",
  className,
  ...props
}: CouponFieldLabelProps) {
  const context = useCouponField("CouponFieldLabel");

  return (
    <label
      {...props}
      id={context.labelId}
      htmlFor={context.inputId}
      className={cn(
        "block font-medium text-[var(--uai-muted)]",
        context.chrome.labelClass,
        className,
      )}
    >
      {children}
    </label>
  );
}

export type CouponFieldControlProps = ComponentProps<"div">;

export function CouponFieldControl({
  children,
  className,
  style,
  ...props
}: CouponFieldControlProps) {
  const context = useCouponField("CouponFieldControl");

  return (
    <div
      {...props}
      className={cn(
        "flex min-w-0 items-center border bg-[var(--uai-surface)] transition-[border-color,box-shadow] duration-[120ms] ease-out hover:border-[var(--uai-border-strong)] focus-within:border-[var(--uai-border-strong)] focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--uai-accent)_18%,transparent)] motion-reduce:transition-none",
        context.chrome.controlClass,
        context.status === "error"
          ? "border-[color-mix(in_oklab,var(--uai-danger)_70%,var(--uai-border))] hover:border-[var(--uai-danger)] focus-within:border-[var(--uai-danger)]"
          : context.status === "applied"
            ? "border-[color-mix(in_oklab,var(--uai-success)_45%,var(--uai-border))]"
            : "border-[var(--uai-border)]",
        className,
      )}
      style={{ ...style, borderRadius: context.chrome.controlRadius }}
    >
      {children}
    </div>
  );
}

export type CouponFieldInputProps = Omit<
  ComponentProps<"input">,
  "defaultValue" | "onChange" | "value"
>;

export function CouponFieldInput({
  className,
  disabled,
  style,
  onKeyDown,
  ...props
}: CouponFieldInputProps) {
  const context = useCouponField("CouponFieldInput");
  const isDisabled = context.disabled || disabled;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (
      !event.defaultPrevented &&
      event.key === "Enter" &&
      !event.nativeEvent.isComposing &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey
    ) {
      event.preventDefault();
      context.apply();
    }
  };

  return (
    <input
      {...props}
      id={context.inputId}
      className={cn(
        "min-w-0 flex-1 bg-transparent font-medium tracking-[0.04em] uppercase outline-none placeholder:font-normal placeholder:tracking-normal placeholder:normal-case placeholder:text-[var(--uai-subtle)] disabled:cursor-not-allowed",
        context.chrome.inputClass,
        className,
      )}
      style={{ ...style, outline: "none" }}
      value={context.draft}
      onChange={(event) => context.setDraft(event.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Enter code"
      autoCapitalize="characters"
      autoComplete="off"
      spellCheck={false}
      disabled={isDisabled}
      aria-invalid={context.status === "error"}
      aria-labelledby={context.labelId}
      aria-describedby={context.feedbackId}
    />
  );
}

export type CouponFieldApplyProps = ComponentProps<"button">;

export function CouponFieldApply({
  children,
  className,
  style,
  disabled,
  onClick,
  ...props
}: CouponFieldApplyProps) {
  const context = useCouponField("CouponFieldApply");
  const isApplying = context.status === "applying";
  const isDisabled = context.disabled || disabled || !context.canApply;
  const label = isApplying ? "Applying…" : context.isReplacing ? "Replace" : "Apply";

  return (
    <button
      {...props}
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 font-medium transition-[transform,background-color,color,filter] duration-[140ms] ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] motion-reduce:transition-none",
        context.chrome.applyClass,
        isApplying
          ? "cursor-progress bg-[var(--uai-accent)] text-[var(--uai-accent-foreground)] opacity-80"
          : isDisabled
            ? "cursor-not-allowed bg-[var(--uai-surface-raised)] text-[var(--uai-subtle)]"
            : "bg-[var(--uai-accent)] text-[var(--uai-accent-foreground)] hover:brightness-[1.08] active:scale-[0.97] motion-reduce:active:scale-100",
        className,
      )}
      style={{ ...style, borderRadius: context.chrome.applyRadius }}
      disabled={isDisabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.apply();
      }}
    >
      {isApplying ? (
        <LoaderCircle
          className={cn(context.chrome.iconClass, "animate-spin motion-reduce:animate-none")}
          aria-hidden="true"
        />
      ) : null}
      {children ?? label}
    </button>
  );
}

export type CouponFieldFeedbackProps = ComponentProps<"div">;

export function CouponFieldFeedback({ children, className, ...props }: CouponFieldFeedbackProps) {
  const context = useCouponField("CouponFieldFeedback");
  const isError = context.status === "error";
  const isApplied = context.status === "applied";
  const isApplying = context.status === "applying";

  if (context.status === "idle" && !children) return null;

  return (
    <div
      {...props}
      className={cn(
        "uai-coupon-field-feedback flex items-start",
        context.chrome.feedbackClass,
        isError ? "text-[var(--uai-danger)]" : "text-[var(--uai-muted)]",
        className,
      )}
    >
      {isError ? (
        <CircleAlert
          className={cn("mt-px shrink-0", context.chrome.iconClass)}
          aria-hidden="true"
        />
      ) : isApplied ? (
        <CheckCircle2
          className={cn("mt-px shrink-0 text-[var(--uai-success)]", context.chrome.iconClass)}
          aria-hidden="true"
        />
      ) : isApplying ? (
        <LoaderCircle
          className={cn(
            "mt-px shrink-0 animate-spin motion-reduce:animate-none",
            context.chrome.iconClass,
          )}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </div>
  );
}

export type CouponFieldMessageProps = ComponentProps<"span">;

export function CouponFieldMessage({ children, className, ...props }: CouponFieldMessageProps) {
  const context = useCouponField("CouponFieldMessage");
  const isError = context.status === "error";
  const isStatus = context.status === "applied" || context.status === "applying";

  return (
    <span
      {...props}
      id={context.feedbackId}
      className={cn(
        "min-w-0 flex-1",
        context.status === "applying" && "uai-coupon-field-shimmer",
        context.status === "applied" && "text-[var(--uai-text)]",
        className,
      )}
      role={isError ? "alert" : isStatus ? "status" : undefined}
      aria-live={isError ? "assertive" : isStatus ? "polite" : undefined}
      aria-atomic="true"
    >
      {children}
    </span>
  );
}

export type CouponFieldRemoveProps = ComponentProps<"button">;

export function CouponFieldRemove({
  children = "Remove",
  className,
  onClick,
  ...props
}: CouponFieldRemoveProps) {
  const context = useCouponField("CouponFieldRemove");
  if (!context.appliedCode) return null;

  return (
    <button
      {...props}
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full text-[11.5px] font-medium text-[var(--uai-subtle)] transition-[color,background-color,transform] duration-[120ms] ease-out hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] active:scale-[0.97] disabled:cursor-not-allowed motion-reduce:transition-none motion-reduce:active:scale-100",
        context.chrome.removeClass,
        className,
      )}
      disabled={context.disabled || context.status === "applying" || props.disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.clear();
      }}
    >
      <X className={context.chrome.iconClass} aria-hidden="true" />
      {children}
    </button>
  );
}
