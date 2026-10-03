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
  useState,
} from "react";
import {
  StatusBanner,
  StatusBannerContent,
  StatusBannerDescription,
  StatusBannerIcon,
} from "@/components/ui/uai/status-banner";
import {
  StepIndicator,
  StepIndicatorStep,
  type StepIndicatorVariant,
} from "@/components/ui/uai/step-indicator";
import { cn } from "@/lib/uai-utils";

export const ONBOARDING_WIZARD_VARIANTS = ["sidebar", "stacked", "compact"] as const;
export type OnboardingWizardVariant = (typeof ONBOARDING_WIZARD_VARIANTS)[number];
/** Return an error message to block the step, or nothing to continue. */
export type OnboardingWizardValidate = () =>
  | string
  | null
  | undefined
  | Promise<string | null | undefined>;

export type OnboardingWizardProps = Omit<ComponentProps<"section">, "defaultValue"> & {
  variant?: OnboardingWizardVariant;
  /** The current step. Persist it to resume setup later. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Runs after the last step validates. Throw or reject with an Error to show its message. */
  onComplete?: () => Promise<unknown> | unknown;
};

type Step = { value: string; optional: boolean; validate?: OnboardingWizardValidate };
type WizardContext = {
  id: string;
  variant: OnboardingWizardVariant;
  steps: Step[];
  current: string;
  index: number;
  reached: number;
  error: string | null;
  pending: boolean;
  complete: boolean;
  register: (step: Step) => () => void;
  goTo: (value: string) => void;
  next: (options?: { skip?: boolean }) => Promise<void>;
  back: () => void;
};
const Context = createContext<WizardContext | null>(null);
function useWizard(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within OnboardingWizard`);
  return context;
}
const PanelContext = createContext<string | null>(null);

const onboardingWizardVariants = cva(
  "box-border @container min-w-0 border bg-card text-[13px]/[18px] text-card-foreground",
  {
    variants: {
      variant: {
        sidebar: "rounded-[14px] p-[clamp(16px,4cqi,28px)]",
        stacked: "mx-auto max-w-180 rounded-[14px] p-[clamp(16px,4cqi,28px)]",
        compact: "mx-auto max-w-130 rounded-xl p-4",
      },
    },
  },
);

const onboardingWizardButtonVariants = cva(
  "cursor-pointer rounded-full border-0 font-medium [transition:background-color_120ms_ease-out,color_120ms_ease-out,filter_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
  {
    variants: {
      emphasis: {
        primary: "bg-primary text-primary-foreground enabled:hover:brightness-108",
        secondary:
          "bg-secondary text-secondary-foreground enabled:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
        ghost:
          "bg-transparent text-muted-foreground enabled:hover:bg-accent enabled:hover:text-accent-foreground",
      },
      size: {
        default: "h-8 px-3.5 text-[13px]",
        compact: "h-7 px-3 text-[12.5px]",
      },
    },
  },
);

const enterMotion =
  "animate-[enter_240ms_var(--ease-out-quint)_both] fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none";

const indicatorVariants: Record<OnboardingWizardVariant, StepIndicatorVariant> = {
  sidebar: "vertical",
  stacked: "horizontal",
  compact: "compact",
};

/**
 * Guides setup through ordered panels. Steps register in document order; the current step is
 * controllable so applications can persist and resume progress.
 */
export function OnboardingWizard({
  variant = "sidebar",
  value,
  defaultValue,
  onValueChange,
  onComplete,
  children,
  className,
  ...props
}: OnboardingWizardProps) {
  const id = useId();
  const [steps, setSteps] = useState<Step[]>([]);
  const [internal, setInternal] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const current = value ?? internal ?? steps[0]?.value ?? "";
  const index = Math.max(
    0,
    steps.findIndex((step) => step.value === current),
  );
  const [reached, setReached] = useState(index);
  const furthest = Math.max(reached, index);
  useEffect(() => {
    setReached((value) => Math.max(value, index));
  }, [index]);

  const goTo = (next: string) => {
    setError(null);
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  const next = async ({ skip = false } = {}) => {
    const step = steps[index];
    if (!step || pending) return;
    const panel = document.getElementById(`${id}-panel-${step.value}`);
    if (!skip) {
      const fields = panel?.querySelectorAll<HTMLInputElement>("input, select, textarea") ?? [];
      const invalid = Array.from(fields).find((field) => !field.validity.valid);
      if (invalid) {
        setError(invalid.validationMessage || "Check the highlighted field.");
        invalid.focus();
        return;
      }
      setPending(true);
      try {
        const message = await step.validate?.();
        if (message) {
          setError(message);
          return;
        }
      } finally {
        setPending(false);
      }
    }
    const following = steps[index + 1];
    if (following) {
      goTo(following.value);
      return;
    }
    setPending(true);
    try {
      await onComplete?.();
      setError(null);
      setComplete(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Setup could not be finished.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Context.Provider
      value={{
        id,
        variant,
        steps,
        current,
        index,
        reached: furthest,
        error,
        pending,
        complete,
        register: (step) => {
          setSteps((list) =>
            list.some((item) => item.value === step.value)
              ? list.map((item) => (item.value === step.value ? step : item))
              : [...list, step],
          );
          return () => setSteps((list) => list.filter((item) => item.value !== step.value));
        },
        goTo,
        next,
        back: () => {
          const previous = steps[index - 1];
          if (previous) goTo(previous.value);
        },
      }}
    >
      <section
        aria-labelledby={`${id}-title`}
        data-slot="onboarding-wizard"
        data-variant={variant}
        className={cn(onboardingWizardVariants({ variant }), className)}
        {...props}
      >
        <div
          className={cn(
            "grid min-w-0 gap-5 [grid-template-areas:'header'_'progress'_'body']",
            variant === "sidebar" &&
              "@min-[720px]:grid-cols-[220px_minmax(0,1fr)] @min-[720px]:grid-rows-[auto_1fr] @min-[720px]:gap-x-8 @min-[720px]:[grid-template-areas:'progress_header'_'progress_body']",
          )}
        >
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function OnboardingWizardHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="onboarding-wizard-header"
      className={cn("grid min-w-0 gap-1 [grid-area:header]", className)}
      {...props}
    />
  );
}

export function OnboardingWizardTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useWizard("OnboardingWizardTitle");
  return (
    <h2
      data-slot="onboarding-wizard-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em]",
        variant === "compact" ? "text-[15px]/5" : "text-lg/6",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function OnboardingWizardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="onboarding-wizard-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** "Step 2 of 4", announced politely as the step changes. */
export function OnboardingWizardStepCount({ className, ...props }: ComponentProps<"p">) {
  const { index, steps } = useWizard("OnboardingWizardStepCount");
  return (
    <p
      aria-live="polite"
      data-slot="onboarding-wizard-step-count"
      className={cn("m-0 text-[12px] text-subtle-foreground tabular-nums", className)}
      {...props}
    >
      Step {Math.min(index + 1, steps.length || 1)} of {steps.length || 1}
    </p>
  );
}

export function OnboardingWizardProgress({
  className,
  ...props
}: Omit<ComponentProps<typeof StepIndicator>, "variant">) {
  const { variant } = useWizard("OnboardingWizardProgress");
  return (
    <StepIndicator
      aria-label="Setup progress"
      className={cn("min-w-0 self-start [grid-area:progress]", className)}
      {...props}
      variant={indicatorVariants[variant]}
    />
  );
}

/** A step in the progress list. Reached steps become buttons that return to that step. */
export function OnboardingWizardProgressStep({
  value,
  children,
  ...props
}: Omit<ComponentProps<typeof StepIndicatorStep>, "status" | "optional"> & { value: string }) {
  const context = useWizard("OnboardingWizardProgressStep");
  const position = context.steps.findIndex((step) => step.value === value);
  const step = context.steps[position];
  const isCurrent = value === context.current && !context.complete;
  const status = isCurrent
    ? "current"
    : context.complete || (position >= 0 && position < context.reached)
      ? "complete"
      : "upcoming";
  const reachable = position >= 0 && position <= context.reached && !isCurrent && !context.complete;
  return (
    <StepIndicatorStep {...props} status={status} optional={step?.optional ?? false}>
      {reachable ? (
        <button
          type="button"
          onClick={() => context.goTo(value)}
          className="grid cursor-pointer gap-0.5 border-0 bg-transparent p-0 text-start text-inherit hover:text-foreground focus-visible:rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {children}
        </button>
      ) : (
        <span className="grid gap-0.5">{children}</span>
      )}
    </StepIndicatorStep>
  );
}

/** Holds the panels, error, and footer. */
export function OnboardingWizardBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="onboarding-wizard-body"
      className={cn("grid min-w-0 content-start gap-4 [grid-area:body]", className)}
      {...props}
    />
  );
}

export type OnboardingWizardPanelProps = ComponentProps<"fieldset"> & {
  value: string;
  optional?: boolean;
  /** Runs before advancing, after native field validation passes. */
  validate?: OnboardingWizardValidate;
};

/** One step. Inactive panels stay mounted and hidden so entered values survive navigation. */
export function OnboardingWizardPanel({
  value,
  optional = false,
  validate,
  className,
  ...props
}: OnboardingWizardPanelProps) {
  const context = useWizard("OnboardingWizardPanel");
  const validateRef = useRef(validate);
  validateRef.current = validate;
  const { register } = context;
  const registerRef = useRef(register);
  registerRef.current = register;
  useLayoutEffect(
    () =>
      registerRef.current({
        value,
        optional,
        validate: () => validateRef.current?.(),
      }),
    [value, optional],
  );
  const active = context.current === value && !context.complete;
  return (
    <PanelContext.Provider value={value}>
      <fieldset
        data-slot="onboarding-wizard-panel"
        className={cn("m-0 grid min-w-0 gap-3.5 border-0 p-0", enterMotion, className)}
        {...props}
        id={`${context.id}-panel-${value}`}
        aria-labelledby={`${context.id}-panel-${value}-title`}
        hidden={!active}
        disabled={context.pending}
        data-value={value}
      />
    </PanelContext.Provider>
  );
}

/** The step heading. Focus moves here when the step changes after the first render. */
export function OnboardingWizardPanelTitle({ className, ...props }: ComponentProps<"h3">) {
  const context = useWizard("OnboardingWizardPanelTitle");
  const value = useContext(PanelContext);
  if (value === null) {
    throw new Error("OnboardingWizardPanelTitle must be used within OnboardingWizardPanel");
  }
  const ref = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  const active = context.current === value;
  useEffect(() => {
    if (active && mounted.current) ref.current?.focus();
    mounted.current = true;
  }, [active]);
  return (
    <h3
      tabIndex={-1}
      data-slot="onboarding-wizard-panel-title"
      className={cn("m-0 text-[15px]/5 font-medium outline-none", className)}
      {...props}
      ref={ref}
      id={`${context.id}-panel-${value}-title`}
    />
  );
}

export function OnboardingWizardPanelDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="onboarding-wizard-panel-description"
      className={cn("m-0 -mt-2 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Shows the current validation or completion error as an error Status Banner. */
export function OnboardingWizardError({
  children,
  ...props
}: Omit<ComponentProps<typeof StatusBanner>, "tone">) {
  const context = useWizard("OnboardingWizardError");
  if (!context.error) return null;
  return (
    <StatusBanner variant="tinted" {...props} tone="error">
      <StatusBannerIcon />
      <StatusBannerContent>
        {children}
        <StatusBannerDescription className="text-inherit">{context.error}</StatusBannerDescription>
      </StatusBannerContent>
    </StatusBanner>
  );
}

export function OnboardingWizardFooter({ className, ...props }: ComponentProps<"div">) {
  const { complete } = useWizard("OnboardingWizardFooter");
  if (complete) return null;
  return (
    <div
      data-slot="onboarding-wizard-footer"
      className={cn("flex flex-wrap items-center justify-end gap-2 pt-1", className)}
      {...props}
    />
  );
}

const buttonSize = (variant: OnboardingWizardVariant) =>
  variant === "compact" ? "compact" : "default";

/** Returns to the previous step. Hidden on the first step. */
export function OnboardingWizardBack({ onClick, className, ...props }: ComponentProps<"button">) {
  const context = useWizard("OnboardingWizardBack");
  if (context.index === 0) return null;
  return (
    <button
      type="button"
      data-slot="onboarding-wizard-back"
      className={cn(
        onboardingWizardButtonVariants({
          emphasis: "secondary",
          size: buttonSize(context.variant),
        }),
        "mr-auto",
        className,
      )}
      {...props}
      disabled={context.pending}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.back();
      }}
    />
  );
}

/** Advances without validation. Renders only on optional steps. */
export function OnboardingWizardSkip({ onClick, className, ...props }: ComponentProps<"button">) {
  const context = useWizard("OnboardingWizardSkip");
  if (!context.steps[context.index]?.optional) return null;
  return (
    <button
      type="button"
      data-slot="onboarding-wizard-skip"
      className={cn(
        onboardingWizardButtonVariants({ emphasis: "ghost", size: buttonSize(context.variant) }),
        className,
      )}
      {...props}
      disabled={context.pending}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) void context.next({ skip: true });
      }}
    />
  );
}

function Advance({
  part,
  slot,
  last,
  pendingLabel,
  children,
  onClick,
  className,
  ...props
}: ComponentProps<"button"> & {
  part: string;
  slot: string;
  last: boolean;
  pendingLabel: ReactNode;
}) {
  const context = useWizard(part);
  if ((context.index === context.steps.length - 1) !== last) return null;
  return (
    <button
      type="button"
      data-slot={slot}
      className={cn(
        onboardingWizardButtonVariants({ emphasis: "primary", size: buttonSize(context.variant) }),
        context.pending && "cursor-progress",
        className,
      )}
      {...props}
      aria-busy={context.pending || undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) void context.next();
      }}
    >
      {context.pending ? (
        <span className="animate-shimmer bg-[linear-gradient(90deg,color-mix(in_oklab,currentColor_55%,transparent)_0%,color-mix(in_oklab,currentColor_55%,transparent)_35%,currentColor_50%,color-mix(in_oklab,currentColor_55%,transparent)_65%,color-mix(in_oklab,currentColor_55%,transparent)_100%)] bg-[length:200%_100%] bg-clip-text [-webkit-text-fill-color:transparent] motion-reduce:animate-none motion-reduce:bg-none motion-reduce:[-webkit-text-fill-color:currentColor]">
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/** Validates the current step and moves on. Hidden on the last step. */
export function OnboardingWizardNext({
  pendingLabel = "Checking…",
  ...props
}: ComponentProps<"button"> & { pendingLabel?: ReactNode }) {
  return (
    <Advance
      {...props}
      part="OnboardingWizardNext"
      slot="onboarding-wizard-next"
      last={false}
      pendingLabel={pendingLabel}
    />
  );
}

/** Validates the last step and calls `onComplete`. Renders only on the last step. */
export function OnboardingWizardFinish({
  pendingLabel = "Finishing…",
  ...props
}: ComponentProps<"button"> & { pendingLabel?: ReactNode }) {
  return (
    <Advance
      {...props}
      part="OnboardingWizardFinish"
      slot="onboarding-wizard-finish"
      last
      pendingLabel={pendingLabel}
    />
  );
}

/** Replaces the panels once setup finishes. Focus moves here so the result is announced. */
export function OnboardingWizardComplete({ className, ...props }: ComponentProps<"div">) {
  const context = useWizard("OnboardingWizardComplete");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (context.complete) ref.current?.focus();
  }, [context.complete]);
  if (!context.complete) return null;
  return (
    <div
      role="status"
      tabIndex={-1}
      data-slot="onboarding-wizard-complete"
      className={cn(
        "grid min-w-0 gap-2 bg-[color-mix(in_oklab,var(--success)_8%,var(--card))] p-5 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--success)_24%,transparent)] outline-offset-2",
        context.variant === "compact" ? "rounded-xl" : "rounded-[14px]",
        enterMotion,
        className,
      )}
      {...props}
      ref={ref}
    />
  );
}
