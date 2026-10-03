"use client";

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
    controlRadius: pill ? 999 : compact ? 12 : 14,
    buttonClass: compact ? "size-7" : "size-8",
    buttonRadius: pill ? 999 : compact ? 8 : 10,
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
        {...props}
        className={cn(
          "inline-grid max-w-full text-[var(--uai-text)]",
          disabled && "opacity-55",
          className,
        )}
        data-variant={variant}
        data-disabled={disabled || undefined}
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

export type QuantityPickerControlProps = ComponentProps<"div">;

export function QuantityPickerControl({
  children,
  className,
  style,
  ...props
}: QuantityPickerControlProps) {
  const context = useQuantityPicker("QuantityPickerControl");

  return (
    <div
      {...props}
      className={cn(
        "grid grid-cols-[auto_minmax(40px,1fr)_auto] items-center bg-[var(--uai-surface-raised)] transition-[background-color,box-shadow] duration-[120ms] ease-out focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--uai-accent)_18%,transparent)] motion-reduce:transition-none",
        context.chrome.controlClass,
        className,
      )}
      style={{ ...style, borderRadius: context.chrome.controlRadius }}
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
  style,
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
      {...props}
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-transparent text-[var(--uai-muted)] transition-[transform,background-color,color] duration-[140ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--uai-text)_8%,transparent)] hover:text-[var(--uai-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] active:scale-[0.94] disabled:cursor-not-allowed disabled:bg-transparent disabled:text-[color-mix(in_oklab,var(--uai-subtle)_55%,transparent)] disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100",
        context.chrome.buttonClass,
        className,
      )}
      style={{ ...style, borderRadius: context.chrome.buttonRadius }}
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
  style,
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
      {...props}
      id={context.inputId}
      type="number"
      className={cn(
        "min-w-0 appearance-none bg-transparent text-center font-medium tabular-nums outline-none selection:bg-[color-mix(in_oklab,var(--uai-accent)_32%,transparent)] selection:text-[var(--uai-text)] focus-visible:outline-none disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        context.chrome.inputClass,
        className,
      )}
      style={{ ...style, outline: "none" }}
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
  muted: "text-[var(--uai-subtle)]",
  warning: "text-[var(--uai-warning)]",
  danger: "text-[var(--uai-danger)]",
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
      {...props}
      id={context.messageId}
      className={cn(context.chrome.messageClass, quantityPickerMessageToneClass[tone], className)}
    >
      {children}
    </p>
  );
}
