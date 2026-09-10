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
        style={{
          position: "sticky",
          bottom: variant === "floating" ? 16 : 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          padding: variant === "compact" ? 10 : 16,
          background: "var(--uai-surface)",
          color: "var(--uai-text)",
          border: "1px solid var(--uai-border-strong)",
          borderRadius: variant === "bar" ? 0 : variant === "compact" ? 12 : 14,
          boxShadow: variant === "floating" ? "0 8px 24px #0002" : undefined,
          fontSize: 13,
          ...style,
        }}
      >
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
      style={{ margin: 0, flex: "1 1 140px", ...style }}
    >
      {children ??
        (context.status === "saving"
          ? "Saving changes…"
          : context.status === "error"
            ? "Changes could not be saved. Try again."
            : "You have unsaved changes.")}
    </p>
  );
}
export function UnsavedChangesBarActions({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "flex", flexWrap: "wrap", gap: 8, ...style }} />;
}
export function UnsavedChangesBarSave({
  children = "Save changes",
  onClick,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useChanges();
  return (
    <button
      {...props}
      type="button"
      disabled={context.status === "saving" || props.disabled}
      style={{
        border: 0,
        borderRadius: 8,
        background: "var(--uai-text)",
        color: "var(--uai-surface)",
        padding: "8px 12px",
        ...style,
      }}
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
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useChanges();
  return (
    <button
      {...props}
      type="button"
      disabled={context.status === "saving" || props.disabled}
      style={{
        border: "1px solid var(--uai-border-strong)",
        borderRadius: 8,
        background: "transparent",
        color: "inherit",
        padding: "8px 12px",
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.onDiscard?.();
      }}
    >
      {children}
    </button>
  );
}
