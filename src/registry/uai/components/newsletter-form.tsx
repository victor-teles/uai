"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type FormEvent,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/uai-utils";

export const NEWSLETTER_FORM_VARIANTS = ["inline", "stacked", "card"] as const;
export type NewsletterFormVariant = (typeof NEWSLETTER_FORM_VARIANTS)[number];
export type NewsletterFormStatus =
  | "idle"
  | "invalid"
  | "consent"
  | "submitting"
  | "success"
  | "duplicate"
  | "error";
export type NewsletterFormResult = "success" | "duplicate" | "error";
export type NewsletterSubmission = { email: string; consent: boolean };
export type NewsletterFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  variant?: NewsletterFormVariant;
  /** Resolve "duplicate" for existing subscribers; throwing or resolving "error" shows a retry message. */
  onSubscribe: (
    submission: NewsletterSubmission,
    // biome-ignore lint/suspicious/noConfusingVoidType: async handlers without a result mean success.
  ) => Promise<NewsletterFormResult | void> | NewsletterFormResult | void;
  defaultEmail?: string;
};
type NewsletterContext = {
  id: string;
  variant: NewsletterFormVariant;
  email: string;
  setEmail: (email: string) => void;
  consent: boolean;
  setConsent: (consent: boolean) => void;
  requireConsent: (required: boolean) => void;
  status: NewsletterFormStatus;
  inputRef: React.RefObject<HTMLInputElement | null>;
  consentRef: React.RefObject<HTMLButtonElement | null>;
};
const Context = createContext<NewsletterContext | null>(null);
function useNewsletter(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within NewsletterForm`);
  return context;
}
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dangerText = "text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]";
const successText = "text-[color-mix(in_oklab,var(--success)_75%,var(--foreground))]";
const invalidRing = "shadow-[0_0_0_1px_color-mix(in_oklab,var(--destructive)_70%,transparent)]";
const fieldRing =
  "shadow-[0_0_0_1px_var(--border)] focus-within:shadow-[0_0_0_1px_var(--border-strong),0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]";
const inputRing =
  "shadow-[0_0_0_1px_var(--border)] focus:shadow-[0_0_0_1px_var(--border-strong),0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]";

const newsletterFormVariants = cva("box-border grid min-w-0 text-[13px]/[18px] text-foreground", {
  variants: {
    variant: {
      inline: "gap-2",
      stacked: "gap-3",
      card: "gap-3 rounded-[14px] border bg-card p-5",
    },
  },
});

const newsletterFormFieldVariants = cva("min-w-0 items-center", {
  variants: {
    variant: {
      inline:
        "flex gap-1 rounded-full bg-card py-1 pr-1 pl-3.5 transition-shadow duration-120 ease-out motion-reduce:transition-none",
      stacked: "grid gap-2 rounded-none bg-transparent p-0 shadow-none",
      card: "flex gap-1 rounded-full bg-background py-1 pr-1 pl-3.5 transition-shadow duration-120 ease-out motion-reduce:transition-none",
    },
  },
});

export function NewsletterForm({
  variant = "inline",
  onSubscribe,
  defaultEmail = "",
  children,
  className,
  ...props
}: NewsletterFormProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLButtonElement>(null);
  const [email, setEmailState] = useState(defaultEmail);
  const [consent, setConsentState] = useState(false);
  const [consentRequired, requireConsent] = useState(false);
  const [status, setStatus] = useState<NewsletterFormStatus>("idle");
  const reset = () => setStatus((current) => (current === "submitting" ? current : "idle"));
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;
    const address = email.trim();
    if (!EMAIL.test(address)) {
      setStatus("invalid");
      inputRef.current?.focus();
      return;
    }
    if (consentRequired && !consent) {
      setStatus("consent");
      consentRef.current?.focus();
      return;
    }
    setStatus("submitting");
    try {
      const result = await onSubscribe({ email: address, consent });
      setStatus(typeof result === "string" ? result : "success");
    } catch {
      setStatus("error");
    }
  };
  return (
    <Context.Provider
      value={{
        id,
        variant,
        email,
        setEmail: (next) => {
          setEmailState(next);
          reset();
        },
        consent,
        setConsent: (next) => {
          setConsentState(next);
          reset();
        },
        requireConsent,
        status,
        inputRef,
        consentRef,
      }}
    >
      <form
        noValidate
        aria-busy={status === "submitting"}
        data-slot="newsletter-form"
        data-variant={variant}
        className={cn(newsletterFormVariants({ variant }), className)}
        {...props}
        onSubmit={handleSubmit}
      >
        {children}
      </form>
    </Context.Provider>
  );
}

export function NewsletterFormLabel({ className, ...props }: ComponentProps<"label">) {
  const context = useNewsletter("NewsletterFormLabel");
  return (
    <Label
      data-slot="newsletter-form-label"
      className={cn("text-[13px] leading-[inherit] font-medium select-auto", className)}
      {...props}
      htmlFor={`${context.id}-email`}
    />
  );
}

export function NewsletterFormField({ className, ...props }: ComponentProps<"div">) {
  const context = useNewsletter("NewsletterFormField");
  const invalid = context.status === "invalid" || context.status === "duplicate";
  return (
    <div
      data-slot="newsletter-form-field"
      className={cn(
        newsletterFormFieldVariants({ variant: context.variant }),
        context.variant !== "stacked" && (invalid ? invalidRing : fieldRing),
        className,
      )}
      {...props}
    />
  );
}

export function NewsletterFormInput({
  className,
  onChange,
  ...props
}: Omit<ComponentProps<"input">, "value" | "defaultValue" | "id" | "type">) {
  const context = useNewsletter("NewsletterFormInput");
  const stacked = context.variant === "stacked";
  const invalid = context.status === "invalid" || context.status === "duplicate";
  return (
    <Input
      name="email"
      autoComplete="email"
      inputMode="email"
      data-slot="newsletter-form-input"
      className={cn(
        "box-border w-full min-w-0 flex-1 border-0 bg-transparent text-[13px]/[18px] text-inherit shadow-none outline-none transition-shadow duration-120 ease-out placeholder:text-subtle-foreground placeholder:opacity-100 focus-visible:ring-0 motion-reduce:transition-none md:text-[13px]/[18px] dark:bg-transparent",
        stacked ? "h-9 rounded-[10px] px-3 py-0" : "h-7 rounded-none p-0",
        stacked && (invalid ? invalidRing : inputRing),
        className,
      )}
      {...props}
      ref={context.inputRef}
      id={`${context.id}-email`}
      type="email"
      required
      value={context.email}
      aria-invalid={invalid || undefined}
      aria-describedby={`${context.id}-message`}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) context.setEmail(event.target.value);
      }}
    />
  );
}

export function NewsletterFormSubmit({
  children = "Subscribe",
  pendingLabel = "Subscribing…",
  onClick,
  className,
  ...props
}: Omit<ComponentProps<"button">, "type"> & { pendingLabel?: string }) {
  const context = useNewsletter("NewsletterFormSubmit");
  const pending = context.status === "submitting";
  const stacked = context.variant === "stacked";
  return (
    <Button
      data-slot="newsletter-form-submit"
      variant="default"
      className={cn(
        "flex-none rounded-full border-0 bg-primary px-3.5 py-0 text-[13px] font-medium whitespace-nowrap text-primary-foreground [transition:filter_120ms_ease-out,opacity_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-primary focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid has-[>svg]:px-3.5 motion-reduce:transition-none",
        stacked ? "h-8.5" : "h-7.5",
        pending
          ? "cursor-progress opacity-70"
          : "cursor-pointer hover:brightness-108 active:scale-[0.97] motion-reduce:active:scale-100",
        className,
      )}
      {...props}
      type="submit"
      aria-disabled={pending || undefined}
      onClick={(event) => {
        if (pending) event.preventDefault();
        onClick?.(event);
      }}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function NewsletterFormConsent({
  required = true,
  children,
  className,
  ...props
}: Omit<ComponentProps<"label">, "htmlFor"> & { required?: boolean }) {
  const context = useNewsletter("NewsletterFormConsent");
  const { requireConsent } = context;
  useIsomorphicLayoutEffect(() => {
    requireConsent(required);
    return () => requireConsent(false);
  }, [required, requireConsent]);
  const checkboxId = `${context.id}-consent`;
  return (
    <Label
      data-slot="newsletter-form-consent"
      className={cn(
        "flex cursor-pointer items-start gap-2 text-xs/4 font-normal text-muted-foreground select-auto",
        className,
      )}
      {...props}
      htmlFor={checkboxId}
    >
      <Checkbox
        ref={context.consentRef}
        id={checkboxId}
        name="consent"
        required={required}
        checked={context.consent}
        aria-invalid={context.status === "consent" || undefined}
        aria-describedby={`${context.id}-message`}
        onCheckedChange={(checked) => context.setConsent(checked === true)}
        className="m-0 mt-px size-3.5 flex-none cursor-pointer shadow-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid [&_svg]:size-3"
      />
      <span>{children}</span>
    </Label>
  );
}

export type NewsletterFormMessages = Partial<Record<NewsletterFormStatus, string>>;
const COPY: Record<NewsletterFormStatus, string> = {
  idle: "",
  invalid: "Enter an email address like name@example.com.",
  consent: "Confirm that you want to receive the newsletter.",
  submitting: "Subscribing…",
  success: "You’re subscribed. Check your inbox to confirm your address.",
  duplicate: "This email is already subscribed. No further action is needed.",
  error: "We couldn’t subscribe you. Please try again.",
};
const TONE: Partial<Record<NewsletterFormStatus, string>> = {
  invalid: dangerText,
  consent: dangerText,
  error: dangerText,
  success: successText,
};

export function NewsletterFormMessage({
  messages,
  children,
  className,
  ...props
}: ComponentProps<"p"> & { messages?: NewsletterFormMessages }) {
  const context = useNewsletter("NewsletterFormMessage");
  const missing = context.status === "invalid" && context.email.trim() === "";
  const copy = missing
    ? (messages?.invalid ?? "Enter your email address.")
    : (messages?.[context.status] ?? COPY[context.status]);
  return (
    <p
      role="status"
      data-slot="newsletter-form-message"
      className={cn(
        "m-0 min-h-4 text-xs/4 transition-colors duration-120 ease-out motion-reduce:transition-none",
        TONE[context.status] ?? "text-subtle-foreground",
        className,
      )}
      {...props}
      id={`${context.id}-message`}
    >
      {context.status === "idle" ? children : copy}
    </p>
  );
}
