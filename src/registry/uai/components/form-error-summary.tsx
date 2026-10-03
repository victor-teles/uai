"use client";

import { CircleAlert } from "lucide-react";
import { type ComponentProps, createContext, useContext, useEffect, useId, useRef } from "react";

export const FORM_ERROR_SUMMARY_VARIANTS = ["card", "plain", "compact"] as const;
export type FormErrorSummaryVariant = (typeof FORM_ERROR_SUMMARY_VARIANTS)[number];
export type FormErrorSummaryProps = ComponentProps<"section"> & {
  variant?: FormErrorSummaryVariant;
  focusOnMount?: boolean;
};
const Context = createContext<string | null>(null);
const summaryCss = `
.uai-form-error-summary:focus{outline:none}
.uai-form-error-summary:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-form-error-summary li::marker{color:color-mix(in oklab,var(--uai-danger) 70%,transparent)}
.uai-form-error-summary-link{color:var(--uai-text);text-decoration-color:color-mix(in oklab,var(--uai-text) 30%,transparent);transition:text-decoration-color 120ms ease-out,color 120ms ease-out}
.uai-form-error-summary-link:hover{text-decoration-color:currentColor}
.uai-form-error-summary-link:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px;border-radius:4px}
@media (prefers-reduced-motion: reduce){.uai-form-error-summary-link{transition:none}}
`;
export function FormErrorSummary({
  variant = "card",
  focusOnMount = false,
  children,
  className,
  style,
  ...props
}: FormErrorSummaryProps) {
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);
  return (
    <Context.Provider value={id}>
      <section
        role="alert"
        {...props}
        ref={ref}
        tabIndex={-1}
        aria-labelledby={id}
        data-variant={variant}
        className={className ? `uai-form-error-summary ${className}` : "uai-form-error-summary"}
        style={{
          color: "var(--uai-text)",
          borderStyle: "solid",
          borderColor: "color-mix(in oklab, var(--uai-danger) 30%, transparent)",
          borderLeftColor: "var(--uai-danger)",
          borderWidth: variant === "plain" ? "0 0 0 3px" : "1px 1px 1px 3px",
          background:
            variant === "plain"
              ? "transparent"
              : "color-mix(in oklab, var(--uai-danger) 7%, var(--uai-surface))",
          borderRadius: variant === "plain" ? 0 : variant === "compact" ? 12 : 14,
          padding: variant === "plain" ? "2px 0 2px 14px" : variant === "compact" ? 12 : 16,
          fontSize: variant === "compact" ? 12.5 : 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{summaryCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}
export function FormErrorSummaryTitle({
  children = "Check the following fields",
  style,
  ...props
}: ComponentProps<"h2">) {
  const id = useContext(Context);
  if (!id) throw new Error("FormErrorSummaryTitle must be used within FormErrorSummary");
  return (
    <h2
      {...props}
      id={id}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: 0,
        fontSize: 14,
        lineHeight: "20px",
        fontWeight: 500,
        ...style,
      }}
    >
      <CircleAlert
        size={16}
        strokeWidth={1.75}
        aria-hidden="true"
        style={{ flexShrink: 0, color: "var(--uai-danger)" }}
      />
      {children}
    </h2>
  );
}
export function FormErrorSummaryList({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{ margin: "8px 0 0", paddingLeft: 42, display: "grid", gap: 4, ...style }}
    />
  );
}
export function FormErrorSummaryLink({
  fieldId,
  onClick,
  className,
  style,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { fieldId: string }) {
  return (
    <li>
      <a
        {...props}
        href={`#${encodeURIComponent(fieldId)}`}
        className={
          className ? `uai-form-error-summary-link ${className}` : "uai-form-error-summary-link"
        }
        style={{
          textDecorationLine: "underline",
          textDecorationThickness: 1,
          textUnderlineOffset: 3,
          ...style,
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const field = document.getElementById(fieldId);
          if (field) {
            event.preventDefault();
            field.focus();
            field.scrollIntoView?.({ block: "center" });
          }
        }}
      />
    </li>
  );
}
