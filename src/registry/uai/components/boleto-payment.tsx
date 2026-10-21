"use client";

import { cva } from "class-variance-authority";
import { Barcode, Check, CheckCircle2, Copy, Download, QrCode, XCircle } from "lucide-react";
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
import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/uai-utils";

export const BOLETO_PAYMENT_VARIANTS = ["card", "plain", "compact"] as const;
export const BOLETO_PAYMENT_STATUSES = ["pending", "paid", "overdue", "cancelled"] as const;
export const BOLETO_PAYMENT_METHODS = ["boleto", "pix"] as const;

export type BoletoPaymentVariant = (typeof BOLETO_PAYMENT_VARIANTS)[number];
export type BoletoPaymentStatus = (typeof BOLETO_PAYMENT_STATUSES)[number];
export type BoletoPaymentMethod = (typeof BOLETO_PAYMENT_METHODS)[number];
/** What the badge shows: the consumer status, plus "due-today" and "overdue" derived from the dates. */
export type BoletoPaymentDisplayStatus = BoletoPaymentStatus | "due-today";

type DateInput = Date | string | number;

export function formatBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

/* -------------------------------------------------------------------------------------------------
 * Linha digitável and barcode: pure string math (FEBRABAN layout, check digits mod 10 and mod 11).
 * -----------------------------------------------------------------------------------------------*/

const onlyDigits = (value: string) => value.replace(/\D/g, "");

function mod10(digits: string) {
  let total = 0;
  let weight = 2;
  for (let index = digits.length - 1; index >= 0; index--) {
    const product = Number(digits[index]) * weight;
    total += Math.floor(product / 10) + (product % 10);
    weight = weight === 2 ? 1 : 2;
  }
  return (10 - (total % 10)) % 10;
}

function mod11(digits: string) {
  let total = 0;
  let weight = 2;
  for (let index = digits.length - 1; index >= 0; index--) {
    total += Number(digits[index]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const rest = 11 - (total % 11);
  return rest === 0 || rest === 10 || rest === 11 ? 1 : rest;
}

/** The 44-digit barcode for a 47-digit linha digitável (dots and spaces are ignored). */
export function boletoBarcodeFromLine(line: string) {
  const digits = onlyDigits(line);
  if (digits.length !== 47) throw new Error("A linha digitável has 47 digits.");
  return (
    digits.slice(0, 4) +
    digits.slice(32, 47) +
    digits.slice(4, 9) +
    digits.slice(10, 20) +
    digits.slice(21, 31)
  );
}

/** The 47-digit linha digitável for a 44-digit barcode, with the three field check digits. */
export function boletoLineFromBarcode(barcode: string) {
  const digits = onlyDigits(barcode);
  if (digits.length !== 44) throw new Error("A boleto barcode has 44 digits.");
  const field1 = digits.slice(0, 4) + digits.slice(19, 24);
  const field2 = digits.slice(24, 34);
  const field3 = digits.slice(34, 44);
  return (
    field1 +
    mod10(field1) +
    field2 +
    mod10(field2) +
    field3 +
    mod10(field3) +
    digits.slice(4, 5) +
    digits.slice(5, 19)
  );
}

/** Checks the three field digits and the general mod-11 digit of a linha digitável. */
export function isValidBoletoLine(line: string) {
  const digits = onlyDigits(line);
  if (digits.length !== 47) return false;
  const fields = [digits.slice(0, 10), digits.slice(10, 21), digits.slice(21, 32)];
  if (fields.some((field) => mod10(field.slice(0, -1)) !== Number(field.slice(-1)))) return false;
  const barcode = boletoBarcodeFromLine(digits);
  return mod11(barcode.slice(0, 4) + barcode.slice(5)) === Number(barcode[4]);
}

/** The five printed groups: `AAAAA.AAAAA BBBBB.BBBBBB CCCCC.CCCCCC D EEEEEEEEEEEEEE`. */
export function boletoLineGroups(line: string) {
  const d = onlyDigits(line);
  return [
    `${d.slice(0, 5)}.${d.slice(5, 10)}`,
    `${d.slice(10, 15)}.${d.slice(15, 21)}`,
    `${d.slice(21, 26)}.${d.slice(26, 32)}`,
    d.slice(32, 33),
    d.slice(33, 47),
  ];
}

const ITF_PATTERNS = [
  "nnwwn",
  "wnnnw",
  "nwnnw",
  "wwnnn",
  "nnwnw",
  "wnwnn",
  "nwwnn",
  "nnnww",
  "wnnwn",
  "nwnwn",
];

/**
 * ITF-25 (Interleaved 2 of 5) bars for a 44-digit barcode: start pattern, pairs of digits
 * interleaved as bars and spaces, stop pattern. Narrow is 1 unit and wide is 3.
 */
export function boletoBarcodeBars(barcode: string) {
  const digits = onlyDigits(barcode);
  let sequence = "nnnn";
  for (let index = 0; index + 1 < digits.length; index += 2) {
    const bars = ITF_PATTERNS[Number(digits[index])] ?? "";
    const spaces = ITF_PATTERNS[Number(digits[index + 1])] ?? "";
    for (let k = 0; k < 5; k++) sequence += `${bars[k]}${spaces[k]}`;
  }
  sequence += "wnn";
  const bars: { x: number; width: number }[] = [];
  let x = 0;
  for (let index = 0; index < sequence.length; index++) {
    const width = sequence[index] === "w" ? 3 : 1;
    if (index % 2 === 0) bars.push({ x, width });
    x += width;
  }
  return { bars, width: x };
}

/* -------------------------------------------------------------------------------------------------
 * Dates: calendar days in the boleto's time zone, so server and client agree when `now` is passed.
 * -----------------------------------------------------------------------------------------------*/

function calendarDay(value: DateInput, timeZone: string) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return { year: year ?? 0, month: month ?? 1, day: day ?? 1 };
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) => Number(parts.find((entry) => entry.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day") };
}

type CalendarDay = ReturnType<typeof calendarDay>;

const dayNumber = (day: CalendarDay) => Date.UTC(day.year, day.month - 1, day.day) / 86_400_000;
const pad = (value: number) => String(value).padStart(2, "0");
export function formatBoletoDate(day: CalendarDay) {
  return `${pad(day.day)}/${pad(day.month)}/${day.year}`;
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/

export type BoletoPaymentProps = Omit<ComponentProps<"section">, "onCopy"> & {
  variant?: BoletoPaymentVariant;
  /** Payment state owned by the application. Due today and overdue are derived from the dates. */
  status?: BoletoPaymentStatus;
  /** The 47-digit linha digitável. Pass this or `barcode`. */
  digitableLine?: string;
  /** The 44-digit barcode. Pass this or `digitableLine`. */
  barcode?: string;
  /** The due date, as `YYYY-MM-DD` or a date. */
  dueDate: DateInput;
  /** Fixes "today" so server and client render the same due state. */
  now?: DateInput;
  /** When it was paid, for the paid caption. */
  paidAt?: DateInput;
  /** The BolePix copy-and-paste code. When set, a Pix tab can be shown. */
  pixCode?: string;
  /** Whether an overdue boleto can still be paid (with fees). */
  payableAfterDue?: boolean;
  /** The time zone that decides which calendar day it is. */
  timeZone?: string;
  /** Shows the barcode in compact, which hides it by default. */
  showBarcode?: boolean;
  method?: BoletoPaymentMethod;
  defaultMethod?: BoletoPaymentMethod;
  onMethodChange?: (method: BoletoPaymentMethod) => void;
  /** Called after a successful copy with the copied text and what it was. */
  onCopy?: (text: string, kind: BoletoPaymentMethod) => void;
};

type CopyState = "idle" | "copied" | "failed";

type BoletoPaymentContextValue = {
  variant: BoletoPaymentVariant;
  status: BoletoPaymentStatus;
  displayStatus: BoletoPaymentDisplayStatus;
  line: string;
  barcode: string;
  groups: string[];
  due: CalendarDay;
  daysLeft: number;
  paidAt: CalendarDay | null;
  pixCode: string | undefined;
  copyable: boolean;
  showBarcode: boolean;
  method: BoletoPaymentMethod;
  setMethod: (method: BoletoPaymentMethod) => void;
  copyState: Record<BoletoPaymentMethod, CopyState>;
  flash: boolean;
  copy: (kind: BoletoPaymentMethod) => Promise<void>;
  titleId: string;
  amountId: string;
};

const BoletoPaymentContext = createContext<BoletoPaymentContextValue | null>(null);

function useBoletoPayment(name: string) {
  const context = useContext(BoletoPaymentContext);
  if (!context) throw new Error(`${name} must be used within BoletoPayment`);
  return context;
}

const boletoPaymentVariants = cva("@container/boleto grid w-full min-w-0 text-card-foreground", {
  variants: {
    variant: {
      card: "gap-4 rounded-[14px] border border-border bg-card p-5",
      plain: "gap-4",
      compact: "gap-3 rounded-xl border border-border bg-card p-3.5",
    },
  },
});

export function BoletoPayment({
  variant = "card",
  status = "pending",
  digitableLine,
  barcode,
  dueDate,
  now,
  paidAt,
  pixCode,
  payableAfterDue = true,
  timeZone = "America/Sao_Paulo",
  showBarcode,
  method,
  defaultMethod = "boleto",
  onMethodChange,
  onCopy,
  children,
  className,
  ...props
}: BoletoPaymentProps) {
  const line = digitableLine
    ? onlyDigits(digitableLine)
    : barcode
      ? boletoLineFromBarcode(barcode)
      : "";
  const code = barcode ? onlyDigits(barcode) : line ? boletoBarcodeFromLine(line) : "";
  const [mountedAt] = useState(() => Date.now());
  const today = calendarDay(now ?? mountedAt, timeZone);
  const due = calendarDay(dueDate, timeZone);
  const daysLeft = dayNumber(due) - dayNumber(today);
  const displayStatus: BoletoPaymentDisplayStatus =
    status === "pending" && daysLeft < 0
      ? "overdue"
      : status === "pending" && daysLeft === 0
        ? "due-today"
        : status;
  const copyable =
    displayStatus === "pending" ||
    displayStatus === "due-today" ||
    (displayStatus === "overdue" && payableAfterDue);

  const [internalMethod, setInternalMethod] = useState<BoletoPaymentMethod>(defaultMethod);
  const currentMethod = pixCode ? (method ?? internalMethod) : "boleto";
  const setMethod = (next: BoletoPaymentMethod) => {
    if (next === currentMethod) return;
    if (method === undefined) setInternalMethod(next);
    onMethodChange?.(next);
  };

  const [copyState, setCopyState] = useState<Record<BoletoPaymentMethod, CopyState>>({
    boleto: "idle",
    pix: "idle",
  });
  const [flash, setFlash] = useState(false);
  const onCopyRef = useRef(onCopy);
  onCopyRef.current = onCopy;

  useEffect(() => {
    if (copyState.boleto !== "copied" && copyState.pix !== "copied") return;
    const timer = window.setTimeout(() => setCopyState({ boleto: "idle", pix: "idle" }), 2000);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  useEffect(() => {
    if (!flash) return;
    // Each group holds the tint for 600ms, then fades over 240ms.
    const timer = window.setTimeout(() => setFlash(false), 600);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const copy = async (kind: BoletoPaymentMethod) => {
    const text = kind === "pix" ? (pixCode ?? "") : line;
    try {
      await navigator.clipboard.writeText(text);
      setCopyState({ boleto: "idle", pix: "idle", [kind]: "copied" });
      if (kind === "boleto") setFlash(true);
      onCopyRef.current?.(text, kind);
    } catch {
      // Without clipboard access the digits stay selectable, and the hint says so.
      setCopyState({ boleto: "idle", pix: "idle", [kind]: "failed" });
    }
  };

  const titleId = useId();
  const amountId = useId();

  return (
    <BoletoPaymentContext.Provider
      value={{
        variant,
        status,
        displayStatus,
        line,
        barcode: code,
        groups: line ? boletoLineGroups(line) : [],
        due,
        daysLeft,
        paidAt: paidAt === undefined ? null : calendarDay(paidAt, timeZone),
        pixCode,
        copyable,
        showBarcode: showBarcode ?? variant !== "compact",
        method: currentMethod,
        setMethod,
        copyState,
        flash,
        copy,
        titleId,
        amountId,
      }}
    >
      <section
        data-slot="boleto-payment"
        data-variant={variant}
        data-status={displayStatus}
        data-invalid={line && !isValidBoletoLine(line) ? "" : undefined}
        aria-labelledby={`${titleId} ${amountId}`}
        className={cn(boletoPaymentVariants({ variant }), className)}
        {...props}
      >
        {children}
      </section>
    </BoletoPaymentContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Header
 * -----------------------------------------------------------------------------------------------*/

export function BoletoPaymentHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="boleto-payment-header"
      className={cn(
        "flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-2",
        className,
      )}
      {...props}
    />
  );
}

export function BoletoPaymentTitle({
  children = "Pague com boleto",
  className,
  ...props
}: ComponentProps<"h3">) {
  const context = useBoletoPayment("BoletoPaymentTitle");
  return (
    <h3
      data-slot="boleto-payment-title"
      id={context.titleId}
      className={cn(
        "m-0 font-medium text-muted-foreground",
        context.variant === "compact"
          ? "text-[12.5px] leading-[18px]"
          : "text-[13px] leading-[18px]",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export type BoletoPaymentAmountProps = Omit<ComponentProps<"p">, "children"> & { value: number };

export function BoletoPaymentAmount({ value, className, ...props }: BoletoPaymentAmountProps) {
  const context = useBoletoPayment("BoletoPaymentAmount");
  return (
    <p
      data-slot="boleto-payment-amount"
      id={context.amountId}
      className={cn(
        "m-0 mt-0.5 font-semibold tracking-[-0.01em] text-foreground tabular-nums",
        context.variant === "compact" ? "text-[20px] leading-6" : "text-[28px] leading-8",
        className,
      )}
      {...props}
    >
      {formatBrl(value)}
    </p>
  );
}

const statusCopy: Record<BoletoPaymentDisplayStatus, string> = {
  pending: "Aguardando pagamento",
  "due-today": "Vence hoje",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

/** A polite live region, so payment is announced when the status changes. */
export function BoletoPaymentStatusBadge({
  children,
  className,
  ...props
}: ComponentProps<"span">) {
  const context = useBoletoPayment("BoletoPaymentStatusBadge");
  const status = context.displayStatus;
  return (
    <Badge
      variant="secondary"
      data-slot="boleto-payment-status-badge"
      data-status={status}
      className={cn(
        "h-6 shrink-0 gap-1.5 rounded-full border-0 px-2.5 py-0 text-[11.5px] font-medium",
        (status === "pending" || status === "due-today") && "bg-warning/14 text-warning-ink",
        status === "paid" && "bg-success/14 text-success-ink",
        status === "overdue" && "bg-destructive/14 text-destructive-ink",
        status === "cancelled" && "bg-muted text-muted-foreground",
        className,
      )}
      {...props}
      role="status"
      aria-live="polite"
    >
      <span
        key={status}
        className="inline-flex animate-in items-center gap-1.5 duration-200 fade-in-0 motion-reduce:animate-none"
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full bg-current",
            (status === "pending" || status === "due-today") &&
              "animate-pulse motion-reduce:animate-none",
          )}
        />
        {children ?? statusCopy[status]}
      </span>
    </Badge>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Methods (BolePix)
 * -----------------------------------------------------------------------------------------------*/

const METHOD_LABELS: Record<BoletoPaymentMethod, { label: string; icon: typeof Barcode }> = {
  boleto: { label: "Boleto", icon: Barcode },
  pix: { label: "Pix", icon: QrCode },
};

export type BoletoPaymentMethodsProps = Omit<ComponentProps<"div">, "children"> & {
  /** The group's accessible name. */
  label?: string;
};

/**
 * "Boleto | Pix" for a BolePix. Renders only when `pixCode` is set. A radio group of segment
 * buttons (ToggleGroup's value differs between Radix and Base UI, so the selection stays here).
 */
export function BoletoPaymentMethods({
  label = "Forma de pagamento",
  className,
  onKeyDown,
  ...props
}: BoletoPaymentMethodsProps) {
  const context = useBoletoPayment("BoletoPaymentMethods");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  if (!context.pixCode) return null;
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next: BoletoPaymentMethod =
      event.key === "Home"
        ? "boleto"
        : event.key === "End"
          ? "pix"
          : context.method === "boleto"
            ? "pix"
            : "boleto";
    context.setMethod(next);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      data-slot="boleto-payment-methods"
      className={cn(
        "relative isolate inline-grid grid-cols-2 justify-self-start rounded-full bg-muted p-0.5",
        className,
      )}
      {...props}
      onKeyDown={handleKeyDown}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0.5 left-0.5 -z-1 w-[calc(50%-2px)] rounded-full bg-card shadow-[0_0_0_1px_var(--border)] [transition:translate_240ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:bg-foreground/12 dark:shadow-none",
          context.method === "pix" && "translate-x-full",
        )}
      />
      {BOLETO_PAYMENT_METHODS.map((value) => {
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
            onClick={() => context.setMethod(value)}
            className={cn(
              toggleVariants(),
              "h-6 min-w-0 cursor-pointer gap-1.5 rounded-full border-0 bg-transparent px-3 text-[12px] font-medium text-subtle-foreground [transition:color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-transparent hover:text-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] aria-checked:text-foreground data-[state=on]:bg-transparent motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-3.5",
            )}
          >
            <Icon aria-hidden="true" strokeWidth={1.75} />
            {text}
          </button>
        );
      })}
    </div>
  );
}

export function BoletoPaymentPanels({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="boleto-payment-panels" className={cn("grid", className)} {...props} />;
}

export type BoletoPaymentPanelProps = ComponentProps<"div"> & { value: BoletoPaymentMethod };

/**
 * One method's content. The active panel opens with `grid-template-rows`, so the card height
 * follows the switch; the incoming panel fades up 4px. The Pix panel renders only with `pixCode`.
 */
export function BoletoPaymentPanel({
  value,
  className,
  children,
  ...props
}: BoletoPaymentPanelProps) {
  const context = useBoletoPayment("BoletoPaymentPanel");
  if (value === "pix" && !context.pixCode) return null;
  const active = context.method === value;
  return (
    <div
      data-slot="boleto-payment-panel"
      data-value={value}
      data-state={active ? "active" : "inactive"}
      aria-hidden={!active || undefined}
      inert={!active}
      className={cn(
        "grid [transition:grid-template-rows_300ms_cubic-bezier(0.23,1,0.32,1),opacity_200ms_ease-out,translate_200ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        active
          ? "grid-rows-[1fr] translate-y-0 opacity-100"
          : "pointer-events-none grid-rows-[0fr] translate-y-1 opacity-0",
        className,
      )}
      {...props}
    >
      <div className="-m-px grid min-h-0 gap-4 overflow-hidden p-px">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Barcode
 * -----------------------------------------------------------------------------------------------*/

/** The ITF-25 barcode drawn from the code, on a white tile scanners can read in both themes. */
export function BoletoPaymentBarcode({ children, className, ...props }: ComponentProps<"figure">) {
  const context = useBoletoPayment("BoletoPaymentBarcode");
  if (!context.showBarcode) return null;
  const settled = context.status === "paid" || context.status === "cancelled";
  const { bars, width } = boletoBarcodeBars(context.barcode);
  return (
    <figure
      data-slot="boleto-payment-barcode"
      className={cn(
        "isolate m-0 grid overflow-hidden rounded-[10px] bg-white px-3 py-2.5 shadow-[0_0_0_1px_var(--border)] *:[grid-area:1/1]",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className={cn(
          "transition-[filter,opacity] duration-240 ease-out-quint motion-reduce:transition-none",
          settled && "opacity-22 blur-[2px]",
        )}
      >
        {children ?? (
          <svg
            viewBox={`0 0 ${width} 48`}
            preserveAspectRatio="none"
            className="block h-12 w-full fill-black"
            aria-hidden="true"
            focusable="false"
          >
            {bars.map((bar) => (
              <rect key={bar.x} x={bar.x} y={0} width={bar.width} height={48} />
            ))}
          </svg>
        )}
      </div>
      {settled ? (
        <figcaption className="flex animate-in items-center justify-center gap-2 text-[12px] leading-4 font-medium text-black/85 duration-180 ease-out-quint fade-in-0 zoom-in-96 motion-reduce:animate-none">
          {context.status === "paid" ? (
            <CheckCircle2
              className="size-[18px] animate-in text-success-ink delay-60 duration-200 ease-out-quint fill-mode-both fade-in-0 zoom-in-50 motion-reduce:animate-none"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          ) : (
            <XCircle className="size-[18px] opacity-70" strokeWidth={1.75} aria-hidden="true" />
          )}
          {context.status === "paid"
            ? context.paidAt
              ? `Pago em ${formatBoletoDate(context.paidAt)}`
              : "Pago"
            : "Boleto cancelado"}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Linha digitável
 * -----------------------------------------------------------------------------------------------*/

/** Stagger for the copy flash: 30ms per group, five groups. */
const FLASH_DELAYS = ["delay-0", "delay-[30ms]", "delay-[60ms]", "delay-[90ms]", "delay-[120ms]"];

function CopyButton({
  kind,
  label,
  compact,
}: {
  kind: BoletoPaymentMethod;
  label: string;
  compact?: boolean;
}) {
  const context = useBoletoPayment("BoletoPaymentCopy");
  const copied = context.copyState[kind] === "copied";
  return (
    <Button
      type="button"
      data-slot="boleto-payment-copy"
      data-copied={copied || undefined}
      disabled={!context.copyable}
      onClick={() => void context.copy(kind)}
      className={cn(
        "shrink-0 gap-1.5 rounded-full border-0 py-0 font-medium transition-[scale,background-color,color,filter] duration-[140ms] ease-out-quint focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-secondary disabled:text-subtle-foreground disabled:opacity-100 motion-reduce:transition-none motion-reduce:active:scale-100",
        compact
          ? "h-7 px-3 text-[12px] has-[>svg]:px-3"
          : "h-8 px-3.5 text-[12.5px] has-[>svg]:px-3.5",
        copied
          ? "bg-success/14 text-success-ink hover:bg-success/14"
          : "bg-primary text-primary-foreground hover:bg-primary hover:brightness-[1.08]",
      )}
    >
      {copied ? (
        <Check
          key="copied"
          className="size-3.5 animate-in duration-200 ease-out-quint fade-in-0 zoom-in-50 motion-reduce:animate-none"
          strokeWidth={2.2}
          aria-hidden="true"
        />
      ) : (
        <Copy key="copy" className="size-3.5" strokeWidth={2} aria-hidden="true" />
      )}
      {/* Both labels share one cell, so the button keeps its width when the label swaps. */}
      <span className="grid [&>*]:[grid-area:1/1]">
        <span className={cn(copied && "invisible")} aria-hidden={copied}>
          {label}
        </span>
        <span className={cn(!copied && "invisible")} aria-hidden={!copied}>
          Copiado
        </span>
      </span>
    </Button>
  );
}

export type BoletoPaymentDigitableLineProps = Omit<ComponentProps<"div">, "children"> & {
  label?: string;
};

/**
 * The linha digitável in five groups, always breaking after the third, with a copy button and a
 * spoken confirmation. Screen readers get the digits in blocks of five instead of one long number.
 */
export function BoletoPaymentDigitableLine({
  label = "Linha digitável",
  className,
  ...props
}: BoletoPaymentDigitableLineProps) {
  const context = useBoletoPayment("BoletoPaymentDigitableLine");
  const compact = context.variant === "compact";
  const labelId = useId();
  const struck = !context.copyable;
  const spoken = context.line.match(/.{1,5}/g)?.join(" ") ?? "";
  const state = context.copyState.boleto;

  const digits = (
    <code
      aria-hidden="true"
      className={cn(
        "flex min-w-0 flex-1 flex-wrap font-mono text-muted-foreground tabular-nums select-all",
        compact ? "gap-x-[7px] gap-y-0.5 text-[11.5px] leading-4" : "gap-x-2 text-[13px] leading-5",
        struck && "line-through decoration-subtle-foreground/60",
      )}
    >
      {context.groups.map((group, index) => (
        <span key={group + String(index)} className="contents">
          {index === 3 ? <span aria-hidden="true" className="h-0 basis-full" /> : null}
          <span
            aria-hidden="true"
            className={cn(
              "-mx-px rounded-[4px] px-px transition-[background-color,color] ease-out motion-reduce:transition-none",
              context.flash ? "duration-120" : "duration-240",
              FLASH_DELAYS[index],
              !struck && "hover:bg-muted hover:text-foreground",
              context.flash && "text-foreground motion-safe:bg-success/14",
            )}
          >
            {group}
          </span>
        </span>
      ))}
    </code>
  );

  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would imply form controls the code does not have.
    <div
      data-slot="boleto-payment-digitable-line"
      className={cn("grid min-w-0 gap-2", className)}
      {...props}
      role="group"
      aria-labelledby={labelId}
    >
      <div className={cn("flex min-w-0 items-center justify-between gap-2", compact && "sr-only")}>
        <span id={labelId} className="text-[12px] leading-4 font-medium text-muted-foreground">
          {label}
        </span>
        {compact ? null : <CopyButton kind="boleto" label="Copiar código" />}
      </div>
      <div
        className={cn(
          "flex min-w-0 items-center gap-2 bg-background",
          compact ? "rounded-[10px] py-[3px] pr-[3px] pl-2.5" : "rounded-xl px-3 py-2.5",
        )}
      >
        <span className="sr-only">{spoken}</span>
        {digits}
        {compact ? <CopyButton kind="boleto" label="Copiar" compact /> : null}
      </div>
      {state === "failed" ? (
        <p className="m-0 text-[11.5px] leading-4 text-subtle-foreground">
          Selecione e copie o código
        </p>
      ) : null}
      <span role="status" className="sr-only">
        {state === "copied"
          ? "Linha digitável copiada"
          : state === "failed"
            ? "Não foi possível copiar a linha digitável"
            : ""}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Pix tab
 * -----------------------------------------------------------------------------------------------*/

export type BoletoPaymentPixProps = Omit<ComponentProps<"div">, "children"> & {
  /** The provider's QR image. */
  children?: ReactNode;
  description?: ReactNode;
};

/** The BolePix QR (from the provider) and "Copiar Pix". */
export function BoletoPaymentPix({
  children,
  description = "Pagando com Pix, a confirmação chega na hora. O valor e o vencimento são os mesmos.",
  className,
  ...props
}: BoletoPaymentPixProps) {
  const context = useBoletoPayment("BoletoPaymentPix");
  const state = context.copyState.pix;
  if (!context.pixCode) return null;
  return (
    <div
      data-slot="boleto-payment-pix"
      className={cn(
        "grid items-start gap-4 grid-cols-[minmax(0,1fr)] @min-[340px]/boleto:grid-cols-[132px_minmax(0,1fr)]",
        className,
      )}
      {...props}
    >
      <figure className="m-0 grid size-[132px] place-items-center justify-self-center overflow-hidden rounded-xl bg-white p-2.5 shadow-[0_0_0_1px_var(--border)] @min-[340px]/boleto:justify-self-start [&_img]:size-full [&_svg]:size-full">
        {children}
      </figure>
      <div className="grid content-start gap-2.5">
        <p className="m-0 text-[12.5px] leading-[18px] text-muted-foreground">{description}</p>
        <div className="justify-self-start">
          <CopyButton kind="pix" label="Copiar Pix" />
        </div>
        {state === "failed" ? (
          <p className="m-0 text-[11.5px] leading-4 text-subtle-foreground">
            Selecione e copie o código
          </p>
        ) : null}
        <span role="status" className="sr-only">
          {state === "copied"
            ? "Código Pix copiado"
            : state === "failed"
              ? "Não foi possível copiar o código Pix"
              : ""}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Details and footer
 * -----------------------------------------------------------------------------------------------*/

export type BoletoPaymentDetailsProps = ComponentProps<"dl"> & {
  /** Who receives the payment, for example "Casa Aroeira Ltda · 12.345.678/0001-95". */
  beneficiary?: ReactNode;
};

/** Vencimento (with how long is left), Beneficiário, then any consumer rows. */
export function BoletoPaymentDetails({
  beneficiary,
  children,
  className,
  ...props
}: BoletoPaymentDetailsProps) {
  const context = useBoletoPayment("BoletoPaymentDetails");
  const date = formatBoletoDate(context.due);
  const dueToday = context.displayStatus === "due-today";
  const relative =
    context.status !== "pending" || context.daysLeft < 0
      ? null
      : context.daysLeft === 1
        ? "amanhã"
        : context.daysLeft > 1
          ? `em ${context.daysLeft} dias`
          : null;
  return (
    <dl
      data-slot="boleto-payment-details"
      className={cn(
        "m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3.5 gap-y-1.5 text-[12px] leading-4",
        className,
      )}
      {...props}
    >
      <BoletoPaymentDetail term="Vencimento">
        <b className={cn("font-medium text-foreground", dueToday && "text-warning-ink")}>
          {dueToday ? `Hoje, ${date}` : date}
        </b>
        {relative ? ` · ${relative}` : null}
      </BoletoPaymentDetail>
      {beneficiary ? (
        <BoletoPaymentDetail term="Beneficiário">{beneficiary}</BoletoPaymentDetail>
      ) : null}
      {children}
    </dl>
  );
}

export type BoletoPaymentDetailProps = Omit<ComponentProps<"div">, "children"> & {
  term: ReactNode;
  children: ReactNode;
};

export function BoletoPaymentDetail({
  term,
  children,
  className,
  ...props
}: BoletoPaymentDetailProps) {
  return (
    <div data-slot="boleto-payment-detail" className={cn("contents", className)} {...props}>
      <dt className="text-subtle-foreground">{term}</dt>
      <dd className="m-0 min-w-0 text-right text-muted-foreground tabular-nums">{children}</dd>
    </div>
  );
}

export function BoletoPaymentFooter({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer
      data-slot="boleto-payment-footer"
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2",
        className,
      )}
      {...props}
    />
  );
}

export type BoletoPaymentDownloadProps = ComponentProps<"a">;

/** A secondary pill that links to the consumer's PDF. */
export function BoletoPaymentDownload({
  children = "Baixar PDF",
  className,
  ...props
}: BoletoPaymentDownloadProps) {
  return (
    <a
      data-slot="boleto-payment-download"
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary px-3 text-[12px] leading-4 font-medium text-foreground no-underline transition-[background-color,scale] duration-[120ms,140ms] ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
        className,
      )}
      {...props}
    >
      <Download className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      {children}
    </a>
  );
}

export type BoletoPaymentHintProps = ComponentProps<"p"> & {
  /** Danger ink for consumer lines such as an overdue fee notice. */
  tone?: "subtle" | "danger";
};

export function BoletoPaymentHint({
  tone = "subtle",
  children = "Compensa em até 3 dias úteis",
  className,
  ...props
}: BoletoPaymentHintProps) {
  return (
    <p
      data-slot="boleto-payment-hint"
      data-tone={tone}
      className={cn(
        "m-0 text-[11.5px] leading-4",
        tone === "danger" ? "text-[12px] text-destructive-ink" : "text-subtle-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
