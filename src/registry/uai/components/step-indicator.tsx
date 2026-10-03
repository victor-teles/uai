"use client";

import { type ComponentProps, createContext, useContext } from "react";

export const STEP_INDICATOR_VARIANTS = ["horizontal", "vertical", "compact"] as const;
export type StepIndicatorVariant = (typeof STEP_INDICATOR_VARIANTS)[number];
export type StepIndicatorStatus = "upcoming" | "current" | "complete" | "blocked" | "error";
const Context = createContext<StepIndicatorVariant | null>(null);
const statusTone: Record<StepIndicatorStatus, string> = {
  complete: "var(--uai-text)",
  current: "var(--uai-accent)",
  error: "var(--uai-danger)",
  blocked: "var(--uai-border-strong)",
  upcoming: "var(--uai-border)",
};
const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;
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
          gap: variant === "compact" ? 4 : variant === "vertical" ? 2 : 10,
          listStyle: "none",
          margin: 0,
          padding: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
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
  const tone = statusTone[status];
  const active = status === "current";
  const muted = status === "upcoming" || status === "blocked";
  const label = (
    <span
      style={{
        fontSize: 11.5,
        lineHeight: "16px",
        color:
          status === "error"
            ? "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))"
            : active
              ? "var(--uai-accent)"
              : "var(--uai-subtle)",
        ...(variant === "compact" ? visuallyHidden : {}),
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
      {optional ? " · Optional" : ""}
    </span>
  );
  if (variant === "compact")
    return (
      <li
        {...props}
        aria-current={active ? "step" : undefined}
        data-status={status}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          minWidth: 0,
          height: 28,
          padding: "0 12px 0 10px",
          borderRadius: 999,
          background: active ? "var(--uai-surface-raised)" : "transparent",
          color: muted ? "var(--uai-subtle)" : "var(--uai-text)",
          fontSize: 12.5,
          transition: "background-color 120ms ease-out, color 120ms ease-out",
          ...style,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            flexShrink: 0,
            borderRadius: 999,
            background: tone,
          }}
        />
        {children}
        {label}
      </li>
    );
  return (
    <li
      {...props}
      aria-current={active ? "step" : undefined}
      data-status={status}
      style={{
        display: "grid",
        alignContent: "start",
        gap: 4,
        flex: variant === "vertical" ? undefined : "1 1 110px",
        minWidth: 0,
        color: muted ? "var(--uai-muted)" : "var(--uai-text)",
        ...(variant === "vertical"
          ? {
              padding: "8px 0 10px 14px",
              boxShadow: `inset 2px 0 0 ${tone}`,
            }
          : { paddingTop: 12, boxShadow: `inset 0 3px 0 ${tone}` }),
        borderRadius: variant === "vertical" ? 0 : "2px 2px 0 0",
        transition: "box-shadow 240ms cubic-bezier(0.23, 1, 0.32, 1), color 120ms ease-out",
        ...style,
      }}
    >
      {children}
      {label}
    </li>
  );
}
export function StepIndicatorTitle({ style, ...props }: ComponentProps<"span">) {
  return <span {...props} style={{ fontWeight: 500, overflowWrap: "anywhere", ...style }} />;
}
export function StepIndicatorDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12, lineHeight: "16px", ...style }}
    />
  );
}
