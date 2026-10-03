"use client";

import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type PointerEvent,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export const SPLIT_PANE_VARIANTS = ["card", "flush", "inset"] as const;
export type SplitPaneVariant = (typeof SPLIT_PANE_VARIANTS)[number];
export type SplitPaneOrientation = "horizontal" | "vertical";
export type SplitPaneProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  variant?: SplitPaneVariant;
  orientation?: SplitPaneOrientation;
  /** Size of the primary region as a percentage of the container. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Persist the proportion in localStorage under this key. */
  storageKey?: string;
};
type SplitContext = {
  id: string;
  value: number;
  min: number;
  max: number;
  step: number;
  orientation: SplitPaneOrientation;
  variant: SplitPaneVariant;
  rootRef: React.RefObject<HTMLDivElement | null>;
  change: (value: number) => void;
};
const Context = createContext<SplitContext | null>(null);
function useSplit(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within SplitPane`);
  return context;
}
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value * 10) / 10));
}

export function SplitPane({
  variant = "card",
  orientation = "horizontal",
  value,
  defaultValue = 50,
  onValueChange,
  min = 20,
  max = 80,
  step = 5,
  storageKey,
  children,
  style,
  ...props
}: SplitPaneProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(() => clamp(defaultValue, min, max));
  const current = clamp(value ?? internal, min, max);
  const change = (next: number) => {
    const bounded = clamp(next, min, max);
    if (bounded === current) return;
    if (value === undefined) setInternal(bounded);
    onValueChange?.(bounded);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, String(bounded));
      } catch {}
    }
  };
  const restore = useRef({ storageKey, min, max, value, onValueChange });
  useEffect(() => {
    const {
      storageKey: key,
      min: low,
      max: high,
      value: controlled,
      onValueChange: notify,
    } = restore.current;
    if (!key) return;
    let stored: number;
    try {
      stored = Number(window.localStorage.getItem(key));
    } catch {
      return;
    }
    if (!Number.isFinite(stored) || stored <= 0) return;
    const bounded = clamp(stored, low, high);
    if (controlled === undefined) setInternal(bounded);
    notify?.(bounded);
  }, []);
  return (
    <Context.Provider
      value={{ id, value: current, min, max, step, orientation, variant, rootRef, change }}
    >
      <div
        {...props}
        ref={rootRef}
        data-variant={variant}
        data-orientation={orientation}
        style={{
          display: "flex",
          flexDirection: orientation === "horizontal" ? "row" : "column",
          gap: variant === "inset" ? 4 : 0,
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
          padding: variant === "inset" ? 4 : 0,
          border: variant === "card" ? "1px solid var(--uai-border)" : 0,
          borderRadius: variant === "flush" ? 0 : 14,
          background: variant === "inset" ? "var(--uai-surface-raised)" : "var(--uai-surface)",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

function paneStyle(variant: SplitPaneVariant): React.CSSProperties {
  return {
    minWidth: 0,
    minHeight: 0,
    overflow: "auto",
    background: "var(--uai-surface)",
    borderRadius: variant === "inset" ? 10 : 0,
    boxShadow: variant === "inset" ? "0 1px 2px oklch(0 0 0 / 0.06)" : undefined,
  };
}

export function SplitPanePrimary({ style, ...props }: ComponentProps<"div">) {
  const context = useSplit("SplitPanePrimary");
  return (
    <div
      {...props}
      id={`${context.id}-primary`}
      data-split-pane-region="primary"
      style={{ ...paneStyle(context.variant), flex: `0 0 ${context.value}%`, ...style }}
    />
  );
}

export function SplitPaneSecondary({ style, ...props }: ComponentProps<"div">) {
  const context = useSplit("SplitPaneSecondary");
  return (
    <div
      {...props}
      data-split-pane-region="secondary"
      style={{ ...paneStyle(context.variant), flex: "1 1 0", ...style }}
    />
  );
}

export function SplitPaneHandle({
  style,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  className,
  ...props
}: ComponentProps<"div">) {
  const context = useSplit("SplitPaneHandle");
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const lastExpanded = useRef(context.value);
  const horizontal = context.orientation === "horizontal";
  const toPercent = (event: PointerEvent<HTMLDivElement>) => {
    const box = context.rootRef.current?.getBoundingClientRect();
    if (!box) return context.value;
    const size = horizontal ? box.width : box.height;
    if (!size) return context.value;
    const offset = horizontal ? event.clientX - box.left : event.clientY - box.top;
    return (offset / size) * 100;
  };
  const keys: Record<string, () => number> = {
    [horizontal ? "ArrowLeft" : "ArrowUp"]: () => context.value - context.step,
    [horizontal ? "ArrowRight" : "ArrowDown"]: () => context.value + context.step,
    Home: () => context.min,
    End: () => context.max,
    Enter: () => {
      if (context.value > context.min) {
        lastExpanded.current = context.value;
        return context.min;
      }
      return lastExpanded.current > context.min ? lastExpanded.current : 50;
    },
  };
  const active = dragging || focused;
  return (
    // biome-ignore lint/a11y/useSemanticElements: an <hr> cannot be focusable or expose a value; this is the APG window splitter.
    <div
      role="separator"
      tabIndex={0}
      aria-label="Resize panels"
      {...props}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-valuenow={context.value}
      aria-valuemin={context.min}
      aria-valuemax={context.max}
      aria-controls={`${context.id}-primary`}
      data-dragging={dragging || undefined}
      className={["group/split-handle", className].filter(Boolean).join(" ")}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        const next = keys[event.key];
        if (event.defaultPrevented || !next) return;
        event.preventDefault();
        context.change(next());
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        event.currentTarget.focus();
        setDragging(true);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (dragging) context.change(toPercent(event));
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        if (!dragging) return;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        setDragging(false);
      }}
      style={{
        position: "relative",
        flex: "0 0 auto",
        display: "grid",
        placeItems: "center",
        width: horizontal ? 12 : "100%",
        height: horizontal ? "100%" : 12,
        margin: context.variant === "inset" ? 0 : horizontal ? "0 -6px" : "-6px 0",
        zIndex: 1,
        cursor: horizontal ? "col-resize" : "row-resize",
        touchAction: "none",
        outline: "none",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: horizontal ? 1 : "100%",
          height: horizontal ? "100%" : 1,
          background: focused
            ? "var(--uai-accent)"
            : dragging
              ? "var(--uai-border-strong)"
              : context.variant === "inset"
                ? "transparent"
                : "var(--uai-border)",
          transform: active ? (horizontal ? "scaleX(2)" : "scaleY(2)") : "none",
          transition: "background-color 120ms ease-out, transform 140ms ease-out",
        }}
      />
      <span
        aria-hidden="true"
        className={
          active
            ? undefined
            : "bg-[var(--uai-border-strong)] group-hover/split-handle:bg-[var(--uai-muted)] motion-safe:group-hover/split-handle:scale-110"
        }
        style={{
          position: "absolute",
          width: horizontal ? 4 : 28,
          height: horizontal ? 28 : 4,
          borderRadius: 999,
          background: active ? "var(--uai-text)" : undefined,
          boxShadow: context.variant === "inset" ? undefined : "0 0 0 2px var(--uai-surface)",
          transform: dragging ? "scale(1.1)" : undefined,
          transition:
            "background-color 120ms ease-out, transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      />
    </div>
  );
}
