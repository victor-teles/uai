"use client";

import {
  type ComponentProps,
  type CSSProperties,
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

const layoutCss = `
[data-uai-wizard-layout]{display:grid;gap:20px;min-width:0;grid-template-areas:"header" "progress" "body"}
[data-uai-wizard-part="header"]{grid-area:header}
[data-uai-wizard-part="progress"]{grid-area:progress}
[data-uai-wizard-part="body"]{grid-area:body}
@container (min-width: 720px){
  [data-uai-wizard="sidebar"]>[data-uai-wizard-layout]{grid-template-columns:220px minmax(0,1fr);grid-template-rows:auto 1fr;grid-template-areas:"progress header" "progress body";column-gap:32px}
}
[data-uai-wizard-button]{transition:background-color 120ms ease-out,color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-wizard-button="primary"]{background:var(--uai-accent);color:var(--uai-accent-foreground)}
[data-uai-wizard-button="secondary"]{background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-wizard-button="ghost"]{background:transparent;color:var(--uai-muted)}
[data-uai-wizard-button="primary"]:hover:not(:disabled){filter:brightness(1.08)}
[data-uai-wizard-button="secondary"]:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
[data-uai-wizard-button="ghost"]:hover:not(:disabled){background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-wizard-button]:active:not(:disabled){transform:scale(0.97)}
[data-uai-wizard-button]:disabled{opacity:0.6;cursor:not-allowed}
[data-uai-wizard-button]:focus-visible,[data-uai-wizard-step]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px;border-radius:6px}
[data-uai-wizard-step]:hover{color:var(--uai-text)}
@keyframes uai-wizard-enter{from{opacity:0;transform:translateY(4px)}}
[data-uai-wizard-enter]{animation:uai-wizard-enter 240ms cubic-bezier(0.23,1,0.32,1) both}
@keyframes uai-wizard-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
[data-uai-wizard-shimmer]{background:linear-gradient(90deg,color-mix(in oklab,currentColor 55%,transparent) 0%,color-mix(in oklab,currentColor 55%,transparent) 35%,currentColor 50%,color-mix(in oklab,currentColor 55%,transparent) 65%,color-mix(in oklab,currentColor 55%,transparent) 100%) 0 0/200% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:uai-wizard-shimmer 2s linear infinite}
@media (prefers-reduced-motion: reduce){[data-uai-wizard-button]{transition:none}[data-uai-wizard-button]:active:not(:disabled){transform:none}[data-uai-wizard-enter]{animation:none}[data-uai-wizard-shimmer]{animation:none;background:none;-webkit-text-fill-color:currentColor}}`;
const shells: Record<OnboardingWizardVariant, CSSProperties> = {
  sidebar: { padding: "clamp(16px, 4cqi, 28px)", borderRadius: 14 },
  stacked: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "clamp(16px, 4cqi, 28px)",
    borderRadius: 14,
  },
  compact: { maxWidth: 520, margin: "0 auto", padding: 16, borderRadius: 12 },
};
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
  style,
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
        {...props}
        data-variant={variant}
        data-uai-wizard={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          border: "1px solid var(--uai-border)",
          background: "var(--uai-surface)",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...shells[variant],
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-wizard-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function OnboardingWizardHeader({ style, ...props }: ComponentProps<"header">) {
  return (
    <header
      {...props}
      data-uai-wizard-part="header"
      style={{ display: "grid", gap: 4, minWidth: 0, ...style }}
    />
  );
}

export function OnboardingWizardTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useWizard("OnboardingWizardTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 15 : 18,
        fontWeight: 600,
        lineHeight: variant === "compact" ? "20px" : "24px",
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

export function OnboardingWizardDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

/** "Step 2 of 4", announced politely as the step changes. */
export function OnboardingWizardStepCount({ style, ...props }: ComponentProps<"p">) {
  const { index, steps } = useWizard("OnboardingWizardStepCount");
  return (
    <p
      aria-live="polite"
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      Step {Math.min(index + 1, steps.length || 1)} of {steps.length || 1}
    </p>
  );
}

export function OnboardingWizardProgress({
  style,
  ...props
}: Omit<ComponentProps<typeof StepIndicator>, "variant">) {
  const { variant } = useWizard("OnboardingWizardProgress");
  return (
    <StepIndicator
      aria-label="Setup progress"
      {...props}
      data-uai-wizard-part="progress"
      variant={indicatorVariants[variant]}
      style={{ alignSelf: "start", minWidth: 0, ...style }}
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
          data-uai-wizard-step=""
          style={{
            display: "grid",
            gap: 2,
            padding: 0,
            border: 0,
            background: "transparent",
            color: "inherit",
            font: "inherit",
            textAlign: "start",
            cursor: "pointer",
          }}
        >
          {children}
        </button>
      ) : (
        <span style={{ display: "grid", gap: 2 }}>{children}</span>
      )}
    </StepIndicatorStep>
  );
}

/** Holds the panels, error, and footer. */
export function OnboardingWizardBody({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-uai-wizard-part="body"
      style={{ display: "grid", gap: 16, alignContent: "start", minWidth: 0, ...style }}
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
  style,
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
        {...props}
        id={`${context.id}-panel-${value}`}
        aria-labelledby={`${context.id}-panel-${value}-title`}
        hidden={!active}
        disabled={context.pending}
        data-value={value}
        data-uai-wizard-enter=""
        style={{
          display: active ? "grid" : "none",
          gap: 14,
          minWidth: 0,
          margin: 0,
          padding: 0,
          border: 0,
          ...style,
        }}
      />
    </PanelContext.Provider>
  );
}

/** The step heading. Focus moves here when the step changes after the first render. */
export function OnboardingWizardPanelTitle({ style, ...props }: ComponentProps<"h3">) {
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
      {...props}
      ref={ref}
      id={`${context.id}-panel-${value}-title`}
      style={{
        margin: 0,
        fontSize: 15,
        fontWeight: 500,
        lineHeight: "20px",
        outline: "none",
        ...style,
      }}
    />
  );
}

export function OnboardingWizardPanelDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: "-8px 0 0", color: "var(--uai-muted)", textWrap: "pretty", ...style }}
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
        <StatusBannerDescription style={{ color: "inherit" }}>
          {context.error}
        </StatusBannerDescription>
      </StatusBannerContent>
    </StatusBanner>
  );
}

export function OnboardingWizardFooter({ style, ...props }: ComponentProps<"div">) {
  const { complete } = useWizard("OnboardingWizardFooter");
  if (complete) return null;
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
        paddingTop: 4,
        ...style,
      }}
    />
  );
}

const button = (variant: OnboardingWizardVariant): CSSProperties => ({
  height: variant === "compact" ? 28 : 32,
  padding: variant === "compact" ? "0 12px" : "0 14px",
  border: 0,
  borderRadius: 999,
  font: "inherit",
  fontSize: variant === "compact" ? 12.5 : 13,
  fontWeight: 500,
  cursor: "pointer",
});

/** Returns to the previous step. Hidden on the first step. */
export function OnboardingWizardBack({ onClick, style, ...props }: ComponentProps<"button">) {
  const context = useWizard("OnboardingWizardBack");
  if (context.index === 0) return null;
  return (
    <button
      type="button"
      {...props}
      disabled={context.pending}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.back();
      }}
      data-uai-wizard-button="secondary"
      style={{ ...button(context.variant), marginRight: "auto", ...style }}
    />
  );
}

/** Advances without validation. Renders only on optional steps. */
export function OnboardingWizardSkip({ onClick, style, ...props }: ComponentProps<"button">) {
  const context = useWizard("OnboardingWizardSkip");
  if (!context.steps[context.index]?.optional) return null;
  return (
    <button
      type="button"
      {...props}
      disabled={context.pending}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) void context.next({ skip: true });
      }}
      data-uai-wizard-button="ghost"
      style={{ ...button(context.variant), ...style }}
    />
  );
}

function Advance({
  part,
  last,
  pendingLabel,
  children,
  onClick,
  style,
  ...props
}: ComponentProps<"button"> & { part: string; last: boolean; pendingLabel: ReactNode }) {
  const context = useWizard(part);
  if ((context.index === context.steps.length - 1) !== last) return null;
  return (
    <button
      type="button"
      {...props}
      aria-busy={context.pending || undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) void context.next();
      }}
      data-uai-wizard-button="primary"
      style={{
        ...button(context.variant),
        cursor: context.pending ? "progress" : "pointer",
        ...style,
      }}
    >
      {context.pending ? <span data-uai-wizard-shimmer="">{pendingLabel}</span> : children}
    </button>
  );
}

/** Validates the current step and moves on. Hidden on the last step. */
export function OnboardingWizardNext({
  pendingLabel = "Checking…",
  ...props
}: ComponentProps<"button"> & { pendingLabel?: ReactNode }) {
  return (
    <Advance {...props} part="OnboardingWizardNext" last={false} pendingLabel={pendingLabel} />
  );
}

/** Validates the last step and calls `onComplete`. Renders only on the last step. */
export function OnboardingWizardFinish({
  pendingLabel = "Finishing…",
  ...props
}: ComponentProps<"button"> & { pendingLabel?: ReactNode }) {
  return <Advance {...props} part="OnboardingWizardFinish" last pendingLabel={pendingLabel} />;
}

/** Replaces the panels once setup finishes. Focus moves here so the result is announced. */
export function OnboardingWizardComplete({ style, ...props }: ComponentProps<"div">) {
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
      {...props}
      ref={ref}
      data-uai-wizard-enter=""
      style={{
        display: "grid",
        gap: 8,
        minWidth: 0,
        padding: 20,
        borderRadius: context.variant === "compact" ? 12 : 14,
        background: "color-mix(in oklab, var(--uai-success) 8%, var(--uai-surface))",
        boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--uai-success) 24%, transparent)",
        outlineOffset: 2,
        ...style,
      }}
    />
  );
}
