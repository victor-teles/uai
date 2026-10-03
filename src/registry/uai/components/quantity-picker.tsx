"use client";

import { cva } from "class-variance-authority";
import { Minus, Plus } from "lucide-react";
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

export const QUANTITY_PICKER_VARIANTS = ["rounded", "pill", "compact"] as const;

export type QuantityPickerVariant = (typeof QUANTITY_PICKER_VARIANTS)[number];

export type QuantityPickerProps = ComponentProps<"div"> & {
  variant?: QuantityPickerVariant;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

function quantityPickerChrome(variant: QuantityPickerVariant) {
  const compact = variant === "compact";
  const pill = variant === "pill";

  return {
    labelClass: compact ? "mb-1 text-[11.5px] leading-4" : "mb-1.5 text-[12px] leading-4",
    controlClass: compact ? "gap-0.5 p-0.5" : "gap-1 p-1",
    controlRadius: pill ? "rounded-full" : compact ? "rounded-xl" : "rounded-[14px]",
    buttonClass: compact ? "size-7" : "size-8",
    buttonRadius: pill ? "rounded-full" : compact ? "rounded-lg" : "rounded-[10px]",
    inputClass: compact
      ? "h-7 w-10 text-[12.5px] leading-4"
      : "h-8 w-12 text-[13px] leading-[18px]",
    messageClass: compact ? "mt-1.5 text-[11px] leading-4" : "mt-2 text-[11.5px] leading-4",
    iconClass: compact ? "size-3" : "size-3.5",
  };
}

function normalizeQuantity(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function addQuantity(value: number, delta: number) {
  return Number((value + delta).toFixed(10));
}

function validateQuantityRange(min: number, max: number, step: number) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error("QuantityPicker min and max must be finite numbers");
  }
  if (max < min) throw new Error("QuantityPicker max must be greater than or equal to min");
  if (!Number.isFinite(step) || step <= 0) {
    throw new Error("QuantityPicker step must be a finite number greater than zero");
  }
}

type QuantityPickerContextValue = {
  draft: string;
  setDraft: (value: string) => void;
  beginEditing: () => void;
  commitDraft: () => void;
  resetDraft: () => void;
  decrease: () => void;
  increase: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
  disabled: boolean;
  min: number;
  max: number;
  step: number;
  inputId: string;
  labelId: string;
  messageId: string;
  chrome: ReturnType<typeof quantityPickerChrome>;
};

const QuantityPickerContext = createContext<QuantityPickerContextValue | null>(null);

function useQuantityPicker(name: string) {
  const context = useContext(QuantityPickerContext);
  if (!context) throw new Error(`${name} must be used within QuantityPicker`);
  return context;
}

const quantityPickerVariants = cva("inline-grid max-w-full text-foreground", {
  variants: { variant: { rounded: "", pill: "", compact: "" } },
});

export function QuantityPicker({
  variant = "rounded",
  value,
  defaultValue = 1,
  onValueChange,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  children,
  className,
  ...props
}: QuantityPickerProps) {
  validateQuantityRange(min, max, step);

  const inputId = useId();
  const labelId = useId();
  const messageId = useId();
  const chrome = quantityPickerChrome(variant);
  const [internalValue, setInternalValue] = useState(() =>
    normalizeQuantity(defaultValue, min, max),
  );
  const quantity = normalizeQuantity(value ?? internalValue, min, max);
  const [draft, setDraft] = useState(String(quantity));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(String(quantity));
  }, [editing, quantity]);

  const setQuantity = (nextValue: number) => {
    const normalizedValue = normalizeQuantity(nextValue, min, max);
    setDraft(String(normalizedValue));
    if (value === undefined) setInternalValue(normalizedValue);
    if (normalizedValue !== quantity) onValueChange?.(normalizedValue);
  };

  const context: QuantityPickerContextValue = {
    draft,
    setDraft,
    beginEditing: () => {
      setDraft(String(quantity));
      setEditing(true);
    },
    commitDraft: () => {
      setEditing(false);
      const parsedValue = Number(draft);
      if (draft.trim() === "" || !Number.isFinite(parsedValue)) {
        setDraft(String(quantity));
        return;
      }
      setQuantity(parsedValue);
    },
    resetDraft: () => setDraft(String(quantity)),
    decrease: () => setQuantity(addQuantity(quantity, -step)),
    increase: () => setQuantity(addQuantity(quantity, step)),
    canDecrease: !disabled && quantity > min,
    canIncrease: !disabled && quantity < max,
    disabled,
    min,
    max,
    step,
    inputId,
    labelId,
    messageId,
    chrome,
  };

  return (
    <QuantityPickerContext.Provider value={context}>
      <div
        data-slot="quantity-picker"
        data-variant={variant}
        data-disabled={disabled || undefined}
        className={cn(quantityPickerVariants({ variant }), disabled && "opacity-55", className)}
        {...props}
      >
        {children}
      </div>
    </QuantityPickerContext.Provider>
  );
}

export type QuantityPickerLabelProps = ComponentProps<"label">;

export function QuantityPickerLabel({
  children = "Quantity",
  className,
  ...props
}: QuantityPickerLabelProps) {
  const context = useQuantityPicker("QuantityPickerLabel");

  return (
    <label
      data-slot="quantity-picker-label"
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

export type QuantityPickerControlProps = ComponentProps<"div">;

export function QuantityPickerControl({
  children,
  className,
  ...props
}: QuantityPickerControlProps) {
  const context = useQuantityPicker("QuantityPickerControl");

  return (
    <div
      data-slot="quantity-picker-control"
      className={cn(
        "grid grid-cols-[auto_minmax(40px,1fr)_auto] items-center bg-muted transition-[background-color,box-shadow] duration-[120ms] ease-out focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)] motion-reduce:transition-none",
        context.chrome.controlClass,
        context.chrome.controlRadius,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type QuantityPickerButtonProps = ComponentProps<"button">;

type QuantityPickerStepButtonProps = QuantityPickerButtonProps & {
  direction: "decrease" | "increase";
};

function QuantityPickerStepButton({
  direction,
  children,
  className,
  disabled,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: QuantityPickerStepButtonProps) {
  const context = useQuantityPicker(
    direction === "decrease" ? "QuantityPickerDecrease" : "QuantityPickerIncrease",
  );
  const decreasing = direction === "decrease";
  const isDisabled = disabled || (decreasing ? !context.canDecrease : !context.canIncrease);
  const Icon = decreasing ? Minus : Plus;
  const label = ariaLabel ?? (decreasing ? "Decrease quantity" : "Increase quantity");
  const changeQuantity = decreasing ? context.decrease : context.increase;

  return (
    <button
      type="button"
      data-slot={decreasing ? "quantity-picker-decrease" : "quantity-picker-increase"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-transparent text-muted-foreground transition-[scale,background-color,color] duration-[140ms] ease-out-quint hover:bg-foreground/8 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.94] disabled:cursor-not-allowed disabled:bg-transparent disabled:text-subtle-foreground/55 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100",
        context.chrome.buttonClass,
        context.chrome.buttonRadius,
        className,
      )}
      {...props}
      disabled={isDisabled}
      aria-label={label}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) changeQuantity();
      }}
    >
      {children ?? (
        <Icon className={context.chrome.iconClass} strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
}

export function QuantityPickerDecrease(props: QuantityPickerButtonProps) {
  return <QuantityPickerStepButton {...props} direction="decrease" />;
}

export type QuantityPickerInputProps = Omit<
  ComponentProps<"input">,
  "defaultValue" | "max" | "min" | "onChange" | "step" | "type" | "value"
>;

export function QuantityPickerInput({
  className,
  disabled,
  onBlur,
  onFocus,
  onKeyDown,
  ...props
}: QuantityPickerInputProps) {
  const context = useQuantityPicker("QuantityPickerInput");
  const isDisabled = context.disabled || disabled;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;

    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      context.resetDraft();
      event.currentTarget.select();
    }
  };

  return (
    <input
      data-slot="quantity-picker-input"
      className={cn(
        "min-w-0 appearance-none bg-transparent text-center font-medium tabular-nums outline-none selection:bg-primary/32 selection:text-foreground focus-visible:outline-none disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        context.chrome.inputClass,
        className,
      )}
      {...props}
      id={context.inputId}
      type="number"
      value={context.draft}
      min={context.min}
      max={context.max}
      step={context.step}
      inputMode={context.step % 1 === 0 ? "numeric" : "decimal"}
      disabled={isDisabled}
      aria-labelledby={context.labelId}
      aria-describedby={context.messageId}
      onChange={(event) => context.setDraft(event.target.value)}
      onFocus={(event) => {
        onFocus?.(event);
        context.beginEditing();
        event.currentTarget.select();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        context.commitDraft();
      }}
      onKeyDown={handleKeyDown}
    />
  );
}

export function QuantityPickerIncrease(props: QuantityPickerButtonProps) {
  return <QuantityPickerStepButton {...props} direction="increase" />;
}

export const QUANTITY_PICKER_MESSAGE_TONES = ["muted", "warning", "danger"] as const;

export type QuantityPickerMessageTone = (typeof QUANTITY_PICKER_MESSAGE_TONES)[number];

export type QuantityPickerMessageProps = ComponentProps<"p"> & {
  tone?: QuantityPickerMessageTone;
};

const quantityPickerMessageToneClass: Record<QuantityPickerMessageTone, string> = {
  muted: "text-subtle-foreground",
  warning: "text-warning",
  danger: "text-destructive",
};

export function QuantityPickerMessage({
  tone = "muted",
  children,
  className,
  ...props
}: QuantityPickerMessageProps) {
  const context = useQuantityPicker("QuantityPickerMessage");

  return (
    <p
      data-slot="quantity-picker-message"
      data-tone={tone}
      className={cn(context.chrome.messageClass, quantityPickerMessageToneClass[tone], className)}
      {...props}
      id={context.messageId}
    >
      {children}
    </p>
  );
}
