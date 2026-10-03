"use client";

import { Check, Minus } from "lucide-react";
import { type ComponentProps, type CSSProperties, createContext, useContext, useId } from "react";
import { PricingToggle, type PricingToggleVariant } from "@/components/ui/uai/pricing-toggle";

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
const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const pricingCss = `
[data-uai-pricing-action]{transition:filter 120ms ease-out,box-shadow 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-pricing-action="secondary"]:hover{box-shadow:inset 0 0 0 999px color-mix(in oklab,var(--uai-text) 9%,transparent)}
[data-uai-pricing-action="primary"]:hover{filter:brightness(1.08)}
[data-uai-pricing-action]:active{transform:scale(0.97)}
[data-uai-pricing-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@media (prefers-reduced-motion:reduce){[data-uai-pricing-action]{transition:none}[data-uai-pricing-action]:active{transform:none}}
`;

/** Plans, billing periods, limits, and purchase actions. The root owns the billing period through PricingToggle. */
export function PricingSection({
  variant = "cards",
  value,
  defaultValue,
  onValueChange,
  children,
  style,
  ...props
}: PricingSectionProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        style={{
          boxSizing: "border-box",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{pricingCss}</style>
        <PricingToggle
          variant={toggleVariants[variant]}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          style={{ gap: variant === "compact" ? 20 : 32 }}
        >
          {children}
        </PricingToggle>
      </section>
    </Context.Provider>
  );
}

export function PricingSectionHeader({ style, ...props }: ComponentProps<"header">) {
  return (
    <header
      {...props}
      style={{
        display: "grid",
        justifyItems: "center",
        gap: 12,
        maxWidth: 600,
        margin: "0 auto",
        textAlign: "center",
        ...style,
      }}
    />
  );
}

export function PricingSectionTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useSection("PricingSectionTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 22 : 30,
        fontWeight: 500,
        lineHeight: 1.15,
        letterSpacing: "-0.025em",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function PricingSectionDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 15,
        lineHeight: "23px",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

export function PricingSectionPlans({ style, ...props }: ComponentProps<"ul">) {
  const { variant } = useSection("PricingSectionPlans");
  const joined = variant === "joined";
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${variant === "compact" ? 180 : 220}px), 1fr))`,
        gap: joined ? 1 : variant === "compact" ? 8 : 12,
        margin: 0,
        padding: 0,
        overflow: joined ? "hidden" : undefined,
        border: joined ? "1px solid var(--uai-border)" : 0,
        borderRadius: joined ? 14 : 0,
        background: joined ? "var(--uai-border)" : "transparent",
        listStyle: "none",
        ...style,
      }}
    />
  );
}

export type PricingSectionPlanProps = ComponentProps<"li"> & { featured?: boolean };

export function PricingSectionPlan({ featured = false, style, ...props }: PricingSectionPlanProps) {
  const { variant } = useSection("PricingSectionPlan");
  const id = useId();
  const joined = variant === "joined";
  const compact = variant === "compact";
  return (
    <PlanContext.Provider value={{ id, featured }}>
      <li
        aria-labelledby={`${id}-name`}
        {...props}
        data-featured={featured || undefined}
        style={{
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: compact ? 10 : 14,
          minWidth: 0,
          padding: compact ? 14 : 20,
          border: joined
            ? 0
            : `1px solid var(${featured ? "--uai-border-strong" : "--uai-border"})`,
          borderRadius: joined ? 0 : compact ? 12 : 14,
          background: featured
            ? "color-mix(in oklab, var(--uai-surface-raised) 60%, var(--uai-surface))"
            : "var(--uai-surface)",
          boxShadow: joined ? "none" : "0 1px 2px oklch(0 0 0 / 0.04)",
          ...style,
        }}
      />
    </PlanContext.Provider>
  );
}

export function PricingSectionPlanName({ style, ...props }: ComponentProps<"h3">) {
  const plan = usePlan("PricingSectionPlanName");
  return (
    <h3
      {...props}
      id={`${plan.id}-name`}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
        margin: 0,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: "20px",
        ...style,
      }}
    />
  );
}

export function PricingSectionPlanBadge({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 8px",
        borderRadius: 999,
        background: "color-mix(in oklab, var(--uai-accent) 16%, transparent)",
        color: "color-mix(in oklab, var(--uai-accent) 70%, var(--uai-text))",
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: "16px",
        ...style,
      }}
    />
  );
}

export function PricingSectionPlanPrice({ style, ...props }: ComponentProps<"p">) {
  const { variant } = useSection("PricingSectionPlanPrice");
  return (
    <p
      {...props}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 22 : 30,
        fontWeight: 500,
        lineHeight: 1.1,
        letterSpacing: "-0.03em",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function PricingSectionPlanPeriod({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        marginLeft: 4,
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontWeight: 400,
        letterSpacing: 0,
        ...style,
      }}
    />
  );
}

export function PricingSectionPlanDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        lineHeight: "19px",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

export function PricingSectionPlanFeatures({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gap: 9,
        margin: 0,
        padding: "14px 0 2px",
        borderTop: "1px solid color-mix(in oklab, var(--uai-border) 70%, transparent)",
        listStyle: "none",
        ...style,
      }}
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
  style,
  ...props
}: PricingSectionPlanFeatureProps) {
  const Icon = included ? Check : Minus;
  return (
    <li
      {...props}
      data-included={included}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        color: included ? "var(--uai-text)" : "var(--uai-subtle)",
        ...style,
      }}
    >
      <Icon
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        style={{
          flex: "none",
          marginTop: 2,
          color: included ? "var(--uai-muted)" : "var(--uai-border-strong)",
        }}
      />
      <span>
        {included ? null : <span style={visuallyHidden}>Not included: </span>}
        {children}
      </span>
    </li>
  );
}

/** Purchase action. The featured plan uses the accent fill; other plans use a raised pill. */
export function PricingSectionPlanAction({ style, ...props }: ComponentProps<"a">) {
  const plan = usePlan("PricingSectionPlanAction");
  const { variant } = useSection("PricingSectionPlanAction");
  return (
    <a
      {...props}
      data-uai-pricing-action={plan.featured ? "primary" : "secondary"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: variant === "compact" ? 30 : 34,
        marginTop: "auto",
        padding: "0 14px",
        borderRadius: 999,
        background: plan.featured ? "var(--uai-accent)" : "var(--uai-surface-raised)",
        color: plan.featured ? "var(--uai-accent-foreground)" : "var(--uai-text)",
        fontSize: variant === "compact" ? 12.5 : 13,
        fontWeight: 500,
        textDecoration: "none",
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

export function PricingSectionFootnote({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        lineHeight: "16px",
        textAlign: "center",
        ...style,
      }}
    />
  );
}
