"use client";

import { cva } from "class-variance-authority";
import { Check, Circle, Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
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
  headerClass: string;
  titleClass: string;
  descriptionClass: string;
  bodyClass: string;
  groupGapClass: string;
  controlClass: string;
  controlRadiusClass: string;
  footerClass: string;
};

function signUpCardChrome(variant: SignUpCardVariant): SignUpCardChrome {
  const compact = variant === "compact";

  return {
    headerClass: compact ? "mb-4" : "mb-5",
    titleClass: compact ? "text-[15px] leading-5" : "text-[17px] leading-6",
    descriptionClass: compact
      ? "mt-1 text-[12.5px] leading-[18px]"
      : "mt-1.5 text-[13px] leading-[18px]",
    bodyClass:
      variant === "split"
        ? "grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch sm:gap-6"
        : "grid gap-4",
    groupGapClass: compact ? "gap-2.5" : "gap-3",
    controlClass: compact
      ? "h-[34px] py-0 text-[12.5px] md:text-[12.5px]"
      : "h-[38px] py-0 text-[13px] md:text-[13px]",
    controlRadiusClass: compact ? "rounded-lg" : "rounded-[10px]",
    footerClass: compact ? "mt-4 pt-3.5" : "mt-5 pt-4",
  };
}

const signUpCardVariants = cva("w-full border bg-card text-card-foreground", {
  variants: {
    variant: {
      card: "rounded-[14px] p-5",
      split: "rounded-[14px] p-6",
      compact: "rounded-xl p-3.5",
    },
  },
});

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
        data-slot="sign-up-card"
        className={cn(signUpCardVariants({ variant }), className)}
        {...props}
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
    <header
      data-slot="sign-up-card-header"
      className={cn(chrome.headerClass, className)}
      {...props}
    >
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
      data-slot="sign-up-card-title"
      className={cn("font-semibold tracking-[-0.015em] text-balance", chrome.titleClass, className)}
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
      data-slot="sign-up-card-description"
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

export type SignUpCardBodyProps = ComponentProps<"div">;

export function SignUpCardBody({ children, className, ...props }: SignUpCardBodyProps) {
  const { chrome } = useSignUpCard("SignUpCardBody");
  return (
    <div data-slot="sign-up-card-body" className={cn(chrome.bodyClass, className)} {...props}>
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
      data-slot="sign-up-card-providers"
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
  type = "button",
  disabled,
  ...props
}: SignUpCardProviderProps) {
  const { chrome, submitting } = useSignUpCard("SignUpCardProvider");
  return (
    <Button
      data-slot="sign-up-card-provider"
      variant="secondary"
      className={cn(
        "w-full gap-2 rounded-full border-0 px-3.5 text-foreground transition-[background-color,scale] duration-[140ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100 has-[>svg]:px-3.5",
        chrome.controlClass,
        className,
      )}
      {...props}
      type={type}
      disabled={disabled || submitting}
    >
      {children}
    </Button>
  );
}

export type SignUpCardDividerProps = ComponentProps<"div">;

export function SignUpCardDivider({ children, className, ...props }: SignUpCardDividerProps) {
  const { variant } = useSignUpCard("SignUpCardDivider");
  const label = children ?? (variant === "split" ? "or" : "or create with email");
  const dividerRuleClass = cn(
    "flex-1 data-[orientation=horizontal]:w-auto",
    variant === "split" &&
      "sm:data-[orientation=horizontal]:h-auto sm:data-[orientation=horizontal]:min-h-6 sm:data-[orientation=horizontal]:w-px",
  );
  return (
    <div
      data-slot="sign-up-card-divider"
      className={cn(
        "flex items-center gap-3 text-center text-[11.5px] leading-4 text-subtle-foreground",
        variant === "split" && "sm:flex-col sm:gap-2",
        className,
      )}
      {...props}
    >
      <Separator className={dividerRuleClass} aria-hidden="true" />
      <span className="shrink-0">{label}</span>
      <Separator className={dividerRuleClass} aria-hidden="true" />
    </div>
  );
}

export type SignUpCardFieldsProps = ComponentProps<"div">;

export function SignUpCardFields({ children, className, ...props }: SignUpCardFieldsProps) {
  const { chrome } = useSignUpCard("SignUpCardFields");
  return (
    <div
      data-slot="sign-up-card-fields"
      className={cn("grid content-start", chrome.groupGapClass, className)}
      {...props}
    >
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
      <div data-slot="sign-up-card-field" className={cn("grid gap-1.5", className)} {...props}>
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
    <Label
      htmlFor={htmlFor ?? controlId}
      data-slot="sign-up-card-label"
      className={cn("block text-[12.5px] leading-4 font-medium select-auto", className)}
      {...props}
    >
      {children}
    </Label>
  );
}

export type SignUpCardInputProps = Omit<ComponentProps<"input">, "size"> & {
  revealable?: boolean;
};

export function SignUpCardInput({
  revealable = false,
  className,
  id,
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
    <Input
      data-slot="sign-up-card-input"
      className={cn(
        "w-full min-w-0 bg-transparent px-3 text-foreground shadow-none outline-none placeholder:text-subtle-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent",
        !revealable &&
          "border border-border bg-background transition-[border-color,box-shadow] duration-[120ms] ease-out hover:border-border-strong focus-visible:border-border-strong focus-visible:ring-3 focus-visible:ring-primary/24 motion-reduce:transition-none aria-invalid:border-destructive/70 dark:bg-background",
        !revealable &&
          invalid &&
          "border-destructive/70 hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/22 aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/22 dark:aria-invalid:ring-destructive/22",
        !revealable && chrome.controlRadiusClass,
        revealable &&
          "rounded-none border-0 pr-10 focus-visible:ring-0 aria-invalid:ring-0 dark:aria-invalid:ring-0",
        chrome.controlClass,
        className,
      )}
      {...props}
      id={id ?? controlId}
      type={inputType}
      disabled={disabled || submitting}
      aria-describedby={describedBy || undefined}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
    />
  );

  if (!revealable) return input;

  return (
    <div
      className={cn(
        "relative border bg-background transition-[border-color,box-shadow] duration-[120ms] ease-out hover:border-border-strong focus-within:border-border-strong focus-within:ring-3 focus-within:ring-primary/24 motion-reduce:transition-none",
        invalid &&
          "border-destructive/70 hover:border-destructive focus-within:border-destructive focus-within:ring-destructive/22",
        chrome.controlRadiusClass,
      )}
    >
      {input}
      <Toggle
        type="button"
        className="absolute inset-y-0 right-0 h-auto w-10 min-w-0 rounded-[inherit] px-0 text-subtle-foreground transition-colors duration-[120ms] ease-out hover:bg-transparent hover:text-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-3px] focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:bg-transparent data-[state=on]:text-subtle-foreground data-[state=on]:hover:text-foreground motion-reduce:transition-none [&_svg]:stroke-[1.75]"
        disabled={disabled || submitting}
        aria-label={revealed ? "Hide password" : "Show password"}
        pressed={revealed}
        onPressedChange={setRevealed}
      >
        {revealed ? (
          <EyeOff
            key="hide"
            className="animate-in fade-in-0 zoom-in-75 duration-150 ease-out-quint motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <Eye
            key="show"
            className="animate-in fade-in-0 zoom-in-75 duration-150 ease-out-quint motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
      </Toggle>
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
      data-slot="sign-up-card-field-message"
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
      data-slot="sign-up-card-password-guide"
      className={cn("grid gap-1 text-[11.5px] leading-4 text-subtle-foreground", className)}
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
      data-slot="sign-up-card-password-requirement"
      className={cn(
        "flex items-start gap-1.5 transition-colors duration-[120ms] ease-out motion-reduce:transition-none",
        met && "text-muted-foreground [&_svg]:text-success",
        className,
      )}
      {...props}
    >
      <Icon
        key={met ? "met" : "unmet"}
        className={cn(
          "mt-0.5 size-3.5 shrink-0",
          met &&
            "animate-in fade-in-0 zoom-in-50 duration-200 ease-out-quint motion-reduce:animate-none",
        )}
        strokeWidth={met ? 2.2 : 1.6}
        aria-hidden="true"
      />
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
        data-slot="sign-up-card-consent"
        className={cn(
          "flex items-start gap-2 text-[12px] leading-4 text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline",
          className,
        )}
        {...props}
      >
        {children}
      </label>
    </SignUpCardConsentContext.Provider>
  );
}

export type SignUpCardCheckboxProps = ComponentProps<typeof Checkbox>;

export function SignUpCardCheckbox({ className, disabled, id, ...props }: SignUpCardCheckboxProps) {
  const { submitting } = useSignUpCard("SignUpCardCheckbox");
  const { controlId } = useSignUpCardConsent("SignUpCardCheckbox");
  return (
    <Checkbox
      data-slot="sign-up-card-checkbox"
      className={cn(
        "mt-px size-3.5 shrink-0 rounded-[4px] shadow-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-3",
        className,
      )}
      {...props}
      id={id ?? controlId}
      disabled={disabled || submitting}
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
      data-slot="sign-up-card-error"
      className={cn(
        "rounded-[10px] bg-destructive/10 px-3 py-2.5 text-[12px] leading-4 text-[color-mix(in_oklab,var(--destructive)_80%,var(--foreground))] inset-ring inset-ring-destructive/24 wrap-anywhere animate-in fade-in-0 slide-in-from-top-1 duration-200 ease-out-quint motion-reduce:animate-none",
        className,
      )}
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
  disabled,
  type = "submit",
  ...props
}: SignUpCardSubmitProps) {
  const { chrome, submitting } = useSignUpCard("SignUpCardSubmit");
  return (
    <Button
      data-slot="sign-up-card-submit"
      className={cn(
        "w-full gap-2 rounded-full border-0 px-4 transition-[filter,scale] duration-[140ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary hover:brightness-108 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100 has-[>svg]:px-4",
        chrome.controlClass,
        className,
      )}
      {...props}
      type={type}
      disabled={disabled || submitting}
      aria-busy={submitting || undefined}
    >
      {submitting ? (
        <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
      ) : null}
      {submitting ? "Creating account…" : children}
    </Button>
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
      data-slot="sign-up-card-verification"
      className={cn(
        "grid justify-items-center gap-3 rounded-xl bg-muted px-4 py-5 text-center text-[12.5px] leading-[18px] text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint motion-reduce:animate-none [&_strong]:font-medium [&_strong]:text-foreground",
        className,
      )}
      role="status"
      {...props}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-primary/16 text-primary">
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
      data-slot="sign-up-card-footer"
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
