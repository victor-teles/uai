"use client";

import { cva } from "class-variance-authority";
import { Check, CheckCircle2, Copy, TimerOff } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/uai-utils";

export const PIX_PAYMENT_VARIANTS = ["card", "plain", "compact"] as const;
export const PIX_PAYMENT_STATUSES = ["pending", "paid", "expired"] as const;

export type PixPaymentVariant = (typeof PIX_PAYMENT_VARIANTS)[number];
export type PixPaymentStatus = (typeof PIX_PAYMENT_STATUSES)[number];

export function formatBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export type PixPaymentProps = ComponentProps<"section"> & {
  variant?: PixPaymentVariant;
  /** Payment state owned by the application, usually from a webhook or polling. */
  status?: PixPaymentStatus;
  /** The Pix copy-and-paste payload (BR Code). */
  code: string;
  /** When the charge expires. The countdown ticks locally while pending. */
  expiresAt?: Date | string | number;
  /** Fixes the starting clock so server and client render the same countdown. */
  now?: Date | string | number;
  onExpire?: () => void;
  onCodeCopy?: (code: string) => void;
};

const pixPaymentVariants = cva("@container/pix grid w-full text-card-foreground", {
  variants: {
    variant: {
      card: "gap-5 rounded-[14px] border border-border bg-card p-5",
      plain: "gap-5",
      compact: "gap-3.5 rounded-xl border border-border bg-card p-3.5",
    },
  },
});

type PixPaymentContextValue = {
  variant: PixPaymentVariant;
  status: PixPaymentStatus;
  code: string;
  secondsLeft: number | null;
  copied: boolean;
  copy: () => Promise<void>;
};

const PixPaymentContext = createContext<PixPaymentContextValue | null>(null);

function usePixPayment(name: string) {
  const context = useContext(PixPaymentContext);
  if (!context) throw new Error(`${name} must be used within PixPayment`);
  return context;
}

function toTime(value: Date | string | number) {
  return new Date(value).getTime();
}

export function PixPayment({
  variant = "card",
  status = "pending",
  code,
  expiresAt,
  now,
  onExpire,
  onCodeCopy,
  children,
  className,
  ...props
}: PixPaymentProps) {
  const deadline = expiresAt === undefined ? null : toTime(expiresAt);
  // A fixed `now` becomes an offset from the real clock, so the countdown keeps ticking.
  const [offset] = useState(() => (now === undefined ? 0 : toTime(now) - Date.now()));
  const [clock, setClock] = useState(() => Date.now() + offset);
  const [copied, setCopied] = useState(false);
  const expiredNotified = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const secondsLeft = deadline === null ? null : Math.max(0, Math.ceil((deadline - clock) / 1000));

  useEffect(() => {
    if (status !== "pending" || deadline === null) return;
    const timer = window.setInterval(() => setClock(Date.now() + offset), 1000);
    return () => window.clearInterval(timer);
  }, [deadline, offset, status]);

  useEffect(() => {
    if (status !== "pending" || secondsLeft !== 0 || expiredNotified.current) return;
    expiredNotified.current = true;
    onExpireRef.current?.();
  }, [secondsLeft, status]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCodeCopy?.(code);
    } catch {
      setCopied(false);
    }
  };

  return (
    <PixPaymentContext.Provider value={{ variant, status, code, secondsLeft, copied, copy }}>
      <section
        data-slot="pix-payment"
        data-variant={variant}
        data-status={status}
        className={cn(pixPaymentVariants({ variant }), className)}
        {...props}
      >
        {children}
      </section>
    </PixPaymentContext.Provider>
  );
}

export type PixPaymentHeaderProps = ComponentProps<"header">;

export function PixPaymentHeader({ className, ...props }: PixPaymentHeaderProps) {
  return (
    <header
      data-slot="pix-payment-header"
      className={cn(
        "flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-2",
        className,
      )}
      {...props}
    />
  );
}

export type PixPaymentTitleProps = ComponentProps<"h3">;

export function PixPaymentTitle({
  children = "Pague com Pix",
  className,
  ...props
}: PixPaymentTitleProps) {
  return (
    <h3
      data-slot="pix-payment-title"
      className={cn("text-[13px] leading-[18px] font-medium text-muted-foreground", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export type PixPaymentAmountProps = Omit<ComponentProps<"p">, "children"> & {
  value: number;
};

export function PixPaymentAmount({ value, className, ...props }: PixPaymentAmountProps) {
  const context = usePixPayment("PixPaymentAmount");
  return (
    <p
      data-slot="pix-payment-amount"
      className={cn(
        "font-semibold tracking-[-0.01em] text-foreground tabular-nums",
        context.variant === "compact" ? "text-[20px] leading-6" : "text-[28px] leading-8",
        className,
      )}
      {...props}
    >
      {formatBrl(value)}
    </p>
  );
}

const statusCopy: Record<PixPaymentStatus, string> = {
  pending: "Aguardando pagamento",
  paid: "Pagamento confirmado",
  expired: "Código expirado",
};

export type PixPaymentStatusBadgeProps = ComponentProps<"span">;

/** A polite live region, so confirmation is announced when the status changes. */
export function PixPaymentStatusBadge({
  children,
  className,
  ...props
}: PixPaymentStatusBadgeProps) {
  const context = usePixPayment("PixPaymentStatusBadge");
  return (
    <Badge
      variant="secondary"
      data-slot="pix-payment-status-badge"
      data-status={context.status}
      className={cn(
        "h-6 shrink-0 gap-1.5 rounded-full border-0 px-2.5 py-0 text-[11.5px] font-medium",
        context.status === "pending" && "bg-warning/14 text-warning",
        context.status === "paid" && "bg-success/14 text-success",
        context.status === "expired" && "bg-muted text-muted-foreground",
        className,
      )}
      {...props}
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full bg-current",
          context.status === "pending" && "animate-pulse motion-reduce:animate-none",
        )}
      />
      {children ?? statusCopy[context.status]}
    </Badge>
  );
}

export type PixPaymentBodyProps = ComponentProps<"div">;

/** Places the QR code beside the payment details, stacking on narrow containers. */
export function PixPaymentBody({ className, ...props }: PixPaymentBodyProps) {
  return (
    <div
      data-slot="pix-payment-body"
      className={cn(
        "grid items-start gap-5 @min-[520px]/pix:grid-cols-[auto_minmax(0,1fr)]",
        className,
      )}
      {...props}
    />
  );
}

export type PixPaymentQrCodeProps = ComponentProps<"figure">;

/** Frames the consumer's QR image. The tile stays white so every camera can read it. */
export function PixPaymentQrCode({ children, className, ...props }: PixPaymentQrCodeProps) {
  const context = usePixPayment("PixPaymentQrCode");
  const compact = context.variant === "compact";
  return (
    <figure
      data-slot="pix-payment-qr-code"
      className={cn(
        "relative isolate m-0 grid shrink-0 place-items-center justify-self-center overflow-hidden bg-white shadow-[0_0_0_1px_var(--border)] @min-[520px]/pix:justify-self-start",
        compact ? "size-32 rounded-[10px] p-2.5" : "size-44 rounded-xl p-3.5",
        "[&_img]:size-full [&_svg]:size-full",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "size-full transition-[filter,opacity] duration-240 ease-out-quint motion-reduce:transition-none",
          context.status !== "pending" && "opacity-25 blur-[3px]",
        )}
        aria-hidden={context.status !== "pending" || undefined}
      >
        {children}
      </div>
      {context.status !== "pending" ? (
        <figcaption
          className={cn(
            "absolute inset-0 grid animate-in place-content-center justify-items-center gap-1.5 text-center text-[12px] leading-4 font-medium text-[oklch(0.247_0.006_258)] duration-240 ease-out-quint fade-in-0 zoom-in-96 motion-reduce:animate-none",
          )}
        >
          {context.status === "paid" ? (
            <CheckCircle2 className="size-7 text-success" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <TimerOff className="size-7 opacity-70" strokeWidth={1.75} aria-hidden="true" />
          )}
          {context.status === "paid" ? "Pago" : "QR Code expirado"}
        </figcaption>
      ) : null}
    </figure>
  );
}

export type PixPaymentDetailsProps = ComponentProps<"div">;

export function PixPaymentDetails({ className, ...props }: PixPaymentDetailsProps) {
  return (
    <div
      data-slot="pix-payment-details"
      className={cn("grid min-w-0 content-start gap-3.5", className)}
      {...props}
    />
  );
}

export type PixPaymentCodeProps = Omit<ComponentProps<"div">, "children"> & {
  label?: string;
};

/** The copy-and-paste code with a copy button and a spoken confirmation. */
export function PixPaymentCode({
  label = "Pix copia e cola",
  className,
  ...props
}: PixPaymentCodeProps) {
  const context = usePixPayment("PixPaymentCode");
  const compact = context.variant === "compact";
  const disabled = context.status !== "pending";
  const labelId = useId();
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would imply form controls the code does not have.
    <div
      data-slot="pix-payment-code"
      className={cn("grid min-w-0 gap-1.5", className)}
      {...props}
      role="group"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="text-[12px] leading-4 font-medium text-muted-foreground">
        {label}
      </span>
      <div
        className={cn(
          "flex min-w-0 items-center gap-1 bg-background",
          compact ? "rounded-[10px] p-0.5 pl-2.5" : "rounded-xl p-1 pl-3",
        )}
      >
        <code
          className={cn(
            "min-w-0 flex-1 truncate font-mono text-[12px] leading-4 text-muted-foreground",
            disabled && "line-through decoration-subtle-foreground/60",
          )}
          title={context.code}
        >
          {context.code}
        </code>
        <Button
          type="button"
          data-slot="pix-payment-copy"
          className={cn(
            "shrink-0 gap-1.5 rounded-full py-0 font-medium transition-[scale,background-color,filter] duration-[140ms] ease-out-quint focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-secondary disabled:text-subtle-foreground disabled:opacity-100 motion-reduce:transition-none motion-reduce:active:scale-100",
            compact
              ? "h-7 px-3 text-[12px] has-[>svg]:px-3"
              : "h-8 px-3.5 text-[12.5px] has-[>svg]:px-3.5",
            "bg-primary text-primary-foreground hover:bg-primary hover:brightness-[1.08]",
          )}
          disabled={disabled}
          onClick={() => void context.copy()}
        >
          {context.copied ? (
            <Check className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" strokeWidth={2} aria-hidden="true" />
          )}
          {context.copied ? "Copiado" : "Copiar código"}
        </Button>
      </div>
      <span role="status" className="sr-only">
        {context.copied ? "Código Pix copiado" : ""}
      </span>
    </div>
  );
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export type PixPaymentCountdownProps = Omit<ComponentProps<"p">, "children">;

/** Time left before the charge expires. Hidden once the payment is confirmed. */
export function PixPaymentCountdown({ className, ...props }: PixPaymentCountdownProps) {
  const context = usePixPayment("PixPaymentCountdown");
  if (context.secondsLeft === null || context.status === "paid") return null;
  const expired = context.status === "expired" || context.secondsLeft === 0;
  const urgent = !expired && context.secondsLeft <= 60;
  return (
    <p
      data-slot="pix-payment-countdown"
      className={cn(
        "text-[12px] leading-4 text-subtle-foreground",
        urgent && "text-warning",
        className,
      )}
      {...props}
    >
      {expired ? (
        "O prazo para pagar terminou."
      ) : (
        <>
          Expira em{" "}
          <time
            className="font-medium text-foreground tabular-nums"
            dateTime={`PT${context.secondsLeft}S`}
          >
            {formatClock(context.secondsLeft)}
          </time>
        </>
      )}
    </p>
  );
}

export type PixPaymentStepsProps = ComponentProps<"ol">;

export function PixPaymentSteps({ className, ...props }: PixPaymentStepsProps) {
  return (
    <ol
      data-slot="pix-payment-steps"
      className={cn(
        "m-0 grid list-none gap-2 p-0 text-[12.5px] leading-[18px] text-muted-foreground [counter-reset:pix-step]",
        className,
      )}
      {...props}
    />
  );
}

export type PixPaymentStepProps = ComponentProps<"li">;

export function PixPaymentStep({ className, ...props }: PixPaymentStepProps) {
  return (
    <li
      data-slot="pix-payment-step"
      className={cn(
        "flex gap-2.5 [counter-increment:pix-step] before:grid before:size-[18px] before:shrink-0 before:place-items-center before:rounded-full before:bg-muted before:text-[10.5px] before:font-medium before:text-muted-foreground before:tabular-nums before:content-[counter(pix-step)]",
        className,
      )}
      {...props}
    />
  );
}
