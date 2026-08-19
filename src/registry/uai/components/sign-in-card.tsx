"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useId,
  useState,
} from "react";

import { cn } from "@/lib/uai-utils";

export const SIGN_IN_CARD_VARIANTS = ["card", "split", "compact"] as const;
export const SIGN_IN_CARD_STATUSES = ["idle", "submitting", "error"] as const;

export type SignInCardVariant = (typeof SIGN_IN_CARD_VARIANTS)[number];
export type SignInCardStatus = (typeof SIGN_IN_CARD_STATUSES)[number];

export type SignInCardProps = ComponentProps<"form"> & {
  variant?: SignInCardVariant;
  status?: SignInCardStatus;
};

type SignInCardChrome = {
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

function signInCardChrome(variant: SignInCardVariant): SignInCardChrome {
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

type SignInCardContextValue = {
  variant: SignInCardVariant;
  status: SignInCardStatus;
  submitting: boolean;
  titleId: string;
  errorId: string;
  chrome: SignInCardChrome;
};

const SignInCardContext = createContext<SignInCardContextValue | null>(null);

function useSignInCard(name: string) {
  const context = useContext(SignInCardContext);
  if (!context) throw new Error(`${name} must be used within SignInCard`);
  return context;
}

export function SignInCard({
  variant = "card",
  status = "idle",
  children,
  className,
  style,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  ...props
}: SignInCardProps) {
  const titleId = useId();
  const errorId = useId();
  const submitting = status === "submitting";
  const chrome = signInCardChrome(variant);
  const context: SignInCardContextValue = {
    variant,
    status,
    submitting,
    titleId,
    errorId,
    chrome,
  };

  return (
    <SignInCardContext.Provider value={context}>
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
    </SignInCardContext.Provider>
  );
}

export type SignInCardHeaderProps = ComponentProps<"header">;

export function SignInCardHeader({ children, className, ...props }: SignInCardHeaderProps) {
  const { chrome } = useSignInCard("SignInCardHeader");

  return (
    <header className={cn(chrome.headerClass, className)} {...props}>
      {children}
    </header>
  );
}

export type SignInCardTitleProps = ComponentProps<"h2">;

export function SignInCardTitle({ children, className, ...props }: SignInCardTitleProps) {
  const { titleId, chrome } = useSignInCard("SignInCardTitle");

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

export type SignInCardDescriptionProps = ComponentProps<"p">;

export function SignInCardDescription({
  children,
  className,
  ...props
}: SignInCardDescriptionProps) {
  const { chrome } = useSignInCard("SignInCardDescription");

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

export type SignInCardBodyProps = ComponentProps<"div">;

export function SignInCardBody({ children, className, ...props }: SignInCardBodyProps) {
  const { chrome } = useSignInCard("SignInCardBody");

  return (
    <div className={cn(chrome.bodyClass, className)} {...props}>
      {children}
    </div>
  );
}

export type SignInCardProvidersProps = ComponentProps<"fieldset">;

export function SignInCardProviders({
  children,
  className,
  "aria-label": ariaLabel = "Sign-in providers",
  ...props
}: SignInCardProvidersProps) {
  const { chrome } = useSignInCard("SignInCardProviders");

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

export type SignInCardProviderProps = ComponentProps<"button">;

export function SignInCardProvider({
  children,
  className,
  style,
  type = "button",
  disabled,
  ...props
}: SignInCardProviderProps) {
  const { chrome, submitting } = useSignInCard("SignInCardProvider");

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

export type SignInCardDividerProps = ComponentProps<"div">;

export function SignInCardDivider({ children, className, ...props }: SignInCardDividerProps) {
  const { variant } = useSignInCard("SignInCardDivider");
  const label = children ?? (variant === "split" ? "or" : "or continue with email");

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

export type SignInCardFieldsProps = ComponentProps<"div">;

export function SignInCardFields({ children, className, ...props }: SignInCardFieldsProps) {
  const { chrome } = useSignInCard("SignInCardFields");

  return (
    <div className={cn("grid content-start", chrome.groupGapClass, className)} {...props}>
      {children}
    </div>
  );
}

type SignInCardFieldContextValue = {
  controlId: string;
  messageId: string;
  invalid: boolean;
};

const SignInCardFieldContext = createContext<SignInCardFieldContextValue | null>(null);

function useSignInCardField(name: string) {
  const context = useContext(SignInCardFieldContext);
  if (!context) throw new Error(`${name} must be used within SignInCardField`);
  return context;
}

export type SignInCardFieldProps = ComponentProps<"div"> & {
  invalid?: boolean;
};

export function SignInCardField({
  invalid = false,
  children,
  className,
  ...props
}: SignInCardFieldProps) {
  useSignInCard("SignInCardField");
  const controlId = useId();
  const messageId = useId();

  return (
    <SignInCardFieldContext.Provider value={{ controlId, messageId, invalid }}>
      <div className={cn("grid gap-1.5", className)} {...props}>
        {children}
      </div>
    </SignInCardFieldContext.Provider>
  );
}

export type SignInCardLabelProps = ComponentProps<"label">;

export function SignInCardLabel({ children, className, htmlFor, ...props }: SignInCardLabelProps) {
  useSignInCard("SignInCardLabel");
  const { controlId } = useSignInCardField("SignInCardLabel");

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

export type SignInCardInputProps = Omit<ComponentProps<"input">, "size"> & {
  revealable?: boolean;
};

export function SignInCardInput({
  revealable = false,
  className,
  id,
  style,
  disabled,
  "aria-describedby": ariaDescribedby,
  "aria-invalid": ariaInvalid,
  type,
  ...props
}: SignInCardInputProps) {
  const { chrome, submitting } = useSignInCard("SignInCardInput");
  const { controlId, messageId, invalid } = useSignInCardField("SignInCardInput");
  const [revealed, setRevealed] = useState(false);
  const inputType = revealable ? (revealed ? "text" : "password") : type;
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
      aria-describedby={ariaDescribedby ?? (invalid ? messageId : undefined)}
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
        {revealed ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export type SignInCardFieldMessageProps = ComponentProps<"p">;

export function SignInCardFieldMessage({
  children,
  className,
  id,
  role,
  ...props
}: SignInCardFieldMessageProps) {
  useSignInCard("SignInCardFieldMessage");
  const { messageId, invalid } = useSignInCardField("SignInCardFieldMessage");

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

export type SignInCardOptionsProps = ComponentProps<"div">;

export function SignInCardOptions({ children, className, ...props }: SignInCardOptionsProps) {
  useSignInCard("SignInCardOptions");

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[0.72rem] leading-4 text-[var(--uai-muted)] [&_a]:font-medium [&_a]:text-[var(--uai-text)] [&_a]:underline-offset-4 [&_a:hover]:underline [&_input]:accent-[var(--uai-text)] [&_label]:inline-flex [&_label]:items-center [&_label]:gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type SignInCardErrorProps = ComponentProps<"div">;

export function SignInCardError({ children, className, id, ...props }: SignInCardErrorProps) {
  const { status, errorId } = useSignInCard("SignInCardError");
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

export type SignInCardSubmitProps = ComponentProps<"button">;

export function SignInCardSubmit({
  children = "Sign in",
  className,
  style,
  disabled,
  type = "submit",
  ...props
}: SignInCardSubmitProps) {
  const { chrome, submitting } = useSignInCard("SignInCardSubmit");

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
        <LoaderCircle
          className="size-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : null}
      {submitting ? "Signing in…" : children}
    </button>
  );
}

export type SignInCardFooterProps = ComponentProps<"footer">;

export function SignInCardFooter({ children, className, ...props }: SignInCardFooterProps) {
  const { chrome } = useSignInCard("SignInCardFooter");

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
