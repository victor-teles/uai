"use client";

import { cva } from "class-variance-authority";
import { Check, X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { NumberTick } from "@/lib/uai-number-tick";
import { cn } from "@/lib/uai-utils";

export const PRICE_SUMMARY_VARIANTS = ["card", "plain", "compact"] as const;
export const PRICE_SUMMARY_TONES = ["default", "muted", "success"] as const;

export type PriceSummaryVariant = (typeof PRICE_SUMMARY_VARIANTS)[number];
export type PriceSummaryTone = (typeof PRICE_SUMMARY_TONES)[number];

/**
 * Set `aria-busy` on the root while totals recalculate: the total dims and announces once when
 * done. Set `aria-busy` on an item to show a skeleton in place of just that amount.
 */
export type PriceSummaryProps = ComponentProps<"section"> & {
  variant?: PriceSummaryVariant;
};

const priceSummaryVariants = cva("w-full text-card-foreground", {
  variants: {
    variant: {
      card: "rounded-[14px] border border-border bg-card p-[18px]",
      plain: "rounded-none bg-transparent p-0",
      compact: "rounded-xl border border-border bg-card p-3",
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
    totalClass: "mt-3 pt-3",
    totalLabelClass: compact ? "text-[12.5px] leading-[18px]" : "text-[13px] leading-[18px]",
    totalValueClass: compact ? "text-[16px] leading-5" : "text-[22px] leading-[26px]",
    codeClass: compact ? "h-5" : "h-5.5",
    noteClass: compact ? "mt-2.5 text-[11px] leading-4" : "mt-3 text-[11.5px] leading-4",
  };
}

type PriceSummaryContextValue = {
  titleId: string;
  busy: boolean;
  chrome: ReturnType<typeof priceSummaryChrome>;
};

// Stand-ins for `--success-ink` / `--destructive-ink` until the ink tokens land.
const successInk = "text-[color-mix(in_oklab,var(--success)_75%,var(--foreground))]";
const destructiveInk = "text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]";
const isBusy = (value: unknown) => value === true || value === "true";
/** Ticks a plain-text amount with NumberTick; other children render as given. */
function tickable(children: ReactNode) {
  return typeof children === "string" || typeof children === "number" ? (
    <NumberTick value={String(children)} />
  ) : (
    children
  );
}

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
  "aria-busy": ariaBusy,
  ...props
}: PriceSummaryProps) {
  const titleId = useId();
  const chrome = priceSummaryChrome(variant);
  const busy = isBusy(ariaBusy);

  return (
    <PriceSummaryContext.Provider value={{ titleId, busy, chrome }}>
      <section
        data-slot="price-summary"
        data-variant={variant}
        aria-busy={ariaBusy}
        className={cn(
          priceSummaryVariants({ variant }),
          // An error note keeps the previous total visible but dimmed.
          "has-[[data-slot=price-summary-note][role=alert]]:[&_[data-slot=price-summary-total]_dd]:opacity-45",
          className,
        )}
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
  success: successInk,
};

export function PriceSummaryItem({
  label,
  tone = "default",
  children,
  className,
  ...props
}: PriceSummaryItemProps) {
  const context = usePriceSummary("PriceSummaryItem");
  const pending = isBusy(props["aria-busy"]);
  // While recalculating, the skeleton keeps the previous amount's width.
  const previous = useRef(typeof children === "string" ? children.length : 6);
  if (!pending && typeof children === "string") previous.current = children.length;

  return (
    <div
      data-slot="price-summary-item"
      data-tone={tone}
      className={cn("flex min-w-0 items-center", context.chrome.itemClass, className)}
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
        {pending ? (
          <>
            <span className="sr-only">Updating</span>
            <span
              aria-hidden="true"
              className="ml-auto block h-3 rounded-[4px] bg-[linear-gradient(90deg,var(--muted)_0%,color-mix(in_oklab,var(--muted)_55%,var(--card))_50%,var(--muted)_100%)] bg-size-[200%_100%] motion-safe:animate-skeleton-shimmer"
              style={{ width: `${Math.max(previous.current - 1, 3)}ch` }}
            />
          </>
        ) : (
          tickable(children)
        )}
      </dd>
    </div>
  );
}

export type PriceSummaryCodeProps = ComponentProps<"span"> & {
  /** Called after the chip's exit when the ✕ is pressed. Omit it to hide the ✕. */
  onRemove?: () => void;
  /** Accessible name of the ✕. Defaults to "Remove code <children>". */
  removeLabel?: string;
};

/** A discount code chip, for an item's `label`. Pops in, and leaves in 120ms when removed. */
export function PriceSummaryCode({
  onRemove,
  removeLabel,
  children,
  className,
  ...props
}: PriceSummaryCodeProps) {
  const context = usePriceSummary("PriceSummaryCode");
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!leaving) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => onRemove?.(), reduce ? 0 : 120);
    return () => window.clearTimeout(timer);
  }, [leaving, onRemove]);
  return (
    <span
      data-slot="price-summary-code"
      data-state={leaving ? "closed" : "open"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-muted pr-1 pl-2 font-mono text-[11.5px] leading-4 font-medium text-foreground",
        context.chrome.codeClass,
        !onRemove && "pr-2",
        "animate-in fade-in-0 zoom-in-96 duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-96 data-[state=closed]:fill-mode-forwards data-[state=closed]:duration-120 data-[state=closed]:ease-out motion-reduce:data-[state=closed]:animate-none",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          aria-label={
            removeLabel ?? `Remove code ${typeof children === "string" ? children : ""}`.trim()
          }
          disabled={leaving}
          onClick={() => setLeaving(true)}
          className="grid size-4 cursor-pointer place-items-center rounded-[4px] border-0 bg-transparent p-0 text-subtle-foreground transition-[color,background-color,scale] duration-[100ms,100ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] hover:bg-foreground/8 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid enabled:active:scale-[0.92] motion-reduce:transition-none motion-reduce:enabled:active:scale-100"
        >
          <X className="size-3" strokeWidth={2.2} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

export type PriceSummarySavingsProps = ComponentProps<"div">;

/**
 * States what the discounts save. Expands in 300ms when it gets text and collapses when its
 * children become empty, keeping the last text during the collapse.
 */
export function PriceSummarySavings({ children, className, ...props }: PriceSummarySavingsProps) {
  usePriceSummary("PriceSummarySavings");
  const open = children !== null && children !== undefined && children !== false && children !== "";
  const last = useRef<ReactNode>(children);
  if (open) last.current = children;
  return (
    <div
      data-slot="price-summary-savings"
      data-state={open ? "open" : "closed"}
      aria-hidden={!open || undefined}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-out-quint motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className,
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">
        <p
          className={cn(
            "m-0 mt-3 flex h-7.5 items-center gap-2 rounded-lg bg-success/10 px-2.5 text-[12px] leading-4 font-medium tabular-nums",
            successInk,
          )}
        >
          <Check className="size-3.5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
          {last.current}
        </p>
      </div>
    </div>
  );
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

  return (
    <div
      data-slot="price-summary-total"
      className={cn(
        "flex items-end justify-between gap-4 border-t border-border",
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
        aria-live="polite"
        aria-busy={context.busy || undefined}
        className={cn(
          "ml-auto min-w-0 max-w-[58%] text-right font-semibold tracking-[-0.025em] tabular-nums wrap-anywhere",
          "transition-opacity duration-120 ease-out motion-reduce:transition-none",
          context.busy && "opacity-45",
          context.chrome.totalValueClass,
        )}
      >
        {tickable(children)}
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
      className={cn(
        "text-subtle-foreground",
        props.role === "alert" && destructiveInk,
        context.chrome.noteClass,
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
