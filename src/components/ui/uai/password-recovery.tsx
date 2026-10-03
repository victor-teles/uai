"use client";

import {
  Check,
  Circle,
  CircleCheck,
  ClockAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  MailCheck,
} from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useId,
  useState,
} from "react";

import { cn } from "@/lib/uai-utils";

export const PASSWORD_RECOVERY_VARIANTS = ["card", "split", "compact"] as const;
export const PASSWORD_RECOVERY_STEPS = ["request", "sent", "reset", "expired", "success"] as const;
export const PASSWORD_RECOVERY_STATUSES = ["idle", "submitting", "error"] as const;

export type PasswordRecoveryVariant = (typeof PASSWORD_RECOVERY_VARIANTS)[number];
export type PasswordRecoveryStep = (typeof PASSWORD_RECOVERY_STEPS)[number];
export type PasswordRecoveryStatus = (typeof PASSWORD_RECOVERY_STATUSES)[number];

export type PasswordRecoveryProps = ComponentProps<"form"> & {
  variant?: PasswordRecoveryVariant;
  step?: PasswordRecoveryStep;
  status?: PasswordRecoveryStatus;
};

type PasswordRecoveryChrome = {
  rootClass: string;
  rootStyle: CSSProperties;
  asideClass: string;
  asideStyle: CSSProperties;
  mainStyle: CSSProperties;
  titleClass: string;
  descriptionClass: string;
  groupGapClass: string;
  controlClass: string;
  controlStyle: CSSProperties;
  footerClass: string;
};

function passwordRecoveryChrome(variant: PasswordRecoveryVariant): PasswordRecoveryChrome {
  const compact = variant === "compact";
  const split = variant === "split";

  return {
    rootClass: cn(
      "grid w-full border border-[var(--uai-border)] bg-[var(--uai-surface)] text-[var(--uai-text)]",
      split && "sm:grid-cols-[minmax(190px,0.72fr)_minmax(0,1fr)]",
    ),
    rootStyle: {
      borderRadius: compact ? 12 : 14,
      overflow: "hidden",
      padding: split ? 0 : compact ? 14 : 20,
    },
    asideClass: split
      ? "border-b border-[var(--uai-border)] bg-[var(--uai-canvas)] sm:border-r sm:border-b-0"
      : "border-b border-[var(--uai-border)]",
    asideStyle: split
      ? { padding: 24 }
      : { marginBottom: compact ? 14 : 18, paddingBottom: compact ? 12 : 16 },
    mainStyle: split ? { padding: 24 } : {},
    titleClass: compact ? "text-[15px] leading-5" : "text-[17px] leading-6",
    descriptionClass: compact
      ? "mt-1 text-[12.5px] leading-[18px]"
      : "mt-1.5 text-[13px] leading-[18px]",
    groupGapClass: compact ? "gap-2.5" : "gap-3",
    controlClass: compact ? "h-[34px] text-[12.5px]" : "h-[38px] text-[13px]",
    controlStyle: { borderRadius: compact ? 8 : 10 },
    footerClass: compact ? "mt-4 pt-3.5" : "mt-5 pt-4",
  };
}

type PasswordRecoveryContextValue = {
  variant: PasswordRecoveryVariant;
  step: PasswordRecoveryStep;
  status: PasswordRecoveryStatus;
  submitting: boolean;
  titleId: string;
  errorId: string;
  chrome: PasswordRecoveryChrome;
};

const PasswordRecoveryContext = createContext<PasswordRecoveryContextValue | null>(null);

function usePasswordRecovery(name: string) {
  const context = useContext(PasswordRecoveryContext);
  if (!context) throw new Error(`${name} must be used within PasswordRecovery`);
  return context;
}

export function PasswordRecovery({
  variant = "card",
  step = "request",
  status = "idle",
  children,
  className,
  style,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  ...props
}: PasswordRecoveryProps) {
  const titleId = useId();
  const errorId = useId();
  const submitting = status === "submitting";
  const chrome = passwordRecoveryChrome(variant);

  return (
    <PasswordRecoveryContext.Provider
      value={{ variant, step, status, submitting, titleId, errorId, chrome }}
    >
      <form
        {...props}
        className={cn(chrome.rootClass, className)}
        style={{ ...chrome.rootStyle, ...style }}
        data-variant={variant}
        data-step={step}
        aria-busy={submitting || undefined}
        aria-labelledby={ariaLabelledby ?? titleId}
        aria-describedby={ariaDescribedby ?? (status === "error" ? errorId : undefined)}
      >
        {children}
      </form>
    </PasswordRecoveryContext.Provider>
  );
}

export type PasswordRecoveryAsideProps = ComponentProps<"aside">;

export function PasswordRecoveryAside({
  children,
  className,
  style,
  ...props
}: PasswordRecoveryAsideProps) {
  const { chrome } = usePasswordRecovery("PasswordRecoveryAside");

  return (
    <aside
      className={cn(
        "grid min-w-0 content-start gap-3 text-[12px] leading-4 text-[var(--uai-muted)] [&_p]:m-0 [&_strong]:font-medium [&_strong]:text-[var(--uai-text)]",
        chrome.asideClass,
        className,
      )}
      style={{ ...chrome.asideStyle, ...style }}
      {...props}
    >
      {children}
    </aside>
  );
}

export type PasswordRecoveryProgressProps = ComponentProps<"ol">;

export function PasswordRecoveryProgress({
  children,
  className,
  ...props
}: PasswordRecoveryProgressProps) {
  const { variant } = usePasswordRecovery("PasswordRecoveryProgress");

  return (
    <ol
      className={cn(
        "grid list-none gap-2 p-0",
        variant !== "split" && "grid-cols-3",
        variant === "split" && "sm:grid-cols-1",
        className,
      )}
      {...props}
    >
      {children}
    </ol>
  );
}

export type PasswordRecoveryProgressItemProps = ComponentProps<"li"> & {
  state?: "complete" | "current" | "upcoming";
};

export function PasswordRecoveryProgressItem({
  state = "upcoming",
  children,
  className,
  ...props
}: PasswordRecoveryProgressItemProps) {
  usePasswordRecovery("PasswordRecoveryProgressItem");
  const Icon = state === "complete" ? Check : Circle;

  return (
    <li
      className={cn(
        "flex min-w-0 items-start gap-2 text-[11.5px] leading-4",
        state === "upcoming" && "text-[var(--uai-subtle)]",
        state === "complete" && "text-[var(--uai-muted)]",
        state === "current" && "font-medium text-[var(--uai-text)]",
        className,
      )}
      aria-current={state === "current" ? "step" : undefined}
      data-state={state}
      {...props}
    >
      <span
        className={cn(
          "mt-px inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-[var(--uai-border-strong)] transition-[background-color,border-color] duration-[180ms] ease-out motion-reduce:transition-none",
          state === "upcoming" && "[&_svg]:opacity-0",
          state === "complete" &&
            "border-transparent bg-[var(--uai-accent)] text-[var(--uai-accent-foreground)]",
          state === "current" &&
            "border-[var(--uai-accent)] text-[var(--uai-accent)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--uai-accent)_18%,transparent)] [&_svg]:fill-current",
        )}
      >
        <Icon
          className="size-2.5"
          strokeWidth={state === "complete" ? 2.4 : 2}
          aria-hidden="true"
        />
      </span>
      <span className="min-w-0 [overflow-wrap:anywhere]">
        <span className="sr-only">
          {state === "complete" ? "Complete: " : state === "current" ? "Current: " : "Upcoming: "}
        </span>
        {children}
      </span>
    </li>
  );
}

export type PasswordRecoveryMainProps = ComponentProps<"div">;

export function PasswordRecoveryMain({
  children,
  className,
  style,
  ...props
}: PasswordRecoveryMainProps) {
  const { chrome } = usePasswordRecovery("PasswordRecoveryMain");

  return (
    <div className={cn("min-w-0", className)} style={{ ...chrome.mainStyle, ...style }} {...props}>
      {children}
    </div>
  );
}

export type PasswordRecoveryHeaderProps = ComponentProps<"header">;

export function PasswordRecoveryHeader({
  children,
  className,
  ...props
}: PasswordRecoveryHeaderProps) {
  usePasswordRecovery("PasswordRecoveryHeader");
  return (
    <header className={cn("mb-5", className)} {...props}>
      {children}
    </header>
  );
}

export type PasswordRecoveryTitleProps = ComponentProps<"h2">;

export function PasswordRecoveryTitle({
  children,
  className,
  ...props
}: PasswordRecoveryTitleProps) {
  const { titleId, chrome } = usePasswordRecovery("PasswordRecoveryTitle");
  return (
    <h2
      id={titleId}
      className={cn("font-semibold tracking-[-0.015em] text-balance", chrome.titleClass, className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export type PasswordRecoveryDescriptionProps = ComponentProps<"p">;

export function PasswordRecoveryDescription({
  children,
  className,
  ...props
}: PasswordRecoveryDescriptionProps) {
  const { chrome } = usePasswordRecovery("PasswordRecoveryDescription");
  return (
    <p
      className={cn(
        "max-w-[52ch] text-[var(--uai-muted)] [overflow-wrap:anywhere]",
        chrome.descriptionClass,
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export type PasswordRecoveryStageProps = ComponentProps<"div"> & {
  when: PasswordRecoveryStep;
};

export function PasswordRecoveryStage({
  when,
  children,
  className,
  ...props
}: PasswordRecoveryStageProps) {
  const { step } = usePasswordRecovery("PasswordRecoveryStage");
  if (step !== when) return null;

  return (
    <div
      className={cn(
        "grid gap-4 motion-safe:animate-[uai-recovery-in_240ms_cubic-bezier(0.23,1,0.32,1)]",
        className,
      )}
      data-recovery-stage={when}
      {...props}
    >
      <style>
        {
          "@keyframes uai-recovery-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}"
        }
      </style>
      {children}
    </div>
  );
}

export type PasswordRecoveryFieldsProps = ComponentProps<"div">;

export function PasswordRecoveryFields({
  children,
  className,
  ...props
}: PasswordRecoveryFieldsProps) {
  const { chrome } = usePasswordRecovery("PasswordRecoveryFields");
  return (
    <div className={cn("grid", chrome.groupGapClass, className)} {...props}>
      {children}
    </div>
  );
}

type PasswordRecoveryFieldContextValue = {
  controlId: string;
  messageId: string;
  invalid: boolean;
};

const PasswordRecoveryFieldContext = createContext<PasswordRecoveryFieldContextValue | null>(null);

function usePasswordRecoveryField(name: string) {
  const context = useContext(PasswordRecoveryFieldContext);
  if (!context) throw new Error(`${name} must be used within PasswordRecoveryField`);
  return context;
}

export type PasswordRecoveryFieldProps = ComponentProps<"div"> & { invalid?: boolean };

export function PasswordRecoveryField({
  invalid = false,
  children,
  className,
  ...props
}: PasswordRecoveryFieldProps) {
  usePasswordRecovery("PasswordRecoveryField");
  const controlId = useId();
  const messageId = useId();

  return (
    <PasswordRecoveryFieldContext.Provider value={{ controlId, messageId, invalid }}>
      <div className={cn("grid gap-1.5", className)} {...props}>
        {children}
      </div>
    </PasswordRecoveryFieldContext.Provider>
  );
}

export type PasswordRecoveryLabelProps = ComponentProps<"label">;

export function PasswordRecoveryLabel({
  children,
  className,
  htmlFor,
  ...props
}: PasswordRecoveryLabelProps) {
  usePasswordRecovery("PasswordRecoveryLabel");
  const { controlId } = usePasswordRecoveryField("PasswordRecoveryLabel");

  return (
    <label
      htmlFor={htmlFor ?? controlId}
      className={cn("text-[12.5px] leading-4 font-medium", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export type PasswordRecoveryInputProps = Omit<ComponentProps<"input">, "size"> & {
  revealable?: boolean;
};

export function PasswordRecoveryInput({
  revealable = false,
  className,
  id,
  style,
  disabled,
  "aria-describedby": ariaDescribedby,
  "aria-invalid": ariaInvalid,
  type,
  ...props
}: PasswordRecoveryInputProps) {
  const { chrome, submitting } = usePasswordRecovery("PasswordRecoveryInput");
  const { controlId, messageId, invalid } = usePasswordRecoveryField("PasswordRecoveryInput");
  const [revealed, setRevealed] = useState(false);
  const inputType = revealable ? (revealed ? "text" : "password") : type;
  const describedBy = [ariaDescribedby, invalid ? messageId : undefined].filter(Boolean).join(" ");
  const input = (
    <input
      {...props}
      id={id ?? controlId}
      type={inputType}
      disabled={disabled || submitting}
      className={cn(
        "min-w-0 w-full bg-transparent px-3 text-[var(--uai-text)] outline-none placeholder:text-[var(--uai-subtle)] disabled:cursor-not-allowed disabled:opacity-50",
        !revealable &&
          "border border-[var(--uai-border)] bg-[var(--uai-canvas)] transition-[border-color,box-shadow] duration-[120ms] ease-out hover:border-[var(--uai-border-strong)] focus:border-[var(--uai-border-strong)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--uai-accent)_24%,transparent)] motion-reduce:transition-none",
        !revealable &&
          invalid &&
          "border-[color-mix(in_oklab,var(--uai-danger)_70%,transparent)] hover:border-[var(--uai-danger)] focus:border-[var(--uai-danger)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--uai-danger)_22%,transparent)]",
        revealable && "pr-10",
        chrome.controlClass,
        className,
      )}
      style={!revealable ? { ...chrome.controlStyle, ...style } : style}
      aria-describedby={describedBy || undefined}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
    />
  );

  if (!revealable) return input;

  return (
    <div
      className={cn(
        "relative border border-[var(--uai-border)] bg-[var(--uai-canvas)] transition-[border-color,box-shadow] duration-[120ms] ease-out hover:border-[var(--uai-border-strong)] focus-within:border-[var(--uai-border-strong)] focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--uai-accent)_24%,transparent)] motion-reduce:transition-none",
        invalid &&
          "border-[color-mix(in_oklab,var(--uai-danger)_70%,transparent)] hover:border-[var(--uai-danger)] focus-within:border-[var(--uai-danger)] focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--uai-danger)_22%,transparent)]",
      )}
      style={chrome.controlStyle}
    >
      {input}
      <button
        type="button"
        className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-[inherit] text-[var(--uai-subtle)] transition-colors duration-[120ms] ease-out hover:text-[var(--uai-text)] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--uai-accent)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none [&_svg]:size-4 [&_svg]:stroke-[1.75]"
        disabled={disabled || submitting}
        aria-label={revealed ? "Hide password" : "Show password"}
        aria-pressed={revealed}
        onClick={() => setRevealed((current) => !current)}
      >
        {revealed ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export type PasswordRecoveryFieldMessageProps = ComponentProps<"p">;

export function PasswordRecoveryFieldMessage({
  children,
  className,
  id,
  role,
  ...props
}: PasswordRecoveryFieldMessageProps) {
  usePasswordRecovery("PasswordRecoveryFieldMessage");
  const { messageId, invalid } = usePasswordRecoveryField("PasswordRecoveryFieldMessage");

  return (
    <p
      id={id ?? messageId}
      className={cn(
        "text-[11.5px] leading-4 [overflow-wrap:anywhere]",
        invalid
          ? "text-[color-mix(in_oklab,var(--uai-danger)_80%,var(--uai-text))]"
          : "text-[var(--uai-subtle)]",
        className,
      )}
      role={role ?? (invalid ? "alert" : undefined)}
      {...props}
    >
      {children}
    </p>
  );
}

export type PasswordRecoveryPasswordGuideProps = ComponentProps<"ul">;

export function PasswordRecoveryPasswordGuide({
  children,
  className,
  "aria-label": ariaLabel = "Password requirements",
  ...props
}: PasswordRecoveryPasswordGuideProps) {
  usePasswordRecovery("PasswordRecoveryPasswordGuide");
  return (
    <ul
      aria-label={ariaLabel}
      className={cn("grid gap-1 text-[11.5px] leading-4 text-[var(--uai-subtle)]", className)}
      {...props}
    >
      {children}
    </ul>
  );
}

export type PasswordRecoveryPasswordRequirementProps = ComponentProps<"li"> & { met?: boolean };

export function PasswordRecoveryPasswordRequirement({
  met = false,
  children,
  className,
  ...props
}: PasswordRecoveryPasswordRequirementProps) {
  usePasswordRecovery("PasswordRecoveryPasswordRequirement");
  const Icon = met ? Check : Circle;

  return (
    <li
      className={cn(
        "flex items-start gap-1.5 transition-colors duration-[120ms] ease-out motion-reduce:transition-none",
        met && "text-[var(--uai-muted)] [&_svg]:text-[var(--uai-success)]",
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" strokeWidth={met ? 2.2 : 1.6} aria-hidden="true" />
      <span className="sr-only">{met ? "Met: " : "Not met: "}</span>
      <span>{children}</span>
    </li>
  );
}

export type PasswordRecoveryErrorProps = ComponentProps<"div">;

export function PasswordRecoveryError({
  children,
  className,
  id,
  ...props
}: PasswordRecoveryErrorProps) {
  const { status, errorId } = usePasswordRecovery("PasswordRecoveryError");
  if (status !== "error") return null;

  return (
    <div
      id={id ?? errorId}
      className={cn(
        "bg-[color-mix(in_oklab,var(--uai-danger)_10%,transparent)] px-3 py-2.5 text-[12px] leading-4 text-[color-mix(in_oklab,var(--uai-danger)_80%,var(--uai-text))] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--uai-danger)_24%,transparent)] [overflow-wrap:anywhere]",
        className,
      )}
      style={{ borderRadius: 10 }}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
}

export type PasswordRecoverySubmitProps = ComponentProps<"button">;

const passwordRecoverySubmitCopy: Record<
  PasswordRecoveryStep,
  { idle: string; submitting: string }
> = {
  request: { idle: "Send reset link", submitting: "Sending link…" },
  sent: { idle: "Continue", submitting: "Working…" },
  reset: { idle: "Update password", submitting: "Updating password…" },
  expired: { idle: "Send a new link", submitting: "Sending link…" },
  success: { idle: "Continue", submitting: "Working…" },
};

export function PasswordRecoverySubmit({
  children,
  className,
  style,
  disabled,
  type = "submit",
  ...props
}: PasswordRecoverySubmitProps) {
  const { chrome, step, submitting } = usePasswordRecovery("PasswordRecoverySubmit");
  const copy = passwordRecoverySubmitCopy[step];

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || submitting}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-full border-0 bg-[var(--uai-accent)] px-4 font-medium text-[var(--uai-accent-foreground)] transition-[filter,transform] duration-[140ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:brightness-[1.08] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transform-none motion-reduce:transition-none",
        chrome.controlClass,
        className,
      )}
      style={style}
      aria-busy={submitting || undefined}
    >
      {submitting ? (
        <LoaderCircle
          className="size-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : null}
      {submitting ? copy.submitting : (children ?? copy.idle)}
    </button>
  );
}

export type PasswordRecoveryStatusProps = ComponentProps<"div"> & {
  tone?: "sent" | "expired" | "success";
};

const passwordRecoveryStatusIcon = {
  sent: MailCheck,
  expired: ClockAlert,
  success: CircleCheck,
} as const;

export function PasswordRecoveryStatus({
  tone = "sent",
  children,
  className,
  role,
  ...props
}: PasswordRecoveryStatusProps) {
  usePasswordRecovery("PasswordRecoveryStatus");
  const Icon = passwordRecoveryStatusIcon[tone];

  return (
    <div
      className={cn(
        "grid justify-items-center gap-3 bg-[var(--uai-surface-raised)] px-4 py-5 text-center text-[12.5px] leading-[18px] text-[var(--uai-muted)] [&_strong]:font-medium [&_strong]:text-[var(--uai-text)]",
        tone === "expired" &&
          "bg-[color-mix(in_oklab,var(--uai-warning)_8%,var(--uai-surface-raised))] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--uai-warning)_26%,transparent)]",
        className,
      )}
      style={{ borderRadius: 12 }}
      role={role ?? (tone === "expired" ? "alert" : "status")}
      {...props}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full",
          tone === "sent" &&
            "bg-[color-mix(in_oklab,var(--uai-accent)_16%,transparent)] text-[var(--uai-accent)]",
          tone === "expired" &&
            "bg-[color-mix(in_oklab,var(--uai-warning)_16%,transparent)] text-[var(--uai-warning)]",
          tone === "success" &&
            "bg-[color-mix(in_oklab,var(--uai-success)_16%,transparent)] text-[var(--uai-success)]",
        )}
      >
        <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
      </span>
      {children}
    </div>
  );
}

export type PasswordRecoveryActionsProps = ComponentProps<"div">;

export function PasswordRecoveryActions({
  children,
  className,
  ...props
}: PasswordRecoveryActionsProps) {
  usePasswordRecovery("PasswordRecoveryActions");
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export type PasswordRecoveryActionProps = ComponentProps<"button">;

export function PasswordRecoveryAction({
  children,
  className,
  disabled,
  type = "button",
  ...props
}: PasswordRecoveryActionProps) {
  const { submitting } = usePasswordRecovery("PasswordRecoveryAction");
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || submitting}
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-[12.5px] font-medium text-[var(--uai-muted)] transition-[background-color,color,transform] duration-[140ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </button>
  );
}

export type PasswordRecoveryFooterProps = ComponentProps<"footer">;

export function PasswordRecoveryFooter({
  children,
  className,
  ...props
}: PasswordRecoveryFooterProps) {
  const { chrome } = usePasswordRecovery("PasswordRecoveryFooter");
  return (
    <footer
      className={cn(
        "border-t border-[var(--uai-border)] text-center text-[12px] leading-4 text-[var(--uai-muted)] [&_a]:font-medium [&_a]:text-[var(--uai-accent)] [&_a]:underline-offset-4 [&_a:hover]:underline",
        chrome.footerClass,
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  );
}
