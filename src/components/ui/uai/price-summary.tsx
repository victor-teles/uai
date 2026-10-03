import { type ComponentProps, createContext, type ReactNode, useContext, useId } from "react";

import { cn } from "@/lib/uai-utils";

export const PRICE_SUMMARY_VARIANTS = ["card", "plain", "compact"] as const;
export const PRICE_SUMMARY_TONES = ["default", "muted", "success"] as const;

export type PriceSummaryVariant = (typeof PRICE_SUMMARY_VARIANTS)[number];
export type PriceSummaryTone = (typeof PRICE_SUMMARY_TONES)[number];

export type PriceSummaryProps = ComponentProps<"section"> & {
  variant?: PriceSummaryVariant;
};

function priceSummaryChrome(variant: PriceSummaryVariant) {
  const compact = variant === "compact";

  return {
    rootClass:
      variant === "plain"
        ? "bg-transparent"
        : "border border-[color-mix(in_oklab,var(--uai-border)_60%,transparent)] bg-[var(--uai-surface)]",
    rootStyle: {
      borderRadius: compact ? 12 : variant === "card" ? 14 : 0,
      padding: compact ? 12 : variant === "card" ? 18 : 0,
    },
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
  style,
  "aria-labelledby": ariaLabelledby,
  ...props
}: PriceSummaryProps) {
  const titleId = useId();
  const chrome = priceSummaryChrome(variant);

  return (
    <PriceSummaryContext.Provider value={{ titleId, chrome }}>
      <section
        {...props}
        className={cn("w-full text-[var(--uai-text)]", chrome.rootClass, className)}
        style={{ ...chrome.rootStyle, ...style }}
        data-variant={variant}
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
    <header className={cn(context.chrome.headerClass, className)} {...props}>
      {children}
    </header>
  );
}

export type PriceSummaryTitleProps = ComponentProps<"h2">;

export function PriceSummaryTitle({ children, className, ...props }: PriceSummaryTitleProps) {
  const context = usePriceSummary("PriceSummaryTitle");

  return (
    <h2
      id={context.titleId}
      className={cn("font-medium tracking-[-0.01em]", context.chrome.titleClass, className)}
      {...props}
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
      className={cn("text-[var(--uai-subtle)]", context.chrome.descriptionClass, className)}
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
    <dl className={cn("grid", context.chrome.listClass, className)} {...props}>
      {children}
    </dl>
  );
}

export type PriceSummaryItemProps = ComponentProps<"div"> & {
  label: ReactNode;
  tone?: PriceSummaryTone;
};

const priceSummaryToneClass: Record<PriceSummaryTone, string> = {
  default: "text-[var(--uai-text)]",
  muted: "text-[var(--uai-muted)]",
  success: "text-[var(--uai-success)]",
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
      className={cn("flex min-w-0 items-baseline", context.chrome.itemClass, className)}
      {...props}
    >
      <dt className="min-w-0 text-[var(--uai-muted)] [overflow-wrap:anywhere]">{label}</dt>
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
      className={cn(
        "flex items-end justify-between gap-4 border-t border-[color-mix(in_oklab,var(--uai-border)_60%,transparent)]",
        context.chrome.totalClass,
        className,
      )}
      {...props}
    >
      <dt className="min-w-0 [overflow-wrap:anywhere]">
        <span className={cn("block font-medium", context.chrome.totalLabelClass)}>{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[11.5px] leading-4 text-[var(--uai-subtle)]">
            {hint}
          </span>
        ) : null}
      </dt>
      <dd
        className={cn(
          "ml-auto min-w-0 max-w-[58%] text-right font-semibold tracking-[-0.025em] tabular-nums [overflow-wrap:anywhere]",
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
    <p className={cn("text-[var(--uai-subtle)]", context.chrome.noteClass, className)} {...props}>
      {children}
    </p>
  );
}
