"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from "react";

import { cn } from "@/lib/uai-utils";

export const PRICE_SUMMARY_VARIANTS = ["card", "plain", "compact"] as const;
export const PRICE_SUMMARY_TONES = ["default", "muted", "success"] as const;

export type PriceSummaryVariant = (typeof PRICE_SUMMARY_VARIANTS)[number];
export type PriceSummaryTone = (typeof PRICE_SUMMARY_TONES)[number];

export type PriceSummaryProps = ComponentProps<"section"> & {
  variant?: PriceSummaryVariant;
};

const priceSummaryVariants = cva("w-full text-card-foreground", {
  variants: {
    variant: {
      card: "rounded-[14px] border border-border/60 bg-card p-[18px]",
      plain: "rounded-none bg-transparent p-0",
      compact: "rounded-xl border border-border/60 bg-card p-3",
    },
  },
});

function priceSummaryChrome(variant: PriceSummaryVariant) {
  const compact = variant === "compact";

  return {
    headerClass: compact ? "mb-3" : "mb-4",
    titleClass: compact ? "text-[13px] leading-[18px]" : "text-[14px] leading-5",
    descriptionClass: compact ? "mt-0.5 text-[11.5px] leading-4" : "mt-0.5 text-[12px] leading-4",
    listClass: compact ? "gap-1.5" : "gap-2",
    itemClass: compact ? "text-[12px] leading-4" : "text-[13px] leading-[18px]",
    totalClass: compact ? "mt-3 pt-3" : "mt-4 pt-4",
    totalLabelClass: compact ? "text-[12.5px] leading-[18px]" : "text-[13px] leading-[18px]",
    totalValueClass: compact ? "text-[16px] leading-5" : "text-[20px] leading-6",
    noteClass: compact ? "mt-2.5 text-[11px] leading-4" : "mt-3 text-[11.5px] leading-4",
  };
}

type PriceSummaryContextValue = {
  titleId: string;
  chrome: ReturnType<typeof priceSummaryChrome>;
};

const PriceSummaryContext = createContext<PriceSummaryContextValue | null>(null);

function usePriceSummary(name: string) {
  const context = useContext(PriceSummaryContext);
  if (!context) throw new Error(`${name} must be used within PriceSummary`);
  return context;
}

export function PriceSummary({
  variant = "card",
  children,
  className,
  "aria-labelledby": ariaLabelledby,
  ...props
}: PriceSummaryProps) {
  const titleId = useId();
  const chrome = priceSummaryChrome(variant);

  return (
    <PriceSummaryContext.Provider value={{ titleId, chrome }}>
      <section
        data-slot="price-summary"
        data-variant={variant}
        className={cn(priceSummaryVariants({ variant }), className)}
        {...props}
        aria-labelledby={ariaLabelledby ?? titleId}
      >
        {children}
      </section>
    </PriceSummaryContext.Provider>
  );
}

export type PriceSummaryHeaderProps = ComponentProps<"header">;

export function PriceSummaryHeader({ children, className, ...props }: PriceSummaryHeaderProps) {
  const context = usePriceSummary("PriceSummaryHeader");

  return (
    <header
      data-slot="price-summary-header"
      className={cn(context.chrome.headerClass, className)}
      {...props}
    >
      {children}
    </header>
  );
}

export type PriceSummaryTitleProps = ComponentProps<"h2">;

export function PriceSummaryTitle({ children, className, ...props }: PriceSummaryTitleProps) {
  const context = usePriceSummary("PriceSummaryTitle");

  return (
    <h2
      data-slot="price-summary-title"
      className={cn("font-medium tracking-[-0.01em]", context.chrome.titleClass, className)}
      {...props}
      id={context.titleId}
    >
      {children}
    </h2>
  );
}

export type PriceSummaryDescriptionProps = ComponentProps<"p">;

export function PriceSummaryDescription({
  children,
  className,
  ...props
}: PriceSummaryDescriptionProps) {
  const context = usePriceSummary("PriceSummaryDescription");

  return (
    <p
      data-slot="price-summary-description"
      className={cn("text-subtle-foreground", context.chrome.descriptionClass, className)}
      {...props}
    >
      {children}
    </p>
  );
}

export type PriceSummaryListProps = ComponentProps<"dl">;

export function PriceSummaryList({ children, className, ...props }: PriceSummaryListProps) {
  const context = usePriceSummary("PriceSummaryList");

  return (
    <dl
      data-slot="price-summary-list"
      className={cn("grid", context.chrome.listClass, className)}
      {...props}
    >
      {children}
    </dl>
  );
}

export type PriceSummaryItemProps = ComponentProps<"div"> & {
  label: ReactNode;
  tone?: PriceSummaryTone;
};

const priceSummaryToneClass: Record<PriceSummaryTone, string> = {
  default: "text-card-foreground",
  muted: "text-muted-foreground",
  success: "text-success",
};

export function PriceSummaryItem({
  label,
  tone = "default",
  children,
  className,
  ...props
}: PriceSummaryItemProps) {
  const context = usePriceSummary("PriceSummaryItem");

  return (
    <div
      data-slot="price-summary-item"
      data-tone={tone}
      className={cn("flex min-w-0 items-baseline", context.chrome.itemClass, className)}
      {...props}
    >
      <dt className="min-w-0 text-muted-foreground wrap-anywhere">{label}</dt>
      <span className="min-w-4 flex-1" aria-hidden="true" />
      <dd
        className={cn(
          "max-w-[58%] shrink-0 break-words text-right font-medium tabular-nums",
          priceSummaryToneClass[tone],
        )}
      >
        {children}
      </dd>
    </div>
  );
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Ticks the total in place when its text changes, so a new amount reads as an update.
function useValueTick<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const previous = useRef<string | null>(null);
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const text = element.textContent;
    const changed = previous.current !== null && previous.current !== text;
    previous.current = text;
    if (!changed || typeof element.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    element.animate(
      [
        { opacity: 0.4, transform: "translateY(3px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
  });
  return ref;
}

export type PriceSummaryTotalProps = ComponentProps<"div"> & {
  label?: ReactNode;
  hint?: ReactNode;
};

export function PriceSummaryTotal({
  label = "Total",
  hint,
  children,
  className,
  ...props
}: PriceSummaryTotalProps) {
  const context = usePriceSummary("PriceSummaryTotal");
  const valueRef = useValueTick<HTMLElement>();

  return (
    <div
      data-slot="price-summary-total"
      className={cn(
        "flex items-end justify-between gap-4 border-t border-border/60",
        context.chrome.totalClass,
        className,
      )}
      {...props}
    >
      <dt className="min-w-0 wrap-anywhere">
        <span className={cn("block font-medium", context.chrome.totalLabelClass)}>{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[11.5px] leading-4 text-subtle-foreground">
            {hint}
          </span>
        ) : null}
      </dt>
      <dd
        ref={valueRef}
        className={cn(
          "ml-auto min-w-0 max-w-[58%] text-right font-semibold tracking-[-0.025em] tabular-nums wrap-anywhere",
          context.chrome.totalValueClass,
        )}
      >
        {children}
      </dd>
    </div>
  );
}

export type PriceSummaryNoteProps = ComponentProps<"p">;

export function PriceSummaryNote({ children, className, ...props }: PriceSummaryNoteProps) {
  const context = usePriceSummary("PriceSummaryNote");

  return (
    <p
      data-slot="price-summary-note"
      className={cn("text-subtle-foreground", context.chrome.noteClass, className)}
      {...props}
    >
      {children}
    </p>
  );
}
