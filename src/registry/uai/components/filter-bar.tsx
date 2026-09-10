"use client";

import { X } from "lucide-react";
import { type ComponentProps, createContext, useContext } from "react";

export const FILTER_BAR_VARIANTS = ["toolbar", "panel", "compact"] as const;
export type FilterBarVariant = (typeof FILTER_BAR_VARIANTS)[number];
export type FilterBarProps = ComponentProps<"div"> & {
  variant?: FilterBarVariant;
  activeCount?: number;
  onReset?: () => void;
  disabled?: boolean;
};
type FilterContext = { activeCount: number; onReset?: () => void; disabled: boolean };
const Context = createContext<FilterContext | null>(null);
function useFilter() {
  const context = useContext(Context);
  if (!context) throw new Error("FilterBar children must be used within FilterBar");
  return context;
}
export function FilterBar({
  variant = "toolbar",
  activeCount = 0,
  onReset,
  disabled = false,
  style,
  children,
  ...props
}: FilterBarProps) {
  return (
    <Context.Provider value={{ activeCount, onReset, disabled }}>
      <div
        {...props}
        data-variant={variant}
        style={{
          display: "flex",
          flexDirection: variant === "panel" ? "column" : "row",
          flexWrap: "wrap",
          alignItems: variant === "panel" ? "stretch" : "center",
          gap: variant === "compact" ? 8 : 12,
          padding: variant === "compact" ? 8 : 16,
          border: "1px solid var(--uai-border)",
          borderRadius: variant === "compact" ? 12 : 14,
          background: variant === "panel" ? "var(--uai-surface-raised)" : "var(--uai-surface)",
          color: "var(--uai-text)",
          fontSize: 13,
          minWidth: 0,
          ...style,
        }}
      >
        {children}
      </div>
    </Context.Provider>
  );
}
export function FilterBarControls({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, ...style }}
    />
  );
}
export function FilterBarChips({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "flex", flexWrap: "wrap", gap: 6, ...style }} />;
}
export function FilterBarChip({
  children,
  onRemove,
  disabled,
  style,
  ...props
}: ComponentProps<"span"> & { onRemove: () => void; disabled?: boolean }) {
  const context = useFilter();
  return (
    <span
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 4px 2px 10px",
        maxWidth: "100%",
        border: "1px solid var(--uai-border-strong)",
        borderRadius: 999,
        fontSize: 12,
        ...style,
      }}
    >
      <span style={{ overflowWrap: "anywhere" }}>{children}</span>
      <button
        type="button"
        disabled={context.disabled || disabled}
        onClick={onRemove}
        style={{
          display: "grid",
          placeItems: "center",
          width: 28,
          height: 28,
          flexShrink: 0,
          border: 0,
          background: "transparent",
          color: "inherit",
          borderRadius: 999,
        }}
      >
        <X size={12} aria-hidden="true" />
        <span className="sr-only">Remove {children} filter</span>
      </button>
    </span>
  );
}
export function FilterBarCount({ children, style, ...props }: ComponentProps<"span">) {
  return (
    <span role="status" {...props} style={{ color: "var(--uai-muted)", fontSize: 12, ...style }}>
      {children}
    </span>
  );
}
export function FilterBarReset({
  children = "Reset filters",
  onClick,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useFilter();
  return (
    <button
      {...props}
      type="button"
      disabled={context.disabled || !context.activeCount || props.disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.onReset?.();
      }}
      style={{
        border: 0,
        background: "transparent",
        color: "inherit",
        padding: "6px 8px",
        textDecoration: "underline",
        opacity: context.activeCount ? 1 : 0.5,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
