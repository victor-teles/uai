"use client";

import { cva } from "class-variance-authority";
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
import { cn } from "@/lib/uai-utils";

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
const splitPaneVariants = cva(
  "flex min-h-0 min-w-0 overflow-hidden text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        card: "gap-0 rounded-[14px] border bg-card p-0",
        flush: "gap-0 rounded-none border-0 bg-card p-0",
        inset: "gap-1 rounded-[14px] border-0 bg-muted p-1",
      },
      orientation: { horizontal: "flex-row", vertical: "flex-col" },
    },
  },
);
const splitPanePaneVariants = cva("min-h-0 min-w-0 overflow-auto bg-card", {
  variants: {
    variant: {
      card: "rounded-none",
      flush: "rounded-none",
      inset: "rounded-[10px] shadow-[0_1px_2px_oklch(0_0_0/0.06)]",
    },
  },
});

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
  className,
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
        data-slot="split-pane"
        className={cn(splitPaneVariants({ variant, orientation }), className)}
        {...props}
        ref={rootRef}
        data-variant={variant}
        data-orientation={orientation}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

export function SplitPanePrimary({ className, style, ...props }: ComponentProps<"div">) {
  const context = useSplit("SplitPanePrimary");
  return (
    <div
      data-slot="split-pane-primary"
      className={cn(splitPanePaneVariants({ variant: context.variant }), className)}
      {...props}
      id={`${context.id}-primary`}
      data-split-pane-region="primary"
      style={{ flex: `0 0 ${context.value}%`, ...style }}
    />
  );
}

export function SplitPaneSecondary({ className, ...props }: ComponentProps<"div">) {
  const context = useSplit("SplitPaneSecondary");
  return (
    <div
      data-slot="split-pane-secondary"
      className={cn(splitPanePaneVariants({ variant: context.variant }), "flex-[1_1_0]", className)}
      {...props}
      data-split-pane-region="secondary"
    />
  );
}

export function SplitPaneHandle({
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
      data-slot="split-pane-handle"
      className={cn(
        "group/split-handle relative z-1 grid flex-none touch-none place-items-center outline-none",
        horizontal ? "h-full w-3 cursor-col-resize" : "h-3 w-full cursor-row-resize",
        context.variant === "inset" ? "m-0" : horizontal ? "-mx-1.5" : "-my-1.5",
        className,
      )}
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
    >
      <span
        aria-hidden="true"
        data-slot="split-pane-handle-line"
        className={cn(
          "[transition:background-color_120ms_ease-out,transform_140ms_ease-out] motion-reduce:transition-none",
          horizontal ? "h-full w-px" : "h-px w-full",
          focused
            ? "bg-ring"
            : dragging
              ? "bg-border-strong"
              : context.variant === "inset"
                ? "bg-transparent"
                : "bg-border",
          active && (horizontal ? "[transform:scaleX(2)]" : "[transform:scaleY(2)]"),
        )}
      />
      <span
        aria-hidden="true"
        data-slot="split-pane-handle-grip"
        className={cn(
          "absolute rounded-full [transition:background-color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
          horizontal ? "h-7 w-1" : "h-1 w-7",
          active
            ? "bg-foreground"
            : "bg-border-strong group-hover/split-handle:bg-muted-foreground motion-safe:group-hover/split-handle:scale-110",
          context.variant !== "inset" && "shadow-[0_0_0_2px_var(--card)]",
          dragging && "[transform:scale(1.1)]",
        )}
      />
    </div>
  );
}
