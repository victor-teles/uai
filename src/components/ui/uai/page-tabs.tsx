"use client";

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
  style,
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
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          gap: 16,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      />
    </Context.Provider>
  );
}

/** Lays out the tab list beside page actions. */
export function PageTabsBar({ style, ...props }: ComponentProps<"div">) {
  const context = useTabs("PageTabsBar");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 0,
        borderBottom: context.variant === "underline" ? "1px solid var(--uai-border)" : undefined,
        ...style,
      }}
    />
  );
}

type Thumb = { left: number; top: number; width: number; height: number };
const ListContext = createContext(false);
const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

function thumbStyle(variant: PageTabsVariant, thumb: Thumb): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    left: 0,
    pointerEvents: "none",
    transition: `transform 240ms ${easeOut}, width 240ms ${easeOut}`,
  };
  if (variant === "underline") {
    return {
      ...base,
      top: thumb.top + thumb.height - 2,
      width: Math.max(0, thumb.width - 16),
      height: 2,
      borderRadius: 2,
      background: "var(--uai-text)",
      transform: `translateX(${thumb.left + 8}px)`,
    };
  }
  return {
    ...base,
    top: thumb.top,
    width: thumb.width,
    height: thumb.height,
    borderRadius: variant === "pill" ? 999 : 9,
    background: variant === "pill" ? "var(--uai-surface-raised)" : "var(--uai-surface)",
    boxShadow:
      variant === "segmented"
        ? "0 0 0 1px var(--uai-border), 0 1px 2px oklch(0 0 0 / 0.08)"
        : undefined,
    transform: `translateX(${thumb.left}px)`,
  };
}

export function PageTabsList({ style, onKeyDown, children, ...props }: ComponentProps<"div">) {
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
      {...props}
      ref={ref}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) move(event);
      }}
      style={{
        position: "relative",
        isolation: "isolate",
        display: "flex",
        flex: "1 1 auto",
        alignItems: "center",
        gap: context.variant === "underline" ? 4 : 2,
        minWidth: 0,
        overflowX: "auto",
        scrollbarWidth: "none",
        overscrollBehaviorX: "contain",
        padding: context.variant === "segmented" ? 3 : 0,
        borderRadius: context.variant === "segmented" ? 12 : 0,
        background: context.variant === "segmented" ? "var(--uai-surface-raised)" : undefined,
        ...style,
      }}
    >
      {thumb ? (
        <span
          aria-hidden="true"
          data-page-tabs-thumb=""
          style={{
            ...thumbStyle(context.variant, thumb),
            zIndex: -1,
            ...(settled ? null : { transition: "none" }),
          }}
        />
      ) : null}
      <ListContext.Provider value={thumb !== null}>{children}</ListContext.Provider>
    </div>
  );
}

const tabInteraction =
  "text-[var(--uai-subtle)] [transition:color_120ms_ease-out,background-color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] enabled:hover:text-[var(--uai-muted)] enabled:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--uai-accent)] motion-reduce:transition-none motion-reduce:active:scale-100";

export function PageTabsTab({
  value,
  children,
  style,
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
        className={[tabInteraction, className].filter(Boolean).join(" ")}
        style={{
          position: "relative",
          display: "inline-flex",
          flex: "0 0 auto",
          alignItems: "center",
          gap: 6,
          height: variant === "underline" ? 40 : 28,
          padding: variant === "underline" ? "0 8px" : "0 12px",
          border: 0,
          borderRadius: variant === "underline" ? 0 : variant === "pill" ? 999 : 9,
          background: !fallback
            ? "transparent"
            : variant === "pill"
              ? "var(--uai-surface-raised)"
              : variant === "segmented"
                ? "var(--uai-surface)"
                : "transparent",
          boxShadow: !fallback
            ? undefined
            : variant === "underline"
              ? "inset 0 -2px 0 var(--uai-text)"
              : variant === "segmented"
                ? "0 0 0 1px var(--uai-border), 0 1px 2px oklch(0 0 0 / 0.08)"
                : undefined,
          color: selected ? "var(--uai-text)" : undefined,
          font: "inherit",
          fontSize: variant === "underline" ? 13 : 12.5,
          fontWeight: 500,
          whiteSpace: "nowrap",
          cursor: props.disabled ? "not-allowed" : "pointer",
          opacity: props.disabled ? 0.45 : 1,
          ...style,
        }}
      >
        {children}
      </button>
    </TabContext.Provider>
  );
}

export function PageTabsCount({ style, ...props }: ComponentProps<"span">) {
  const selected = useContext(TabContext);
  useTabs("PageTabsCount");
  if (selected === null) throw new Error("PageTabsCount must be used within PageTabsTab");
  return (
    <span
      {...props}
      style={{
        minWidth: 18,
        padding: "0 6px",
        borderRadius: 999,
        background: `color-mix(in oklab, var(--uai-text) ${selected ? 10 : 6}%, transparent)`,
        color: selected ? "var(--uai-text)" : "var(--uai-subtle)",
        fontSize: 11,
        lineHeight: "17px",
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        textAlign: "center",
        transition: "background-color 120ms ease-out, color 120ms ease-out",
        ...style,
      }}
    />
  );
}

/** Page-level actions that sit beside the tabs. They are not part of the tab list. */
export function PageTabsActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flex: "0 0 auto", alignItems: "center", gap: 6, ...style }}
    />
  );
}

export function PageTabsPanel({
  value,
  style,
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
      {...props}
      id={`${context.id}-panel-${slug(value)}`}
      aria-labelledby={`${context.id}-tab-${slug(value)}`}
      ref={ref}
      hidden={!selected}
      style={{ minWidth: 0, ...style }}
    />
  );
}
