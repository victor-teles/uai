"use client";

import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import { type ComponentProps, createContext, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/uai-utils";

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
/** How long the bar confirms a successful save before it leaves. */
const SAVED_MS = 1200;
const EXIT_MS = 150;
type Phase = "open" | "saved" | "closing" | "closed";
type ChangesContext = {
  /** `saved` is internal: the bar confirms a save after `dirty` turns false. */
  status: "idle" | "saving" | "error" | "saved";
  onSave?: () => void;
  onDiscard?: () => void;
};
const Context = createContext<ChangesContext | null>(null);
const unsavedChangesBarVariants = cva(
  "sticky z-10 flex flex-wrap items-center border-solid border-border bg-card text-card-foreground",
  {
    variants: {
      variant: {
        bar: "bottom-0 gap-3 rounded-none border-x-0 border-y px-4 py-2.5 text-[13px]/[18px]",
        floating:
          "bottom-4 gap-3 rounded-2xl border-0 py-2 pr-2 pl-4 text-[13px]/[18px] shadow-[0_0_0_1px_var(--border-strong),0_12px_32px_-12px_oklch(0_0_0/0.45)]",
        compact: "bottom-0 gap-2 rounded-xl border py-1.5 pr-1.5 pl-3 text-[12.5px]/[18px]",
      },
    },
  },
);
const actionClass =
  "h-7.5 cursor-pointer whitespace-nowrap rounded-full border-0 px-3.5 py-0 text-[12.5px] font-medium transition-[background-color,filter,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid enabled:active:scale-[0.97] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-60 has-[>svg]:px-3.5 motion-reduce:transition-none motion-reduce:enabled:active:scale-100";
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

  // When `dirty` turns false after a `saving` status, confirm the save, then play the exit.
  // Any other clean transition (discard, synchronous save) unmounts at once, as before.
  const [phase, setPhase] = useState<Phase>(dirty ? "open" : "closed");
  const [saved, setSaved] = useState(false);
  const [wasDirty, setWasDirty] = useState(dirty);
  const [lastStatus, setLastStatus] = useState(status);
  if (dirty && status !== lastStatus) setLastStatus(status);
  if (dirty !== wasDirty) {
    setWasDirty(dirty);
    const confirmed = !dirty && (lastStatus === "saving" || status === "saving");
    setSaved(confirmed);
    setPhase(dirty ? "open" : confirmed ? "saved" : "closed");
  }
  useEffect(() => {
    if (phase !== "saved" && phase !== "closing") return;
    const timer = window.setTimeout(
      () => setPhase(phase === "saved" ? "closing" : "closed"),
      phase === "saved" ? SAVED_MS : EXIT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "closed") return null;
  return (
    <Context.Provider value={{ status: saved ? "saved" : status, onSave, onDiscard }}>
      <section
        aria-label="Unsaved changes"
        data-slot="unsaved-changes-bar"
        data-variant={variant}
        data-state={phase}
        className={cn(
          unsavedChangesBarVariants({ variant }),
          phase === "closing"
            ? "animate-out fade-out-0 slide-out-to-bottom-1 fill-mode-forwards duration-150 ease-out motion-reduce:hidden"
            : "animate-in fade-in-0 slide-in-from-bottom-1 zoom-in-98 duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none",
          className,
        )}
        {...props}
        aria-busy={status === "saving"}
      >
        {children}
      </section>
    </Context.Provider>
  );
}
export function UnsavedChangesBarMessage({ children, className, ...props }: ComponentProps<"p">) {
  const context = useChanges();
  const error = context.status === "error";
  const saved = context.status === "saved";
  return (
    <p
      data-slot="unsaved-changes-bar-message"
      className={cn(
        "m-0 flex min-w-0 flex-[1_1_140px] items-center gap-2 font-medium",
        error
          ? "text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]"
          : "text-foreground",
        className,
      )}
      {...props}
      role={error ? "alert" : "status"}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full ring-3",
          "transition-colors duration-200 ease-out motion-reduce:transition-none",
          error
            ? "bg-destructive ring-destructive/22"
            : saved
              ? "bg-success ring-success/22"
              : "bg-warning ring-warning/22",
        )}
      />
      <span
        className={
          context.status === "saving"
            ? "shimmer-text motion-reduce:text-muted-foreground"
            : undefined
        }
      >
        {children ??
          (context.status === "saving"
            ? "Saving changes…"
            : saved
              ? "Changes saved."
              : error
                ? "Changes could not be saved. Try again."
                : "You have unsaved changes.")}
      </span>
    </p>
  );
}
export function UnsavedChangesBarActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="unsaved-changes-bar-actions"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    />
  );
}
export function UnsavedChangesBarSave({
  children = "Save changes",
  savedLabel = "Saved",
  onClick,
  className,
  ...props
}: ComponentProps<"button"> & { savedLabel?: string }) {
  const context = useChanges();
  const saved = context.status === "saved";
  return (
    <Button
      data-slot="unsaved-changes-bar-save"
      variant="default"
      className={cn(
        actionClass,
        saved
          ? "gap-1.5 bg-success/14 text-success hover:bg-success/14 disabled:cursor-default disabled:opacity-100"
          : "bg-primary text-primary-foreground hover:bg-primary enabled:hover:brightness-108",
        className,
      )}
      {...props}
      type="button"
      disabled={context.status === "saving" || saved || props.disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.onSave?.();
      }}
    >
      {saved ? (
        <>
          <Check
            className="size-3.5 animate-in fade-in-0 zoom-in-50 duration-200 ease-out-quint motion-reduce:animate-none"
            strokeWidth={2.2}
            aria-hidden="true"
          />
          {savedLabel}
        </>
      ) : context.status === "saving" ? (
        "Saving…"
      ) : (
        children
      )}
    </Button>
  );
}
export function UnsavedChangesBarDiscard({
  children = "Discard",
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useChanges();
  return (
    <Button
      data-slot="unsaved-changes-bar-discard"
      variant="secondary"
      className={cn(
        actionClass,
        "bg-secondary text-secondary-foreground hover:bg-secondary enabled:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
        className,
      )}
      {...props}
      type="button"
      disabled={context.status === "saving" || context.status === "saved" || props.disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.onDiscard?.();
      }}
    >
      {children}
    </Button>
  );
}
