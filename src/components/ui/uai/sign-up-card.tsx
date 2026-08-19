"use client";

import { Check, Circle, Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useId,
  useState,
} from "react";

import { cn } from "@/lib/uai-utils";

export const SIGN_UP_CARD_VARIANTS = ["card", "split", "compact"] as const;
export const SIGN_UP_CARD_STATUSES = ["idle", "submitting", "error", "verification"] as const;

export type SignUpCardVariant = (typeof SIGN_UP_CARD_VARIANTS)[number];
export type SignUpCardStatus = (typeof SIGN_UP_CARD_STATUSES)[number];

export type SignUpCardProps = ComponentProps<"form"> & {
  variant?: SignUpCardVariant;
  status?: SignUpCardStatus;
};

type SignUpCardChrome = {
  rootClass: string;
  rootStyle: CSSProperties;
  headerClass: string;
  titleClass: string;
  descriptionClass: string;
  bodyClass: string;
  groupGapClass: string;
  controlClass: string;
  controlStyle: CSSProperties;
  footerClass: string;
};

function signUpCardChrome(variant: SignUpCardVariant): SignUpCardChrome {
  const compact = variant === "compact";

  return {
    rootClass: "border border-[var(--uai-border)] bg-[var(--uai-surface)]",
    rootStyle: {
      borderRadius: compact ? 12 : 14,
      padding: compact ? 14 : variant === "split" ? 24 : 20,
    },
    headerClass: compact ? "mb-4" : "mb-5",
    titleClass: compact ? "text-base leading-5" : "text-lg leading-6",
    descriptionClass: compact ? "mt-1 text-[12px] leading-4" : "mt-1.5 text-[13px] leading-[18px]",
    bodyClass:
      variant === "split"
        ? "grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch sm:gap-6"
        : "grid gap-4",
    groupGapClass: compact ? "gap-2.5" : "gap-3",
    controlClass: compact ? "h-[34px] text-[12px]" : "h-[42px] text-[13px]",
    controlStyle: { borderRadius: compact ? 8 : 10 },
    footerClass: compact ? "mt-4 pt-3.5" : "mt-5 pt-4",
  };
}

type SignUpCardContextValue = {
  status: SignUpCardStatus;
  submitting: boolean;
  variant: SignUpCardVariant;
  titleId: string;
  errorId: string;
  chrome: SignUpCardChrome;
};

const SignUpCardContext = createContext<SignUpCardContextValue | null>(null);

function useSignUpCard(name: string) {
  const context = useContext(SignUpCardContext);
  if (!context) throw new Error(`${name} must be used within SignUpCard`);
  return context;
}

export function SignUpCard({
  variant = "card",
  status = "idle",
  children,
  className,
  style,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  ...props
}: SignUpCardProps) {
  const titleId = useId();
  const errorId = useId();
  const submitting = status === "submitting";
  const chrome = signUpCardChrome(variant);

  return (
    <SignUpCardContext.Provider value={{ status, submitting, variant, titleId, errorId, chrome }}>
      <form
        {...props}
        className={cn("w-full text-[var(--uai-text)]", chrome.rootClass, className)}
        style={{ ...chrome.rootStyle, ...style }}
        data-variant={variant}
        aria-busy={submitting || undefined}
        aria-labelledby={ariaLabelledby ?? titleId}
        aria-describedby={ariaDescribedby ?? (status === "error" ? errorId : undefined)}
      >
        {children}
      </form>
    </SignUpCardContext.Provider>
  );
}

export type SignUpCardHeaderProps = ComponentProps<"header">;

export function SignUpCardHeader({ children, className, ...props }: SignUpCardHeaderProps) {
  const { chrome } = useSignUpCard("SignUpCardHeader");
  return (
    <header className={cn(chrome.headerClass, className)} {...props}>
      {children}
    </header>
  );
}

export type SignUpCardTitleProps = ComponentProps<"h2">;

export function SignUpCardTitle({ children, className, ...props }: SignUpCardTitleProps) {
  const { titleId, chrome } = useSignUpCard("SignUpCardTitle");
  return (
    <h2
      id={titleId}
      className={cn("font-semibold tracking-[-0.025em] text-balance", chrome.titleClass, className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export type SignUpCardDescriptionProps = ComponentProps<"p">;

export function SignUpCardDescription({
  children,
  className,
  ...props
}: SignUpCardDescriptionProps) {
  const { chrome } = useSignUpCard("SignUpCardDescription");
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

export type SignUpCardBodyProps = ComponentProps<"div">;

export function SignUpCardBody({ children, className, ...props }: SignUpCardBodyProps) {
  const { chrome } = useSignUpCard("SignUpCardBody");
  return (
    <div className={cn(chrome.bodyClass, className)} {...props}>
      {children}
    </div>
  );
}

export type SignUpCardProvidersProps = ComponentProps<"fieldset">;

export function SignUpCardProviders({
  children,
  className,
  "aria-label": ariaLabel = "Sign-up providers",
  ...props
}: SignUpCardProvidersProps) {
  const { chrome } = useSignUpCard("SignUpCardProviders");
  return (
    <fieldset
      className={cn("m-0 grid min-w-0 content-start border-0 p-0", chrome.groupGapClass, className)}
      {...props}
    >
      <legend className="sr-only">{ariaLabel}</legend>
      {children}
    </fieldset>
  );
}

export type SignUpCardProviderProps = ComponentProps<"button">;

export function SignUpCardProvider({
  children,
  className,
  style,
  type = "button",
  disabled,
  ...props
}: SignUpCardProviderProps) {
  const { chrome, submitting } = useSignUpCard("SignUpCardProvider");
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || submitting}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 border border-[var(--uai-border)] bg-[var(--uai-surface-raised)] px-3 font-medium transition-[background-color,border-color] duration-150 hover:border-[var(--uai-border-strong)] hover:bg-[color-mix(in_oklab,var(--uai-surface-raised)_76%,var(--uai-text)_4%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-text)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0",
        chrome.controlClass,
        className,
      )}
      style={{ ...chrome.controlStyle, ...style }}
    >
      {children}
    </button>
  );
}

export type SignUpCardDividerProps = ComponentProps<"div">;

export function SignUpCardDivider({ children, className, ...props }: SignUpCardDividerProps) {
  const { variant } = useSignUpCard("SignUpCardDivider");
  const label = children ?? (variant === "split" ? "or" : "or create with email");
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-center text-[0.72rem] leading-4 text-[var(--uai-muted)]",
        variant === "split" && "sm:flex-col sm:gap-2",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "h-px flex-1 bg-[var(--uai-border)]",
          variant === "split" && "sm:h-auto sm:min-h-6 sm:w-px",
        )}
        aria-hidden="true"
      />
      <span className="shrink-0">{label}</span>
      <span
        className={cn(
          "h-px flex-1 bg-[var(--uai-border)]",
          variant === "split" && "sm:h-auto sm:min-h-6 sm:w-px",
        )}
        aria-hidden="true"
      />
    </div>
  );
}

export type SignUpCardFieldsProps = ComponentProps<"div">;

export function SignUpCardFields({ children, className, ...props }: SignUpCardFieldsProps) {
  const { chrome } = useSignUpCard("SignUpCardFields");
  return (
    <div className={cn("grid content-start", chrome.groupGapClass, className)} {...props}>
      {children}
    </div>
  );
}

type SignUpCardFieldContextValue = {
  controlId: string;
  messageId: string;
  invalid: boolean;
};

const SignUpCardFieldContext = createContext<SignUpCardFieldContextValue | null>(null);

function useSignUpCardField(name: string) {
  const context = useContext(SignUpCardFieldContext);
  if (!context) throw new Error(`${name} must be used within SignUpCardField`);
  return context;
}

export type SignUpCardFieldProps = ComponentProps<"div"> & { invalid?: boolean };

export function SignUpCardField({
  invalid = false,
  children,
  className,
  ...props
}: SignUpCardFieldProps) {
  useSignUpCard("SignUpCardField");
  const controlId = useId();
  const messageId = useId();
  return (
    <SignUpCardFieldContext.Provider value={{ controlId, messageId, invalid }}>
      <div className={cn("grid gap-1.5", className)} {...props}>
        {children}
      </div>
    </SignUpCardFieldContext.Provider>
  );
}

export type SignUpCardLabelProps = ComponentProps<"label">;

export function SignUpCardLabel({ children, className, htmlFor, ...props }: SignUpCardLabelProps) {
  useSignUpCard("SignUpCardLabel");
  const { controlId } = useSignUpCardField("SignUpCardLabel");
  return (
    <label
      htmlFor={htmlFor ?? controlId}
      className={cn("text-[0.72rem] leading-4 font-medium", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export type SignUpCardInputProps = Omit<ComponentProps<"input">, "size"> & {
  revealable?: boolean;
};

export function SignUpCardInput({
  revealable = false,
  className,
  id,
  style,
  disabled,
  "aria-describedby": ariaDescribedby,
  "aria-invalid": ariaInvalid,
  type,
  ...props
}: SignUpCardInputProps) {
  const { chrome, submitting } = useSignUpCard("SignUpCardInput");
  const { controlId, messageId, invalid } = useSignUpCardField("SignUpCardInput");
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
        "min-w-0 w-full bg-transparent px-3 text-[var(--uai-text)] outline-none placeholder:text-[var(--uai-muted)] disabled:cursor-not-allowed disabled:opacity-50",
        !revealable &&
          "border border-[var(--uai-border)] focus:border-[var(--uai-border-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-text)]",
        !revealable && invalid && "border-[var(--uai-danger)]",
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
        "relative border border-[var(--uai-border)] focus-within:border-[var(--uai-border-strong)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--uai-text)]",
        invalid && "border-[var(--uai-danger)]",
      )}
      style={chrome.controlStyle}
    >
      {input}
      <button
        type="button"
        className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-[inherit] text-[var(--uai-muted)] transition-colors duration-150 hover:text-[var(--uai-text)] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--uai-text)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
        disabled={disabled || submitting}
        aria-label={revealed ? "Hide password" : "Show password"}
        aria-pressed={revealed}
        onClick={() => setRevealed((current) => !current)}
      >
        {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </button>
    </div>
  );
}

export type SignUpCardFieldMessageProps = ComponentProps<"p">;

export function SignUpCardFieldMessage({
  children,
  className,
  id,
  role,
  ...props
}: SignUpCardFieldMessageProps) {
  useSignUpCard("SignUpCardFieldMessage");
  const { messageId, invalid } = useSignUpCardField("SignUpCardFieldMessage");
  return (
    <p
      id={id ?? messageId}
      className={cn(
        "text-[0.7rem] leading-4 [overflow-wrap:anywhere]",
        invalid ? "text-[var(--uai-danger)]" : "text-[var(--uai-muted)]",
        className,
      )}
      role={role ?? (invalid ? "alert" : undefined)}
      {...props}
    >
      {children}
    </p>
  );
}

export type SignUpCardPasswordGuideProps = ComponentProps<"ul">;

export function SignUpCardPasswordGuide({
  children,
  className,
  "aria-label": ariaLabel = "Password requirements",
  ...props
}: SignUpCardPasswordGuideProps) {
  useSignUpCard("SignUpCardPasswordGuide");
  return (
    <ul
      aria-label={ariaLabel}
      className={cn("grid gap-1 text-[0.7rem] leading-4 text-[var(--uai-muted)]", className)}
      {...props}
    >
      {children}
    </ul>
  );
}

export type SignUpCardPasswordRequirementProps = ComponentProps<"li"> & { met?: boolean };

export function SignUpCardPasswordRequirement({
  met = false,
  children,
  className,
  ...props
}: SignUpCardPasswordRequirementProps) {
  useSignUpCard("SignUpCardPasswordRequirement");
  const Icon = met ? Check : Circle;
  return (
    <li
      className={cn("flex items-start gap-1.5", met && "text-[var(--uai-text)]", className)}
      {...props}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" strokeWidth={met ? 2.2 : 1.6} aria-hidden="true" />
      <span className="sr-only">{met ? "Met: " : "Not met: "}</span>
      <span>{children}</span>
    </li>
  );
}

export type SignUpCardConsentProps = ComponentProps<"label">;

type SignUpCardConsentContextValue = { controlId: string };

const SignUpCardConsentContext = createContext<SignUpCardConsentContextValue | null>(null);

function useSignUpCardConsent(name: string) {
  const context = useContext(SignUpCardConsentContext);
  if (!context) throw new Error(`${name} must be used within SignUpCardConsent`);
  return context;
}

export function SignUpCardConsent({
  children,
  className,
  htmlFor,
  ...props
}: SignUpCardConsentProps) {
  useSignUpCard("SignUpCardConsent");
  const controlId = useId();
  return (
    <SignUpCardConsentContext.Provider value={{ controlId }}>
      <label
        htmlFor={htmlFor ?? controlId}
        className={cn(
          "flex items-start gap-2 text-[0.72rem] leading-4 text-[var(--uai-muted)] [&_a]:font-medium [&_a]:text-[var(--uai-text)] [&_a]:underline-offset-4 [&_a:hover]:underline",
          className,
        )}
        {...props}
      >
        {children}
      </label>
    </SignUpCardConsentContext.Provider>
  );
}

export type SignUpCardCheckboxProps = Omit<ComponentProps<"input">, "type">;

export function SignUpCardCheckbox({ className, disabled, id, ...props }: SignUpCardCheckboxProps) {
  const { submitting } = useSignUpCard("SignUpCardCheckbox");
  const { controlId } = useSignUpCardConsent("SignUpCardCheckbox");
  return (
    <input
      {...props}
      id={id ?? controlId}
      type="checkbox"
      disabled={disabled || submitting}
      className={cn(
        "mt-0.5 size-3.5 shrink-0 accent-[var(--uai-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-text)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
}

export type SignUpCardErrorProps = ComponentProps<"div">;

export function SignUpCardError({ children, className, id, ...props }: SignUpCardErrorProps) {
  const { status, errorId } = useSignUpCard("SignUpCardError");
  if (status !== "error") return null;
  return (
    <div
      id={id ?? errorId}
      className={cn(
        "border border-[color-mix(in_oklab,var(--uai-danger)_48%,var(--uai-border))] bg-[color-mix(in_oklab,var(--uai-danger)_9%,var(--uai-surface))] px-3 py-2.5 text-[0.72rem] leading-4 text-[var(--uai-danger)] [overflow-wrap:anywhere]",
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

export type SignUpCardSubmitProps = ComponentProps<"button">;

export function SignUpCardSubmit({
  children = "Create account",
  className,
  style,
  disabled,
  type = "submit",
  ...props
}: SignUpCardSubmitProps) {
  const { chrome, submitting } = useSignUpCard("SignUpCardSubmit");
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || submitting}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 bg-[var(--uai-text)] px-4 font-semibold text-[var(--uai-surface)] transition-[opacity,transform] duration-150 hover:opacity-90 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-text)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none",
        chrome.controlClass,
        className,
      )}
      style={{ ...chrome.controlStyle, ...style }}
      aria-busy={submitting || undefined}
    >
      {submitting ? (
        <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
      ) : null}
      {submitting ? "Creating account…" : children}
    </button>
  );
}

export type SignUpCardVerificationProps = ComponentProps<"div">;

export function SignUpCardVerification({
  children,
  className,
  ...props
}: SignUpCardVerificationProps) {
  const { status } = useSignUpCard("SignUpCardVerification");
  if (status !== "verification") return null;
  return (
    <div
      className={cn(
        "grid justify-items-center gap-3 border border-[var(--uai-border)] bg-[var(--uai-surface-raised)] px-4 py-5 text-center text-[0.75rem] leading-[18px] text-[var(--uai-muted)]",
        className,
      )}
      style={{ borderRadius: 12 }}
      role="status"
      {...props}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-[var(--uai-surface)] text-[var(--uai-text)]">
        <MailCheck className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
      </span>
      {children}
    </div>
  );
}

export type SignUpCardFooterProps = ComponentProps<"footer">;

export function SignUpCardFooter({ children, className, ...props }: SignUpCardFooterProps) {
  const { chrome } = useSignUpCard("SignUpCardFooter");
  return (
    <footer
      className={cn(
        "border-t border-[var(--uai-border)] text-center text-[0.72rem] leading-4 text-[var(--uai-muted)] [&_a]:font-medium [&_a]:text-[var(--uai-text)] [&_a]:underline-offset-4 [&_a:hover]:underline",
        chrome.footerClass,
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  );
}
