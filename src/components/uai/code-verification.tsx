"use client";

import {
  type ClipboardEvent,
  type ComponentProps,
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  InlineFeedback,
  InlineFeedbackAction,
  type InlineFeedbackProps,
} from "@/components/ui/uai/inline-feedback";
import {
  StatusBanner,
  StatusBannerContent,
  StatusBannerIcon,
  type StatusBannerTone,
} from "@/components/ui/uai/status-banner";

export const CODE_VERIFICATION_VARIANTS = ["card", "split", "compact"] as const;
export type CodeVerificationVariant = (typeof CODE_VERIFICATION_VARIANTS)[number];
export type CodeVerificationStatus = "idle" | "verifying" | "invalid" | "expired" | "verified";
/** Resolve with nothing or "success" to accept the code. */
export type CodeVerificationResult = "success" | "invalid" | "expired" | undefined;

export type CodeVerificationProps = Omit<ComponentProps<"section">, "defaultValue" | "onChange"> & {
  variant?: CodeVerificationVariant;
  /** Number of characters in the code. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Checks the code. Delivery and verification stay with the application. */
  onVerify: (code: string) => Promise<CodeVerificationResult> | CodeVerificationResult;
  /** Sends a new code. Throw or reject to report a failure. */
  onResend?: () => Promise<unknown> | unknown;
  /** Seconds before another code can be requested. The countdown starts on mount. */
  resendAfter?: number;
  /** Submit as soon as every character is entered. */
  autoSubmit?: boolean;
};

type CodeVerificationContext = {
  id: string;
  variant: CodeVerificationVariant;
  length: number;
  code: string;
  status: CodeVerificationStatus;
  remaining: number;
  inputs: { current: (HTMLInputElement | null)[] };
  change: (code: string) => void;
  verify: (code: string) => void;
  resend: () => Promise<void>;
};
const Context = createContext<CodeVerificationContext | null>(null);
function useCodeVerification(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within CodeVerification`);
  return context;
}

const layoutCss = `
[data-uai-code-layout]{display:grid;gap:20px;align-items:start;min-width:0}
@container (min-width: 640px){
  [data-uai-code="split"]>[data-uai-code-layout]{grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);column-gap:40px}
}
[data-uai-code-cell]{border:1px solid transparent;background:var(--uai-canvas);color:var(--uai-text);transition:border-color 120ms ease-out,background-color 120ms ease-out,box-shadow 120ms ease-out}
[data-uai-code-cell]:hover:not(:focus):not(:disabled){border-color:var(--uai-border)}
[data-uai-code-cell][data-filled]{border-color:var(--uai-border-strong);background:var(--uai-surface)}
[data-uai-code-cell]:focus{outline:none;border-color:var(--uai-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--uai-accent) 22%,transparent)}
[data-uai-code-cell][aria-invalid="true"]{border-color:var(--uai-danger);background:color-mix(in oklab,var(--uai-danger) 6%,var(--uai-surface))}
[data-uai-code-cell][readonly],[data-uai-code-cell]:disabled{background:var(--uai-surface-raised);border-color:transparent}
[data-uai-code][data-status="verified"] [data-uai-code-cell]{color:var(--uai-success);background:color-mix(in oklab,var(--uai-success) 8%,var(--uai-surface))}
[data-uai-code-submit],[data-uai-code-alternative]{transition:background-color 120ms ease-out,color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-code-submit="ready"]{background:var(--uai-accent);color:var(--uai-accent-foreground)}
[data-uai-code-submit="ready"]:hover{filter:brightness(1.08)}
[data-uai-code-submit="idle"]{background:var(--uai-surface-raised);color:var(--uai-subtle)}
[data-uai-code-submit="ready"]:active,[data-uai-code-alternative]:active{transform:scale(0.97)}
[data-uai-code-alternative]{background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-code-alternative]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
[data-uai-code-submit]:focus-visible,[data-uai-code-alternative]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@keyframes uai-code-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
[data-uai-code-shimmer]{background:linear-gradient(90deg,color-mix(in oklab,currentColor 55%,transparent) 0%,color-mix(in oklab,currentColor 55%,transparent) 35%,currentColor 50%,color-mix(in oklab,currentColor 55%,transparent) 65%,color-mix(in oklab,currentColor 55%,transparent) 100%) 0 0/200% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:uai-code-shimmer 2s linear infinite}
@media (prefers-reduced-motion: reduce){[data-uai-code-cell],[data-uai-code-submit],[data-uai-code-alternative]{transition:none}[data-uai-code-submit="ready"]:active,[data-uai-code-alternative]:active{transform:none}[data-uai-code-shimmer]{animation:none;background:none;-webkit-text-fill-color:currentColor}}`;
const shells: Record<CodeVerificationVariant, CSSProperties> = {
  card: {
    maxWidth: 440,
    margin: "0 auto",
    padding: "clamp(20px, 6cqi, 28px)",
    border: "1px solid var(--uai-border)",
    borderRadius: 14,
    background: "var(--uai-surface)",
  },
  split: {
    padding: "clamp(20px, 4cqi, 32px)",
    border: "1px solid var(--uai-border)",
    borderRadius: 14,
    background: "var(--uai-surface)",
  },
  compact: {
    maxWidth: 360,
    margin: "0 auto",
    padding: 16,
    border: "1px solid var(--uai-border)",
    borderRadius: 12,
    background: "var(--uai-surface)",
  },
};
const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** Collects a one-time code, verifies it through `onVerify`, and paces resend requests. */
export function CodeVerification({
  variant = "card",
  length = 6,
  value,
  defaultValue = "",
  onValueChange,
  onVerify,
  onResend,
  resendAfter = 30,
  autoSubmit = true,
  children,
  style,
  ...props
}: CodeVerificationProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const [status, setStatus] = useState<CodeVerificationStatus>("idle");
  const [remaining, setRemaining] = useState(resendAfter);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const code = (value ?? internal).slice(0, length);
  const counting = remaining > 0;

  useEffect(() => {
    if (!counting) return;
    const timer = window.setInterval(() => {
      setRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [counting]);

  const change = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
    if (status === "invalid") setStatus("idle");
  };
  const verify = async (candidate: string) => {
    if (candidate.length < length || status === "verifying" || status === "verified") return;
    setStatus("verifying");
    try {
      const result = await onVerify(candidate);
      if (result === undefined || result === "success") {
        setStatus("verified");
        return;
      }
      setStatus(result);
    } catch {
      setStatus("invalid");
    }
    if (value === undefined) setInternal("");
    onValueChange?.("");
    inputs.current[0]?.focus();
  };
  const resend = async () => {
    await onResend?.();
    setRemaining(resendAfter);
    setStatus("idle");
    if (value === undefined) setInternal("");
    onValueChange?.("");
    inputs.current[0]?.focus();
  };

  return (
    <Context.Provider
      value={{
        id,
        variant,
        length,
        code,
        status,
        remaining,
        inputs,
        change: (next) => {
          change(next);
          if (autoSubmit && next.length === length) void verify(next);
        },
        verify: (candidate) => void verify(candidate),
        resend,
      }}
    >
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-status={status}
        data-uai-code={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...shells[variant],
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-code-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function CodeVerificationHeader({ style, ...props }: ComponentProps<"header">) {
  return <header {...props} style={{ display: "grid", gap: 6, minWidth: 0, ...style }} />;
}

export function CodeVerificationTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useCodeVerification("CodeVerificationTitle");
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
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function CodeVerificationDescription({ style, ...props }: ComponentProps<"p">) {
  const { id } = useCodeVerification("CodeVerificationDescription");
  return (
    <p
      {...props}
      id={`${id}-description`}
      style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }}
    />
  );
}

/** Where the code was sent, emphasised inside the description. */
export function CodeVerificationDestination({ style, ...props }: ComponentProps<"strong">) {
  return (
    <strong
      {...props}
      style={{ color: "var(--uai-text)", fontWeight: 500, overflowWrap: "anywhere", ...style }}
    />
  );
}

/** The form region. Enter submits the entered code. */
export function CodeVerificationForm({ onSubmit, style, ...props }: ComponentProps<"form">) {
  const context = useCodeVerification("CodeVerificationForm");
  return (
    <form
      noValidate
      aria-labelledby={`${context.id}-title`}
      {...props}
      onSubmit={(event) => {
        onSubmit?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        if (context.code.length < context.length) {
          context.inputs.current[context.code.length]?.focus();
          return;
        }
        context.verify(context.code);
      }}
      style={{ display: "grid", gap: 14, minWidth: 0, ...style }}
    />
  );
}

export type CodeVerificationInputProps = Omit<ComponentProps<"fieldset">, "children"> & {
  /** Accessible name of the group. */
  label?: string;
  /** Restrict entry to digits (the default) or allow letters too. */
  mode?: "numeric" | "alphanumeric";
};

/**
 * One input per character. Typing advances, Backspace steps back, arrows and Home/End move,
 * and pasting a full code fills every box. The first box carries autocomplete="one-time-code".
 */
export function CodeVerificationInput({
  label = "Verification code",
  mode = "numeric",
  style,
  ...props
}: CodeVerificationInputProps) {
  const context = useCodeVerification("CodeVerificationInput");
  const { length, code, status, inputs, variant } = context;
  const invalid = status === "invalid" || status === "expired";
  const locked = status === "verifying" || status === "verified";
  const size = variant === "compact" ? 36 : 44;
  const clean = (text: string) =>
    mode === "numeric" ? text.replace(/\D/g, "") : text.replace(/[^0-9a-z]/gi, "").toUpperCase();
  const focusAt = (index: number) => {
    const target = inputs.current[Math.max(0, Math.min(length - 1, index))];
    target?.focus();
    target?.select();
  };
  // Focus after a code change waits for the render, so the focus guard sees the new code.
  const pendingFocus = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (pendingFocus.current === null) return;
    focusAt(pendingFocus.current);
    pendingFocus.current = null;
  });
  const changeAndFocus = (next: string, index: number) => {
    pendingFocus.current = index;
    context.change(next);
  };
  const fill = (start: number, text: string) => {
    const chars = clean(text).slice(0, length - start);
    if (!chars) return;
    changeAndFocus(
      (code.slice(0, start) + chars + code.slice(start + chars.length)).slice(0, length),
      Math.min(start + chars.length, length - 1),
    );
  };
  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (code[index]) {
        changeAndFocus(code.slice(0, index) + code.slice(index + 1), index);
      } else if (index > 0) {
        changeAndFocus(code.slice(0, index - 1) + code.slice(index), index - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(Math.min(index + 1, code.length));
    } else if (event.key === "Home") {
      event.preventDefault();
      focusAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusAt(Math.min(code.length, length - 1));
    }
  };
  return (
    <fieldset
      aria-label={label}
      aria-describedby={`${context.id}-description ${context.id}-message`}
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${length}, minmax(0, ${size}px))`,
        justifyContent: variant === "split" ? "start" : "center",
        gap: variant === "compact" ? 6 : 8,
        minWidth: 0,
        margin: 0,
        padding: 0,
        border: 0,
        ...style,
      }}
    >
      {Array.from({ length }, (_, index) => {
        const char = code[index] ?? "";
        return (
          <input
            // biome-ignore lint/suspicious/noArrayIndexKey: positions are stable slots
            key={index}
            ref={(node) => {
              inputs.current[index] = node;
            }}
            aria-label={`Character ${index + 1} of ${length}`}
            aria-invalid={invalid || undefined}
            data-uai-code-cell=""
            data-filled={char ? "" : undefined}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            inputMode={mode === "numeric" ? "numeric" : "text"}
            pattern={mode === "numeric" ? "[0-9]*" : undefined}
            autoCapitalize="characters"
            spellCheck={false}
            disabled={status === "verified"}
            readOnly={locked}
            value={char}
            onFocus={(event) => {
              if (index > code.length) focusAt(code.length);
              else event.currentTarget.select();
            }}
            onChange={(event) => {
              // A box can briefly hold its old character plus the new one, or a whole autofilled code.
              let typed = clean(event.target.value);
              if (char && typed.length === 2) {
                typed = typed.startsWith(char) ? typed.slice(1) : typed.slice(0, 1);
              }
              if (typed) fill(index, typed);
            }}
            onPaste={(event: ClipboardEvent<HTMLInputElement>) => {
              event.preventDefault();
              fill(index, event.clipboardData.getData("text"));
            }}
            onKeyDown={onKeyDown(index)}
            style={{
              boxSizing: "border-box",
              width: "100%",
              minWidth: 0,
              height: size + 4,
              padding: 0,
              borderRadius: variant === "compact" ? 8 : 10,
              fontFamily: "inherit",
              fontSize: variant === "compact" ? 18 : 20,
              fontWeight: 500,
              fontVariantNumeric: "tabular-nums",
              textAlign: "center",
              caretColor: "var(--uai-text)",
            }}
          />
        );
      })}
    </fieldset>
  );
}

const messageTones: Record<"invalid" | "expired" | "verified", StatusBannerTone> = {
  invalid: "error",
  expired: "warning",
  verified: "success",
};

/** Shows its content only for the matching verification status. */
export function CodeVerificationMessage({
  status,
  children,
  ...props
}: Omit<ComponentProps<typeof StatusBanner>, "tone"> & {
  status: "invalid" | "expired" | "verified";
}) {
  const context = useCodeVerification("CodeVerificationMessage");
  if (context.status !== status) return null;
  return (
    <StatusBanner
      variant="tinted"
      {...props}
      id={`${context.id}-message`}
      tone={messageTones[status]}
    >
      <StatusBannerIcon />
      <StatusBannerContent>{children}</StatusBannerContent>
    </StatusBanner>
  );
}

export function CodeVerificationSubmit({
  pendingLabel = "Verifying…",
  children,
  style,
  ...props
}: ComponentProps<"button"> & { pendingLabel?: ReactNode }) {
  const context = useCodeVerification("CodeVerificationSubmit");
  const pending = context.status === "verifying";
  const ready = context.code.length === context.length && context.status !== "verified";
  return (
    <button
      type="submit"
      {...props}
      aria-disabled={!ready || pending || undefined}
      aria-busy={pending || undefined}
      data-uai-code-submit={ready || pending ? "ready" : "idle"}
      style={{
        height: context.variant === "compact" ? 30 : 34,
        padding: "0 16px",
        border: 0,
        borderRadius: 999,
        font: "inherit",
        fontSize: 13,
        fontWeight: 500,
        cursor: pending ? "progress" : ready ? "pointer" : "not-allowed",
        ...style,
      }}
    >
      {pending ? <span data-uai-code-shimmer="">{pendingLabel}</span> : children}
    </button>
  );
}

/** Groups the resend action and its Inline Feedback status. */
export function CodeVerificationResend({ style, ...props }: InlineFeedbackProps) {
  useCodeVerification("CodeVerificationResend");
  return (
    <InlineFeedback duration={4000} {...props} style={{ justifyContent: "center", ...style }} />
  );
}

/** Requests a new code. Disabled while the countdown runs, which it shows as m:ss. */
export function CodeVerificationResendButton({
  children,
  style,
  ...props
}: Omit<ComponentProps<typeof InlineFeedbackAction>, "onAction">) {
  const context = useCodeVerification("CodeVerificationResendButton");
  const waiting = context.remaining > 0;
  return (
    <InlineFeedbackAction
      {...props}
      disabled={waiting || context.status === "verified"}
      onAction={context.resend}
      style={{
        border: 0,
        padding: "0 4px",
        background: "transparent",
        color: waiting ? "var(--uai-subtle)" : "var(--uai-text)",
        textDecorationLine: waiting ? "none" : "underline",
        textDecorationColor: "var(--uai-border-strong)",
        textUnderlineOffset: 3,
        cursor: waiting ? "default" : "pointer",
        ...style,
      }}
    >
      {children}
      {waiting && (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {" "}
          in {formatTime(context.remaining)}
        </span>
      )}
    </InlineFeedbackAction>
  );
}

/** Other ways to verify, such as a call, backup code, or authenticator app. */
export function CodeVerificationAlternatives({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingTop: 16,
        borderTop: "1px solid var(--uai-border)",
        color: "var(--uai-subtle)",
        fontSize: 12,
        ...style,
      }}
    />
  );
}

export function CodeVerificationAlternative({ style, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      data-uai-code-alternative=""
      style={{
        height: 28,
        padding: "0 12px",
        border: 0,
        borderRadius: 999,
        font: "inherit",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    />
  );
}
