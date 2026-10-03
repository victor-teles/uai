"use client";

import { cva } from "class-variance-authority";
import { Check, LoaderCircle, LockKeyhole } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  PriceSummary,
  type PriceSummaryProps,
  type PriceSummaryVariant,
} from "@/components/ui/uai/price-summary";
import {
  StatusBanner,
  StatusBannerContent,
  StatusBannerIcon,
  type StatusBannerProps,
} from "@/components/ui/uai/status-banner";
import {
  StepIndicator,
  StepIndicatorStep,
  type StepIndicatorVariant,
} from "@/components/ui/uai/step-indicator";
import { cn } from "@/lib/uai-utils";

export const CHECKOUT_VARIANTS = ["split", "single", "compact"] as const;
export type CheckoutVariant = (typeof CHECKOUT_VARIANTS)[number];
export type CheckoutOrderStatus = "idle" | "placing" | "placed" | "error";
export type CheckoutStepStatus = "complete" | "current" | "upcoming";
export type CheckoutProps = Omit<ComponentProps<"section">, "onSubmit"> & {
  variant?: CheckoutVariant;
  /** Ordered step values, for example ["contact", "delivery", "payment", "review"]. */
  steps: readonly string[];
  step?: string;
  defaultStep?: string;
  onStepChange?: (step: string) => void;
  /** Called with the step's form data when the shopper continues past a step. */
  onStepComplete?: (step: string, data: FormData) => void;
  /** Places the order. Reject the promise to show CheckoutError and keep the review step open. */
  onPlaceOrder?: () => void | Promise<void>;
};

type CheckoutContext = {
  id: string;
  variant: CheckoutVariant;
  steps: readonly string[];
  step: string;
  furthest: number;
  status: CheckoutOrderStatus;
  statusOf: (value: string) => CheckoutStepStatus;
  goTo: (value: string) => void;
  complete: (value: string, data: FormData) => void;
  placeOrder: () => void;
  focusRequest: RefObject<string | null>;
};
const Context = createContext<CheckoutContext | null>(null);
function useCheckout(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within Checkout`);
  return context;
}
type SectionContext = { id: string; value: string; status: CheckoutStepStatus };
const SectionContext = createContext<SectionContext | null>(null);
function useSection(part: string) {
  const context = useContext(SectionContext);
  if (!context) throw new Error(`${part} must be used within CheckoutSection`);
  return context;
}

const progressVariants: Record<CheckoutVariant, StepIndicatorVariant> = {
  split: "horizontal",
  single: "horizontal",
  compact: "compact",
};
const summaryVariants: Record<CheckoutVariant, PriceSummaryVariant> = {
  split: "card",
  single: "card",
  compact: "compact",
};

const checkoutVariants = cva("@container box-border min-w-0 text-[13px]/[18px] text-foreground", {
  variants: {
    variant: { split: "", single: "mx-auto max-w-[640px]", compact: "mx-auto max-w-[520px]" },
  },
});
const checkoutLayoutVariants = cva("grid min-w-0 items-start", {
  variants: {
    variant: {
      split: "gap-5 @min-[760px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] @min-[760px]:gap-x-8",
      single: "gap-5",
      compact: "gap-3",
    },
  },
});
const fullWidth = "@min-[760px]:col-span-full";

/** Guided checkout: contact, delivery, payment, review, and confirmation. */
export function Checkout({
  variant = "split",
  steps,
  step,
  defaultStep,
  onStepChange,
  onStepComplete,
  onPlaceOrder,
  className,
  children,
  ...props
}: CheckoutProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultStep ?? steps[0] ?? "");
  const current = step ?? internal;
  const [furthest, setFurthest] = useState(() => Math.max(steps.indexOf(current), 0));
  const [status, setStatus] = useState<CheckoutOrderStatus>("idle");
  const focusRequest = useRef<string | null>(null);
  const currentIndex = steps.indexOf(current);
  const reached = Math.max(furthest, currentIndex);
  const goTo = (value: string) => {
    if (value === current) return;
    focusRequest.current = value;
    if (step === undefined) setInternal(value);
    onStepChange?.(value);
  };
  const statusOf = (value: string): CheckoutStepStatus => {
    if (status === "placed") return "complete";
    if (value === current) return "current";
    const index = steps.indexOf(value);
    return index !== -1 && index < reached ? "complete" : "upcoming";
  };
  const complete = (value: string, data: FormData) => {
    onStepComplete?.(value, data);
    const index = steps.indexOf(value);
    const next = steps[index + 1];
    setFurthest((previous) => Math.max(previous, index + 1));
    // Return to the furthest step reached when an earlier step was edited.
    const target = steps[Math.max(index + 1, reached)] ?? next;
    if (target) goTo(target);
  };
  const placeOrder = () => {
    if (status === "placing" || status === "placed") return;
    const finish = () => {
      focusRequest.current = "confirmation";
      setStatus("placed");
    };
    const result = onPlaceOrder?.();
    if (!result) return finish();
    setStatus("placing");
    result.then(finish, () => setStatus("error"));
  };
  return (
    <Context.Provider
      value={{
        id,
        variant,
        steps,
        step: current,
        furthest: reached,
        status,
        statusOf,
        goTo,
        complete,
        placeOrder,
        focusRequest,
      }}
    >
      <section
        aria-labelledby={`${id}-title`}
        data-slot="checkout"
        className={cn(checkoutVariants({ variant }), className)}
        {...props}
        data-variant={variant}
        data-status={status}
      >
        <div data-slot="checkout-layout" className={checkoutLayoutVariants({ variant })}>
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function CheckoutHeader({ className, ...props }: ComponentProps<"header">) {
  const { variant } = useCheckout("CheckoutHeader");
  return (
    <header
      data-slot="checkout-header"
      className={cn("grid min-w-0 gap-1.5", variant === "split" && fullWidth, className)}
      {...props}
    />
  );
}

export function CheckoutTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useCheckout("CheckoutTitle");
  return (
    <h2
      data-slot="checkout-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.015em]",
        variant === "compact" ? "text-[18px]/[1.2]" : "text-[22px]/[1.2]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function CheckoutDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="checkout-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Step progress. Compose CheckoutProgressStep for each value in `steps`. */
export function CheckoutProgress({
  "aria-label": ariaLabel = "Checkout progress",
  ...props
}: ComponentProps<"ol">) {
  const { variant } = useCheckout("CheckoutProgress");
  return (
    <div className={cn("min-w-0", variant === "split" && fullWidth)}>
      <StepIndicator
        aria-label={ariaLabel}
        data-slot="checkout-progress"
        {...props}
        variant={progressVariants[variant]}
      />
    </div>
  );
}

/** One progress entry. Its status follows the checkout state. */
export function CheckoutProgressStep({
  value,
  ...props
}: Omit<ComponentProps<typeof StepIndicatorStep>, "status"> & { value: string }) {
  const context = useCheckout("CheckoutProgressStep");
  return (
    <StepIndicatorStep
      data-slot="checkout-progress-step"
      {...props}
      status={context.statusOf(value)}
    />
  );
}

/** The step sections. Replaced by CheckoutConfirmation once the order is placed. */
export function CheckoutMain({ className, ...props }: ComponentProps<"div">) {
  const context = useCheckout("CheckoutMain");
  if (context.status === "placed") return null;
  return (
    <div
      data-slot="checkout-main"
      className={cn("grid min-w-0", context.variant === "compact" ? "gap-2" : "gap-3", className)}
      {...props}
    />
  );
}

export type CheckoutSectionProps = ComponentProps<"section"> & { value: string };

/** One checkout step. Shows its form while current and its summary once complete. */
export function CheckoutSection({ value, className, ...props }: CheckoutSectionProps) {
  const context = useCheckout("CheckoutSection");
  const id = useId();
  const status = context.statusOf(value);
  const compact = context.variant === "compact";
  return (
    <SectionContext.Provider value={{ id, value, status }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="checkout-section"
        className={cn(
          "grid min-w-0 [transition:background-color_180ms_ease-out,box-shadow_180ms_ease-out] motion-reduce:transition-none",
          compact ? "gap-2.5 rounded-xl px-3 py-2.5" : "gap-3.5 rounded-[14px] px-4 py-3.5",
          status === "upcoming" ? "bg-card/50" : "bg-card",
          status === "current" ? "shadow-[inset_0_0_0_1px_var(--border)]" : "shadow-none",
          className,
        )}
        {...props}
        data-status={status}
      />
    </SectionContext.Provider>
  );
}

export function CheckoutSectionHeader({ className, ...props }: ComponentProps<"header">) {
  useSection("CheckoutSectionHeader");
  return (
    <header
      data-slot="checkout-section-header"
      className={cn("flex min-w-0 items-center justify-between gap-3", className)}
      {...props}
    />
  );
}

/** Step heading. Receives focus when the step becomes current through Continue or Edit. */
export function CheckoutSectionTitle({ children, className, ...props }: ComponentProps<"h3">) {
  const checkout = useCheckout("CheckoutSectionTitle");
  const section = useSection("CheckoutSectionTitle");
  const ref = useRef<HTMLHeadingElement>(null);
  const { focusRequest } = checkout;
  useEffect(() => {
    if (section.status === "current" && focusRequest.current === section.value) {
      focusRequest.current = null;
      ref.current?.focus();
    }
  }, [section.status, section.value, focusRequest]);
  const complete = section.status === "complete";
  return (
    <h3
      tabIndex={-1}
      data-slot="checkout-section-title"
      className={cn(
        "m-0 flex items-center gap-2 text-sm/5 font-medium outline-offset-4",
        section.status === "upcoming" ? "text-subtle-foreground" : "text-foreground",
        className,
      )}
      {...props}
      ref={ref}
      id={`${section.id}-title`}
    >
      {complete ? (
        <span
          aria-hidden="true"
          className="grid size-[18px] place-items-center rounded-full bg-success/16 text-success"
        >
          <Check size={11} strokeWidth={2.5} />
        </span>
      ) : null}
      {children}
      {complete ? <span className="sr-only">, complete</span> : null}
    </h3>
  );
}

const checkoutButtonBase = [
  "cursor-pointer border-0 font-medium rounded-full",
  "[transition:background-color_120ms_ease-out,filter_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-97",
  "motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
];

const checkoutPrimaryVariants = cva(
  [
    ...checkoutButtonBase,
    "inline-flex items-center justify-center justify-self-start gap-2 px-[18px] text-[13px] text-primary-foreground enabled:hover:brightness-108",
  ],
  {
    variants: {
      compact: { true: "h-8", false: "h-10" },
      blocked: {
        true: "cursor-not-allowed bg-[color-mix(in_oklab,var(--primary)_55%,var(--card))]",
        false: "bg-primary",
      },
    },
    defaultVariants: { blocked: false },
  },
);

/** Reopens a completed step. Hidden while the step is current or upcoming. */
export function CheckoutSectionEdit({
  children = "Edit",
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const checkout = useCheckout("CheckoutSectionEdit");
  const section = useSection("CheckoutSectionEdit");
  if (section.status !== "complete" || checkout.status === "placed") return null;
  return (
    <button
      type="button"
      aria-describedby={`${section.id}-title`}
      data-slot="checkout-section-edit"
      className={cn(
        checkoutButtonBase,
        "h-[26px] flex-none bg-secondary px-3 text-[12.5px] text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) checkout.goTo(section.value);
      }}
    >
      {children}
    </button>
  );
}

/** What the shopper entered, shown once the step is complete. */
export function CheckoutSectionSummary({ className, ...props }: ComponentProps<"div">) {
  const section = useSection("CheckoutSectionSummary");
  if (section.status !== "complete") return null;
  return (
    <div
      data-slot="checkout-section-summary"
      className={cn("-mt-1.5 min-w-0 pl-[26px] text-[12.5px] text-muted-foreground", className)}
      {...props}
    />
  );
}

const enter =
  "animate-in fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint motion-reduce:animate-none";

/** The step's fields. Native validation runs before the step completes. */
export function CheckoutSectionForm({ onSubmit, className, ...props }: ComponentProps<"form">) {
  const checkout = useCheckout("CheckoutSectionForm");
  const section = useSection("CheckoutSectionForm");
  if (section.status !== "current") return null;
  return (
    <form
      aria-labelledby={`${section.id}-title`}
      data-slot="checkout-section-form"
      className={cn(
        "grid min-w-0",
        checkout.variant === "compact" ? "gap-2.5" : "gap-3.5",
        enter,
        className,
      )}
      {...props}
      onSubmit={(event) => {
        onSubmit?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        checkout.complete(section.value, new FormData(event.currentTarget));
      }}
    />
  );
}

/** Two fields side by side on wide containers; one column when narrow. */
export function CheckoutFieldRow({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="checkout-field-row"
      className={cn(
        "grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3",
        className,
      )}
      {...props}
    />
  );
}

/** Submits the current step and moves to the next one. */
export function CheckoutSectionContinue({
  children = "Continue",
  className,
  ...props
}: ComponentProps<"button">) {
  const checkout = useCheckout("CheckoutSectionContinue");
  useSection("CheckoutSectionContinue");
  return (
    <button
      data-slot="checkout-section-continue"
      className={cn(
        checkoutPrimaryVariants({ compact: checkout.variant === "compact" }),
        className,
      )}
      {...props}
      type="submit"
    >
      {children}
    </button>
  );
}

/**
 * Payment slot. Render your payment provider's hosted fields inside; Uai never collects card
 * data. The region is a labelled group with a lock note.
 */
export function CheckoutPayment({
  "aria-label": ariaLabel = "Payment details",
  children,
  className,
  ...props
}: ComponentProps<"fieldset">) {
  const { variant } = useCheckout("CheckoutPayment");
  return (
    <fieldset
      aria-label={ariaLabel}
      data-slot="checkout-payment"
      className={cn(
        "m-0 grid min-w-0 gap-2.5 border-0 bg-background",
        variant === "compact" ? "rounded-lg p-2.5" : "rounded-[10px] p-3",
        className,
      )}
      {...props}
    >
      {children}
    </fieldset>
  );
}

export function CheckoutPaymentNote({ children, className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="checkout-payment-note"
      className={cn("m-0 flex items-start gap-1.5 text-xs/4 text-subtle-foreground", className)}
      {...props}
    >
      <LockKeyhole size={12} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 flex-none" />
      <span>{children}</span>
    </p>
  );
}

export type CheckoutPlaceOrderProps = ComponentProps<"button"> & { pendingLabel?: ReactNode };

/** Places the order from the review step. */
export function CheckoutPlaceOrder({
  children = "Place order",
  pendingLabel = "Placing order…",
  disabled,
  onClick,
  className,
  ...props
}: CheckoutPlaceOrderProps) {
  const checkout = useCheckout("CheckoutPlaceOrder");
  const placing = checkout.status === "placing";
  const blocked = disabled || placing;
  return (
    <button
      type="button"
      data-slot="checkout-place-order"
      className={cn(
        checkoutPrimaryVariants({ compact: checkout.variant === "compact", blocked }),
        className,
      )}
      {...props}
      disabled={blocked}
      aria-busy={placing || undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) checkout.placeOrder();
      }}
    >
      {placing ? (
        <>
          <LoaderCircle
            size={14}
            aria-hidden="true"
            className="animate-spin [animation-duration:900ms] motion-reduce:animate-none"
          />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Shown when onPlaceOrder rejects. Compose StatusBanner parts inside. */
export function CheckoutError({ children, ...props }: Omit<StatusBannerProps, "tone">) {
  const checkout = useCheckout("CheckoutError");
  if (checkout.status !== "error") return null;
  return (
    <StatusBanner variant="tinted" data-slot="checkout-error" {...props} tone="error">
      <StatusBannerIcon />
      <StatusBannerContent>{children}</StatusBannerContent>
    </StatusBanner>
  );
}

/** Replaces the steps once the order is placed. Its heading receives focus. */
export function CheckoutConfirmation({ className, ...props }: ComponentProps<"div">) {
  const checkout = useCheckout("CheckoutConfirmation");
  if (checkout.status !== "placed") return null;
  return (
    <div
      role="status"
      data-slot="checkout-confirmation"
      className={cn(
        "grid min-w-0 gap-2.5 bg-[color-mix(in_oklab,var(--success)_10%,var(--card))]",
        checkout.variant === "compact" ? "rounded-xl p-3.5" : "rounded-[14px] p-5",
        enter,
        className,
      )}
      {...props}
    />
  );
}

export function CheckoutConfirmationTitle({ className, ...props }: ComponentProps<"h3">) {
  const { focusRequest } = useCheckout("CheckoutConfirmationTitle");
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusRequest.current === "confirmation") {
      focusRequest.current = null;
      ref.current?.focus();
    }
  }, [focusRequest]);
  return (
    <h3
      tabIndex={-1}
      data-slot="checkout-confirmation-title"
      className={cn(
        "m-0 text-base/[22px] font-semibold tracking-[-0.01em] text-[color-mix(in_oklab,var(--success)_70%,var(--foreground))]",
        className,
      )}
      {...props}
      ref={ref}
    />
  );
}

/** Order summary column. Sticky beside the steps in the split layout. */
export function CheckoutSummary({
  "aria-label": ariaLabel = "Order summary",
  className,
  ...props
}: ComponentProps<"aside">) {
  const { variant } = useCheckout("CheckoutSummary");
  return (
    <aside
      aria-label={ariaLabel}
      data-slot="checkout-summary"
      className={cn(
        "grid min-w-0 gap-3",
        variant === "split" && "@min-[760px]:sticky @min-[760px]:top-4",
        className,
      )}
      {...props}
    />
  );
}

/** Totals. Compose PriceSummary parts inside; the block picks the summary style. */
export function CheckoutSummaryTotals(props: Omit<PriceSummaryProps, "variant">) {
  const { variant } = useCheckout("CheckoutSummaryTotals");
  return (
    <PriceSummary
      data-slot="checkout-summary-totals"
      {...props}
      variant={summaryVariants[variant]}
    />
  );
}
