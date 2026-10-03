"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/uai-utils";

export const PAGE_TABS_VARIANTS = ["underline", "pill", "segmented"] as const;
export type PageTabsVariant = (typeof PAGE_TABS_VARIANTS)[number];
export type PageTabsProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  variant?: PageTabsVariant;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};
type TabsContext = {
  id: string;
  value: string;
  variant: PageTabsVariant;
  select: (value: string) => void;
};
const Context = createContext<TabsContext | null>(null);
function useTabs(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within PageTabs`);
  return context;
}
const TabContext = createContext<boolean | null>(null);
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
function slug(value: string) {
  return value.replace(/[^\w-]/g, "_");
}

export function PageTabs({
  variant = "underline",
  value,
  defaultValue = "",
  onValueChange,
  className,
  ...props
}: PageTabsProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  return (
    <Context.Provider
      value={{
        id,
        value: current,
        variant,
        select: (next) => {
          if (next === current) return;
          if (value === undefined) setInternal(next);
          onValueChange?.(next);
        },
      }}
    >
      <div
        data-slot="page-tabs"
        data-variant={variant}
        className={cn("grid min-w-0 gap-4 text-[13px]/[18px] text-foreground", className)}
        {...props}
      />
    </Context.Provider>
  );
}

/** Lays out the tab list beside page actions. */
export function PageTabsBar({ className, ...props }: ComponentProps<"div">) {
  const context = useTabs("PageTabsBar");
  return (
    <div
      data-slot="page-tabs-bar"
      className={cn(
        "flex min-w-0 items-center gap-3",
        context.variant === "underline" && "border-b",
        className,
      )}
      {...props}
    />
  );
}

type Thumb = { left: number; top: number; width: number; height: number };
const ListContext = createContext(false);
const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

const pageTabsThumbVariants = cva(
  "pointer-events-none absolute left-0 -z-1 transition-[transform,width] duration-240 ease-out-quint",
  {
    variants: {
      variant: {
        underline: "h-0.5 rounded-[2px] bg-foreground",
        pill: "rounded-full bg-accent",
        segmented:
          "rounded-[9px] bg-card shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.08)]",
      },
    },
  },
);

function thumbStyle(variant: PageTabsVariant, thumb: Thumb): React.CSSProperties {
  if (variant === "underline") {
    return {
      top: thumb.top + thumb.height - 2,
      width: Math.max(0, thumb.width - 16),
      transform: `translateX(${thumb.left + 8}px)`,
    };
  }
  return {
    top: thumb.top,
    width: thumb.width,
    height: thumb.height,
    transform: `translateX(${thumb.left}px)`,
  };
}

export function PageTabsList({ className, onKeyDown, children, ...props }: ComponentProps<"div">) {
  const context = useTabs("PageTabsList");
  const ref = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<Thumb | null>(null);
  const [settled, setSettled] = useState(false);
  // Measure the selected tab so a single thumb can slide between tabs.
  useIsomorphicLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => {
      const tab = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!tab) return setThumb(null);
      const next = {
        left: tab.offsetLeft,
        top: tab.offsetTop,
        width: tab.offsetWidth,
        height: tab.offsetHeight,
      };
      setThumb((current) =>
        current &&
        current.left === next.left &&
        current.top === next.top &&
        current.width === next.width &&
        current.height === next.height
          ? current
          : next,
      );
    };
    measure();
    if (typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const tab of list.querySelectorAll('[role="tab"]')) observer.observe(tab);
    return () => observer.disconnect();
  }, [context.value]);
  // Skip the slide on first paint so the thumb does not fly in from the left edge.
  useEffect(() => {
    if (!thumb || settled) return;
    const frame = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(frame);
  }, [thumb, settled]);
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
    );
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const target = {
      ArrowRight: tabs[(index + 1) % tabs.length],
      ArrowLeft: tabs[(index - 1 + tabs.length) % tabs.length],
      Home: tabs[0],
      End: tabs[tabs.length - 1],
    }[event.key];
    if (!target || index === -1) return;
    event.preventDefault();
    target.focus();
    target.click();
  };
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      data-slot="page-tabs-list"
      className={cn(
        "relative isolate flex min-w-0 flex-[1_1_auto] items-center overflow-x-auto overscroll-x-contain [scrollbar-width:none]",
        context.variant === "underline" ? "gap-1" : "gap-0.5",
        context.variant === "segmented" && "rounded-xl bg-muted p-0.75",
        className,
      )}
      {...props}
      ref={ref}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) move(event);
      }}
    >
      {thumb ? (
        <span
          aria-hidden="true"
          data-page-tabs-thumb=""
          data-slot="page-tabs-thumb"
          className={cn(
            pageTabsThumbVariants({ variant: context.variant }),
            !settled && "transition-none",
          )}
          style={thumbStyle(context.variant, thumb)}
        />
      ) : null}
      <ListContext.Provider value={thumb !== null}>{children}</ListContext.Provider>
    </div>
  );
}

const pageTabsTabVariants = cva(
  "relative inline-flex flex-none cursor-pointer items-center gap-1.5 border-0 bg-transparent font-medium whitespace-nowrap [transition:color_120ms_ease-out,background-color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        underline: "h-10 rounded-none px-2 text-[13px]",
        pill: "h-7 rounded-full px-3 text-[12.5px]",
        segmented: "h-7 rounded-[9px] px-3 text-[12.5px]",
      },
      fallback: { true: "", false: "" },
    },
    compoundVariants: [
      {
        variant: "underline",
        fallback: true,
        className: "shadow-[inset_0_-2px_0_var(--foreground)]",
      },
      { variant: "pill", fallback: true, className: "bg-accent" },
      {
        variant: "segmented",
        fallback: true,
        className: "bg-card shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.08)]",
      },
    ],
  },
);

export function PageTabsTab({
  value,
  children,
  className,
  onClick,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: string }) {
  const context = useTabs("PageTabsTab");
  // The list paints a sliding thumb once it has measured; until then the tab paints itself.
  const thumb = useContext(ListContext);
  const selected = context.value === value;
  const { variant } = context;
  const fallback = selected && !thumb;
  return (
    <TabContext.Provider value={selected}>
      <button
        type="button"
        role="tab"
        data-slot="page-tabs-tab"
        className={cn(
          pageTabsTabVariants({ variant, fallback }),
          selected
            ? "text-foreground"
            : "text-subtle-foreground enabled:hover:text-muted-foreground",
          className,
        )}
        {...props}
        id={`${context.id}-tab-${slug(value)}`}
        aria-selected={selected}
        aria-controls={`${context.id}-panel-${slug(value)}`}
        tabIndex={selected ? 0 : -1}
        data-state={selected ? "active" : "inactive"}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          context.select(value);
          event.currentTarget.scrollIntoView?.({ block: "nearest", inline: "nearest" });
        }}
      >
        {children}
      </button>
    </TabContext.Provider>
  );
}

export function PageTabsCount({ className, ...props }: ComponentProps<"span">) {
  const selected = useContext(TabContext);
  useTabs("PageTabsCount");
  if (selected === null) throw new Error("PageTabsCount must be used within PageTabsTab");
  return (
    <span
      data-slot="page-tabs-count"
      className={cn(
        "min-w-[18px] rounded-full px-1.5 text-center text-[11px]/[17px] font-medium tabular-nums transition-[background-color,color] duration-120 ease-[ease-out]",
        selected ? "bg-foreground/10 text-foreground" : "bg-foreground/6 text-subtle-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Page-level actions that sit beside the tabs. They are not part of the tab list. */
export function PageTabsActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="page-tabs-actions"
      className={cn("flex flex-none items-center gap-1.5", className)}
      {...props}
    />
  );
}

export function PageTabsPanel({
  value,
  className,
  ...props
}: Omit<ComponentProps<"div">, "value"> & { value: string }) {
  const context = useTabs("PageTabsPanel");
  const selected = context.value === value;
  const ref = useRef<HTMLDivElement>(null);
  const shown = useRef(selected);
  // Fade the incoming panel so switching tabs reads as one continuous motion.
  useIsomorphicLayoutEffect(() => {
    const wasShown = shown.current;
    shown.current = selected;
    const panel = ref.current;
    if (!selected || wasShown || !panel || typeof panel.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    panel.animate(
      [
        { opacity: 0, transform: "translateY(4px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 220, easing: easeOut },
    );
  }, [selected]);
  return (
    <div
      role="tabpanel"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: APG tabs make panels focusable so panels without focusable content stay reachable.
      tabIndex={0}
      data-slot="page-tabs-panel"
      className={cn("min-w-0", className)}
      {...props}
      id={`${context.id}-panel-${slug(value)}`}
      aria-labelledby={`${context.id}-tab-${slug(value)}`}
      ref={ref}
      hidden={!selected}
    />
  );
}
