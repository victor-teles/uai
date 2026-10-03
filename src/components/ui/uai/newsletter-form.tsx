"use client";

import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type FormEvent,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

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
  consentRef: React.RefObject<HTMLInputElement | null>;
};
const Context = createContext<NewsletterContext | null>(null);
function useNewsletter(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within NewsletterForm`);
  return context;
}
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dangerText = "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))";
const successText = "color-mix(in oklab, var(--uai-success) 75%, var(--uai-text))";
const newsletterCss = `
.uai-newsletter-field{background:var(--uai-surface);box-shadow:0 0 0 1px var(--uai-border);transition:box-shadow 120ms ease-out}
.uai-newsletter[data-variant=card] .uai-newsletter-field,.uai-newsletter[data-variant=card] .uai-newsletter-input{background:var(--uai-canvas)}
.uai-newsletter-field:focus-within{box-shadow:0 0 0 1px var(--uai-border-strong),0 0 0 4px color-mix(in oklab,var(--uai-accent) 14%,transparent)}
.uai-newsletter[data-variant=stacked] .uai-newsletter-field{background:transparent;box-shadow:none}
.uai-newsletter-input{outline:none;transition:box-shadow 120ms ease-out}
.uai-newsletter-input::placeholder{color:var(--uai-subtle);opacity:1}
.uai-newsletter[data-variant=stacked] .uai-newsletter-input{background:var(--uai-surface);box-shadow:0 0 0 1px var(--uai-border)}
.uai-newsletter[data-variant=stacked] .uai-newsletter-input:focus{box-shadow:0 0 0 1px var(--uai-border-strong),0 0 0 4px color-mix(in oklab,var(--uai-accent) 14%,transparent)}
.uai-newsletter[data-variant=stacked] .uai-newsletter-input[aria-invalid=true]{box-shadow:0 0 0 1px color-mix(in oklab,var(--uai-danger) 70%,transparent)}
.uai-newsletter-field:has([aria-invalid=true]){box-shadow:0 0 0 1px color-mix(in oklab,var(--uai-danger) 70%,transparent)}
.uai-newsletter-submit{background:var(--uai-accent);color:var(--uai-accent-foreground);transition:filter 120ms ease-out,opacity 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-newsletter-submit:hover{filter:brightness(1.08)}
.uai-newsletter-submit:active{transform:scale(0.97)}
.uai-newsletter-submit[aria-disabled=true]{opacity:0.7;filter:none;transform:none}
.uai-newsletter-submit:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-newsletter-message{transition:color 120ms ease-out}
@media (prefers-reduced-motion: reduce){
.uai-newsletter-field,.uai-newsletter-input,.uai-newsletter-submit,.uai-newsletter-message{transition:none}
.uai-newsletter-submit:active{transform:none}
}
`;
function cx(...names: (string | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

export function NewsletterForm({
  variant = "inline",
  onSubscribe,
  defaultEmail = "",
  children,
  className,
  style,
  ...props
}: NewsletterFormProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
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
        {...props}
        data-variant={variant}
        className={cx("uai-newsletter", className)}
        onSubmit={handleSubmit}
        style={{
          boxSizing: "border-box",
          display: "grid",
          gap: variant === "inline" ? 8 : 12,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...(variant === "card"
            ? {
                padding: 20,
                border: "1px solid var(--uai-border)",
                borderRadius: 14,
                background: "var(--uai-surface)",
              }
            : null),
          ...style,
        }}
      >
        <style>{newsletterCss}</style>
        {children}
      </form>
    </Context.Provider>
  );
}

export function NewsletterFormLabel({ style, ...props }: ComponentProps<"label">) {
  const context = useNewsletter("NewsletterFormLabel");
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor targets NewsletterFormInput; consumers supply the text.
    <label
      {...props}
      htmlFor={`${context.id}-email`}
      style={{ fontSize: 13, fontWeight: 500, ...style }}
    />
  );
}

export function NewsletterFormField({ className, style, ...props }: ComponentProps<"div">) {
  const context = useNewsletter("NewsletterFormField");
  const stacked = context.variant === "stacked";
  return (
    <div
      {...props}
      className={cx("uai-newsletter-field", className)}
      style={{
        display: stacked ? "grid" : "flex",
        alignItems: "center",
        gap: stacked ? 8 : 4,
        minWidth: 0,
        padding: stacked ? 0 : "4px 4px 4px 14px",
        borderRadius: stacked ? 0 : 999,
        ...style,
      }}
    />
  );
}

export function NewsletterFormInput({
  className,
  style,
  onChange,
  ...props
}: Omit<ComponentProps<"input">, "value" | "defaultValue" | "id" | "type">) {
  const context = useNewsletter("NewsletterFormInput");
  const stacked = context.variant === "stacked";
  const invalid = context.status === "invalid" || context.status === "duplicate";
  return (
    <input
      name="email"
      autoComplete="email"
      inputMode="email"
      {...props}
      ref={context.inputRef}
      id={`${context.id}-email`}
      type="email"
      required
      value={context.email}
      aria-invalid={invalid || undefined}
      aria-describedby={`${context.id}-message`}
      className={cx("uai-newsletter-input", className)}
      style={{
        flex: 1,
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
        height: stacked ? 36 : 28,
        padding: stacked ? "0 12px" : 0,
        border: 0,
        borderRadius: stacked ? 10 : 0,
        background: "transparent",
        color: "inherit",
        fontSize: 13,
        lineHeight: "18px",
        ...style,
      }}
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
  style,
  ...props
}: Omit<ComponentProps<"button">, "type"> & { pendingLabel?: string }) {
  const context = useNewsletter("NewsletterFormSubmit");
  const pending = context.status === "submitting";
  const stacked = context.variant === "stacked";
  return (
    <button
      {...props}
      type="submit"
      aria-disabled={pending || undefined}
      className={cx("uai-newsletter-submit", className)}
      style={{
        flex: "none",
        height: stacked ? 34 : 30,
        padding: "0 14px",
        border: 0,
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: pending ? "progress" : "pointer",
        ...style,
      }}
      onClick={(event) => {
        if (pending) event.preventDefault();
        onClick?.(event);
      }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function NewsletterFormConsent({
  required = true,
  children,
  style,
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
    <label
      {...props}
      htmlFor={checkboxId}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        color: "var(--uai-muted)",
        fontSize: 12,
        lineHeight: "16px",
        cursor: "pointer",
        ...style,
      }}
    >
      <input
        ref={context.consentRef}
        id={checkboxId}
        name="consent"
        type="checkbox"
        required={required}
        checked={context.consent}
        aria-invalid={context.status === "consent" || undefined}
        aria-describedby={`${context.id}-message`}
        onChange={(event) => context.setConsent(event.target.checked)}
        style={{
          flex: "none",
          width: 14,
          height: 14,
          margin: "1px 0 0",
          accentColor: "var(--uai-accent)",
          cursor: "pointer",
        }}
      />
      <span>{children}</span>
    </label>
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
  style,
  ...props
}: ComponentProps<"p"> & { messages?: NewsletterFormMessages }) {
  const context = useNewsletter("NewsletterFormMessage");
  const missing = context.status === "invalid" && context.email.trim() === "";
  const copy = missing
    ? (messages?.invalid ?? "Enter your email address.")
    : (messages?.[context.status] ?? COPY[context.status]);
  const tone: CSSProperties = { color: TONE[context.status] ?? "var(--uai-subtle)" };
  return (
    <p
      role="status"
      {...props}
      id={`${context.id}-message`}
      className={cx("uai-newsletter-message", className)}
      style={{ margin: 0, minHeight: 16, fontSize: 12, lineHeight: "16px", ...tone, ...style }}
    >
      {context.status === "idle" ? children : copy}
    </p>
  );
}
