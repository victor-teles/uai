"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/uai-utils";

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
const pricingToggleListVariants = cva(
  "relative isolate inline-flex max-w-full items-center justify-self-start gap-0.5",
  {
    variants: {
      variant: {
        segmented: "rounded-[10px] bg-background p-0.75 shadow-[inset_0_0_0_1px_var(--border)]",
        pill: "rounded-full bg-card p-0.75 shadow-[inset_0_0_0_1px_var(--border)]",
        compact: "rounded-lg bg-transparent p-0",
      },
    },
  },
);
const pricingToggleThumbVariants = cva(
  "pointer-events-none absolute top-0 left-0 -z-1 opacity-0 [transition:transform_220ms_cubic-bezier(0.23,1,0.32,1),width_220ms_cubic-bezier(0.23,1,0.32,1),opacity_120ms_ease-out] group-data-ready/list:opacity-100 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        segmented:
          "rounded-[7px] bg-card shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.08)]",
        pill: "rounded-full bg-accent",
        compact: "rounded-md bg-card shadow-[0_0_0_1px_var(--border)]",
      },
    },
  },
);
const pricingToggleOptionVariants = cva(
  "inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent font-medium whitespace-nowrap text-subtle-foreground [transition:color_120ms_ease-out,background-color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring active:[transform:scale(0.97)] aria-checked:text-foreground motion-reduce:transition-none motion-reduce:active:[transform:none]",
  {
    variants: {
      variant: {
        segmented:
          "h-7 rounded-[7px] px-3 text-[13px]/[18px] not-group-data-ready/list:aria-checked:bg-card",
        pill: "h-7 rounded-full px-3.5 text-[13px]/[18px] not-group-data-ready/list:aria-checked:bg-accent",
        compact:
          "h-6 rounded-md px-2 text-xs/[18px] not-group-data-ready/list:aria-checked:bg-card",
      },
    },
  },
);

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
  className,
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
        data-slot="pricing-toggle"
        data-variant={variant}
        className={cn(
          "grid min-w-0 text-[13px]/[18px] text-foreground",
          variant === "compact" ? "gap-3" : "gap-4",
          className,
        )}
        {...props}
      >
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
      data-slot="pricing-toggle-list"
      className={cn(
        "group/list",
        pricingToggleListVariants({ variant: context.variant }),
        className,
      )}
      {...props}
      ref={ref}
      data-ready={thumb ? "" : undefined}
      onKeyDown={handleKeyDown}
    >
      <span
        aria-hidden="true"
        data-slot="pricing-toggle-thumb"
        className={pricingToggleThumbVariants({ variant: context.variant })}
        style={{
          width: thumb?.width ?? 0,
          height: thumb?.height ?? 0,
          transform: thumb ? `translate(${thumb.x}px, ${thumb.y}px)` : undefined,
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
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: string }) {
  const context = usePricing("PricingToggleOption");
  const checked = context.value === value;
  return (
    // biome-ignore lint/a11y/useSemanticElements: APG radio group built from buttons for custom segmented styling.
    <button
      data-slot="pricing-toggle-option"
      className={cn(pricingToggleOptionVariants({ variant: context.variant }), className)}
      {...props}
      type="button"
      role="radio"
      aria-checked={checked}
      data-value={value}
      tabIndex={checked || context.value === "" ? 0 : -1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.select(value);
      }}
    >
      {children}
    </button>
  );
}

export function PricingToggleSavings({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="pricing-toggle-savings"
      className={cn(
        "inline-flex h-[18px] items-center rounded-full bg-success/14 px-1.5 text-[11px]/4 font-medium text-success tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export function PricingTogglePrice({
  period,
  children,
  className,
  ...props
}: ComponentProps<"span"> & { period: string; children?: ReactNode }) {
  const context = usePricing("PricingTogglePrice");
  if (context.value !== period) return null;
  return (
    <span
      data-slot="pricing-toggle-price"
      className={cn(className)}
      {...props}
      data-period={period}
    >
      {children}
    </span>
  );
}
