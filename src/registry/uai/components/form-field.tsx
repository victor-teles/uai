"use client";

import { type ComponentProps, createContext, useContext, useId, useState } from "react";

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
          gap: 6,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          ...style,
        }}
      >
        {children}
      </div>
    </Context.Provider>
  );
}
export function FormFieldLabel({ children, style, ...props }: ComponentProps<"label">) {
  const context = useField();
  return (
    <label {...props} htmlFor={context.id} style={{ fontWeight: 550, ...style }}>
      {children}
      {context.required && (
        <span style={{ color: "var(--uai-muted)", fontWeight: 400 }}> (required)</span>
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
    style: {
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box" as const,
      border: `1px solid var(${context.invalid ? "--uai-danger" : "--uai-border-strong"})`,
      borderRadius: context.variant === "compact" ? 8 : 14,
      padding: context.variant === "compact" ? "7px 10px" : "12px",
      background: context.variant === "filled" ? "var(--uai-surface-raised)" : "var(--uai-surface)",
      color: "var(--uai-text)",
      fontSize: 13,
      lineHeight: "18px",
    },
  };
}
export function FormFieldInput({
  onChange,
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
      style={{ ...control.style, resize: "vertical", ...style }}
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
      style={{ margin: 0, fontSize: 12, color: "var(--uai-muted)", ...style }}
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
      style={{ fontSize: 12, color: "var(--uai-muted)", textAlign: "right", ...style }}
    >
      {context.value.length}
      {context.maxLength === undefined ? " characters" : ` / ${context.maxLength} characters`}
    </span>
  );
}
