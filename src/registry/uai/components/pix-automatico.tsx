"use client";

import { cva } from "class-variance-authority";
import { Check, Copy, Info, QrCode, Repeat, Smartphone } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toggleVariants } from "@/components/ui/toggle";
import { NumberTick } from "@/lib/uai-number-tick";
import { cn } from "@/lib/uai-utils";

export const PIX_AUTOMATICO_VARIANTS = ["card", "plain", "compact"] as const;
export const PIX_AUTOMATICO_STATUSES = [
  "review",
  "awaiting",
  "active",
  "declined",
  "expired",
  "cancelled",
] as const;
export const PIX_AUTOMATICO_METHODS = ["qr", "app"] as const;
export const PIX_AUTOMATICO_PERIODS = ["week", "month", "quarter", "semester", "year"] as const;

export type PixAutomaticoVariant = (typeof PIX_AUTOMATICO_VARIANTS)[number];
export type PixAutomaticoStatus = (typeof PIX_AUTOMATICO_STATUSES)[number];
export type PixAutomaticoMethod = (typeof PIX_AUTOMATICO_METHODS)[number];
export type PixAutomaticoPeriod = (typeof PIX_AUTOMATICO_PERIODS)[number];
export type PixAutomaticoCharge = { date: Date | string; amount: number };

export function formatBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const PERIOD_LABELS: Record<PixAutomaticoPeriod, string> = {
  week: "por semana",
  month: "por mês",
  quarter: "por trimestre",
  semester: "por semestre",
  year: "por ano",
};

/** "por mês", "por semana"… */
export function pixAutomaticoPeriodLabel(period: PixAutomaticoPeriod) {
  return PERIOD_LABELS[period];
}

const MONTHS_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
const MONTHS_LONG = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** Reads a charge date as a calendar day. "2026-11-05" stays the 5th in every time zone. */
function calendarDay(value: Date | string) {
  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (match) return { day: Number(match[3]), month: Number(match[2]) - 1 };
  }
  const date = new Date(value);
  return { day: date.getDate(), month: date.getMonth() };
}

function toTime(value: Date | string | number) {
  return new Date(value).getTime();
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

const STATUS_LABELS: Record<PixAutomaticoStatus, string> = {
  review: "Pix Automático",
  awaiting: "Aguardando",
  active: "Ativo",
  declined: "Recusado",
  expired: "Expirado",
  cancelled: "Cancelado",
};

const STATUS_SPOKEN: Partial<Record<PixAutomaticoStatus, string>> = {
  awaiting: "Aguardando confirmação no banco",
  active: "Pix Automático autorizado",
  declined: "Autorização recusada",
};

type PixAutomaticoContextValue = {
  variant: PixAutomaticoVariant;
  status: PixAutomaticoStatus;
  method: PixAutomaticoMethod;
  setMethod: (method: PixAutomaticoMethod) => void;
  secondsLeft: number | null;
  code: string | undefined;
  copied: boolean;
  copyFailed: boolean;
  copy: () => Promise<void>;
  titleId: string;
  authorize: () => void;
  onRetry: (() => void) | undefined;
  onOtherMethod: (() => void) | undefined;
};

const PixAutomaticoContext = createContext<PixAutomaticoContextValue | null>(null);

function usePixAutomatico(name: string) {
  const context = useContext(PixAutomaticoContext);
  if (!context) throw new Error(`${name} must be used within PixAutomatico`);
  return context;
}

const rootVariants = cva(
  "@container/pa flex w-full min-w-0 flex-col text-[13px]/[18px] text-card-foreground [transition:border-color_240ms_ease-out] motion-reduce:transition-none",
  {
    variants: {
      variant: {
        card: "max-w-[380px] gap-4 rounded-[14px] border border-border bg-card p-5",
        plain: "gap-4",
        compact: "max-w-[320px] gap-3 rounded-[12px] border border-border bg-card p-3.5",
      },
    },
  },
);

export type PixAutomaticoProps = Omit<ComponentProps<"section">, "children"> & {
  variant?: PixAutomaticoVariant;
  /** Authorization state owned by the application, from the PSP's webhook or polling. */
  status?: PixAutomaticoStatus;
  method?: PixAutomaticoMethod;
  defaultMethod?: PixAutomaticoMethod;
  onMethodChange?: (method: PixAutomaticoMethod) => void;
  /** The QR Code's copy-and-paste payload, for Copiar código. */
  code?: string;
  /** When the authorization request expires. The countdown ticks while awaiting. */
  expiresAt?: Date | string | number;
  /** Fixes the starting clock so server and client render the same countdown. */
  now?: Date | string | number;
  onAuthorize?: (payload: { method: PixAutomaticoMethod }) => void;
  onRetry?: () => void;
  /** Outra forma de pagamento, after a decline. */
  onOtherMethod?: () => void;
  onExpire?: () => void;
  onCodeCopy?: (code: string) => void;
  children?: ReactNode;
};

/**
 * The authorization step for recurring Pix. It shows terms and status only: the payer sets any
 * maximum amount in the bank app, never here.
 */
export function PixAutomatico({
  variant = "card",
  status = "review",
  method: methodProp,
  defaultMethod = "qr",
  onMethodChange,
  code,
  expiresAt,
  now,
  onAuthorize,
  onRetry,
  onOtherMethod,
  onExpire,
  onCodeCopy,
  children,
  className,
  ...props
}: PixAutomaticoProps) {
  const [internalMethod, setInternalMethod] = useState<PixAutomaticoMethod>(defaultMethod);
  const method = methodProp ?? internalMethod;
  const deadline = expiresAt === undefined ? null : toTime(expiresAt);
  // A fixed `now` becomes an offset from the real clock, so the countdown keeps ticking.
  const [offset] = useState(() => (now === undefined ? 0 : toTime(now) - Date.now()));
  const [clock, setClock] = useState(() => (now === undefined ? Date.now() : toTime(now)));
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [minuteNotice, setMinuteNotice] = useState("");
  const expiredNotified = useRef(false);
  const minuteNotified = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const titleId = useId();

  const awaiting = status === "awaiting";
  const secondsLeft = deadline === null ? null : Math.max(0, Math.ceil((deadline - clock) / 1000));

  useEffect(() => {
    if (!awaiting || deadline === null) return;
    setClock(Date.now() + offset);
    const timer = window.setInterval(() => setClock(Date.now() + offset), 1000);
    return () => window.clearInterval(timer);
  }, [awaiting, deadline, offset]);

  useEffect(() => {
    if (!awaiting || secondsLeft === null) return;
    if (secondsLeft === 0 && !expiredNotified.current) {
      expiredNotified.current = true;
      onExpireRef.current?.();
    }
    if (secondsLeft > 0 && secondsLeft <= 60 && !minuteNotified.current) {
      minuteNotified.current = true;
      setMinuteNotice("Falta 1 minuto para o pedido expirar");
    }
  }, [awaiting, secondsLeft]);

  // A new request (back to review) re-arms the one-shot notices.
  useEffect(() => {
    if (status !== "review") return;
    expiredNotified.current = false;
    minuteNotified.current = false;
    setMinuteNotice("");
  }, [status]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const setMethod = (next: PixAutomaticoMethod) => {
    if (methodProp === undefined) setInternalMethod(next);
    onMethodChange?.(next);
  };

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopyFailed(false);
      setCopied(true);
      onCodeCopy?.(code);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  };

  return (
    <PixAutomaticoContext.Provider
      value={{
        variant,
        status,
        method,
        setMethod,
        secondsLeft,
        code,
        copied,
        copyFailed,
        copy,
        titleId,
        authorize: () => onAuthorize?.({ method }),
        onRetry,
        onOtherMethod,
      }}
    >
      <section
        data-slot="pix-automatico"
        data-variant={variant}
        data-status={status}
        data-method={method}
        aria-labelledby={titleId}
        className={cn(
          rootVariants({ variant }),
          status === "declined" && variant !== "plain" && "border-destructive/40",
          className,
        )}
        {...props}
      >
        {children}
        <span role="status" className="sr-only">
          {minuteNotice}
        </span>
      </section>
    </PixAutomaticoContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Header
 * -----------------------------------------------------------------------------------------------*/

export function PixAutomaticoHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="pix-automatico-header"
      className={cn("flex min-w-0 items-center gap-2.5", className)}
      {...props}
    />
  );
}

/** The recipient's initials in a 32px circle (28px in compact). */
export function PixAutomaticoAvatar({ className, ...props }: ComponentProps<"span">) {
  const context = usePixAutomatico("PixAutomaticoAvatar");
  return (
    <span
      data-slot="pix-automatico-avatar"
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-muted text-[11.5px] font-semibold text-foreground shadow-[0_0_0_1px_var(--border)]",
        context.variant === "compact" ? "size-7" : "size-8",
        className,
      )}
      {...props}
    />
  );
}

/** Product and recipient lines. The product names the section. */
export function PixAutomaticoTitle({
  product,
  recipient,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & { product: ReactNode; recipient?: ReactNode }) {
  const context = usePixAutomatico("PixAutomaticoTitle");
  return (
    <div
      data-slot="pix-automatico-title"
      className={cn("grid min-w-0 flex-1", className)}
      {...props}
    >
      <h3
        id={context.titleId}
        className="m-0 truncate text-[13px]/[18px] font-medium text-foreground"
      >
        {product}
      </h3>
      {recipient ? (
        <p className="m-0 truncate text-[12px]/4 text-subtle-foreground tabular-nums">
          {recipient}
        </p>
      ) : null}
    </div>
  );
}

/** A polite live region: the short label shows, the full sentence is spoken. */
export function PixAutomaticoStatusBadge({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  const context = usePixAutomatico("PixAutomaticoStatusBadge");
  const { status } = context;
  const spoken = STATUS_SPOKEN[status];
  return (
    <Badge
      key={status === "declined" ? "declined" : "badge"}
      variant="secondary"
      data-slot="pix-automatico-status-badge"
      data-status={status}
      className={cn(
        "h-6 shrink-0 gap-1.5 rounded-full border-0 px-2.5 py-0 text-[11.5px] font-medium",
        context.variant === "compact" && "h-[22px] px-2 text-[11px]",
        (status === "review" || status === "expired" || status === "cancelled") &&
          "bg-muted text-muted-foreground",
        status === "awaiting" && "bg-warning/14 text-warning-ink",
        status === "active" && "bg-success/14 text-success-ink",
        status === "declined" &&
          "bg-destructive/14 text-destructive-ink motion-safe:animate-shake motion-reduce:animate-none",
        className,
      )}
      {...props}
      role="status"
      aria-live="polite"
    >
      {status === "review" ? (
        <Repeat className="size-3" strokeWidth={2} aria-hidden="true" />
      ) : status === "active" ? (
        <Check className="size-3" strokeWidth={2.2} aria-hidden="true" />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full bg-current",
            status === "awaiting" && "motion-safe:animate-pulse",
          )}
        />
      )}
      {children ?? (
        <>
          <span aria-hidden={spoken ? true : undefined}>{STATUS_LABELS[status]}</span>
          {spoken ? <span className="sr-only">{spoken}</span> : null}
        </>
      )}
    </Badge>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Review: amount, terms, notice, method, authorize
 * -----------------------------------------------------------------------------------------------*/

/** Holds the review content. It collapses with grid rows once the request is sent. */
export function PixAutomaticoReview({ className, children, ...props }: ComponentProps<"div">) {
  const context = usePixAutomatico("PixAutomaticoReview");
  const open = context.status === "review";
  return (
    <div
      data-slot="pix-automatico-review"
      inert={!open || undefined}
      aria-hidden={!open || undefined}
      className={cn(
        "grid min-w-0 [transition:grid-template-rows_300ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        open ? "grid-rows-[1fr]" : "-mt-4 grid-rows-[0fr]",
        context.variant === "compact" && !open && "-mt-3",
        className,
      )}
      {...props}
    >
      <div className="min-h-0 min-w-0 overflow-hidden">
        <div className={cn("grid min-w-0", context.variant === "compact" ? "gap-3" : "gap-4")}>
          {children}
        </div>
      </div>
    </div>
  );
}

export type PixAutomaticoAmountProps = Omit<ComponentProps<"p">, "children"> & {
  value: number | "variable";
  period?: PixAutomaticoPeriod;
};

/** "R$ 89,90 por mês", or "Valor variável". */
export function PixAutomaticoAmount({
  value,
  period,
  className,
  ...props
}: PixAutomaticoAmountProps) {
  const context = usePixAutomatico("PixAutomaticoAmount");
  const compact = context.variant === "compact";
  return (
    <p
      data-slot="pix-automatico-amount"
      className={cn("m-0 flex min-w-0 flex-wrap items-baseline gap-x-1", className)}
      {...props}
    >
      <span
        className={cn(
          "font-semibold tracking-[-0.01em] text-foreground tabular-nums",
          value === "variable"
            ? compact
              ? "text-[18px]/6"
              : "text-[22px]/7"
            : compact
              ? "text-[20px]/6"
              : "text-[28px]/8",
        )}
      >
        {value === "variable" ? "Valor variável" : formatBrl(value)}
      </span>
      {period && value !== "variable" ? (
        <span className="text-[13px]/[18px] text-subtle-foreground">{PERIOD_LABELS[period]}</span>
      ) : null}
    </p>
  );
}

export function PixAutomaticoTerms({ className, ...props }: ComponentProps<"dl">) {
  return (
    <dl
      data-slot="pix-automatico-terms"
      className={cn(
        "m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[12.5px]/[18px]",
        className,
      )}
      {...props}
    />
  );
}

export type PixAutomaticoTermProps = Omit<ComponentProps<"div">, "children"> & {
  label: ReactNode;
  children: ReactNode;
  /** A second line under the value, such as the CNPJ. */
  detail?: ReactNode;
};

/** One row: Primeira cobrança, Periodicidade, Vigência, Recebedor, Valor máximo mínimo. */
export function PixAutomaticoTerm({
  label,
  detail,
  children,
  className,
  ...props
}: PixAutomaticoTermProps) {
  return (
    <div data-slot="pix-automatico-term" className={cn("contents", className)} {...props}>
      <dt className="text-subtle-foreground">{label}</dt>
      <dd className="m-0 min-w-0 text-right text-foreground tabular-nums">
        {children}
        {detail ? (
          <span className="block text-[12px]/4 text-subtle-foreground">{detail}</span>
        ) : null}
      </dd>
    </div>
  );
}

const NOTICE =
  "Você confirma no app do seu banco e pode definir um valor máximo por cobrança. Dá para cancelar quando quiser, direto no banco.";

/** The max-amount and cancel explanation. In compact it sits behind an info button. */
export function PixAutomaticoNotice({ className, children, ...props }: ComponentProps<"div">) {
  const context = usePixAutomatico("PixAutomaticoNotice");
  const text = children ?? NOTICE;
  if (context.variant === "compact") {
    return (
      <Popover>
        <div
          data-slot="pix-automatico-notice"
          className={cn("flex items-center gap-1.5", className)}
          {...props}
        >
          <span className="text-[12px]/4 text-subtle-foreground">Como funciona o valor máximo</span>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Sobre o valor máximo e o cancelamento"
              className="size-6 rounded-md text-muted-foreground [transition:background-color_120ms_ease-out,color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-muted hover:text-foreground active:scale-[0.94] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <Info className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent
          side="top"
          sideOffset={6}
          className="w-[260px] rounded-[14px] border-0 bg-popover p-3 text-[12px]/[17px] text-muted-foreground shadow-[0_0_0_1px_var(--border-strong),0_16px_32px_-12px_oklch(0_0_0/0.32),0_4px_8px_-4px_oklch(0_0_0/0.12)] data-[state=open]:zoom-in-96 data-open:zoom-in-96 data-[state=open]:duration-180 data-open:duration-180 data-[state=closed]:zoom-out-96 data-closed:zoom-out-96 motion-reduce:animate-none"
        >
          {text}
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <div
      data-slot="pix-automatico-notice"
      className={cn(
        "flex min-w-0 items-start gap-2.5 rounded-[10px] bg-muted px-3 py-2.5 text-[12px]/[17px] text-muted-foreground",
        className,
      )}
      {...props}
    >
      <Info className="mt-px size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

/** The variable-amount hint: the bank only pays up to the payer's maximum. */
export function PixAutomaticoMaxHint({
  minimum,
  className,
  children,
  ...props
}: ComponentProps<"p"> & { minimum?: number }) {
  usePixAutomatico("PixAutomaticoMaxHint");
  return (
    <p
      data-slot="pix-automatico-max-hint"
      className={cn("m-0 text-[11.5px]/4 text-subtle-foreground", className)}
      {...props}
    >
      {children ??
        (minimum === undefined
          ? "O banco só paga cobranças até o valor máximo que você definir no app."
          : `O banco só paga cobranças até o valor máximo que você definir no app, e o recebedor pede que ele seja de pelo menos ${formatBrl(minimum)}.`)}
    </p>
  );
}

const METHOD_LABELS: Record<PixAutomaticoMethod, { label: string; icon: typeof QrCode }> = {
  qr: { label: "QR Code", icon: QrCode },
  app: { label: "No app do banco", icon: Smartphone },
};

/** "Como você quer autorizar?": QR Code or No app do banco, as a two-option radio group. */
export function PixAutomaticoMethod({
  label = "Como você quer autorizar?",
  className,
  onKeyDown,
  ...props
}: Omit<ComponentProps<"div">, "children"> & { label?: string }) {
  const context = usePixAutomatico("PixAutomaticoMethod");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const labelId = useId();
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next: PixAutomaticoMethod =
      event.key === "Home"
        ? "qr"
        : event.key === "End"
          ? "app"
          : context.method === "qr"
            ? "app"
            : "qr";
    context.setMethod(next);
    refs.current[next]?.focus();
  };
  return (
    <div
      data-slot="pix-automatico-method"
      className={cn("grid min-w-0 gap-2", className)}
      {...props}
    >
      <span id={labelId} className="text-[12px]/4 font-medium text-muted-foreground">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={handleKeyDown}
        className="relative isolate grid grid-cols-2 rounded-full bg-muted p-0.5"
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0.5 left-0.5 -z-1 w-[calc(50%-2px)] rounded-full bg-card shadow-[0_0_0_1px_var(--border)] [transition:translate_240ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:bg-foreground/12 dark:shadow-none",
            context.method === "app" && "translate-x-full",
          )}
        />
        {PIX_AUTOMATICO_METHODS.map((value) => {
          const { label: text, icon: Icon } = METHOD_LABELS[value];
          const checked = context.method === value;
          return (
            // biome-ignore lint/a11y/useSemanticElements: a segment button in a radio group; ToggleGroupItem renders the same role="radio" button.
            <button
              key={value}
              ref={(node) => {
                refs.current[value] = node;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              data-state={checked ? "on" : "off"}
              tabIndex={checked ? 0 : -1}
              disabled={context.status !== "review"}
              onClick={() => context.setMethod(value)}
              className={cn(
                toggleVariants(),
                "h-7 min-w-0 cursor-pointer gap-1.5 rounded-full border-0 bg-transparent px-3 text-[12px] font-medium text-subtle-foreground [transition:color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-transparent hover:text-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] aria-checked:text-foreground data-[state=on]:bg-transparent motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-3.5",
              )}
            >
              <Icon aria-hidden="true" strokeWidth={1.75} />
              <span className="truncate">{text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const pillClass =
  "rounded-full border-0 font-medium [transition:background-color_120ms_ease-out,filter_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

/** The one primary action: a full-width 36px pill. Its label stays the same for both methods. */
export function PixAutomaticoAuthorize({
  className,
  children,
  onClick,
  ...props
}: ComponentProps<"button">) {
  const context = usePixAutomatico("PixAutomaticoAuthorize");
  return (
    <Button
      type="button"
      data-slot="pix-automatico-authorize"
      className={cn(
        pillClass,
        "h-9 w-full bg-primary text-[13px] text-primary-foreground hover:bg-primary hover:brightness-[1.08]",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.authorize();
      }}
      {...props}
    >
      {children ?? "Autorizar Pix Automático"}
    </Button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Awaiting
 * -----------------------------------------------------------------------------------------------*/

const enterPanel =
  "grid min-w-0 animate-in gap-4 delay-120 duration-240 ease-out-quint fill-mode-backwards fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none";

const QR_STEPS = [
  "Abra o app do seu banco e escolha ler QR Code.",
  "Confira os dados e defina um valor máximo, se quiser.",
  "Confirme. Avisamos aqui na hora.",
];

export type PixAutomaticoQrCodeProps = Omit<ComponentProps<"div">, "children"> & {
  /** The QR image from your PSP. Use `children` instead for an inline SVG. */
  src?: string;
  alt?: string;
  children?: ReactNode;
  steps?: readonly ReactNode[];
};

/** Awaiting with QR Code: the white tile, three steps, the countdown, and Copiar código. */
export function PixAutomaticoQrCode({
  src,
  alt = "QR Code do Pix Automático",
  steps = QR_STEPS,
  children,
  className,
  ...props
}: PixAutomaticoQrCodeProps) {
  const context = usePixAutomatico("PixAutomaticoQrCode");
  if (context.status !== "awaiting" || context.method !== "qr") return null;
  const compact = context.variant === "compact";
  const urgent = context.secondsLeft !== null && context.secondsLeft <= 60;
  return (
    <div
      data-slot="pix-automatico-qr-code"
      className={cn(enterPanel, compact && "gap-3", className)}
      {...props}
    >
      <div
        className={cn(
          "grid min-w-0 items-center gap-4",
          compact
            ? "grid-cols-1 justify-items-center"
            : "@min-[320px]/pa:grid-cols-[136px_minmax(0,1fr)]",
        )}
      >
        <figure
          className={cn(
            "m-0 grid size-[136px] animate-in place-items-center justify-self-center rounded-xl bg-white p-2.5 shadow-[0_0_0_1px_var(--border)] delay-120 duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] fill-mode-backwards zoom-in-96 motion-reduce:animate-none [&_img]:size-full [&_svg]:size-full",
            compact && "size-28 p-2",
          )}
        >
          {/* biome-ignore lint/performance/noImgElement: the QR comes from the payment provider */}
          {children ?? (src ? <img src={src} alt={alt} /> : null)}
        </figure>
        {!compact ? (
          <ol className="m-0 grid list-none gap-2 p-0 text-[12.5px]/[18px] text-muted-foreground [counter-reset:pa-step]">
            {steps.map((step, index) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: the steps are a fixed, ordered list.
                key={index}
                className="flex gap-2.5 [counter-increment:pa-step] before:grid before:size-[18px] before:shrink-0 before:place-items-center before:rounded-full before:bg-muted before:text-[10.5px] before:font-medium before:text-muted-foreground before:tabular-nums before:content-[counter(pa-step)]"
              >
                {step}
              </li>
            ))}
          </ol>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        {context.secondsLeft !== null ? (
          <p
            className={cn(
              "m-0 text-[12px]/4 text-subtle-foreground [transition:color_240ms_ease-out] motion-reduce:transition-none",
              urgent && "text-warning-ink",
            )}
          >
            Expira em{" "}
            <time
              dateTime={`PT${context.secondsLeft}S`}
              className={cn(
                "font-medium tabular-nums",
                urgent ? "text-warning-ink" : "text-foreground",
              )}
            >
              <NumberTick value={formatClock(context.secondsLeft)} />
            </time>
          </p>
        ) : (
          <span />
        )}
        {context.code ? (
          <Button
            type="button"
            variant="secondary"
            data-slot="pix-automatico-copy"
            onClick={() => void context.copy()}
            className={cn(
              pillClass,
              "h-7 gap-1.5 px-3 text-[12px] has-[>svg]:px-3",
              context.copied
                ? "bg-success/14 text-success-ink hover:bg-success/14"
                : "bg-secondary hover:bg-accent",
            )}
          >
            {context.copied ? (
              <Check
                key="copied"
                className="size-3.5 animate-in duration-200 ease-out-quint fade-in-0 zoom-in-50 motion-reduce:animate-none"
                strokeWidth={2.2}
                aria-hidden="true"
              />
            ) : (
              <Copy key="copy" className="size-3.5" strokeWidth={2} aria-hidden="true" />
            )}
            <span className="grid *:[grid-area:1/1]">
              <span className={cn(context.copied && "invisible")} aria-hidden={context.copied}>
                Copiar código
              </span>
              <span className={cn(!context.copied && "invisible")} aria-hidden={!context.copied}>
                Copiado
              </span>
            </span>
          </Button>
        ) : null}
      </div>
      {context.copyFailed ? (
        <p className="m-0 text-[11.5px]/4 text-subtle-foreground">
          Não deu para copiar. Leia o QR Code no app do banco.
        </p>
      ) : null}
      <span role="status" className="sr-only">
        {context.copied ? "Código copiado" : ""}
      </span>
    </div>
  );
}

/** Awaiting in the bank app: a pulsing phone tile, a shimmering title, and the QR fallback. */
export function PixAutomaticoAppPending({
  className,
  ...props
}: Omit<ComponentProps<"div">, "children">) {
  const context = usePixAutomatico("PixAutomaticoAppPending");
  if (context.status !== "awaiting" || context.method !== "app") return null;
  const compact = context.variant === "compact";
  return (
    <div
      data-slot="pix-automatico-app-pending"
      className={cn(enterPanel, compact && "gap-3", className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span
          aria-hidden="true"
          className={cn(
            "relative grid shrink-0 place-items-center rounded-2xl bg-primary/14 text-primary-ink",
            compact ? "size-11" : "size-[52px]",
          )}
        >
          <span className="pointer-events-none absolute -inset-1.5 rounded-[20px] shadow-[0_0_0_1.5px_color-mix(in_oklab,var(--primary)_35%,transparent)] motion-safe:animate-ring-pulse" />
          <Smartphone className="size-5" strokeWidth={1.75} />
        </span>
        <div className="grid min-w-0 gap-1">
          <p className="m-0 text-[13px]/[18px] font-medium text-foreground">
            <span className="motion-safe:shimmer-text">Aguardando confirmação no banco</span>
          </p>
          <p className="m-0 text-[12.5px]/[18px] text-muted-foreground">
            Enviamos o pedido para o app do seu banco. Pode levar alguns minutos para aparecer.
          </p>
        </div>
      </div>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="text-[11.5px]/4 text-subtle-foreground">Não apareceu?</span>
        <Button
          type="button"
          variant="secondary"
          onClick={() => context.setMethod("qr")}
          className={cn(
            pillClass,
            "h-7 gap-1.5 bg-secondary px-3 text-[12px] hover:bg-accent has-[>svg]:px-3",
          )}
        >
          <QrCode className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Usar QR Code
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Active
 * -----------------------------------------------------------------------------------------------*/

/** The success tile, "Pix Automático autorizado", and the consumer's summary line. */
export function PixAutomaticoActive({ className, children, ...props }: ComponentProps<"div">) {
  const context = usePixAutomatico("PixAutomaticoActive");
  if (context.status !== "active") return null;
  return (
    <div
      data-slot="pix-automatico-active"
      className={cn(
        "flex min-w-0 animate-in items-center gap-3 duration-160 fade-in-0 motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 animate-in place-items-center rounded-full bg-success/14 text-success-ink duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] zoom-in-50 motion-reduce:animate-none"
      >
        <Check className="size-5" strokeWidth={2} />
      </span>
      <div className="grid min-w-0">
        <p className="m-0 text-[14px]/5 font-semibold text-foreground">Pix Automático autorizado</p>
        {children ? (
          <p className="m-0 text-[12.5px]/[18px] text-muted-foreground tabular-nums">{children}</p>
        ) : null}
      </div>
    </div>
  );
}

const CHIP_DELAYS = [
  "delay-0",
  "delay-[40ms]",
  "delay-[80ms]",
  "delay-[120ms]",
  "delay-[160ms]",
  "delay-[200ms]",
];

export type PixAutomaticoScheduleProps = Omit<ComponentProps<"div">, "children"> & {
  charges: readonly PixAutomaticoCharge[];
  /** The change-or-cancel line under the timeline. Pass `null` to hide it. */
  hint?: ReactNode;
};

/** The next charges as a horizontal timeline; the first is marked Próxima. */
export function PixAutomaticoSchedule({
  charges,
  hint = "Para mudar o valor máximo ou cancelar, use o app do seu banco.",
  className,
  ...props
}: PixAutomaticoScheduleProps) {
  const context = usePixAutomatico("PixAutomaticoSchedule");
  const labelId = useId();
  if (context.status !== "active") return null;
  const shown = charges.slice(0, 6);
  return (
    <div
      data-slot="pix-automatico-schedule"
      className={cn("grid min-w-0 gap-2.5", className)}
      {...props}
    >
      <span id={labelId} className="text-[12px]/4 font-medium text-muted-foreground">
        Próximas cobranças
      </span>
      <ol
        aria-labelledby={labelId}
        className="relative m-0 grid list-none gap-2 p-0 before:absolute before:top-[7px] before:right-3 before:left-3 before:h-px before:bg-border"
        style={{ gridTemplateColumns: `repeat(${Math.max(1, shown.length)}, minmax(0, 1fr))` }}
      >
        {shown.map((charge, index) => {
          const { day, month } = calendarDay(charge.date);
          const next = index === 0;
          const amount = formatBrl(charge.amount);
          return (
            <li
              key={String(charge.date)}
              className={cn(
                "relative grid min-w-0 animate-in content-start gap-1.5 duration-240 ease-out-quint fill-mode-backwards fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none",
                CHIP_DELAYS[index],
              )}
            >
              <span className="sr-only">
                {`${day} de ${MONTHS_LONG[month]}, ${amount}${next ? ", próxima" : ""}`}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "relative grid size-[15px] place-items-center rounded-full",
                  next ? "bg-primary" : "bg-card shadow-[inset_0_0_0_1.5px_var(--border-strong)]",
                )}
              >
                {next ? (
                  <span className="size-1.5 rounded-full bg-primary-foreground motion-safe:animate-in motion-safe:zoom-in-0 motion-safe:duration-150 motion-safe:delay-120 motion-safe:fill-mode-backwards" />
                ) : null}
              </span>
              <span
                aria-hidden="true"
                className="text-[12.5px]/4 font-medium text-foreground tabular-nums"
              >
                {String(day).padStart(2, "0")} {MONTHS_SHORT[month]}
              </span>
              <span
                aria-hidden="true"
                className="text-[12px]/4 text-subtle-foreground tabular-nums"
              >
                {amount}
              </span>
              {next ? (
                <span aria-hidden="true" className="text-[11px]/4 font-medium text-primary-ink">
                  Próxima
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {hint ? <p className="m-0 text-[11.5px]/4 text-subtle-foreground">{hint}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Outcomes
 * -----------------------------------------------------------------------------------------------*/

/** Declined, expired, or cancelled: one sentence and the way forward. */
export function PixAutomaticoOutcome({ className, children, ...props }: ComponentProps<"div">) {
  const context = usePixAutomatico("PixAutomaticoOutcome");
  const { status } = context;
  if (status !== "declined" && status !== "expired" && status !== "cancelled") return null;
  const compact = context.variant === "compact";
  const size = compact ? "h-7 px-3 text-[12px]" : "h-8 px-3.5 text-[12.5px]";
  const message =
    status === "declined"
      ? "A autorização foi recusada no app do banco. Nenhuma cobrança foi feita."
      : status === "expired"
        ? "O pedido expirou antes da confirmação."
        : "Você cancelou o Pix Automático no seu banco. Nenhuma nova cobrança será feita.";
  return (
    <div
      data-slot="pix-automatico-outcome"
      className={cn(
        "grid min-w-0 animate-in gap-3 duration-240 ease-out-quint fade-in-0 motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <p className="m-0 text-[12.5px]/[18px] text-muted-foreground">{children ?? message}</p>
      {status !== "cancelled" && (context.onRetry || context.onOtherMethod) ? (
        <div className="flex flex-wrap justify-end gap-2">
          {status === "declined" && context.onOtherMethod ? (
            <Button
              type="button"
              variant="secondary"
              onClick={context.onOtherMethod}
              className={cn(pillClass, size, "bg-secondary hover:bg-accent")}
            >
              Outra forma de pagamento
            </Button>
          ) : null}
          {context.onRetry ? (
            <Button
              type="button"
              onClick={context.onRetry}
              className={cn(
                pillClass,
                size,
                "bg-primary text-primary-foreground hover:bg-primary hover:brightness-[1.08]",
              )}
            >
              {status === "declined" ? "Tentar de novo" : "Gerar novo pedido"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
