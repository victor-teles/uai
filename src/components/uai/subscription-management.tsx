"use client";

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";
import {
  ConfirmationDialog,
  type ConfirmationDialogProps,
  type ConfirmationDialogVariant,
} from "@/components/ui/uai/confirmation-dialog";
import {
  DescriptionList,
  type DescriptionListProps,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";
import { PricingToggle, type PricingToggleVariant } from "@/components/ui/uai/pricing-toggle";

export const SUBSCRIPTION_MANAGEMENT_VARIANTS = ["split", "stacked", "compact"] as const;
export type SubscriptionManagementVariant = (typeof SUBSCRIPTION_MANAGEMENT_VARIANTS)[number];
export type SubscriptionManagementStatusTone = "active" | "trial" | "past-due" | "canceled";
export type SubscriptionManagementProps = ComponentProps<"section"> & {
  variant?: SubscriptionManagementVariant;
};

type ManagementContext = { id: string; variant: SubscriptionManagementVariant };
const Context = createContext<ManagementContext | null>(null);
function useManagement(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within SubscriptionManagement`);
  return context;
}

const layoutCss = `
[data-uai-subscription-layout]{display:grid;gap:16px;align-items:start;min-width:0}
[data-uai-subscription-column]{display:grid;gap:16px;align-content:start;min-width:0}
[data-uai-subscription="compact"]>[data-uai-subscription-layout],[data-uai-subscription="compact"] [data-uai-subscription-column]{gap:10px}
@container (min-width: 760px){
  [data-uai-subscription="split"]>[data-uai-subscription-layout]{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);column-gap:24px}
  [data-uai-subscription="split"] [data-uai-subscription-full]{grid-column:1 / -1}
}
.uai-subscription-plan{transition:background-color 120ms ease-out,box-shadow 120ms ease-out}
.uai-subscription-plan:hover{background:color-mix(in oklab,var(--uai-surface-raised) 88%,var(--uai-text))}
.uai-subscription-plan:has(input:focus-visible){outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-subscription-plan:has(input:checked){box-shadow:inset 0 0 0 1.5px var(--uai-accent);background:color-mix(in oklab,var(--uai-accent) 8%,var(--uai-surface))}
.uai-subscription-plan:has(input:disabled){opacity:0.55;cursor:not-allowed}
.uai-subscription-meter-fill{transition:width 300ms cubic-bezier(0.23,1,0.32,1)}
.uai-subscription-button{transition:background-color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-subscription-button:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-subscription-button:hover:not(:disabled){filter:brightness(1.08)}
.uai-subscription-button:active:not(:disabled){transform:scale(0.97)}
@media (prefers-reduced-motion: reduce){.uai-subscription-plan,.uai-subscription-meter-fill,.uai-subscription-button{transition:none}.uai-subscription-button:active:not(:disabled){transform:none}}
`;

const toggleVariants: Record<SubscriptionManagementVariant, PricingToggleVariant> = {
  split: "segmented",
  stacked: "pill",
  compact: "compact",
};
const listVariants: Record<SubscriptionManagementVariant, DescriptionListVariant> = {
  split: "inline",
  stacked: "inline",
  compact: "stacked",
};
const dialogVariants: Record<SubscriptionManagementVariant, ConfirmationDialogVariant> = {
  split: "centered",
  stacked: "sheet",
  compact: "compact",
};
const statusColor: Record<SubscriptionManagementStatusTone, string> = {
  active: "var(--uai-success)",
  trial: "var(--uai-accent)",
  "past-due": "var(--uai-warning)",
  canceled: "var(--uai-muted)",
};

function card(variant: SubscriptionManagementVariant) {
  const compact = variant === "compact";
  return {
    boxSizing: "border-box",
    display: "grid",
    gap: compact ? 10 : 14,
    minWidth: 0,
    padding: compact ? 12 : 16,
    borderRadius: compact ? 12 : 14,
    background: "var(--uai-surface)",
  } as const;
}

/** Plan changes, usage limits, payment, renewal, and cancellation for one subscription. */
export function SubscriptionManagement({
  variant = "split",
  children,
  style,
  ...props
}: SubscriptionManagementProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-subscription={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...(variant === "stacked" ? { maxWidth: 640, margin: "0 auto" } : null),
          ...(variant === "compact" ? { maxWidth: 480, margin: "0 auto" } : null),
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-subscription-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function SubscriptionManagementHeader({ style, ...props }: ComponentProps<"header">) {
  useManagement("SubscriptionManagementHeader");
  return (
    <header
      {...props}
      data-uai-subscription-full=""
      style={{ display: "grid", gap: 4, minWidth: 0, ...style }}
    />
  );
}

export function SubscriptionManagementTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useManagement("SubscriptionManagementTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 18 : 22,
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "-0.015em",
        ...style,
      }}
    />
  );
}

export function SubscriptionManagementDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

/** A column in the split layout; stacks on narrow containers. */
export function SubscriptionManagementColumn({ style, ...props }: ComponentProps<"div">) {
  useManagement("SubscriptionManagementColumn");
  return <div {...props} data-uai-subscription-column="" style={style} />;
}

export type SubscriptionManagementPanelProps = ComponentProps<"section"> & {
  title: ReactNode;
  /** Optional element beside the title, such as a status badge. */
  aside?: ReactNode;
};

/** A titled card for the current plan, usage, payment, or cancellation. */
export function SubscriptionManagementPanel({
  title,
  aside,
  children,
  style,
  ...props
}: SubscriptionManagementPanelProps) {
  const { variant } = useManagement("SubscriptionManagementPanel");
  const id = useId();
  return (
    <section aria-labelledby={id} {...props} style={{ ...card(variant), ...style }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <h3 id={id} style={{ margin: 0, fontSize: 13, fontWeight: 500, lineHeight: "20px" }}>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export type SubscriptionManagementStatusProps = ComponentProps<"span"> & {
  tone?: SubscriptionManagementStatusTone;
};

/** Subscription status as a tinted text pill with a colored dot. */
export function SubscriptionManagementStatus({
  tone = "active",
  children,
  style,
  ...props
}: SubscriptionManagementStatusProps) {
  return (
    <span
      {...props}
      data-tone={tone}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 22,
        padding: "0 8px",
        borderRadius: 999,
        background: `color-mix(in oklab, ${statusColor[tone]} 14%, transparent)`,
        color: `color-mix(in oklab, ${statusColor[tone]} 80%, var(--uai-text))`,
        fontSize: 11.5,
        fontWeight: 500,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, borderRadius: 999, background: statusColor[tone] }}
      />
      {children}
    </span>
  );
}

/** The current plan price, large and tabular. */
export function SubscriptionManagementPrice({ style, ...props }: ComponentProps<"p">) {
  const { variant } = useManagement("SubscriptionManagementPrice");
  return (
    <p
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: 6,
        margin: 0,
        fontSize: variant === "compact" ? 20 : 26,
        fontWeight: 600,
        marginTop: 2,
        lineHeight: 1.1,
        letterSpacing: "-0.015em",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function SubscriptionManagementPeriod({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 12.5,
        fontWeight: 400,
        letterSpacing: 0,
        ...style,
      }}
    />
  );
}

/** Renewal or end date text. */
export function SubscriptionManagementRenewal({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12.5, lineHeight: "18px", ...style }}
    />
  );
}

export function SubscriptionManagementMeters({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "grid", gap: 14, ...style }} />;
}

export type SubscriptionManagementMeterProps = Omit<ComponentProps<"div">, "children"> & {
  label: ReactNode;
  value: number;
  max: number;
  /** Visible and announced usage text, for example "8 of 10 seats". */
  valueText: string;
};

/** A usage limit. Turns warning-toned at 80% so approaching limits are visible. */
export function SubscriptionManagementMeter({
  label,
  value,
  max,
  valueText,
  style,
  ...props
}: SubscriptionManagementMeterProps) {
  useManagement("SubscriptionManagementMeter");
  const id = useId();
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const near = ratio >= 0.8;
  return (
    <div {...props} style={{ display: "grid", gap: 6, minWidth: 0, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <span id={id} style={{ fontWeight: 500 }}>
          {label}
        </span>
        <span
          aria-hidden="true"
          style={{
            color: near
              ? "color-mix(in oklab, var(--uai-warning) 70%, var(--uai-text))"
              : "var(--uai-subtle)",
            fontSize: 12.5,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {valueText}
        </span>
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: native meter cannot be styled consistently across browsers. */}
      <div
        role="meter"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
        data-near-limit={near || undefined}
        style={{
          height: 6,
          overflow: "hidden",
          borderRadius: 999,
          background: "var(--uai-surface-raised)",
        }}
      >
        <div
          className="uai-subscription-meter-fill"
          style={{
            width: `${ratio * 100}%`,
            height: "100%",
            borderRadius: 999,
            background: near ? "var(--uai-warning)" : "var(--uai-accent)",
          }}
        />
      </div>
    </div>
  );
}

type PlansContext = {
  name: string;
  current: string;
  selected: string;
  select: (plan: string) => void;
};
const PlansContext = createContext<PlansContext | null>(null);
function usePlans(part: string) {
  const context = useContext(PlansContext);
  if (!context) throw new Error(`${part} must be used within SubscriptionManagementPlans`);
  return context;
}

export type SubscriptionManagementPlansProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  /** The plan the account is on now. */
  currentPlan: string;
  /** Billing period shared with PricingToggleList and PricingTogglePrice children. */
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (period: string) => void;
  /** Called with the chosen plan and billing period when the change is submitted. */
  onPlanChange?: (plan: string, period: string) => void;
};

/** The change-plan form. Compose PricingToggle parts, plan options, and the submit button. */
export function SubscriptionManagementPlans({
  currentPlan,
  period,
  defaultPeriod = "",
  onPeriodChange,
  onPlanChange,
  children,
  style,
  ...props
}: SubscriptionManagementPlansProps) {
  const { variant } = useManagement("SubscriptionManagementPlans");
  const name = useId();
  const [selected, setSelected] = useState(currentPlan);
  const [internalPeriod, setInternalPeriod] = useState(defaultPeriod);
  const currentPeriod = period ?? internalPeriod;
  return (
    <PlansContext.Provider value={{ name, current: currentPlan, selected, select: setSelected }}>
      <form
        {...props}
        onSubmit={(event) => {
          event.preventDefault();
          onPlanChange?.(selected, currentPeriod);
        }}
        style={{ minWidth: 0, ...style }}
      >
        <PricingToggle
          variant={toggleVariants[variant]}
          value={currentPeriod}
          onValueChange={(next) => {
            if (period === undefined) setInternalPeriod(next);
            onPeriodChange?.(next);
          }}
          style={{ gap: variant === "compact" ? 10 : 14 }}
        >
          {children}
        </PricingToggle>
      </form>
    </PlansContext.Provider>
  );
}

/** A radio group of plans. */
export function SubscriptionManagementPlanOptions({
  "aria-label": ariaLabel = "Plans",
  style,
  ...props
}: ComponentProps<"div">) {
  usePlans("SubscriptionManagementPlanOptions");
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
        gap: 8,
        ...style,
      }}
    />
  );
}

export type SubscriptionManagementPlanOptionProps = Omit<
  ComponentProps<"input">,
  "type" | "name" | "value" | "children"
> & {
  value: string;
  children: ReactNode;
  /** Text appended to the current plan, announced with its name. */
  currentLabel?: ReactNode;
};

/** One plan choice. Its label holds the name, price, and limits. */
export function SubscriptionManagementPlanOption({
  value,
  children,
  currentLabel = "Current plan",
  onChange,
  style,
  ...props
}: SubscriptionManagementPlanOptionProps) {
  const plans = usePlans("SubscriptionManagementPlanOption");
  const { variant } = useManagement("SubscriptionManagementPlanOption");
  const current = plans.current === value;
  return (
    <label
      className="uai-subscription-plan"
      style={{
        position: "relative",
        display: "grid",
        gap: 4,
        alignContent: "start",
        minWidth: 0,
        padding: variant === "compact" ? 10 : 12,
        borderRadius: variant === "compact" ? 8 : 10,
        background: "var(--uai-surface-raised)",
        cursor: "pointer",
        ...style,
      }}
    >
      <input
        {...props}
        type="radio"
        name={plans.name}
        value={value}
        checked={plans.selected === value}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented) plans.select(value);
        }}
        style={{ position: "absolute", inset: 0, margin: 0, opacity: 0, cursor: "inherit" }}
      />
      {children}
      {current ? (
        <span
          style={{
            justifySelf: "start",
            marginTop: 4,
            padding: "2px 8px",
            borderRadius: 999,
            background: "color-mix(in oklab, var(--uai-text) 10%, transparent)",
            color: "var(--uai-muted)",
            fontSize: 11.5,
            fontWeight: 500,
            lineHeight: "16px",
          }}
        >
          {currentLabel}
        </span>
      ) : null}
    </label>
  );
}

export function SubscriptionManagementPlanName({ style, ...props }: ComponentProps<"span">) {
  return <span {...props} style={{ fontWeight: 500, ...style }} />;
}

export function SubscriptionManagementPlanDetail({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 12,
        lineHeight: "16px",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export type SubscriptionManagementPlanSubmitProps = ComponentProps<"button">;

/** Submits the plan change. Disabled until a different plan is selected. */
export function SubscriptionManagementPlanSubmit({
  children = "Change plan",
  disabled,
  style,
  ...props
}: SubscriptionManagementPlanSubmitProps) {
  const plans = usePlans("SubscriptionManagementPlanSubmit");
  const { variant } = useManagement("SubscriptionManagementPlanSubmit");
  const blocked = disabled || plans.selected === plans.current;
  return (
    <button
      {...props}
      type="submit"
      disabled={blocked}
      className={
        props.className ? `uai-subscription-button ${props.className}` : "uai-subscription-button"
      }
      style={{
        justifySelf: "start",
        height: variant === "compact" ? 28 : 32,
        padding: "0 14px",
        border: 0,
        borderRadius: 999,
        background: blocked ? "var(--uai-surface-raised)" : "var(--uai-accent)",
        color: blocked ? "var(--uai-subtle)" : "var(--uai-accent-foreground)",
        fontSize: 13,
        fontWeight: 500,
        cursor: blocked ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** Payment method and billing facts. Compose DescriptionList parts inside. */
export function SubscriptionManagementPayment(props: Omit<DescriptionListProps, "variant">) {
  const { variant } = useManagement("SubscriptionManagementPayment");
  return <DescriptionList {...props} variant={listVariants[variant]} />;
}

/** Cancellation. Compose ConfirmationDialog parts inside; the block picks the dialog style. */
export function SubscriptionManagementCancel(props: Omit<ConfirmationDialogProps, "variant">) {
  const { variant } = useManagement("SubscriptionManagementCancel");
  return <ConfirmationDialog {...props} variant={dialogVariants[variant]} />;
}
