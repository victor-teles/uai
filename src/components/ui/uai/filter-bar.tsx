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
type FilterContext = {
  variant: FilterBarVariant;
  activeCount: number;
  onReset?: () => void;
  disabled: boolean;
};
const Context = createContext<FilterContext | null>(null);
const filterCss = `
.uai-filter-bar-chip{animation:uai-filter-chip-in 180ms cubic-bezier(0.16,1,0.3,1)}
.uai-filter-bar-remove,.uai-filter-bar-reset{transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-filter-bar-remove{background:transparent;color:var(--uai-subtle)}
.uai-filter-bar-remove:hover:not(:disabled){background:color-mix(in oklab,var(--uai-text) 10%,transparent);color:var(--uai-text)}
.uai-filter-bar-reset{background:transparent;color:var(--uai-muted)}
.uai-filter-bar-reset:hover:not(:disabled){background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-filter-bar-remove:active:not(:disabled),.uai-filter-bar-reset:active:not(:disabled){transform:scale(0.97)}
.uai-filter-bar-remove:focus-visible,.uai-filter-bar-reset:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-filter-bar-reset:disabled,.uai-filter-bar-remove:disabled{cursor:not-allowed;opacity:0.45}
@keyframes uai-filter-chip-in{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.uai-filter-bar-chip{animation:none}.uai-filter-bar-remove,.uai-filter-bar-reset{transition:none}}
`;
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
    <Context.Provider value={{ variant, activeCount, onReset, disabled }}>
      <div
        {...props}
        data-variant={variant}
        style={{
          display: "flex",
          flexDirection: variant === "panel" ? "column" : "row",
          flexWrap: "wrap",
          alignItems: variant === "panel" ? "stretch" : "center",
          gap: variant === "compact" ? 8 : variant === "panel" ? 14 : 12,
          padding: variant === "compact" ? "6px 8px" : variant === "panel" ? 16 : "10px 12px",
          border: variant === "toolbar" ? "1px solid transparent" : "1px solid var(--uai-border)",
          borderRadius: variant === "compact" ? 12 : 14,
          background: variant === "compact" ? "transparent" : "var(--uai-surface)",
          color: "var(--uai-text)",
          fontSize: variant === "compact" ? 12.5 : 13,
          lineHeight: "18px",
          minWidth: 0,
          ...style,
        }}
      >
        <style>{filterCss}</style>
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
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, ...style }}
    />
  );
}
export function FilterBarChip({
  children,
  onRemove,
  disabled,
  className,
  style,
  ...props
}: ComponentProps<"span"> & { onRemove: () => void; disabled?: boolean }) {
  const context = useFilter();
  return (
    <span
      {...props}
      className={className ? `uai-filter-bar-chip ${className}` : "uai-filter-bar-chip"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        minHeight: 26,
        padding: "0 3px 0 10px",
        maxWidth: "100%",
        boxSizing: "border-box",
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-text)",
        fontSize: 12,
        fontWeight: 500,
        ...style,
      }}
    >
      <span style={{ overflowWrap: "anywhere" }}>{children}</span>
      <button
        type="button"
        className="uai-filter-bar-remove"
        disabled={context.disabled || disabled}
        onClick={onRemove}
        style={{
          display: "grid",
          placeItems: "center",
          width: 20,
          height: 20,
          padding: 0,
          flexShrink: 0,
          border: 0,
          borderRadius: 999,
          cursor: "pointer",
        }}
      >
        <X size={12} strokeWidth={2} aria-hidden="true" />
        <span className="sr-only">Remove {children} filter</span>
      </button>
    </span>
  );
}
export function FilterBarCount({ children, style, ...props }: ComponentProps<"span">) {
  return (
    <span
      role="status"
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
export function FilterBarReset({
  children = "Reset filters",
  onClick,
  className,
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
      className={className ? `uai-filter-bar-reset ${className}` : "uai-filter-bar-reset"}
      style={{
        height: 28,
        marginLeft: context.variant === "panel" ? 0 : "auto",
        alignSelf: context.variant === "panel" ? "flex-start" : undefined,
        border: 0,
        borderRadius: 999,
        padding: "0 12px",
        font: "inherit",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
