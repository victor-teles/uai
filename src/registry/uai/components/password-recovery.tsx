"use client";

import { cva } from "class-variance-authority";
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
import { type ComponentProps, createContext, useContext, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
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
  asideClass: string;
  mainClass: string;
  titleClass: string;
  descriptionClass: string;
  groupGapClass: string;
  controlClass: string;
  controlRadiusClass: string;
  footerClass: string;
};

const passwordRecoveryVariants = cva(
  "grid w-full overflow-hidden border bg-card text-card-foreground",
  {
    variants: {
      variant: {
        card: "rounded-[14px] p-5",
        split: "rounded-[14px] p-0 sm:grid-cols-[minmax(190px,0.72fr)_minmax(0,1fr)]",
        compact: "rounded-xl p-3.5",
      },
    },
  },
);

function passwordRecoveryChrome(variant: PasswordRecoveryVariant): PasswordRecoveryChrome {
  const compact = variant === "compact";
  const split = variant === "split";

  return {
    asideClass: split
      ? "border-b bg-background p-6 sm:border-r sm:border-b-0"
      : compact
        ? "mb-3.5 border-b pb-3"
        : "mb-[18px] border-b pb-4",
    mainClass: split ? "p-6" : "",
    titleClass: compact ? "text-[15px] leading-5" : "text-[17px] leading-6",
    descriptionClass: compact
      ? "mt-1 text-[12.5px] leading-[18px]"
      : "mt-1.5 text-[13px] leading-[18px]",
    groupGapClass: compact ? "gap-2.5" : "gap-3",
    controlClass: compact
      ? "h-[34px] py-0 text-[12.5px] md:text-[12.5px]"
      : "h-[38px] py-0 text-[13px] md:text-[13px]",
    controlRadiusClass: compact ? "rounded-lg" : "rounded-[10px]",
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
        data-slot="password-recovery"
        className={cn(passwordRecoveryVariants({ variant }), className)}
        {...props}
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
  ...props
}: PasswordRecoveryAsideProps) {
  const { chrome } = usePasswordRecovery("PasswordRecoveryAside");

  return (
    <aside
      data-slot="password-recovery-aside"
      className={cn(
        "grid min-w-0 content-start gap-3 text-[12px] leading-4 text-muted-foreground [&_p]:m-0 [&_strong]:font-medium [&_strong]:text-foreground",
        chrome.asideClass,
        className,
      )}
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
      data-slot="password-recovery-progress"
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
      data-slot="password-recovery-progress-item"
      className={cn(
        "flex min-w-0 items-start gap-2 text-[11.5px] leading-4",
        state === "upcoming" && "text-subtle-foreground",
        state === "complete" && "text-muted-foreground",
        state === "current" && "font-medium text-foreground",
        className,
      )}
      aria-current={state === "current" ? "step" : undefined}
      data-state={state}
      {...props}
    >
      <span
        className={cn(
          "mt-px inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong transition-[background-color,border-color] duration-180 ease-out motion-reduce:transition-none",
          state === "upcoming" && "[&_svg]:opacity-0",
          state === "complete" && "border-transparent bg-primary text-primary-foreground",
          state === "current" &&
            "border-primary text-primary shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)] [&_svg]:fill-current",
        )}
      >
        <Icon
          className="size-2.5"
          strokeWidth={state === "complete" ? 2.4 : 2}
          aria-hidden="true"
        />
      </span>
      <span className="min-w-0 wrap-anywhere">
        <span className="sr-only">
          {state === "complete" ? "Complete: " : state === "current" ? "Current: " : "Upcoming: "}
        </span>
        {children}
      </span>
    </li>
  );
}

export type PasswordRecoveryMainProps = ComponentProps<"div">;

export function PasswordRecoveryMain({ children, className, ...props }: PasswordRecoveryMainProps) {
  const { chrome } = usePasswordRecovery("PasswordRecoveryMain");

  return (
    <div
      data-slot="password-recovery-main"
      className={cn("min-w-0", chrome.mainClass, className)}
      {...props}
    >
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
    <header data-slot="password-recovery-header" className={cn("mb-5", className)} {...props}>
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
      data-slot="password-recovery-title"
      className={cn("font-semibold tracking-[-0.015em] text-balance", chrome.titleClass, className)}
      {...props}
      id={titleId}
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
      data-slot="password-recovery-description"
      className={cn(
        "max-w-[52ch] text-muted-foreground wrap-anywhere",
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
      data-slot="password-recovery-stage"
      className={cn(
        "grid gap-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint motion-reduce:animate-none",
        className,
      )}
      data-recovery-stage={when}
      {...props}
    >
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
    <div
      data-slot="password-recovery-fields"
      className={cn("grid", chrome.groupGapClass, className)}
      {...props}
    >
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
      <div data-slot="password-recovery-field" className={cn("grid gap-1.5", className)} {...props}>
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
    <Label
      data-slot="password-recovery-label"
      htmlFor={htmlFor ?? controlId}
      className={cn("block text-[12.5px] leading-4 font-medium select-auto", className)}
      {...props}
    >
      {children}
    </Label>
  );
}

export type PasswordRecoveryInputProps = Omit<ComponentProps<"input">, "size"> & {
  revealable?: boolean;
};

export function PasswordRecoveryInput({
  revealable = false,
  className,
  id,
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
    <Input
      data-slot="password-recovery-input"
      {...props}
      id={id ?? controlId}
      type={inputType}
      disabled={disabled || submitting}
      className={cn(
        "w-full min-w-0 bg-transparent px-3 text-foreground shadow-none outline-none placeholder:text-subtle-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent",
        !revealable &&
          "border border-border bg-background transition-[border-color,box-shadow] duration-120 ease-out hover:border-border-strong focus-visible:border-border-strong focus-visible:ring-3 focus-visible:ring-primary/24 motion-reduce:transition-none aria-invalid:border-destructive/70 dark:bg-background",
        !revealable &&
          invalid &&
          "border-destructive/70 hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/22 aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/22 dark:aria-invalid:ring-destructive/22",
        !revealable && chrome.controlRadiusClass,
        revealable &&
          "rounded-none border-0 pr-10 focus-visible:ring-0 aria-invalid:ring-0 dark:aria-invalid:ring-0",
        chrome.controlClass,
        className,
      )}
      aria-describedby={describedBy || undefined}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
    />
  );

  if (!revealable) return input;

  return (
    <div
      className={cn(
        "relative border bg-background transition-[border-color,box-shadow] duration-120 ease-out hover:border-border-strong focus-within:border-border-strong focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_24%,transparent)] motion-reduce:transition-none",
        invalid &&
          "border-destructive/70 hover:border-destructive focus-within:border-destructive focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--destructive)_22%,transparent)]",
        chrome.controlRadiusClass,
      )}
    >
      {input}
      <Toggle
        type="button"
        className="absolute inset-y-0 right-0 h-auto w-10 min-w-0 rounded-[inherit] px-0 text-subtle-foreground transition-colors duration-120 ease-out hover:bg-transparent hover:text-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-3px] focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:bg-transparent data-[state=on]:text-subtle-foreground data-[state=on]:hover:text-foreground motion-reduce:transition-none [&_svg]:stroke-[1.75]"
        disabled={disabled || submitting}
        aria-label={revealed ? "Hide password" : "Show password"}
        pressed={revealed}
        onPressedChange={setRevealed}
      >
        {revealed ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </Toggle>
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
      data-slot="password-recovery-field-message"
      id={id ?? messageId}
      className={cn(
        "text-[11.5px] leading-4 wrap-anywhere",
        invalid
          ? "text-[color-mix(in_oklab,var(--destructive)_80%,var(--foreground))]"
          : "text-subtle-foreground",
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
      data-slot="password-recovery-password-guide"
      aria-label={ariaLabel}
      className={cn("grid gap-1 text-[11.5px] leading-4 text-subtle-foreground", className)}
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
      data-slot="password-recovery-password-requirement"
      className={cn(
        "flex items-start gap-1.5 transition-colors duration-120 ease-out motion-reduce:transition-none",
        met && "text-muted-foreground [&_svg]:text-success",
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
      data-slot="password-recovery-error"
      id={id ?? errorId}
      className={cn(
        "rounded-[10px] bg-destructive/10 px-3 py-2.5 text-[12px] leading-4 text-[color-mix(in_oklab,var(--destructive)_80%,var(--foreground))] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--destructive)_24%,transparent)] wrap-anywhere",
        className,
      )}
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
  disabled,
  type = "submit",
  ...props
}: PasswordRecoverySubmitProps) {
  const { chrome, step, submitting } = usePasswordRecovery("PasswordRecoverySubmit");
  const copy = passwordRecoverySubmitCopy[step];

  return (
    <Button
      data-slot="password-recovery-submit"
      {...props}
      type={type}
      disabled={disabled || submitting}
      className={cn(
        "w-full gap-2 rounded-full border-0 px-4 transition-[filter,scale] duration-140 ease-out-quint hover:bg-primary hover:brightness-[1.08] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100 has-[>svg]:px-4",
        chrome.controlClass,
        className,
      )}
      aria-busy={submitting || undefined}
    >
      {submitting ? (
        <LoaderCircle
          className="size-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : null}
      {submitting ? copy.submitting : (children ?? copy.idle)}
    </Button>
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
      data-slot="password-recovery-status"
      className={cn(
        "grid justify-items-center gap-3 rounded-xl bg-muted px-4 py-5 text-center text-[12.5px] leading-[18px] text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground",
        tone === "expired" &&
          "bg-[color-mix(in_oklab,var(--warning)_8%,var(--muted))] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--warning)_26%,transparent)]",
        className,
      )}
      role={role ?? (tone === "expired" ? "alert" : "status")}
      {...props}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full",
          tone === "sent" && "bg-primary/16 text-primary",
          tone === "expired" && "bg-warning/16 text-warning",
          tone === "success" && "bg-success/16 text-success",
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
    <div
      data-slot="password-recovery-actions"
      className={cn("flex flex-wrap items-center justify-center gap-1", className)}
      {...props}
    >
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
    <Button
      data-slot="password-recovery-action"
      variant="ghost"
      {...props}
      type={type}
      disabled={disabled || submitting}
      className={cn(
        "h-7 rounded-full px-3 py-0 text-[12.5px] text-muted-foreground transition-[background-color,color,scale] duration-140 ease-out-quint hover:bg-accent hover:text-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 has-[>svg]:px-3 dark:hover:bg-accent",
        className,
      )}
    >
      {children}
    </Button>
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
      data-slot="password-recovery-footer"
      className={cn(
        "border-t text-center text-[12px] leading-4 text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline",
        chrome.footerClass,
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  );
}
