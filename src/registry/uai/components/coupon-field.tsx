"use client";

import { cva } from "class-variance-authority";
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
    controlRadius: pill ? "rounded-full" : compact ? "rounded-xl" : "rounded-[14px]",
    inputClass: compact
      ? "h-7 px-2 text-[12.5px] leading-4"
      : "h-8 px-2.5 text-[13px] leading-[18px]",
    applyClass: compact
      ? "h-7 min-w-[64px] px-3 text-[12px] leading-4"
      : "h-8 min-w-[76px] px-3.5 text-[12.5px] leading-4",
    applyRadius: "rounded-full",
    feedbackClass: compact
      ? "mt-1.5 min-h-6 gap-1.5 px-0.5 text-[11.5px] leading-4"
      : "mt-2 min-h-7 gap-2 px-1 text-[12px] leading-4",
    removeClass: compact ? "-mt-0.5 h-[22px] px-1.5" : "-mt-1 h-6 px-2",
    iconClass: compact ? "size-3" : "size-3.5",
  };
}

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

const couponFieldVariants = cva("w-full text-foreground", {
  variants: { variant: { rounded: "", pill: "", compact: "" } },
});

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
        data-slot="coupon-field"
        data-variant={variant}
        data-status={status}
        className={cn(couponFieldVariants({ variant }), disabled && "opacity-55", className)}
        {...props}
        aria-busy={status === "applying"}
      >
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
      data-slot="coupon-field-label"
      className={cn(
        "block font-medium text-muted-foreground",
        context.chrome.labelClass,
        className,
      )}
      {...props}
      id={context.labelId}
      htmlFor={context.inputId}
    >
      {children}
    </label>
  );
}

export type CouponFieldControlProps = ComponentProps<"div">;

export function CouponFieldControl({ children, className, ...props }: CouponFieldControlProps) {
  const context = useCouponField("CouponFieldControl");

  return (
    <div
      data-slot="coupon-field-control"
      className={cn(
        "flex min-w-0 items-center border bg-card transition-[border-color,box-shadow] duration-[120ms] ease-out hover:border-border-strong focus-within:border-border-strong focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)] motion-reduce:transition-none",
        context.chrome.controlClass,
        context.chrome.controlRadius,
        context.status === "error"
          ? "border-[color-mix(in_oklab,var(--destructive)_70%,var(--border))] hover:border-destructive focus-within:border-destructive"
          : context.status === "applied"
            ? "border-[color-mix(in_oklab,var(--success)_45%,var(--border))]"
            : "border-border",
        className,
      )}
      {...props}
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
      data-slot="coupon-field-input"
      className={cn(
        "min-w-0 flex-1 bg-transparent font-medium tracking-[0.04em] uppercase outline-none placeholder:font-normal placeholder:tracking-normal placeholder:normal-case placeholder:text-subtle-foreground disabled:cursor-not-allowed",
        context.chrome.inputClass,
        className,
      )}
      {...props}
      id={context.inputId}
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
      type="button"
      data-slot="coupon-field-apply"
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 font-medium transition-[scale,background-color,color,filter] duration-[140ms] ease-out-quint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
        context.chrome.applyClass,
        context.chrome.applyRadius,
        isApplying
          ? "cursor-progress bg-primary text-primary-foreground opacity-80"
          : isDisabled
            ? "cursor-not-allowed bg-secondary text-subtle-foreground"
            : "bg-primary text-primary-foreground hover:brightness-[1.08] active:scale-[0.97] motion-reduce:active:scale-100",
        className,
      )}
      {...props}
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
      data-slot="coupon-field-feedback"
      className={cn(
        "flex animate-in items-start duration-240 ease-out-quint fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none",
        context.chrome.feedbackClass,
        isError ? "text-destructive" : "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {isError ? (
        <CircleAlert
          className={cn("mt-px shrink-0", context.chrome.iconClass)}
          aria-hidden="true"
        />
      ) : isApplied ? (
        <CheckCircle2
          className={cn("mt-px shrink-0 text-success", context.chrome.iconClass)}
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
      data-slot="coupon-field-message"
      className={cn(
        "min-w-0 flex-1",
        context.status === "applying" && "shimmer-text motion-reduce:text-muted-foreground",
        context.status === "applied" && "text-foreground",
        className,
      )}
      {...props}
      id={context.feedbackId}
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
      type="button"
      data-slot="coupon-field-remove"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full text-[11.5px] font-medium text-subtle-foreground transition-[color,background-color,scale] duration-[120ms] ease-out hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] disabled:cursor-not-allowed motion-reduce:transition-none motion-reduce:active:scale-100",
        context.chrome.removeClass,
        className,
      )}
      {...props}
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
