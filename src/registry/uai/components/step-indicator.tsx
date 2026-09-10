"use client";

import { type ComponentProps, createContext, useContext } from "react";

export const STEP_INDICATOR_VARIANTS = ["horizontal", "vertical", "compact"] as const;
export type StepIndicatorVariant = (typeof STEP_INDICATOR_VARIANTS)[number];
export type StepIndicatorStatus = "upcoming" | "current" | "complete" | "blocked" | "error";
const Context = createContext<StepIndicatorVariant | null>(null);
export function StepIndicator({
  variant = "horizontal",
  style,
  ...props
}: ComponentProps<"ol"> & { variant?: StepIndicatorVariant }) {
  return (
    <Context.Provider value={variant}>
      <ol
        aria-label="Form progress"
        {...props}
        data-variant={variant}
        style={{
          display: "flex",
          flexDirection: variant === "vertical" ? "column" : "row",
          flexWrap: "wrap",
          gap: variant === "compact" ? 6 : 12,
          listStyle: "none",
          margin: 0,
          padding: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          ...style,
        }}
      />
    </Context.Provider>
  );
}
export function StepIndicatorStep({
  status = "upcoming",
  optional = false,
  children,
  style,
  ...props
}: ComponentProps<"li"> & { status?: StepIndicatorStatus; optional?: boolean }) {
  const variant = useContext(Context);
  if (!variant) throw new Error("StepIndicatorStep must be used within StepIndicator");
  return (
    <li
      {...props}
      aria-current={status === "current" ? "step" : undefined}
      data-status={status}
      style={{
        display: "grid",
        alignContent: "start",
        gap: 6,
        flex: variant === "vertical" ? undefined : "1 1 110px",
        minWidth: 0,
        border: `1px solid var(${status === "current" ? "--uai-border-strong" : "--uai-border"})`,
        borderRadius: variant === "compact" ? 999 : 14,
        padding: variant === "compact" ? "8px 14px" : 14,
        background: status === "current" ? "var(--uai-surface-raised)" : "var(--uai-surface)",
        ...style,
      }}
    >
      {children}
      <span
        style={{
          fontSize: 11,
          color:
            status === "error"
              ? "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))"
              : "var(--uai-muted)",
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
        {optional ? " · Optional" : ""}
      </span>
    </li>
  );
}
export function StepIndicatorTitle({ style, ...props }: ComponentProps<"span">) {
  return <span {...props} style={{ fontWeight: 550, overflowWrap: "anywhere", ...style }} />;
}
export function StepIndicatorDescription({ style, ...props }: ComponentProps<"p">) {
  return <p {...props} style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12, ...style }} />;
}
