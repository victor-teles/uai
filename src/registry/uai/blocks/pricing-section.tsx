"use client";

import { cva } from "class-variance-authority";
import { Check, Minus } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId } from "react";
import { PricingToggle, type PricingToggleVariant } from "@/components/ui/uai/pricing-toggle";
import { cn } from "@/lib/uai-utils";

export const PRICING_SECTION_VARIANTS = ["cards", "joined", "compact"] as const;
export type PricingSectionVariant = (typeof PRICING_SECTION_VARIANTS)[number];
export type PricingSectionProps = Omit<ComponentProps<"section">, "defaultValue" | "onChange"> & {
  variant?: PricingSectionVariant;
  /** Selected billing period, shared with PricingToggleList and PricingTogglePrice children. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type SectionContext = { id: string; variant: PricingSectionVariant };
const Context = createContext<SectionContext | null>(null);
function useSection(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within PricingSection`);
  return context;
}
type PlanContext = { id: string; featured: boolean };
const PlanContext = createContext<PlanContext | null>(null);
function usePlan(part: string) {
  const context = useContext(PlanContext);
  if (!context) throw new Error(`${part} must be used within PricingSectionPlan`);
  return context;
}

const toggleVariants: Record<PricingSectionVariant, PricingToggleVariant> = {
  cards: "segmented",
  joined: "pill",
  compact: "compact",
};
/** Plans, billing periods, limits, and purchase actions. The root owns the billing period through PricingToggle. */
export function PricingSection({
  variant = "cards",
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: PricingSectionProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="pricing-section"
        className={cn("box-border min-w-0 text-[13px]/[18px] text-foreground", className)}
        {...props}
        data-variant={variant}
      >
        <PricingToggle
          variant={toggleVariants[variant]}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          className={variant === "compact" ? "gap-5" : "gap-8"}
        >
          {children}
        </PricingToggle>
      </section>
    </Context.Provider>
  );
}

export function PricingSectionHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="pricing-section-header"
      className={cn("mx-auto grid max-w-[600px] justify-items-center gap-3 text-center", className)}
      {...props}
    />
  );
}

export function PricingSectionTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useSection("PricingSectionTitle");
  return (
    <h2
      data-slot="pricing-section-title"
      className={cn(
        "m-0 font-medium tracking-[-0.025em] text-balance",
        variant === "compact" ? "text-[22px]/[1.15]" : "text-[30px]/[1.15]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function PricingSectionDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="pricing-section-description"
      className={cn("m-0 text-[15px]/[23px] text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

const pricingSectionPlansVariants = cva("m-0 grid list-none p-0", {
  variants: {
    variant: {
      cards: "grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3",
      joined:
        "grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-px overflow-hidden rounded-[14px] border bg-border",
      compact: "grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-2",
    },
  },
});

export function PricingSectionPlans({ className, ...props }: ComponentProps<"ul">) {
  const { variant } = useSection("PricingSectionPlans");
  return (
    <ul
      data-slot="pricing-section-plans"
      className={cn(pricingSectionPlansVariants({ variant }), className)}
      {...props}
    />
  );
}

export type PricingSectionPlanProps = ComponentProps<"li"> & { featured?: boolean };

const pricingSectionPlanVariants = cva("box-border flex min-w-0 flex-col", {
  variants: {
    variant: {
      cards: "gap-3.5 rounded-[14px] border p-5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
      joined: "gap-3.5 rounded-none border-0 p-5 shadow-none",
      compact: "gap-2.5 rounded-xl border p-3.5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
    },
    featured: {
      true: "border-border-strong bg-[color-mix(in_oklab,var(--muted)_60%,var(--card))]",
      false: "bg-card",
    },
  },
});

export function PricingSectionPlan({
  featured = false,
  className,
  ...props
}: PricingSectionPlanProps) {
  const { variant } = useSection("PricingSectionPlan");
  const id = useId();
  return (
    <PlanContext.Provider value={{ id, featured }}>
      <li
        aria-labelledby={`${id}-name`}
        data-slot="pricing-section-plan"
        className={cn(pricingSectionPlanVariants({ variant, featured }), className)}
        {...props}
        data-featured={featured || undefined}
      />
    </PlanContext.Provider>
  );
}

export function PricingSectionPlanName({ className, ...props }: ComponentProps<"h3">) {
  const plan = usePlan("PricingSectionPlanName");
  return (
    <h3
      data-slot="pricing-section-plan-name"
      className={cn("m-0 flex flex-wrap items-center gap-2 text-sm/5 font-medium", className)}
      {...props}
      id={`${plan.id}-name`}
    />
  );
}

export function PricingSectionPlanBadge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="pricing-section-plan-badge"
      className={cn(
        "inline-flex h-5 items-center rounded-full bg-primary/16 px-2 text-[11.5px]/4 font-medium text-[color-mix(in_oklab,var(--primary)_70%,var(--foreground))]",
        className,
      )}
      {...props}
    />
  );
}

export function PricingSectionPlanPrice({ className, ...props }: ComponentProps<"p">) {
  const { variant } = useSection("PricingSectionPlanPrice");
  return (
    <p
      data-slot="pricing-section-plan-price"
      className={cn(
        "m-0 font-medium tracking-[-0.03em] tabular-nums",
        variant === "compact" ? "text-[22px]/[1.1]" : "text-[30px]/[1.1]",
        className,
      )}
      {...props}
    />
  );
}

export function PricingSectionPlanPeriod({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="pricing-section-plan-period"
      className={cn(
        "ml-1 text-[12px] font-normal tracking-normal text-subtle-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function PricingSectionPlanDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="pricing-section-plan-description"
      className={cn("m-0 leading-[19px] text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

export function PricingSectionPlanFeatures({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pricing-section-plan-features"
      className={cn(
        "m-0 grid list-none gap-[9px] border-t border-border/70 px-0 pt-3.5 pb-0.5",
        className,
      )}
      {...props}
    />
  );
}

export type PricingSectionPlanFeatureProps = ComponentProps<"li"> & {
  /** Set to false to show a limit the plan does not include. */
  included?: boolean;
};

export function PricingSectionPlanFeature({
  included = true,
  children,
  className,
  ...props
}: PricingSectionPlanFeatureProps) {
  const Icon = included ? Check : Minus;
  return (
    <li
      data-slot="pricing-section-plan-feature"
      className={cn(
        "flex items-start gap-2",
        included ? "text-foreground" : "text-subtle-foreground",
        className,
      )}
      {...props}
      data-included={included}
    >
      <Icon
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex-none",
          included ? "text-muted-foreground" : "text-border-strong",
        )}
      />
      <span>
        {included ? null : <span className="sr-only">Not included: </span>}
        {children}
      </span>
    </li>
  );
}

const pricingSectionPlanActionVariants = cva(
  [
    "mt-auto inline-flex items-center justify-center rounded-full px-3.5 font-medium whitespace-nowrap no-underline",
    "[transition:filter_120ms_ease-out,box-shadow_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
  ],
  {
    variants: {
      featured: {
        true: "bg-primary text-primary-foreground hover:brightness-108",
        false:
          "bg-secondary text-secondary-foreground hover:shadow-[inset_0_0_0_999px_color-mix(in_oklab,var(--foreground)_9%,transparent)]",
      },
      compact: { true: "h-[30px] text-[12.5px]", false: "h-[34px] text-[13px]" },
    },
  },
);

/** Purchase action. The featured plan uses the accent fill; other plans use a raised pill. */
export function PricingSectionPlanAction({ className, ...props }: ComponentProps<"a">) {
  const plan = usePlan("PricingSectionPlanAction");
  const { variant } = useSection("PricingSectionPlanAction");
  return (
    <a
      data-slot="pricing-section-plan-action"
      className={cn(
        pricingSectionPlanActionVariants({
          featured: plan.featured,
          compact: variant === "compact",
        }),
        className,
      )}
      {...props}
      data-emphasis={plan.featured ? "primary" : "secondary"}
    />
  );
}

export function PricingSectionFootnote({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="pricing-section-footnote"
      className={cn("m-0 text-center text-xs/4 text-subtle-foreground", className)}
      {...props}
    />
  );
}
