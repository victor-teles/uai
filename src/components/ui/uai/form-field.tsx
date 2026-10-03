"use client";

import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useId,
  useState,
} from "react";

export const FORM_FIELD_VARIANTS = ["outlined", "filled", "compact"] as const;
export type FormFieldVariant = (typeof FORM_FIELD_VARIANTS)[number];
export type FormFieldProps = ComponentProps<"div"> & {
  variant?: FormFieldVariant;
  inputId?: string;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  maxLength?: number;
};
type FieldContext = {
  id: string;
  variant: FormFieldVariant;
  required: boolean;
  invalid: boolean;
  disabled: boolean;
  value: string;
  maxLength?: number;
  change: (value: string) => void;
};
const Context = createContext<FieldContext | null>(null);
const fieldCss = `
.uai-form-field-control{border:1px solid var(--uai-field-border);background:var(--uai-field-fill);transition:border-color 120ms ease-out,background-color 120ms ease-out,box-shadow 120ms ease-out}
.uai-form-field-control::placeholder{color:var(--uai-subtle)}
.uai-form-field-control:hover:not(:disabled):not(:focus){border-color:var(--uai-border-strong)}
.uai-form-field-control:focus{outline:none;border-color:var(--uai-border-strong);box-shadow:0 0 0 3px color-mix(in oklab,var(--uai-accent) 24%,transparent)}
.uai-form-field-control[aria-invalid="true"]{border-color:color-mix(in oklab,var(--uai-danger) 70%,transparent)}
.uai-form-field-control[aria-invalid="true"]:focus{border-color:var(--uai-danger);box-shadow:0 0 0 3px color-mix(in oklab,var(--uai-danger) 22%,transparent)}
.uai-form-field-control:disabled{opacity:0.55;cursor:not-allowed}
@media (prefers-reduced-motion: reduce){.uai-form-field-control{border:1px solid var(--uai-field-border);background:var(--uai-field-fill);transition:none}}
`;
function useField() {
  const context = useContext(Context);
  if (!context) throw new Error("FormField children must be used within FormField");
  return context;
}
export function FormField({
  variant = "outlined",
  inputId,
  required = false,
  invalid = false,
  disabled = false,
  value,
  defaultValue = "",
  onValueChange,
  maxLength,
  children,
  style,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const [internal, setInternal] = useState(defaultValue);
  const context: FieldContext = {
    id: inputId ?? generatedId,
    variant,
    required,
    invalid,
    disabled,
    value: value ?? internal,
    maxLength,
    change: (next) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
  };
  return (
    <Context.Provider value={context}>
      <div
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          gap: variant === "compact" ? 4 : 6,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{fieldCss}</style>
        {children}
      </div>
    </Context.Provider>
  );
}
export function FormFieldLabel({ children, style, ...props }: ComponentProps<"label">) {
  const context = useField();
  return (
    <label
      {...props}
      htmlFor={context.id}
      style={{ fontSize: context.variant === "compact" ? 12.5 : 13, fontWeight: 500, ...style }}
    >
      {children}
      {context.required && (
        <span style={{ color: "var(--uai-subtle)", fontWeight: 400, fontSize: 12 }}>
          {" "}
          (required)
        </span>
      )}
    </label>
  );
}
function fieldControl(context: FieldContext) {
  return {
    id: context.id,
    required: context.required,
    disabled: context.disabled,
    value: context.value,
    maxLength: context.maxLength,
    "aria-invalid": context.invalid || undefined,
    "aria-describedby": `${context.id}-description ${context.id}-error ${context.id}-count`,
    className: "uai-form-field-control",
    style: {
      display: "block",
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box" as const,
      "--uai-field-border": context.variant === "filled" ? "transparent" : "var(--uai-border)",
      "--uai-field-fill":
        context.variant === "filled" ? "var(--uai-surface-raised)" : "var(--uai-canvas)",
      borderRadius: context.variant === "compact" ? 8 : 10,
      padding: context.variant === "compact" ? "6px 10px" : "9px 12px",
      color: "var(--uai-text)",
      font: "inherit",
      fontSize: context.variant === "compact" ? 12.5 : 13,
      lineHeight: "18px",
    } as CSSProperties,
  };
}
export function FormFieldInput({
  onChange,
  className,
  style,
  ...props
}: Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "id" | "maxLength" | "required" | "disabled"
>) {
  const context = useField();
  const control = fieldControl(context);
  return (
    <input
      {...props}
      {...control}
      className={className ? `${control.className} ${className}` : control.className}
      style={{ ...control.style, ...style }}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) context.change(event.target.value);
      }}
    />
  );
}
export function FormFieldTextarea({
  onChange,
  className,
  style,
  ...props
}: Omit<
  ComponentProps<"textarea">,
  "value" | "defaultValue" | "id" | "maxLength" | "required" | "disabled"
>) {
  const context = useField();
  const control = fieldControl(context);
  return (
    <textarea
      rows={3}
      {...props}
      {...control}
      className={className ? `${control.className} ${className}` : control.className}
      style={{
        ...control.style,
        resize: "vertical",
        minHeight: context.variant === "compact" ? 56 : 76,
        ...style,
      }}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) context.change(event.target.value);
      }}
    />
  );
}
export function FormFieldDescription({ style, ...props }: ComponentProps<"p">) {
  const context = useField();
  return (
    <p
      {...props}
      id={`${context.id}-description`}
      style={{ margin: 0, fontSize: 12, lineHeight: "16px", color: "var(--uai-muted)", ...style }}
    />
  );
}
export function FormFieldError({ style, ...props }: ComponentProps<"p">) {
  const context = useField();
  if (!context.invalid) return null;
  return (
    <p
      role="alert"
      {...props}
      id={`${context.id}-error`}
      style={{
        margin: 0,
        fontSize: 12,
        lineHeight: "16px",
        color: "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))",
        ...style,
      }}
    />
  );
}
export function FormFieldCount({ style, ...props }: ComponentProps<"span">) {
  const context = useField();
  return (
    <span
      {...props}
      id={`${context.id}-count`}
      style={{
        fontSize: 11.5,
        color: "var(--uai-subtle)",
        textAlign: "right",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {context.value.length}
      {context.maxLength === undefined ? " characters" : ` / ${context.maxLength} characters`}
    </span>
  );
}
