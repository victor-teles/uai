"use client";

import { type ComponentProps, createContext, useContext, useEffect } from "react";

export const UNSAVED_CHANGES_BAR_VARIANTS = ["bar", "floating", "compact"] as const;
export type UnsavedChangesBarVariant = (typeof UNSAVED_CHANGES_BAR_VARIANTS)[number];
export type UnsavedChangesBarProps = ComponentProps<"section"> & {
  variant?: UnsavedChangesBarVariant;
  dirty: boolean;
  status?: "idle" | "saving" | "error";
  warnBeforeUnload?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
};
type ChangesContext = {
  status: "idle" | "saving" | "error";
  onSave?: () => void;
  onDiscard?: () => void;
};
const Context = createContext<ChangesContext | null>(null);
const changesCss = `
.uai-unsaved-bar{animation:uai-unsaved-in 180ms cubic-bezier(0.16,1,0.3,1)}
.uai-unsaved-save,.uai-unsaved-discard{transition:background-color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-unsaved-save{background:var(--uai-accent);color:var(--uai-accent-foreground)}
.uai-unsaved-save:hover:not(:disabled){filter:brightness(1.08)}
.uai-unsaved-discard{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-unsaved-discard:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-unsaved-save:active:not(:disabled),.uai-unsaved-discard:active:not(:disabled){transform:scale(0.97)}
.uai-unsaved-save:focus-visible,.uai-unsaved-discard:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-unsaved-save:disabled,.uai-unsaved-discard:disabled{cursor:not-allowed;opacity:0.6}
.uai-unsaved-shimmer{color:transparent;background:linear-gradient(90deg,var(--uai-subtle) 0%,var(--uai-subtle) 35%,var(--uai-text) 50%,var(--uai-subtle) 65%,var(--uai-subtle) 100%) 0 0/200% 100%;-webkit-background-clip:text;background-clip:text;animation:uai-unsaved-shimmer 2s linear infinite}
@keyframes uai-unsaved-in{from{opacity:0;transform:translateY(4px) scale(0.98)}to{opacity:1;transform:none}}
@keyframes uai-unsaved-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion: reduce){.uai-unsaved-bar{animation:none}.uai-unsaved-save,.uai-unsaved-discard{transition:none}.uai-unsaved-shimmer{animation:none;color:var(--uai-muted);background:none}}
`;
const actionStyle = {
  height: 30,
  padding: "0 14px",
  border: 0,
  borderRadius: 999,
  font: "inherit",
  fontSize: 12.5,
  fontWeight: 500,
  whiteSpace: "nowrap",
  cursor: "pointer",
} as const;
function useChanges() {
  const context = useContext(Context);
  if (!context) throw new Error("UnsavedChangesBar children must be used within UnsavedChangesBar");
  return context;
}
export function UnsavedChangesBar({
  variant = "bar",
  dirty,
  status = "idle",
  warnBeforeUnload = true,
  onSave,
  onDiscard,
  className,
  style,
  children,
  ...props
}: UnsavedChangesBarProps) {
  useEffect(() => {
    if (!dirty || !warnBeforeUnload) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, warnBeforeUnload]);
  if (!dirty) return null;
  return (
    <Context.Provider value={{ status, onSave, onDiscard }}>
      <section
        aria-label="Unsaved changes"
        {...props}
        aria-busy={status === "saving"}
        data-variant={variant}
        className={className ? `uai-unsaved-bar ${className}` : "uai-unsaved-bar"}
        style={{
          position: "sticky",
          bottom: variant === "floating" ? 16 : 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: variant === "compact" ? 8 : 12,
          padding:
            variant === "compact"
              ? "6px 6px 6px 12px"
              : variant === "floating"
                ? "8px 8px 8px 16px"
                : "10px 16px",
          background: "var(--uai-surface)",
          color: "var(--uai-text)",
          borderStyle: "solid",
          borderColor: "var(--uai-border)",
          borderWidth: variant === "bar" ? "1px 0" : variant === "floating" ? 0 : 1,
          borderRadius: variant === "bar" ? 0 : variant === "compact" ? 12 : 16,
          boxShadow:
            variant === "floating"
              ? "0 0 0 1px var(--uai-border-strong), 0 12px 32px -12px oklch(0 0 0 / 0.45)"
              : undefined,
          fontSize: variant === "compact" ? 12.5 : 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{changesCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}
export function UnsavedChangesBarMessage({ children, style, ...props }: ComponentProps<"p">) {
  const context = useChanges();
  return (
    <p
      {...props}
      role={context.status === "error" ? "alert" : "status"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: 0,
        flex: "1 1 140px",
        minWidth: 0,
        fontWeight: 500,
        color:
          context.status === "error"
            ? "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))"
            : "var(--uai-text)",
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
          background: context.status === "error" ? "var(--uai-danger)" : "var(--uai-warning)",
          boxShadow: `0 0 0 3px color-mix(in oklab, var(${context.status === "error" ? "--uai-danger" : "--uai-warning"}) 22%, transparent)`,
        }}
      />
      <span className={context.status === "saving" ? "uai-unsaved-shimmer" : undefined}>
        {children ??
          (context.status === "saving"
            ? "Saving changes…"
            : context.status === "error"
              ? "Changes could not be saved. Try again."
              : "You have unsaved changes.")}
      </span>
    </p>
  );
}
export function UnsavedChangesBarActions({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "flex", flexWrap: "wrap", gap: 6, ...style }} />;
}
export function UnsavedChangesBarSave({
  children = "Save changes",
  onClick,
  className,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useChanges();
  return (
    <button
      {...props}
      type="button"
      disabled={context.status === "saving" || props.disabled}
      className={className ? `uai-unsaved-save ${className}` : "uai-unsaved-save"}
      style={{ ...actionStyle, ...style }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.onSave?.();
      }}
    >
      {context.status === "saving" ? "Saving…" : children}
    </button>
  );
}
export function UnsavedChangesBarDiscard({
  children = "Discard",
  onClick,
  className,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useChanges();
  return (
    <button
      {...props}
      type="button"
      disabled={context.status === "saving" || props.disabled}
      className={className ? `uai-unsaved-discard ${className}` : "uai-unsaved-discard"}
      style={{ ...actionStyle, ...style }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.onDiscard?.();
      }}
    >
      {children}
    </button>
  );
}
