"use client";

import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const PRICING_TOGGLE_VARIANTS = ["segmented", "pill", "compact"] as const;
export type PricingToggleVariant = (typeof PRICING_TOGGLE_VARIANTS)[number];
export type PricingToggleProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  variant?: PricingToggleVariant;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};
type PricingContext = {
  variant: PricingToggleVariant;
  value: string;
  select: (value: string) => void;
};
const Context = createContext<PricingContext | null>(null);
function usePricing(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within PricingToggle`);
  return context;
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const pricingCss = `
.uai-pricing-list{position:relative;isolation:isolate}
.uai-pricing-thumb{position:absolute;top:0;left:0;z-index:-1;pointer-events:none;opacity:0;transition:transform 220ms cubic-bezier(0.23,1,0.32,1),width 220ms cubic-bezier(0.23,1,0.32,1),opacity 120ms ease-out}
.uai-pricing-list[data-ready] .uai-pricing-thumb{opacity:1}
.uai-pricing-option{background:transparent;color:var(--uai-subtle);transition:color 120ms ease-out,background-color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-pricing-option:hover{color:var(--uai-text)}
.uai-pricing-option[aria-checked=true]{color:var(--uai-text)}
.uai-pricing-list:not([data-ready]) .uai-pricing-option[aria-checked=true]{background:var(--uai-pricing-thumb)}
.uai-pricing-option:active{transform:scale(0.97)}
.uai-pricing-option:focus-visible{outline:2px solid var(--uai-accent);outline-offset:1px}
@media (prefers-reduced-motion: reduce){
.uai-pricing-thumb,.uai-pricing-option{transition:none}
.uai-pricing-option:active{transform:none}
}
`;
const tracks: Record<PricingToggleVariant, CSSProperties> = {
  segmented: {
    padding: 3,
    borderRadius: 10,
    background: "var(--uai-canvas)",
    boxShadow: "inset 0 0 0 1px var(--uai-border)",
    ["--uai-pricing-thumb" as string]: "var(--uai-surface)",
  },
  pill: {
    padding: 3,
    borderRadius: 999,
    background: "var(--uai-surface)",
    boxShadow: "inset 0 0 0 1px var(--uai-border)",
    ["--uai-pricing-thumb" as string]: "var(--uai-surface-raised)",
  },
  compact: {
    padding: 0,
    borderRadius: 8,
    background: "transparent",
    ["--uai-pricing-thumb" as string]: "var(--uai-surface)",
  },
};
const thumbs: Record<PricingToggleVariant, CSSProperties> = {
  segmented: {
    borderRadius: 7,
    boxShadow: "0 0 0 1px var(--uai-border), 0 1px 2px oklch(0 0 0 / 0.08)",
  },
  pill: { borderRadius: 999 },
  compact: { borderRadius: 6, boxShadow: "0 0 0 1px var(--uai-border)" },
};

/** Reads the selected billing period inside PricingToggle. */
export function usePricingPeriod() {
  return usePricing("usePricingPeriod").value;
}

export function PricingToggle({
  variant = "segmented",
  value,
  defaultValue = "",
  onValueChange,
  children,
  style,
  ...props
}: PricingToggleProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const select = (next: string) => {
    if (next === current) return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <Context.Provider value={{ variant, value: current, select }}>
      <div
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          gap: variant === "compact" ? 12 : 16,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{pricingCss}</style>
        {children}
      </div>
    </Context.Provider>
  );
}

const MOVES: Record<string, (index: number, count: number) => number> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
};

export function PricingToggleList({
  className,
  style,
  onKeyDown,
  children,
  ...props
}: ComponentProps<"div">) {
  const context = usePricing("PricingToggleList");
  const ref = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; y: number; width: number; height: number }>();
  useIsomorphicLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => {
      const checked = list.querySelector<HTMLElement>("[role=radio][aria-checked=true]");
      if (!checked || checked.offsetWidth === 0) return setThumb(undefined);
      setThumb({
        x: checked.offsetLeft,
        y: checked.offsetTop,
        width: checked.offsetWidth,
        height: checked.offsetHeight,
      });
    };
    measure();
    if (typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [context.value]);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const move = MOVES[event.key];
    if (event.defaultPrevented || !move || !ref.current) return;
    const options = Array.from(
      ref.current.querySelectorAll<HTMLButtonElement>("[role=radio]:not(:disabled)"),
    );
    if (options.length === 0) return;
    event.preventDefault();
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    const next = options[move(Math.max(index, 0), options.length)];
    next?.focus();
    if (next?.dataset.value) context.select(next.dataset.value);
  };
  return (
    <div
      role="radiogroup"
      {...props}
      ref={ref}
      data-ready={thumb ? "" : undefined}
      className={["uai-pricing-list", className].filter(Boolean).join(" ")}
      onKeyDown={handleKeyDown}
      style={{
        display: "inline-flex",
        justifySelf: "start",
        alignItems: "center",
        gap: 2,
        maxWidth: "100%",
        ...tracks[context.variant],
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        className="uai-pricing-thumb"
        style={{
          width: thumb?.width ?? 0,
          height: thumb?.height ?? 0,
          transform: thumb ? `translate(${thumb.x}px, ${thumb.y}px)` : undefined,
          background: "var(--uai-pricing-thumb)",
          ...thumbs[context.variant],
        }}
      />
      {children}
    </div>
  );
}

export function PricingToggleOption({
  value,
  children,
  onClick,
  className,
  style,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: string }) {
  const context = usePricing("PricingToggleOption");
  const checked = context.value === value;
  const compact = context.variant === "compact";
  const pill = context.variant === "pill";
  return (
    // biome-ignore lint/a11y/useSemanticElements: APG radio group built from buttons for custom segmented styling.
    <button
      {...props}
      type="button"
      role="radio"
      aria-checked={checked}
      data-value={value}
      tabIndex={checked || context.value === "" ? 0 : -1}
      className={["uai-pricing-option", className].filter(Boolean).join(" ")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: compact ? 24 : 28,
        padding: compact ? "0 8px" : pill ? "0 14px" : "0 12px",
        border: 0,
        borderRadius: pill ? 999 : compact ? 6 : 7,
        fontSize: compact ? 12 : 13,
        fontWeight: 500,
        lineHeight: "18px",
        whiteSpace: "nowrap",
        cursor: "pointer",
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.select(value);
      }}
    >
      {children}
    </button>
  );
}

export function PricingToggleSavings({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        padding: "0 6px",
        borderRadius: 999,
        background: "color-mix(in oklab, var(--uai-success) 14%, transparent)",
        color: "var(--uai-success)",
        fontSize: 11,
        fontWeight: 500,
        lineHeight: "16px",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function PricingTogglePrice({
  period,
  children,
  ...props
}: ComponentProps<"span"> & { period: string; children?: ReactNode }) {
  const context = usePricing("PricingTogglePrice");
  if (context.value !== period) return null;
  return (
    <span {...props} data-period={period}>
      {children}
    </span>
  );
}
