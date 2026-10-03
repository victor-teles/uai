"use client";

import { cva } from "class-variance-authority";
import {
  type ClipboardEvent,
  type ComponentProps,
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
import { cn } from "@/lib/uai-utils";

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

const codeVerificationVariants = cva(
  "box-border @container min-w-0 rounded-[14px] border bg-card text-[13px]/[18px] text-card-foreground",
  {
    variants: {
      variant: {
        card: "mx-auto max-w-110 p-[clamp(20px,6cqi,28px)]",
        split: "p-[clamp(20px,4cqi,32px)]",
        compact: "mx-auto max-w-90 rounded-xl p-4",
      },
    },
  },
);

const codeVerificationActionMotion =
  "[transition:background-color_120ms_ease-out,color_120ms_ease-out,filter_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none";

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
  className,
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
        data-slot="code-verification"
        data-variant={variant}
        className={cn(codeVerificationVariants({ variant }), className)}
        {...props}
        data-status={status}
      >
        <div
          className={cn(
            "grid min-w-0 items-start gap-5",
            variant === "split" &&
              "@min-[640px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] @min-[640px]:gap-x-10",
          )}
        >
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function CodeVerificationHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="code-verification-header"
      className={cn("grid min-w-0 gap-1.5", className)}
      {...props}
    />
  );
}

export function CodeVerificationTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useCodeVerification("CodeVerificationTitle");
  return (
    <h2
      data-slot="code-verification-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em] text-balance",
        variant === "compact" ? "text-[15px]/5" : "text-lg/6",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function CodeVerificationDescription({ className, ...props }: ComponentProps<"p">) {
  const { id } = useCodeVerification("CodeVerificationDescription");
  return (
    <p
      data-slot="code-verification-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
      id={`${id}-description`}
    />
  );
}

/** Where the code was sent, emphasised inside the description. */
export function CodeVerificationDestination({ className, ...props }: ComponentProps<"strong">) {
  return (
    <strong
      data-slot="code-verification-destination"
      className={cn("font-medium wrap-anywhere text-foreground", className)}
      {...props}
    />
  );
}

/** The form region. Enter submits the entered code. */
export function CodeVerificationForm({ onSubmit, className, ...props }: ComponentProps<"form">) {
  const context = useCodeVerification("CodeVerificationForm");
  return (
    <form
      noValidate
      aria-labelledby={`${context.id}-title`}
      data-slot="code-verification-form"
      className={cn("grid min-w-0 gap-3.5", className)}
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
  className,
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
      data-slot="code-verification-input"
      className={cn(
        "m-0 grid min-w-0 border-0 p-0",
        variant === "split" ? "justify-start" : "justify-center",
        variant === "compact" ? "gap-1.5" : "gap-2",
        className,
      )}
      {...props}
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, ${size}px))`, ...style }}
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
            data-slot="code-verification-cell"
            className={cn(
              "box-border h-12 w-full min-w-0 rounded-[10px] border p-0 text-center text-[20px] font-medium tabular-nums caret-foreground outline-none [transition:border-color_120ms_ease-out,background-color_120ms_ease-out,box-shadow_120ms_ease-out] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_22%,transparent)] motion-reduce:transition-none",
              variant === "compact" && "h-10 rounded-lg text-[18px]",
              status === "verified"
                ? "border-transparent bg-[color-mix(in_oklab,var(--success)_8%,var(--card))] text-success"
                : cn(
                    "text-foreground hover:not-focus:border-border",
                    locked
                      ? "border-transparent bg-muted"
                      : invalid
                        ? "border-destructive bg-[color-mix(in_oklab,var(--destructive)_6%,var(--card))]"
                        : cn(
                            "focus:border-primary",
                            char
                              ? "border-border-strong bg-card"
                              : "border-transparent bg-background",
                          ),
                  ),
            )}
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
  className,
  ...props
}: ComponentProps<"button"> & { pendingLabel?: ReactNode }) {
  const context = useCodeVerification("CodeVerificationSubmit");
  const pending = context.status === "verifying";
  const ready = context.code.length === context.length && context.status !== "verified";
  return (
    <button
      type="submit"
      data-slot="code-verification-submit"
      className={cn(
        "rounded-full border-0 px-4 text-[13px] font-medium",
        codeVerificationActionMotion,
        context.variant === "compact" ? "h-7.5" : "h-8.5",
        ready || pending
          ? "bg-primary text-primary-foreground hover:brightness-108 active:scale-[0.97] motion-reduce:active:scale-100"
          : "bg-muted text-subtle-foreground",
        pending ? "cursor-progress" : ready ? "cursor-pointer" : "cursor-not-allowed",
        className,
      )}
      {...props}
      aria-disabled={!ready || pending || undefined}
      aria-busy={pending || undefined}
      data-state={ready || pending ? "ready" : "idle"}
    >
      {pending ? (
        <span className="animate-shimmer bg-[linear-gradient(90deg,color-mix(in_oklab,currentColor_55%,transparent)_0%,color-mix(in_oklab,currentColor_55%,transparent)_35%,currentColor_50%,color-mix(in_oklab,currentColor_55%,transparent)_65%,color-mix(in_oklab,currentColor_55%,transparent)_100%)] bg-[length:200%_100%] bg-clip-text [-webkit-text-fill-color:transparent] motion-reduce:animate-none motion-reduce:bg-none motion-reduce:[-webkit-text-fill-color:currentColor]">
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/** Groups the resend action and its Inline Feedback status. */
export function CodeVerificationResend({ className, ...props }: InlineFeedbackProps) {
  useCodeVerification("CodeVerificationResend");
  return (
    <InlineFeedback
      duration={4000}
      data-slot="code-verification-resend"
      className={cn("justify-center", className)}
      {...props}
    />
  );
}

/** Requests a new code. Disabled while the countdown runs, which it shows as m:ss. */
export function CodeVerificationResendButton({
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof InlineFeedbackAction>, "onAction">) {
  const context = useCodeVerification("CodeVerificationResendButton");
  const waiting = context.remaining > 0;
  return (
    <InlineFeedbackAction
      className={cn(
        "border-0 bg-transparent px-1 decoration-border-strong underline-offset-3",
        waiting
          ? "cursor-default text-subtle-foreground no-underline"
          : "cursor-pointer text-foreground underline",
        className,
      )}
      {...props}
      disabled={waiting || context.status === "verified"}
      onAction={context.resend}
    >
      {children}
      {waiting && <span className="tabular-nums"> in {formatTime(context.remaining)}</span>}
    </InlineFeedbackAction>
  );
}

/** Other ways to verify, such as a call, backup code, or authenticator app. */
export function CodeVerificationAlternatives({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="code-verification-alternatives"
      className={cn(
        "flex flex-wrap items-center justify-center gap-1.5 border-t pt-4 text-[12px] text-subtle-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CodeVerificationAlternative({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="code-verification-alternative"
      className={cn(
        "h-7 cursor-pointer rounded-full border-0 bg-muted px-3 text-[12.5px] font-medium text-foreground hover:bg-[color-mix(in_oklab,var(--muted)_85%,var(--foreground))] active:scale-[0.97] motion-reduce:active:scale-100",
        codeVerificationActionMotion,
        className,
      )}
      {...props}
    />
  );
}
