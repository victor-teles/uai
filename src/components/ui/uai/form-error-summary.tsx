"use client";

import { type ComponentProps, createContext, useContext, useEffect, useId, useRef } from "react";

export const FORM_ERROR_SUMMARY_VARIANTS = ["card", "plain", "compact"] as const;
export type FormErrorSummaryVariant = (typeof FORM_ERROR_SUMMARY_VARIANTS)[number];
export type FormErrorSummaryProps = ComponentProps<"section"> & {
  variant?: FormErrorSummaryVariant;
  focusOnMount?: boolean;
};
const Context = createContext<string | null>(null);
export function FormErrorSummary({
  variant = "card",
  focusOnMount = false,
  children,
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
        style={{
          color: "var(--uai-text)",
          borderStyle: "solid",
          borderColor: "var(--uai-danger)",
          borderWidth: variant === "plain" ? "0 0 0 3px" : "1px 1px 1px 3px",
          background: variant === "plain" ? "transparent" : "var(--uai-surface)",
          borderRadius: variant === "plain" ? 0 : variant === "compact" ? 12 : 14,
          padding: variant === "compact" ? 12 : 18,
          fontSize: 13,
          ...style,
        }}
      >
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
    <h2 {...props} id={id} style={{ margin: 0, fontSize: 14, fontWeight: 600, ...style }}>
      {children}
    </h2>
  );
}
export function FormErrorSummaryList({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{ margin: "10px 0 0", paddingLeft: 20, display: "grid", gap: 6, ...style }}
    />
  );
}
export function FormErrorSummaryLink({
  fieldId,
  onClick,
  style,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { fieldId: string }) {
  return (
    <li>
      <a
        {...props}
        href={`#${encodeURIComponent(fieldId)}`}
        style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3, ...style }}
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
