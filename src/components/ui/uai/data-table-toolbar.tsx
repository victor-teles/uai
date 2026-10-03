"use client";

import { Columns3, Download, Search, X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const DATA_TABLE_TOOLBAR_VARIANTS = ["toolbar", "stacked", "compact"] as const;
export type DataTableToolbarVariant = (typeof DATA_TABLE_TOOLBAR_VARIANTS)[number];
export type DataTableToolbarProps = ComponentProps<"div"> & {
  variant?: DataTableToolbarVariant;
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;
  selectedCount?: number;
  onClearSelection?: () => void;
};

type ToolbarContext = {
  id: string;
  variant: DataTableToolbarVariant;
  search: string;
  setSearch: (search: string) => void;
  selectedCount: number;
  onClearSelection?: () => void;
};
const Context = createContext<ToolbarContext | null>(null);
function useToolbar(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within DataTableToolbar`);
  return context;
}

type ColumnsContext = { value: string[]; toggle: (column: string, visible: boolean) => void };
const ColumnsCtx = createContext<ColumnsContext | null>(null);

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

function controlStyle(variant: DataTableToolbarVariant) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: variant === "compact" ? 24 : 28,
    padding: variant === "compact" ? "0 10px" : "0 12px",
    border: 0,
    borderRadius: 999,
    color: "var(--uai-text)",
    fontSize: variant === "compact" ? 12 : 12.5,
    lineHeight: "18px",
    fontWeight: 500,
    whiteSpace: "nowrap",
    cursor: "pointer",
  } as const;
}
const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";
// Secondary pill: raised fill, lighter on hover, a small press. Inline styles own geometry.
const controlClass =
  "bg-[var(--uai-surface-raised)] [transition:background-color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--uai-surface-raised)_85%,var(--uai-text))] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] disabled:pointer-events-none disabled:opacity-50 aria-expanded:bg-[color-mix(in_oklab,var(--uai-surface-raised)_85%,var(--uai-text))] motion-reduce:transition-none motion-reduce:active:scale-100 [&>svg]:text-[var(--uai-muted)]";
function classes(...values: (string | false | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export function DataTableToolbar({
  variant = "toolbar",
  search,
  defaultSearch = "",
  onSearchChange,
  selectedCount = 0,
  onClearSelection,
  style,
  children,
  ...props
}: DataTableToolbarProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultSearch);
  const context: ToolbarContext = {
    id,
    variant,
    search: search ?? internal,
    setSearch: (next) => {
      if (search === undefined) setInternal(next);
      onSearchChange?.(next);
    },
    selectedCount,
    onClearSelection,
  };
  return (
    <Context.Provider value={context}>
      {/* biome-ignore lint/a11y/useSemanticElements: the toolbar groups mixed table controls, not one form fieldset. */}
      <div
        role="group"
        aria-label="Table controls"
        {...props}
        data-variant={variant}
        style={{
          display: "flex",
          flexDirection: variant === "stacked" ? "column" : "row",
          flexWrap: variant === "stacked" ? "nowrap" : "wrap",
          alignItems: variant === "stacked" ? "stretch" : "center",
          gap: variant === "compact" ? 6 : 8,
          minWidth: 0,
          padding: variant === "compact" ? 6 : variant === "stacked" ? 10 : 8,
          border: variant === "stacked" ? 0 : "1px solid var(--uai-border)",
          borderRadius: variant === "compact" ? 12 : 14,
          background: variant === "stacked" ? "var(--uai-canvas)" : "var(--uai-surface)",
          boxShadow: variant === "stacked" ? "inset 0 0 0 1px var(--uai-border)" : undefined,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        {children}
        <span role="status" style={srOnly}>
          {selectedCount > 0 ? `${selectedCount} selected` : ""}
        </span>
      </div>
    </Context.Provider>
  );
}

export function DataTableToolbarGroup({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function DataTableToolbarSearch({
  label = "Search rows",
  style,
  onChange,
  onKeyDown,
  ...props
}: Omit<ComponentProps<"input">, "value" | "defaultValue" | "type"> & { label?: string }) {
  const context = useToolbar("DataTableToolbarSearch");
  const inputRef = useRef<HTMLInputElement>(null);
  const compact = context.variant === "compact";
  return (
    <div
      className="border-transparent [transition:border-color_120ms_ease-out,background-color_120ms_ease-out] focus-within:border-[var(--uai-border-strong)] motion-reduce:transition-none"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        flex: context.variant === "stacked" ? "0 0 auto" : "1 1 200px",
        minWidth: 0,
        height: compact ? 24 : context.variant === "stacked" ? 32 : 28,
        padding: compact ? "0 3px 0 9px" : "0 4px 0 11px",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 999,
        background:
          context.variant === "stacked" ? "var(--uai-surface)" : "var(--uai-surface-raised)",
      }}
    >
      <Search
        size={14}
        strokeWidth={1.75}
        aria-hidden="true"
        style={{ flexShrink: 0, color: "var(--uai-subtle)" }}
      />
      <input
        aria-label={label}
        {...props}
        ref={inputRef}
        type="search"
        id={`${context.id}-search`}
        value={context.search}
        className={classes(
          "outline-none placeholder:text-[var(--uai-subtle)] [&::-webkit-search-cancel-button]:hidden",
          props.className,
        )}
        style={{
          flex: 1,
          width: "100%",
          minWidth: 0,
          border: 0,
          background: "transparent",
          color: "inherit",
          fontSize: compact ? 12 : 12.5,
          lineHeight: "18px",
          ...style,
        }}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented) context.setSearch(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && event.key === "Escape" && context.search) {
            event.preventDefault();
            context.setSearch("");
          }
        }}
      />
      {context.search ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            context.setSearch("");
            inputRef.current?.focus();
          }}
          className={classes(controlClass, "text-[var(--uai-muted)]")}
          style={{ ...controlStyle(context.variant), width: 20, height: 20, padding: 0 }}
        >
          <X size={12} strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export function DataTableToolbarButton({ style, className, ...props }: ComponentProps<"button">) {
  const context = useToolbar("DataTableToolbarButton");
  return (
    <button
      {...props}
      type="button"
      className={classes(controlClass, className)}
      style={{ ...controlStyle(context.variant), ...style }}
    />
  );
}

export function DataTableToolbarExport({
  children = "Export",
  ...props
}: ComponentProps<"button">) {
  return (
    <DataTableToolbarButton {...props}>
      <Download size={14} strokeWidth={1.75} aria-hidden="true" />
      {children}
    </DataTableToolbarButton>
  );
}

export type DataTableToolbarColumnsProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  label?: string;
};

export function DataTableToolbarColumns({
  value,
  defaultValue = [],
  onValueChange,
  label = "Columns",
  children,
  style,
  ...props
}: DataTableToolbarColumnsProps) {
  const context = useToolbar("DataTableToolbarColumns");
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLFieldSetElement>(null);
  const panelId = `${context.id}-columns`;
  const visible = value ?? internal;

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    panel.querySelector("input")?.focus();
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof panel.animate !== "function") return;
    panel.animate(
      [
        { opacity: 0, transform: "scale(0.96)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }, [open]);

  const columns: ColumnsContext = {
    value: visible,
    toggle: (column, show) => {
      const next = show ? [...visible, column] : visible.filter((item) => item !== column);
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
  };

  return (
    <ColumnsCtx.Provider value={columns}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Escape from the trigger or any checkbox closes the panel. */}
      <div
        {...props}
        ref={rootRef}
        style={{ position: "relative", ...style }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
            triggerRef.current?.focus();
          }
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className={controlClass}
          style={controlStyle(context.variant)}
        >
          <Columns3 size={14} strokeWidth={1.75} aria-hidden="true" />
          {label}
        </button>
        {open ? (
          <fieldset
            ref={panelRef}
            id={panelId}
            style={{
              margin: 0,
              border: 0,
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              zIndex: 20,
              display: "grid",
              gap: 1,
              minWidth: 184,
              padding: 4,
              borderRadius: 14,
              background: "var(--uai-surface)",
              boxShadow:
                "0 0 0 1px var(--uai-border-strong), 0 16px 32px -12px oklch(0 0 0 / 0.32), 0 4px 8px -4px oklch(0 0 0 / 0.12)",
              transformOrigin: "top right",
            }}
          >
            <legend style={srOnly}>{`Visible ${label.toLowerCase()}`}</legend>
            {children}
          </fieldset>
        ) : null}
      </div>
    </ColumnsCtx.Provider>
  );
}

export function DataTableToolbarColumn({
  value,
  children,
  disabled,
}: {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  const columns = useContext(ColumnsCtx);
  if (!columns)
    throw new Error("DataTableToolbarColumn must be used within DataTableToolbarColumns");
  return (
    <label
      className={
        disabled
          ? undefined
          : "[transition:background-color_120ms_ease-out] hover:bg-[var(--uai-surface-raised)] motion-reduce:transition-none"
      }
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minHeight: 30,
        padding: "4px 8px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <input
        type="checkbox"
        disabled={disabled}
        checked={columns.value.includes(value)}
        onChange={(event) => columns.toggle(value, event.target.checked)}
        style={{ width: 14, height: 14, margin: 0, accentColor: "var(--uai-accent)" }}
      />
      {children}
    </label>
  );
}

export function DataTableToolbarBulkActions({ style, children, ...props }: ComponentProps<"div">) {
  const context = useToolbar("DataTableToolbarBulkActions");
  const visible = context.selectedCount > 0;
  const ref = useRef<HTMLDivElement>(null);
  // Fade the bar in when a selection starts.
  useLayoutEffect(() => {
    const bar = ref.current;
    if (!visible || !bar || typeof bar.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    bar.animate(
      [
        { opacity: 0, transform: "translateY(-4px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 220, easing: easeOut },
    );
  }, [visible]);
  if (!visible) return null;
  return (
    // biome-ignore lint/a11y/useSemanticElements: bulk actions are buttons, not a form fieldset.
    <div
      role="group"
      aria-label="Bulk actions"
      {...props}
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
        flexBasis: context.variant === "stacked" ? "auto" : "100%",
        minWidth: 0,
        padding: context.variant === "compact" ? "3px 3px 3px 10px" : "4px 4px 4px 12px",
        borderRadius: 999,
        background: "color-mix(in oklab, var(--uai-accent) 12%, transparent)",
        boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--uai-accent) 22%, transparent)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function DataTableToolbarSelectionCount({
  style,
  children,
  ...props
}: ComponentProps<"span">) {
  const context = useToolbar("DataTableToolbarSelectionCount");
  return (
    <span
      {...props}
      aria-hidden="true"
      style={{
        marginRight: "auto",
        color: "var(--uai-text)",
        fontSize: 12.5,
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {children ?? `${context.selectedCount} selected`}
    </span>
  );
}

export function DataTableToolbarClearSelection({
  children = "Clear selection",
  onClick,
  ...props
}: ComponentProps<"button">) {
  const context = useToolbar("DataTableToolbarClearSelection");
  return (
    <DataTableToolbarButton
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.onClearSelection?.();
      }}
    >
      {children}
    </DataTableToolbarButton>
  );
}
