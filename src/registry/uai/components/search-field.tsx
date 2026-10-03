"use client";

import { LoaderCircle, Search, X } from "lucide-react";
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
const searchCss = `
.uai-search-field-control{border:1px solid var(--uai-border);background:var(--uai-canvas);color:var(--uai-subtle);transition:border-color 120ms ease-out,box-shadow 120ms ease-out,color 120ms ease-out}
.uai-search-field-control:hover{border-color:var(--uai-border-strong)}
.uai-search-field-control:focus-within{border-color:var(--uai-border-strong);color:var(--uai-muted);box-shadow:0 0 0 3px color-mix(in oklab,var(--uai-accent) 24%,transparent)}
.uai-search-field-control[data-status="error"]{border-color:color-mix(in oklab,var(--uai-danger) 70%,transparent)}
.uai-search-field-input{outline:none}
.uai-search-field-input::placeholder{color:var(--uai-subtle)}
.uai-search-field-input::-webkit-search-cancel-button{appearance:none}
.uai-search-field-clear{background:transparent;color:var(--uai-subtle);transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1);animation:uai-search-pop 180ms cubic-bezier(0.16,1,0.3,1)}
.uai-search-field-clear:hover{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-search-field-clear:active{transform:scale(0.92)}
.uai-search-field-clear:focus-visible,.uai-search-field-recent:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-search-field-recent{background:var(--uai-surface-raised);color:var(--uai-muted);transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-search-field-recent:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text));color:var(--uai-text)}
.uai-search-field-recent:active{transform:scale(0.97)}
.uai-search-field-spinner{animation:uai-search-spin 0.8s linear infinite}
@keyframes uai-search-pop{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:none}}
@keyframes uai-search-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion: reduce){.uai-search-field-control,.uai-search-field-clear,.uai-search-field-recent{transition:none;animation:none}.uai-search-field-spinner{animation:none}}
`;
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
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{searchCss}</style>
        {children}
      </div>
    </Context.Provider>
  );
}
export function SearchFieldLabel({ children, style, ...props }: ComponentProps<"label">) {
  const context = useSearch();
  return (
    <label {...props} htmlFor={context.id} style={{ fontWeight: 500, ...style }}>
      {children}
    </label>
  );
}
export function SearchFieldControl({
  className,
  style,
  children,
  ...props
}: ComponentProps<"div">) {
  const context = useSearch();
  const compact = context.variant === "compact";
  return (
    <div
      {...props}
      data-status={context.status}
      className={className ? `uai-search-field-control ${className}` : "uai-search-field-control"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 6 : 8,
        padding: compact ? "2px 4px 2px 10px" : "4px 6px 4px 12px",
        borderRadius: context.variant === "pill" ? 999 : compact ? 8 : 10,
        opacity: context.disabled ? 0.55 : 1,
        ...style,
      }}
    >
      {context.status === "loading" ? (
        <LoaderCircle
          className="uai-search-field-spinner"
          size={compact ? 14 : 16}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      ) : (
        <Search size={compact ? 14 : 16} strokeWidth={1.75} aria-hidden="true" />
      )}
      {children}
    </div>
  );
}
export function SearchFieldInput({
  className,
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
      className={className ? `uai-search-field-input ${className}` : "uai-search-field-input"}
      style={{
        flex: 1,
        width: "100%",
        minWidth: 0,
        padding: 0,
        border: 0,
        background: "transparent",
        color: "var(--uai-text)",
        font: "inherit",
        fontSize: context.variant === "compact" ? 12.5 : 13,
        lineHeight: context.variant === "compact" ? "24px" : "28px",
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
  children = <X size={14} strokeWidth={1.75} aria-hidden="true" />,
  onClick,
  className,
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
      className={className ? `uai-search-field-clear ${className}` : "uai-search-field-clear"}
      style={{
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        width: context.variant === "compact" ? 24 : 28,
        height: context.variant === "compact" ? 24 : 28,
        padding: 0,
        border: 0,
        borderRadius: context.variant === "pill" ? 999 : 8,
        cursor: "pointer",
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
        lineHeight: "16px",
        color:
          context.status === "error"
            ? "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))"
            : "var(--uai-subtle)",
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
  className,
  style,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: string }) {
  const context = useSearch();
  return (
    <button
      {...props}
      type="button"
      disabled={context.disabled || props.disabled}
      className={className ? `uai-search-field-recent ${className}` : "uai-search-field-recent"}
      style={{
        height: context.variant === "compact" ? 24 : 28,
        border: 0,
        borderRadius: 999,
        padding: "0 12px",
        font: "inherit",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
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
