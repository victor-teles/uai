"use client";

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

const layoutCss = `
[data-uai-checkout-layout]{display:grid;gap:20px;align-items:start;min-width:0}
[data-uai-checkout="compact"]>[data-uai-checkout-layout]{gap:12px}
@container (min-width: 760px){
  [data-uai-checkout="split"]>[data-uai-checkout-layout]{grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);column-gap:32px}
  [data-uai-checkout="split"] [data-uai-checkout-full]{grid-column:1 / -1}
  [data-uai-checkout="split"] [data-uai-checkout-summary]{position:sticky;top:16px}
}
.uai-checkout-spin{animation:uai-checkout-spin 900ms linear infinite}
@keyframes uai-checkout-spin{to{transform:rotate(360deg)}}
[data-uai-checkout-section]{transition:background-color 180ms ease-out,box-shadow 180ms ease-out}
[data-uai-checkout-enter]{animation:uai-checkout-enter 240ms cubic-bezier(0.23,1,0.32,1)}
@keyframes uai-checkout-enter{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.uai-checkout-button{transition:background-color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-checkout-button:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-checkout-button:active:not(:disabled){transform:scale(0.97)}
.uai-checkout-button[data-kind=primary]:hover:not(:disabled){filter:brightness(1.08)}
.uai-checkout-button[data-kind=secondary]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
@media (prefers-reduced-motion: reduce){.uai-checkout-spin,[data-uai-checkout-enter]{animation:none}.uai-checkout-button,[data-uai-checkout-section]{transition:none}.uai-checkout-button:active:not(:disabled){transform:none}}
`;

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

/** Guided checkout: contact, delivery, payment, review, and confirmation. */
export function Checkout({
  variant = "split",
  steps,
  step,
  defaultStep,
  onStepChange,
  onStepComplete,
  onPlaceOrder,
  children,
  style,
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
        {...props}
        data-variant={variant}
        data-uai-checkout={variant}
        data-status={status}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...(variant === "single" ? { maxWidth: 640, margin: "0 auto" } : null),
          ...(variant === "compact" ? { maxWidth: 520, margin: "0 auto" } : null),
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-checkout-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function CheckoutHeader({ style, ...props }: ComponentProps<"header">) {
  useCheckout("CheckoutHeader");
  return (
    <header
      {...props}
      data-uai-checkout-full=""
      style={{ display: "grid", gap: 6, minWidth: 0, ...style }}
    />
  );
}

export function CheckoutTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useCheckout("CheckoutTitle");
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

export function CheckoutDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

/** Step progress. Compose CheckoutProgressStep for each value in `steps`. */
export function CheckoutProgress({
  "aria-label": ariaLabel = "Checkout progress",
  style,
  ...props
}: ComponentProps<"ol">) {
  const { variant } = useCheckout("CheckoutProgress");
  return (
    <div data-uai-checkout-full="" style={{ minWidth: 0 }}>
      <StepIndicator
        aria-label={ariaLabel}
        {...props}
        variant={progressVariants[variant]}
        style={style}
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
  return <StepIndicatorStep {...props} status={context.statusOf(value)} />;
}

/** The step sections. Replaced by CheckoutConfirmation once the order is placed. */
export function CheckoutMain({ style, ...props }: ComponentProps<"div">) {
  const context = useCheckout("CheckoutMain");
  if (context.status === "placed") return null;
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: context.variant === "compact" ? 8 : 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export type CheckoutSectionProps = ComponentProps<"section"> & { value: string };

/** One checkout step. Shows its form while current and its summary once complete. */
export function CheckoutSection({ value, style, ...props }: CheckoutSectionProps) {
  const context = useCheckout("CheckoutSection");
  const id = useId();
  const status = context.statusOf(value);
  const compact = context.variant === "compact";
  return (
    <SectionContext.Provider value={{ id, value, status }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-status={status}
        data-uai-checkout-section=""
        style={{
          display: "grid",
          gap: compact ? 10 : 14,
          minWidth: 0,
          padding: compact ? "10px 12px" : "14px 16px",
          borderRadius: compact ? 12 : 14,
          background:
            status === "upcoming"
              ? "color-mix(in oklab, var(--uai-surface) 50%, transparent)"
              : "var(--uai-surface)",
          boxShadow: status === "current" ? "inset 0 0 0 1px var(--uai-border)" : "none",
          ...style,
        }}
      />
    </SectionContext.Provider>
  );
}

export function CheckoutSectionHeader({ style, ...props }: ComponentProps<"header">) {
  useSection("CheckoutSectionHeader");
  return (
    <header
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** Step heading. Receives focus when the step becomes current through Continue or Edit. */
export function CheckoutSectionTitle({ children, style, ...props }: ComponentProps<"h3">) {
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
      {...props}
      ref={ref}
      id={`${section.id}-title`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: 0,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: "20px",
        color: section.status === "upcoming" ? "var(--uai-subtle)" : "var(--uai-text)",
        outlineOffset: 4,
        ...style,
      }}
    >
      {complete ? (
        <span
          aria-hidden="true"
          style={{
            display: "grid",
            placeItems: "center",
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "color-mix(in oklab, var(--uai-success) 16%, transparent)",
            color: "var(--uai-success)",
          }}
        >
          <Check size={11} strokeWidth={2.5} />
        </span>
      ) : null}
      {children}
      {complete ? <span style={visuallyHidden}>, complete</span> : null}
    </h3>
  );
}

/** Reopens a completed step. Hidden while the step is current or upcoming. */
export function CheckoutSectionEdit({
  children = "Edit",
  onClick,
  style,
  ...props
}: ComponentProps<"button">) {
  const checkout = useCheckout("CheckoutSectionEdit");
  const section = useSection("CheckoutSectionEdit");
  if (section.status !== "complete" || checkout.status === "placed") return null;
  return (
    <button
      type="button"
      aria-describedby={`${section.id}-title`}
      {...props}
      className={joinClass("uai-checkout-button", props.className)}
      data-kind="secondary"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) checkout.goTo(section.value);
      }}
      style={{
        flex: "none",
        height: 26,
        padding: "0 12px",
        border: 0,
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-text)",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** What the shopper entered, shown once the step is complete. */
export function CheckoutSectionSummary({ style, ...props }: ComponentProps<"div">) {
  const section = useSection("CheckoutSectionSummary");
  if (section.status !== "complete") return null;
  return (
    <div
      {...props}
      style={{
        marginTop: -6,
        paddingLeft: 26,
        color: "var(--uai-muted)",
        fontSize: 12.5,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** The step's fields. Native validation runs before the step completes. */
export function CheckoutSectionForm({ onSubmit, style, ...props }: ComponentProps<"form">) {
  const checkout = useCheckout("CheckoutSectionForm");
  const section = useSection("CheckoutSectionForm");
  if (section.status !== "current") return null;
  return (
    <form
      aria-labelledby={`${section.id}-title`}
      {...props}
      data-uai-checkout-enter=""
      onSubmit={(event) => {
        onSubmit?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        checkout.complete(section.value, new FormData(event.currentTarget));
      }}
      style={{
        display: "grid",
        gap: checkout.variant === "compact" ? 10 : 14,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** Two fields side by side on wide containers; one column when narrow. */
export function CheckoutFieldRow({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

const primaryStyle = (compact: boolean, blocked = false) =>
  ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    justifySelf: "start",
    height: compact ? 32 : 40,
    padding: "0 18px",
    border: 0,
    borderRadius: 999,
    background: blocked
      ? "color-mix(in oklab, var(--uai-accent) 55%, var(--uai-surface))"
      : "var(--uai-accent)",
    color: "var(--uai-accent-foreground)",
    fontSize: 13,
    fontWeight: 500,
    cursor: blocked ? "not-allowed" : "pointer",
  }) as const;

/** Submits the current step and moves to the next one. */
export function CheckoutSectionContinue({
  children = "Continue",
  style,
  ...props
}: ComponentProps<"button">) {
  const checkout = useCheckout("CheckoutSectionContinue");
  useSection("CheckoutSectionContinue");
  return (
    <button
      {...props}
      type="submit"
      className={joinClass("uai-checkout-button", props.className)}
      data-kind="primary"
      style={{ ...primaryStyle(checkout.variant === "compact"), ...style }}
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
  style,
  ...props
}: ComponentProps<"fieldset">) {
  const { variant } = useCheckout("CheckoutPayment");
  return (
    <fieldset
      aria-label={ariaLabel}
      {...props}
      style={{
        margin: 0,
        minInlineSize: 0,
        display: "grid",
        gap: 10,
        minWidth: 0,
        padding: variant === "compact" ? 10 : 12,
        border: 0,
        borderRadius: variant === "compact" ? 8 : 10,
        background: "var(--uai-canvas)",
        ...style,
      }}
    >
      {children}
    </fieldset>
  );
}

export function CheckoutPaymentNote({ children, style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 6,
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        lineHeight: "16px",
        ...style,
      }}
    >
      <LockKeyhole
        size={12}
        strokeWidth={1.75}
        aria-hidden="true"
        style={{ flex: "none", marginTop: 2 }}
      />
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
  style,
  ...props
}: CheckoutPlaceOrderProps) {
  const checkout = useCheckout("CheckoutPlaceOrder");
  const placing = checkout.status === "placing";
  const blocked = disabled || placing;
  return (
    <button
      type="button"
      {...props}
      disabled={blocked}
      aria-busy={placing || undefined}
      className={joinClass("uai-checkout-button", props.className)}
      data-kind="primary"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) checkout.placeOrder();
      }}
      style={{ ...primaryStyle(checkout.variant === "compact", blocked), ...style }}
    >
      {placing ? (
        <>
          <LoaderCircle size={14} aria-hidden="true" className="uai-checkout-spin" />
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
    <StatusBanner variant="tinted" {...props} tone="error">
      <StatusBannerIcon />
      <StatusBannerContent>{children}</StatusBannerContent>
    </StatusBanner>
  );
}

/** Replaces the steps once the order is placed. Its heading receives focus. */
export function CheckoutConfirmation({ style, ...props }: ComponentProps<"div">) {
  const checkout = useCheckout("CheckoutConfirmation");
  if (checkout.status !== "placed") return null;
  return (
    <div
      role="status"
      {...props}
      data-uai-checkout-enter=""
      style={{
        display: "grid",
        gap: 10,
        minWidth: 0,
        padding: checkout.variant === "compact" ? 14 : 20,
        borderRadius: checkout.variant === "compact" ? 12 : 14,
        background: "color-mix(in oklab, var(--uai-success) 10%, var(--uai-surface))",
        ...style,
      }}
    />
  );
}

export function CheckoutConfirmationTitle({ style, ...props }: ComponentProps<"h3">) {
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
      {...props}
      ref={ref}
      style={{
        margin: 0,
        fontSize: 16,
        fontWeight: 600,
        lineHeight: "22px",
        letterSpacing: "-0.01em",
        color: "color-mix(in oklab, var(--uai-success) 70%, var(--uai-text))",
        ...style,
      }}
    />
  );
}

/** Order summary column. Sticky beside the steps in the split layout. */
export function CheckoutSummary({
  "aria-label": ariaLabel = "Order summary",
  style,
  ...props
}: ComponentProps<"aside">) {
  useCheckout("CheckoutSummary");
  return (
    <aside
      aria-label={ariaLabel}
      {...props}
      data-uai-checkout-summary=""
      style={{ display: "grid", gap: 12, minWidth: 0, ...style }}
    />
  );
}

/** Totals. Compose PriceSummary parts inside; the block picks the summary style. */
export function CheckoutSummaryTotals(props: Omit<PriceSummaryProps, "variant">) {
  const { variant } = useCheckout("CheckoutSummaryTotals");
  return <PriceSummary {...props} variant={summaryVariants[variant]} />;
}

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

function joinClass(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}
