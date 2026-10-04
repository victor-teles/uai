"use client";

import { cva } from "class-variance-authority";
import { CheckCircle2, CircleAlert } from "lucide-react";
import {
  type ChangeEvent,
  type ComponentProps,
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/uai-utils";

export const DOCUMENT_FIELD_VARIANTS = ["rounded", "pill", "compact"] as const;
export const DOCUMENT_FIELD_ACCEPTS = ["cpf", "cnpj", "any"] as const;

export type DocumentFieldVariant = (typeof DOCUMENT_FIELD_VARIANTS)[number];
export type DocumentFieldAccept = (typeof DOCUMENT_FIELD_ACCEPTS)[number];
export type DocumentKind = "cpf" | "cnpj";
export type DocumentFieldStatus = "empty" | "incomplete" | "valid" | "invalid";

const CPF_LENGTH = 11;
const CNPJ_LENGTH = 14;

/** Uppercases and strips punctuation. CNPJs issued from July 2026 may contain letters. */
export function normalizeDocument(value: string, accept: DocumentFieldAccept = "any") {
  const upper = value.toUpperCase();
  if (accept === "cpf") return upper.replace(/\D/g, "").slice(0, CPF_LENGTH);
  return upper.replace(/[^0-9A-Z]/g, "").slice(0, CNPJ_LENGTH);
}

export function detectDocumentKind(
  normalized: string,
  accept: DocumentFieldAccept = "any",
): DocumentKind {
  if (accept !== "any") return accept;
  return normalized.length > CPF_LENGTH || /[A-Z]/.test(normalized) ? "cnpj" : "cpf";
}

export function formatDocument(normalized: string, kind: DocumentKind) {
  const groups =
    kind === "cpf"
      ? [
          [0, 3, ""],
          [3, 6, "."],
          [6, 9, "."],
          [9, 11, "-"],
        ]
      : [
          [0, 2, ""],
          [2, 5, "."],
          [5, 8, "."],
          [8, 12, "/"],
          [12, 14, "-"],
        ];
  let formatted = "";
  for (const [start, end, separator] of groups as [number, number, string][]) {
    const part = normalized.slice(start, end);
    if (!part) break;
    formatted += separator + part;
  }
  return formatted;
}

function checkDigit(values: number[], weights: number[]) {
  const sum = values.reduce((total, value, index) => total + value * (weights[index] ?? 0), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== CPF_LENGTH || /^(\d)\1+$/.test(digits)) return false;
  const numbers = [...digits].map(Number);
  const first = checkDigit(numbers.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = checkDigit(numbers.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return numbers[9] === first && numbers[10] === second;
}

/** Validates numeric and alphanumeric CNPJs; letters count as their ASCII code minus 48. */
export function isValidCnpj(value: string) {
  const normalized = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (!/^[0-9A-Z]{12}\d{2}$/.test(normalized) || /^(.)\1+$/.test(normalized)) return false;
  const values = [...normalized].map((character) => character.charCodeAt(0) - 48);
  const weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const first = checkDigit(values.slice(0, 12), weights.slice(1));
  const second = checkDigit(values.slice(0, 13), weights);
  return values[12] === first && values[13] === second;
}

export function isValidDocument(value: string, kind: DocumentKind) {
  return kind === "cpf" ? isValidCpf(value) : isValidCnpj(value);
}

export type DocumentFieldDetails = {
  kind: DocumentKind;
  complete: boolean;
  valid: boolean;
};

export type DocumentFieldProps = Omit<ComponentProps<"div">, "onChange" | "defaultValue"> & {
  variant?: DocumentFieldVariant;
  accept?: DocumentFieldAccept;
  /** Unmasked value: digits, plus uppercase letters for alphanumeric CNPJs. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, details: DocumentFieldDetails) => void;
  /** Forces the invalid state, for example when the server rejects a valid number. */
  invalid?: boolean;
  disabled?: boolean;
};

function documentFieldChrome(variant: DocumentFieldVariant) {
  const compact = variant === "compact";
  return {
    labelClass: compact ? "mb-1 text-[11.5px] leading-4" : "mb-1.5 text-[12px] leading-4",
    controlClass: cn(
      compact ? "gap-1 py-0.5 pr-1 pl-0.5" : "gap-1.5 py-1 pr-1.5 pl-1",
      variant === "pill" ? "rounded-full" : compact ? "rounded-xl" : "rounded-[14px]",
    ),
    inputClass: compact
      ? "h-7 px-2 text-[12.5px] leading-4"
      : "h-8 px-2.5 text-[13px] leading-[18px]",
    kindClass: compact ? "h-5 px-1.5 text-[10.5px]" : "h-[22px] px-2 text-[11px]",
    messageClass: compact
      ? "mt-1.5 gap-1.5 px-0.5 text-[11.5px] leading-4"
      : "mt-2 gap-2 px-1 text-[12px] leading-4",
    iconClass: compact ? "size-3" : "size-3.5",
  };
}

type DocumentFieldContextValue = {
  accept: DocumentFieldAccept;
  value: string;
  kind: DocumentKind;
  status: DocumentFieldStatus;
  showInvalid: boolean;
  disabled: boolean;
  setValue: (value: string) => void;
  markTouched: () => void;
  inputId: string;
  descriptionId: string;
  errorId: string;
  chrome: ReturnType<typeof documentFieldChrome>;
};

const DocumentFieldContext = createContext<DocumentFieldContextValue | null>(null);

function useDocumentField(name: string) {
  const context = useContext(DocumentFieldContext);
  if (!context) throw new Error(`${name} must be used within DocumentField`);
  return context;
}

const documentFieldVariants = cva("w-full text-foreground", {
  variants: { variant: { rounded: "", pill: "", compact: "" } },
});

export function DocumentField({
  variant = "rounded",
  accept = "any",
  value,
  defaultValue = "",
  onValueChange,
  invalid = false,
  disabled = false,
  children,
  className,
  ...props
}: DocumentFieldProps) {
  const inputId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const [internalValue, setInternalValue] = useState(() => normalizeDocument(defaultValue, accept));
  const [touched, setTouched] = useState(false);
  const current = normalizeDocument(value ?? internalValue, accept);
  const kind = detectDocumentKind(current, accept);
  const complete = current.length === (kind === "cpf" ? CPF_LENGTH : CNPJ_LENGTH);
  const valid = complete && isValidDocument(current, kind);
  const status: DocumentFieldStatus = invalid
    ? "invalid"
    : !current
      ? "empty"
      : valid
        ? "valid"
        : complete
          ? "invalid"
          : "incomplete";
  const showInvalid = status === "invalid" || (touched && status === "incomplete");

  const setValue = (raw: string) => {
    const next = normalizeDocument(raw, accept);
    if (value === undefined) setInternalValue(next);
    const nextKind = detectDocumentKind(next, accept);
    const nextComplete = next.length === (nextKind === "cpf" ? CPF_LENGTH : CNPJ_LENGTH);
    onValueChange?.(next, {
      kind: nextKind,
      complete: nextComplete,
      valid: nextComplete && isValidDocument(next, nextKind),
    });
  };

  return (
    <DocumentFieldContext.Provider
      value={{
        accept,
        value: current,
        kind,
        status,
        showInvalid,
        disabled,
        setValue,
        markTouched: () => setTouched(true),
        inputId,
        descriptionId,
        errorId,
        chrome: documentFieldChrome(variant),
      }}
    >
      <div
        data-slot="document-field"
        data-variant={variant}
        data-status={status}
        data-kind={current ? kind : undefined}
        className={cn(documentFieldVariants({ variant }), disabled && "opacity-55", className)}
        {...props}
      >
        {children}
      </div>
    </DocumentFieldContext.Provider>
  );
}

const defaultLabels: Record<DocumentFieldAccept, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  any: "CPF ou CNPJ",
};

export type DocumentFieldLabelProps = ComponentProps<"label">;

export function DocumentFieldLabel({ children, className, ...props }: DocumentFieldLabelProps) {
  const context = useDocumentField("DocumentFieldLabel");
  return (
    <label
      data-slot="document-field-label"
      className={cn(
        "block font-medium text-muted-foreground",
        context.chrome.labelClass,
        className,
      )}
      {...props}
      htmlFor={context.inputId}
    >
      {children ?? defaultLabels[context.accept]}
    </label>
  );
}

export type DocumentFieldControlProps = ComponentProps<"div">;

export function DocumentFieldControl({ children, className, ...props }: DocumentFieldControlProps) {
  const context = useDocumentField("DocumentFieldControl");
  return (
    <div
      data-slot="document-field-control"
      className={cn(
        "flex min-w-0 items-center border bg-card transition-[border-color,box-shadow] duration-[120ms] ease-out hover:border-border-strong focus-within:border-border-strong focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)] motion-reduce:transition-none",
        context.chrome.controlClass,
        context.showInvalid
          ? "border-destructive/70 hover:border-destructive focus-within:border-destructive"
          : context.status === "valid"
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

/** Maps a caret after `count` value characters to its index in the formatted string. */
function caretAfter(formatted: string, count: number) {
  if (count === 0) return 0;
  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    if (/[0-9A-Z]/.test(formatted[index] ?? "")) seen += 1;
    if (seen === count) return index + 1;
  }
  return formatted.length;
}

export type DocumentFieldInputProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange"
>;

export function DocumentFieldInput({
  className,
  disabled,
  onBlur,
  ...props
}: DocumentFieldInputProps) {
  const context = useDocumentField("DocumentFieldInput");
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);
  const formatted = formatDocument(context.value, context.kind);
  const describedBy = [context.descriptionId, context.showInvalid ? context.errorId : null]
    .filter(Boolean)
    .join(" ");

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (pendingCaret.current === null || !input || document.activeElement !== input) return;
    const caret = caretAfter(input.value, pendingCaret.current);
    input.setSelectionRange(caret, caret);
    pendingCaret.current = null;
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = event.target;
    pendingCaret.current = normalizeDocument(
      value.slice(0, selectionStart ?? value.length),
      context.accept,
    ).length;
    context.setValue(value);
  };

  return (
    <input
      inputMode={context.accept === "cpf" ? "numeric" : "text"}
      autoCapitalize="characters"
      autoComplete="off"
      spellCheck={false}
      placeholder={context.accept === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00"}
      data-slot="document-field-input"
      className={cn(
        "min-w-0 flex-1 bg-transparent font-medium tabular-nums tracking-[0.01em] outline-none placeholder:font-normal placeholder:text-subtle-foreground disabled:cursor-not-allowed",
        context.chrome.inputClass,
        className,
      )}
      {...props}
      ref={inputRef}
      id={context.inputId}
      value={formatted}
      onChange={handleChange}
      onBlur={(event) => {
        onBlur?.(event);
        context.markTouched();
      }}
      disabled={context.disabled || disabled}
      aria-invalid={context.showInvalid || undefined}
      aria-describedby={describedBy || undefined}
    />
  );
}

export type DocumentFieldKindProps = ComponentProps<"span">;

/** Names the detected document type once the person starts typing. */
export function DocumentFieldKind({ className, ...props }: DocumentFieldKindProps) {
  const context = useDocumentField("DocumentFieldKind");
  if (!context.value) return null;
  return (
    <span
      data-slot="document-field-kind"
      data-kind={context.kind}
      className={cn(
        "inline-flex shrink-0 animate-in items-center rounded-full bg-muted font-medium text-muted-foreground duration-180 ease-out-quint fade-in-0 zoom-in-96 motion-reduce:animate-none",
        context.chrome.kindClass,
        className,
      )}
      {...props}
    >
      {context.kind === "cpf" ? "CPF" : "CNPJ"}
    </span>
  );
}

export type DocumentFieldStatusIconProps = ComponentProps<"span">;

export function DocumentFieldStatusIcon({ className, ...props }: DocumentFieldStatusIconProps) {
  const context = useDocumentField("DocumentFieldStatusIcon");
  if (context.status !== "valid" && !context.showInvalid) return null;
  return (
    <span
      data-slot="document-field-status-icon"
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 animate-in items-center duration-180 ease-out-quint fade-in-0 zoom-in-96 motion-reduce:animate-none",
        context.showInvalid ? "text-destructive" : "text-success",
        className,
      )}
      {...props}
    >
      {context.showInvalid ? (
        <CircleAlert className="size-4" strokeWidth={1.9} />
      ) : (
        <CheckCircle2 className="size-4" strokeWidth={1.9} />
      )}
    </span>
  );
}

export type DocumentFieldDescriptionProps = ComponentProps<"p">;

export function DocumentFieldDescription({ className, ...props }: DocumentFieldDescriptionProps) {
  const context = useDocumentField("DocumentFieldDescription");
  if (context.showInvalid) return null;
  return (
    <p
      data-slot="document-field-description"
      className={cn("flex text-subtle-foreground", context.chrome.messageClass, className)}
      {...props}
      id={context.descriptionId}
    />
  );
}

export type DocumentFieldErrorProps = ComponentProps<"p">;

export function DocumentFieldError({ children, className, ...props }: DocumentFieldErrorProps) {
  const context = useDocumentField("DocumentFieldError");
  if (!context.showInvalid) return null;
  const name = context.kind === "cpf" ? "CPF" : "CNPJ";
  const fallback =
    context.status === "incomplete"
      ? `Digite o ${name} completo.`
      : `${name} inválido. Confira os ${context.kind === "cpf" ? "números" : "caracteres"}.`;
  return (
    <p
      data-slot="document-field-error"
      className={cn(
        "flex animate-in items-start text-destructive duration-240 ease-out-quint fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none",
        context.chrome.messageClass,
        className,
      )}
      {...props}
      id={context.errorId}
      role="alert"
    >
      {children ?? fallback}
    </p>
  );
}
