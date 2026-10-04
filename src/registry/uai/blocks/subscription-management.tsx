"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { cn } from "@/lib/uai-utils";

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
const statusVariants = cva(
  "inline-flex h-[22px] items-center gap-1.5 rounded-full px-2 text-[11.5px] font-medium",
  {
    variants: {
      tone: {
        active: "bg-success/14 text-[color-mix(in_oklab,var(--success)_80%,var(--foreground))]",
        trial: "bg-primary/14 text-[color-mix(in_oklab,var(--primary)_80%,var(--foreground))]",
        "past-due": "bg-warning/14 text-[color-mix(in_oklab,var(--warning)_80%,var(--foreground))]",
        canceled:
          "bg-muted-foreground/14 text-[color-mix(in_oklab,var(--muted-foreground)_80%,var(--foreground))]",
      },
    },
  },
);
const statusDotColor: Record<SubscriptionManagementStatusTone, string> = {
  active: "bg-success",
  trial: "bg-primary",
  "past-due": "bg-warning",
  canceled: "bg-muted-foreground",
};

const subscriptionManagementVariants = cva(
  "@container box-border min-w-0 text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        split: "",
        stacked: "mx-auto max-w-[640px]",
        compact: "mx-auto max-w-[480px]",
      },
    },
  },
);

/** Plan changes, usage limits, payment, renewal, and cancellation for one subscription. */
export function SubscriptionManagement({
  variant = "split",
  children,
  className,
  ...props
}: SubscriptionManagementProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="subscription-management"
        className={cn(subscriptionManagementVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        <div
          data-slot="subscription-management-layout"
          className={cn(
            "grid min-w-0 items-start",
            variant === "compact" ? "gap-2.5" : "gap-4",
            variant === "split" &&
              "@min-[760px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] @min-[760px]:gap-x-6",
          )}
        >
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function SubscriptionManagementHeader({ className, ...props }: ComponentProps<"header">) {
  const { variant } = useManagement("SubscriptionManagementHeader");
  return (
    <header
      data-slot="subscription-management-header"
      className={cn(
        "grid min-w-0 gap-1",
        variant === "split" && "@min-[760px]:col-span-full",
        className,
      )}
      {...props}
    />
  );
}

export function SubscriptionManagementTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useManagement("SubscriptionManagementTitle");
  return (
    <h2
      data-slot="subscription-management-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.015em]",
        variant === "compact" ? "text-lg/[1.2]" : "text-[22px]/[1.2]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function SubscriptionManagementDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="subscription-management-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** A column in the split layout; stacks on narrow containers. */
export function SubscriptionManagementColumn({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useManagement("SubscriptionManagementColumn");
  return (
    <div
      data-slot="subscription-management-column"
      className={cn(
        "grid min-w-0 content-start",
        variant === "compact" ? "gap-2.5" : "gap-4",
        className,
      )}
      {...props}
    />
  );
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
  className,
  ...props
}: SubscriptionManagementPanelProps) {
  const { variant } = useManagement("SubscriptionManagementPanel");
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      data-slot="subscription-management-panel"
      className={cn(
        "box-border grid min-w-0 bg-card",
        variant === "compact" ? "gap-2.5 rounded-xl p-3" : "gap-3.5 rounded-[14px] p-4",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={id} className="m-0 text-[13px]/5 font-medium">
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
  className,
  ...props
}: SubscriptionManagementStatusProps) {
  return (
    <span
      data-slot="subscription-management-status"
      className={cn(statusVariants({ tone }), className)}
      {...props}
      data-tone={tone}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", statusDotColor[tone])} />
      {children}
    </span>
  );
}

/** The current plan price, large and tabular. */
export function SubscriptionManagementPrice({ className, ...props }: ComponentProps<"p">) {
  const { variant } = useManagement("SubscriptionManagementPrice");
  return (
    <p
      data-slot="subscription-management-price"
      className={cn(
        "m-0 mt-0.5 flex flex-wrap items-baseline gap-1.5 font-semibold tracking-[-0.015em] tabular-nums",
        variant === "compact" ? "text-xl/[1.1]" : "text-[26px]/[1.1]",
        className,
      )}
      {...props}
    />
  );
}

export function SubscriptionManagementPeriod({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="subscription-management-period"
      className={cn("text-[12.5px] font-normal tracking-normal text-subtle-foreground", className)}
      {...props}
    />
  );
}

/** Renewal or end date text. */
export function SubscriptionManagementRenewal({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="subscription-management-renewal"
      className={cn("m-0 text-[12.5px]/[18px] text-muted-foreground", className)}
      {...props}
    />
  );
}

export function SubscriptionManagementMeters({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="subscription-management-meters"
      className={cn("grid gap-3.5", className)}
      {...props}
    />
  );
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
  className,
  ...props
}: SubscriptionManagementMeterProps) {
  useManagement("SubscriptionManagementMeter");
  const id = useId();
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const near = ratio >= 0.8;
  return (
    <div
      data-slot="subscription-management-meter"
      className={cn("grid min-w-0 gap-1.5", className)}
      {...props}
    >
      <div className="flex justify-between gap-2">
        <span id={id} className="font-medium">
          {label}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "text-[12.5px] tabular-nums",
            near
              ? "text-[color-mix(in_oklab,var(--warning)_70%,var(--foreground))]"
              : "text-subtle-foreground",
          )}
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
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out-quint motion-reduce:transition-none",
            near ? "bg-warning" : "bg-primary",
          )}
          style={{ width: `${ratio * 100}%` }}
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
  className,
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
        data-slot="subscription-management-plans"
        className={cn("min-w-0", className)}
        {...props}
        onSubmit={(event) => {
          event.preventDefault();
          onPlanChange?.(selected, currentPeriod);
        }}
      >
        <PricingToggle
          variant={toggleVariants[variant]}
          value={currentPeriod}
          onValueChange={(next) => {
            if (period === undefined) setInternalPeriod(next);
            onPeriodChange?.(next);
          }}
          className={variant === "compact" ? "gap-2.5" : "gap-3.5"}
        >
          {children}
        </PricingToggle>
      </form>
    </PlansContext.Provider>
  );
}

export type SubscriptionManagementPlanOptionsProps = Omit<
  ComponentProps<typeof RadioGroup>,
  "value" | "defaultValue" | "onValueChange" | "name"
>;

/** A radio group of plans. */
export function SubscriptionManagementPlanOptions({
  "aria-label": ariaLabel = "Plans",
  className,
  ...props
}: SubscriptionManagementPlanOptionsProps) {
  const plans = usePlans("SubscriptionManagementPlanOptions");
  return (
    <RadioGroup
      aria-label={ariaLabel}
      data-slot="subscription-management-plan-options"
      className={cn(
        "grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-2",
        className,
      )}
      {...props}
      name={plans.name}
      value={plans.selected}
      onValueChange={plans.select}
    />
  );
}

export type SubscriptionManagementPlanOptionProps = Omit<
  ComponentProps<typeof RadioGroupItem>,
  "value" | "children"
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
  className,
  style,
  ...props
}: SubscriptionManagementPlanOptionProps) {
  const plans = usePlans("SubscriptionManagementPlanOption");
  const { variant } = useManagement("SubscriptionManagementPlanOption");
  const current = plans.current === value;
  return (
    <Label
      data-slot="subscription-management-plan-option"
      className={cn(
        "relative grid min-w-0 cursor-pointer content-start items-stretch gap-1 bg-muted text-[length:inherit] leading-[inherit] font-normal select-auto transition-[background-color,box-shadow] duration-120 ease-[ease-out] hover:bg-[color-mix(in_oklab,var(--muted)_88%,var(--foreground))] has-[[role=radio]:focus-visible]:outline-2 has-[[role=radio]:focus-visible]:outline-offset-2 has-[[role=radio]:focus-visible]:outline-ring has-[[role=radio][data-state=checked]]:bg-[color-mix(in_oklab,var(--primary)_8%,var(--card))] has-[[role=radio][data-state=checked]]:shadow-[inset_0_0_0_1.5px_var(--primary)] has-[[role=radio]:disabled]:cursor-not-allowed has-[[role=radio]:disabled]:opacity-55 motion-reduce:transition-none",
        variant === "compact" ? "rounded-lg p-2.5" : "rounded-[10px] p-3",
        className,
      )}
      style={style}
    >
      <RadioGroupItem
        {...props}
        value={value}
        className="absolute inset-0 m-0 aspect-auto size-auto cursor-[inherit] rounded-[inherit] border-0 opacity-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      {children}
      {current ? (
        <span className="mt-1 justify-self-start rounded-full bg-foreground/10 px-2 py-0.5 text-[11.5px]/4 font-medium text-muted-foreground">
          {currentLabel}
        </span>
      ) : null}
    </Label>
  );
}

export function SubscriptionManagementPlanName({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="subscription-management-plan-name"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

export function SubscriptionManagementPlanDetail({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="subscription-management-plan-detail"
      className={cn("text-xs/4 text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export type SubscriptionManagementPlanSubmitProps = ComponentProps<"button">;

/** Submits the plan change. Disabled until a different plan is selected. */
export function SubscriptionManagementPlanSubmit({
  children = "Change plan",
  disabled,
  className,
  ...props
}: SubscriptionManagementPlanSubmitProps) {
  const plans = usePlans("SubscriptionManagementPlanSubmit");
  const { variant } = useManagement("SubscriptionManagementPlanSubmit");
  const blocked = disabled || plans.selected === plans.current;
  return (
    <Button
      data-slot="subscription-management-plan-submit"
      variant="default"
      className={cn(
        "justify-self-start rounded-full border-0 px-3.5 py-0 text-[13px] transition-[background-color,filter,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring has-[>svg]:px-3.5 enabled:hover:brightness-108 enabled:active:scale-[0.97] disabled:pointer-events-auto disabled:opacity-100 motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
        variant === "compact" ? "h-7" : "h-8",
        blocked
          ? "cursor-not-allowed bg-secondary text-subtle-foreground hover:bg-secondary"
          : "cursor-pointer bg-primary text-primary-foreground hover:bg-primary",
        className,
      )}
      {...props}
      type="submit"
      disabled={blocked}
    >
      {children}
    </Button>
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
