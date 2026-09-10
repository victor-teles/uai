"use client";

import { Search, X } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useRef, useState } from "react";

export const SEARCH_FIELD_VARIANTS = ["rounded", "pill", "compact"] as const;
export type SearchFieldVariant = (typeof SEARCH_FIELD_VARIANTS)[number];
export type SearchFieldStatus = "idle" | "loading" | "empty" | "error";
export type SearchFieldProps = ComponentProps<"div"> & {
  variant?: SearchFieldVariant;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  status?: SearchFieldStatus;
  disabled?: boolean;
};
type SearchContext = {
  id: string;
  value: string;
  change: (value: string) => void;
  focus: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  status: SearchFieldStatus;
  disabled: boolean;
  variant: SearchFieldVariant;
};
const Context = createContext<SearchContext | null>(null);
function useSearch() {
  const context = useContext(Context);
  if (!context) throw new Error("SearchField children must be used within SearchField");
  return context;
}
export function SearchField({
  variant = "rounded",
  value,
  defaultValue = "",
  onValueChange,
  status = "idle",
  disabled = false,
  children,
  style,
  ...props
}: SearchFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internal, setInternal] = useState(defaultValue);
  const context: SearchContext = {
    id,
    inputRef,
    value: value ?? internal,
    status,
    disabled,
    variant,
    focus: () => inputRef.current?.focus(),
    change: (next) => {
      if (disabled) return;
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
          gap: 8,
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
export function SearchFieldLabel({ children, ...props }: ComponentProps<"label">) {
  const context = useSearch();
  return (
    <label {...props} htmlFor={context.id}>
      {children}
    </label>
  );
}
export function SearchFieldControl({ style, children, ...props }: ComponentProps<"div">) {
  const context = useSearch();
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: context.variant === "compact" ? "4px 8px" : "8px 12px",
        border: "1px solid var(--uai-border-strong)",
        borderRadius: context.variant === "pill" ? 999 : context.variant === "compact" ? 12 : 14,
        background: "var(--uai-surface)",
        ...style,
      }}
    >
      <Search size={16} aria-hidden="true" />
      {children}
    </div>
  );
}
export function SearchFieldInput({
  style,
  onChange,
  onKeyDown,
  ...props
}: Omit<ComponentProps<"input">, "value" | "defaultValue" | "id" | "disabled">) {
  const context = useSearch();
  return (
    <input
      type="search"
      {...props}
      id={context.id}
      ref={context.inputRef}
      value={context.value}
      disabled={context.disabled}
      aria-busy={context.status === "loading"}
      aria-invalid={context.status === "error" || undefined}
      aria-describedby={`${context.id}-message`}
      style={{
        flex: 1,
        width: "100%",
        minWidth: 0,
        border: 0,
        background: "transparent",
        color: "inherit",
        fontSize: 13,
        lineHeight: "28px",
        ...style,
      }}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) context.change(event.target.value);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === "Escape") {
          event.preventDefault();
          context.change("");
        }
      }}
    />
  );
}
export function SearchFieldClear({
  children = <X size={14} aria-hidden="true" />,
  onClick,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useSearch();
  if (!context.value) return null;
  return (
    <button
      aria-label="Clear search"
      {...props}
      type="button"
      disabled={context.disabled || props.disabled}
      style={{
        display: "grid",
        placeItems: "center",
        width: 28,
        height: 28,
        border: 0,
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        color: "inherit",
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          context.change("");
          context.focus();
        }
      }}
    >
      {children}
    </button>
  );
}
export function SearchFieldMessage({ children, style, ...props }: ComponentProps<"p">) {
  const context = useSearch();
  const copy = {
    idle: "",
    loading: "Searching…",
    empty: "No results found. Try another search.",
    error: "Search failed. Please try again.",
  };
  return (
    <p
      {...props}
      id={`${context.id}-message`}
      role={context.status === "error" ? "alert" : "status"}
      style={{
        margin: 0,
        fontSize: 12,
        color:
          context.status === "error"
            ? "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))"
            : "var(--uai-muted)",
        ...style,
      }}
    >
      {children ?? copy[context.status]}
    </p>
  );
}
export function SearchFieldRecent({ style, ...props }: ComponentProps<"fieldset">) {
  const context = useSearch();
  if (context.value || context.status !== "idle") return null;
  return (
    <fieldset
      aria-label="Recent searches"
      {...props}
      style={{
        margin: 0,
        padding: 0,
        border: 0,
        minWidth: 0,
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        ...style,
      }}
    />
  );
}
export function SearchFieldRecentItem({
  value,
  children,
  onClick,
  style,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: string }) {
  const context = useSearch();
  return (
    <button
      {...props}
      type="button"
      disabled={context.disabled || props.disabled}
      style={{
        border: "1px solid var(--uai-border)",
        borderRadius: 999,
        padding: "5px 10px",
        background: "var(--uai-surface-raised)",
        color: "inherit",
        fontSize: 12,
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          context.change(value);
          context.focus();
        }
      }}
    >
      {children ?? value}
    </button>
  );
}
