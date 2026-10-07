"use client";

import { cva } from "class-variance-authority";
import { CircleAlert, LoaderCircle, MapPin, Search } from "lucide-react";
import {
  type ChangeEvent,
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/uai-utils";

export const CEP_FIELD_VARIANTS = ["rounded", "pill", "compact"] as const;
export const CEP_FIELD_STATUSES = ["idle", "loading", "found", "not-found", "error"] as const;

export type CepFieldVariant = (typeof CEP_FIELD_VARIANTS)[number];
export type CepFieldStatus = (typeof CEP_FIELD_STATUSES)[number];

const CEP_LENGTH = 8;

export function normalizeCep(value: string) {
  return value.replace(/\D/g, "").slice(0, CEP_LENGTH);
}

export function formatCep(value: string) {
  const digits = normalizeCep(value);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export type CepFieldProps = Omit<ComponentProps<"div">, "onChange" | "defaultValue"> & {
  variant?: CepFieldVariant;
  /** Lookup state owned by the application that resolves the address. */
  status?: CepFieldStatus;
  /** Unmasked digits. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Runs once when eight digits are entered, and again on Enter or the lookup button. */
  onLookup?: (cep: string) => void;
  disabled?: boolean;
};

function cepFieldChrome(variant: CepFieldVariant) {
  const compact = variant === "compact";
  return {
    labelClass: compact ? "mb-1 text-[11.5px] leading-4" : "mb-1.5 text-[12px] leading-4",
    controlClass: cn(
      compact ? "gap-0.5 p-0.5 pl-2" : "gap-1 p-1 pl-2.5",
      variant === "pill" ? "rounded-full" : compact ? "rounded-xl" : "rounded-[14px]",
    ),
    inputClass: compact
      ? "h-7 px-1.5 text-[12.5px] leading-4 md:text-[12.5px]"
      : "h-8 px-2 text-[13px] leading-[18px] md:text-[13px]",
    buttonClass: compact
      ? "h-7 px-2.5 text-[12px] has-[>svg]:px-2.5"
      : "h-8 px-3.5 text-[12.5px] has-[>svg]:px-3.5",
    messageClass: compact
      ? "mt-1.5 gap-1.5 px-0.5 text-[11.5px] leading-4"
      : "mt-2 gap-2 px-1 text-[12px] leading-4",
    addressClass: compact ? "mt-1.5 rounded-[10px] p-2.5" : "mt-2 rounded-xl p-3",
    iconClass: compact ? "size-3" : "size-3.5",
  };
}

type CepFieldContextValue = {
  value: string;
  status: CepFieldStatus;
  disabled: boolean;
  complete: boolean;
  setValue: (value: string) => void;
  lookup: () => void;
  inputId: string;
  messageId: string;
  chrome: ReturnType<typeof cepFieldChrome>;
};

const CepFieldContext = createContext<CepFieldContextValue | null>(null);

function useCepField(name: string) {
  const context = useContext(CepFieldContext);
  if (!context) throw new Error(`${name} must be used within CepField`);
  return context;
}

const cepFieldVariants = cva("w-full text-foreground", {
  variants: { variant: { rounded: "", pill: "", compact: "" } },
});

export function CepField({
  variant = "rounded",
  status = "idle",
  value,
  defaultValue = "",
  onValueChange,
  onLookup,
  disabled = false,
  children,
  className,
  ...props
}: CepFieldProps) {
  const inputId = useId();
  const messageId = useId();
  const [internalValue, setInternalValue] = useState(() => normalizeCep(defaultValue));
  const lastLookup = useRef<string | null>(null);
  const current = normalizeCep(value ?? internalValue);
  const complete = current.length === CEP_LENGTH;

  const lookup = (cep = current, force = true) => {
    if (cep.length !== CEP_LENGTH || disabled || status === "loading") return;
    if (!force && lastLookup.current === cep) return;
    lastLookup.current = cep;
    onLookup?.(cep);
  };

  const setValue = (raw: string) => {
    const next = normalizeCep(raw);
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
    if (next.length < CEP_LENGTH) lastLookup.current = null;
    lookup(next, false);
  };

  return (
    <CepFieldContext.Provider
      value={{
        value: current,
        status,
        disabled,
        complete,
        setValue,
        lookup: () => lookup(),
        inputId,
        messageId,
        chrome: cepFieldChrome(variant),
      }}
    >
      <div
        data-slot="cep-field"
        data-variant={variant}
        data-status={status}
        className={cn(cepFieldVariants({ variant }), disabled && "opacity-55", className)}
        {...props}
        aria-busy={status === "loading"}
      >
        {children}
      </div>
    </CepFieldContext.Provider>
  );
}

export type CepFieldLabelProps = ComponentProps<"label">;

export function CepFieldLabel({ children = "CEP", className, ...props }: CepFieldLabelProps) {
  const context = useCepField("CepFieldLabel");
  return (
    <Label
      data-slot="cep-field-label"
      className={cn(
        "block font-medium text-muted-foreground select-auto",
        context.chrome.labelClass,
        className,
      )}
      {...props}
      htmlFor={context.inputId}
    >
      {children}
    </Label>
  );
}

export type CepFieldControlProps = ComponentProps<"div">;

export function CepFieldControl({ children, className, ...props }: CepFieldControlProps) {
  const context = useCepField("CepFieldControl");
  const failed = context.status === "not-found" || context.status === "error";
  const found = context.status === "found";
  return (
    <div
      data-slot="cep-field-control"
      className={cn(
        "flex min-w-0 items-center border bg-card transition-[border-color,box-shadow] duration-[120ms] ease-out hover:border-border-strong focus-within:border-border-strong focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)] motion-reduce:transition-none",
        context.chrome.controlClass,
        failed
          ? "border-destructive/70 hover:border-destructive focus-within:border-destructive"
          : found
            ? "border-[color-mix(in_oklab,var(--success)_45%,var(--border))]"
            : "border-border",
        className,
      )}
      {...props}
    >
      <MapPin
        className={cn(
          "shrink-0 transition-colors duration-200 ease-out motion-reduce:transition-none",
          found ? "text-success" : "text-subtle-foreground",
          context.chrome.iconClass,
        )}
        strokeWidth={1.9}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

export type CepFieldInputProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange"
>;

/** Maps a caret after `count` digits to its index in the formatted CEP. */
function caretAfter(formatted: string, count: number) {
  if (count === 0) return 0;
  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index] ?? "")) seen += 1;
    if (seen === count) return index + 1;
  }
  return formatted.length;
}

export function CepFieldInput({ className, disabled, onKeyDown, ...props }: CepFieldInputProps) {
  const context = useCepField("CepFieldInput");
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (pendingCaret.current === null || !input || document.activeElement !== input) return;
    const caret = caretAfter(input.value, pendingCaret.current);
    input.setSelectionRange(caret, caret);
    pendingCaret.current = null;
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = event.target;
    pendingCaret.current = normalizeCep(value.slice(0, selectionStart ?? value.length)).length;
    context.setValue(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      context.lookup();
    }
  };

  return (
    <Input
      inputMode="numeric"
      autoComplete="postal-code"
      placeholder="00000-000"
      data-slot="cep-field-input"
      className={cn(
        "min-w-0 flex-1 rounded-none border-0 bg-transparent py-0 font-medium tabular-nums shadow-none outline-none placeholder:font-normal placeholder:text-subtle-foreground focus-visible:ring-0 aria-invalid:ring-0 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-100 dark:bg-transparent",
        context.chrome.inputClass,
        className,
      )}
      {...props}
      ref={inputRef}
      id={context.inputId}
      value={formatCep(context.value)}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={context.disabled || disabled}
      aria-invalid={context.status === "not-found" || context.status === "error" || undefined}
      aria-describedby={context.messageId}
    />
  );
}

export type CepFieldLookupProps = ComponentProps<"button">;

export function CepFieldLookup({
  children,
  className,
  disabled,
  onClick,
  ...props
}: CepFieldLookupProps) {
  const context = useCepField("CepFieldLookup");
  const loading = context.status === "loading";
  return (
    <Button
      type="button"
      variant="secondary"
      data-slot="cep-field-lookup"
      className={cn(
        "shrink-0 gap-1.5 rounded-full bg-secondary py-0 font-medium text-secondary-foreground transition-[scale,background-color,color] duration-[140ms] ease-out-quint hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:text-subtle-foreground disabled:opacity-100 disabled:hover:bg-secondary motion-reduce:transition-none motion-reduce:active:scale-100",
        loading && "cursor-progress",
        context.chrome.buttonClass,
        className,
      )}
      {...props}
      disabled={context.disabled || disabled || !context.complete || loading}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.lookup();
      }}
    >
      {loading ? (
        <LoaderCircle
          className={cn(context.chrome.iconClass, "animate-spin motion-reduce:animate-none")}
          aria-hidden="true"
        />
      ) : (
        <Search className={context.chrome.iconClass} strokeWidth={2} aria-hidden="true" />
      )}
      {children ?? "Buscar"}
    </Button>
  );
}

const defaultMessages: Partial<Record<CepFieldStatus, string>> = {
  loading: "Buscando endereço…",
  "not-found": "Não encontramos esse CEP. Confira os números.",
  error: "Não foi possível buscar o CEP agora. Preencha o endereço abaixo.",
};

export type CepFieldMessageProps = ComponentProps<"p">;

/** A live region that speaks lookup progress and failures. */
export function CepFieldMessage({ children, className, ...props }: CepFieldMessageProps) {
  const context = useCepField("CepFieldMessage");
  const failed = context.status === "not-found" || context.status === "error";
  const content = children ?? defaultMessages[context.status];
  return (
    <p
      data-slot="cep-field-message"
      className={cn(
        "flex items-start empty:hidden",
        failed ? "text-destructive" : "text-muted-foreground",
        context.chrome.messageClass,
        className,
      )}
      {...props}
      id={context.messageId}
      role="status"
      aria-live="polite"
    >
      {content ? (
        <>
          {failed ? (
            <CircleAlert
              className={cn("mt-px shrink-0", context.chrome.iconClass)}
              aria-hidden="true"
            />
          ) : null}
          <span
            className={cn(
              "min-w-0 flex-1",
              context.status === "loading" && "shimmer-text motion-reduce:text-muted-foreground",
            )}
          >
            {content}
          </span>
        </>
      ) : null}
    </p>
  );
}

export type CepFieldAddressProps = ComponentProps<"address">;

/** Shows the resolved address once the lookup succeeds. */
export function CepFieldAddress({ className, ...props }: CepFieldAddressProps) {
  const context = useCepField("CepFieldAddress");
  if (context.status !== "found") return null;
  return (
    <address
      data-slot="cep-field-address"
      className={cn(
        "grid animate-in gap-0.5 bg-muted text-[12.5px] leading-[18px] text-muted-foreground not-italic duration-240 ease-out-quint fade-in-0 slide-in-from-top-1 motion-reduce:animate-none [&>:first-child]:font-medium [&>:first-child]:text-foreground",
        context.chrome.addressClass,
        className,
      )}
      {...props}
    />
  );
}
