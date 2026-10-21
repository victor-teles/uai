"use client";

import { cva } from "class-variance-authority";
import {
  Check,
  ChevronLeft,
  Copy,
  Info,
  LoaderCircle,
  QrCode,
  Repeat,
  Search,
  SearchX,
  Smartphone,
  X,
} from "lucide-react";
import {
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export type PixAutomaticoBank = {
  /** Stable. Drives the monogram tone and `recentBankId`. */
  id: string;
  /** The full, accessible name: "Banco do Brasil". */
  name: string;
  /** Used in copy such as "Enviar para o app {shortName}". Falls back to `name`. */
  shortName?: string;
  /** From assets you're licensed to use. Rendered as a decorative image; the monogram on error. */
  logoUrl?: string;
  /** The 8-digit participant code. Passed through untouched, never shown. */
  ispb?: string;
  /** Overrides the derived initials (max 2 characters). */
  monogram?: string;
  /** Extra search terms, such as ["bb"] or ["cef", "caixa economica federal"]. */
  keywords?: readonly string[];
  disabled?: boolean;
  /** Shown on a disabled row. Defaults to "Indisponível". */
  disabledReason?: string;
};

export type PixAutomaticoBanksStatus = "ready" | "loading" | "error";

export type PixAutomaticoAuthorizePayload =
  | { method: "qr" }
  | { method: "app"; bank: PixAutomaticoBank };

/**
 * Example data, not a registry. Names identify the institutions (nominative use); no logos or
 * trademarks are bundled, so pass `logoUrl` from assets you're licensed to use. Pix Automático
 * participation changes, so real integrations should pass their payment provider's participants
 * through `banks`.
 */
export const PIX_AUTOMATICO_DEFAULT_BANKS: readonly PixAutomaticoBank[] = [
  { id: "nubank", name: "Nubank", monogram: "NU", keywords: ["nu"] },
  { id: "itau", name: "Itaú", monogram: "IT", keywords: ["itau", "itau unibanco"] },
  { id: "bb", name: "Banco do Brasil", monogram: "BB", keywords: ["bb"] },
  { id: "caixa", name: "Caixa", monogram: "CX", keywords: ["cef", "caixa economica federal"] },
  { id: "bradesco", name: "Bradesco", monogram: "BR" },
  { id: "santander", name: "Santander", monogram: "SA" },
  { id: "inter", name: "Inter", monogram: "IN", keywords: ["banco inter"] },
  { id: "c6", name: "C6 Bank", monogram: "C6" },
  { id: "mercadopago", name: "Mercado Pago", monogram: "MP" },
  { id: "picpay", name: "PicPay", monogram: "PP" },
  { id: "btg", name: "BTG Pactual", monogram: "BT" },
  { id: "sicoob", name: "Sicoob", monogram: "SC" },
  { id: "sicredi", name: "Sicredi", monogram: "SI" },
  { id: "pagbank", name: "PagBank", monogram: "PB", keywords: ["pagseguro"] },
  { id: "banrisul", name: "Banrisul", monogram: "BA" },
];

/** Lowercase, without accents: "Itaú" → "itau". */
function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

const MONOGRAM_STOPWORDS = new Set(["banco", "de", "do", "da", "dos", "das", "e"]);

/** The bank's initials: `monogram`, or two letters derived from its name. */
export function pixAutomaticoBankMonogram(bank: PixAutomaticoBank) {
  if (bank.monogram) return bank.monogram.slice(0, 2).toUpperCase();
  const words = fold(bank.shortName ?? bank.name)
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9]/g, ""))
    .filter((word) => word && !MONOGRAM_STOPWORDS.has(word));
  const initials =
    words.length >= 2 ? `${words[0]?.[0]}${words[1]?.[0]}` : (words[0] ?? "").slice(0, 2);
  return initials.toUpperCase();
}

export const PIX_AUTOMATICO_BANK_TONES = ["neutral", "primary", "success", "warning"] as const;
export type PixAutomaticoBankTone = (typeof PIX_AUTOMATICO_BANK_TONES)[number];

/** A stable tone from the bank id (FNV-1a), never a brand color. */
export function pixAutomaticoBankTone(id: string): PixAutomaticoBankTone {
  let hash = 0x811c9dc5;
  for (let index = 0; index < id.length; index++) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return PIX_AUTOMATICO_BANK_TONES[hash % 4] as PixAutomaticoBankTone;
}

function bankShortName(bank: PixAutomaticoBank) {
  return bank.shortName ?? bank.name;
}

/** 0 when the text starts with the needle, 1 when a word does, 2 for any substring. */
function matchIn(text: string, needle: string): { tier: number; at: number } | null {
  let substring = -1;
  for (let at = text.indexOf(needle); at !== -1; at = text.indexOf(needle, at + 1)) {
    if (at === 0) return { tier: 0, at };
    if (text[at - 1] === " ") return { tier: 1, at };
    if (substring === -1) substring = at;
  }
  return substring === -1 ? null : { tier: 2, at: substring };
}

type BankMatch = { bank: PixAutomaticoBank; tier: number; highlight: number };

/**
 * Name-start, then word-start, then substring matches, each tier kept in `banks` order. Matches
 * that only hit `keywords` come last, so "ban" lists Banco do Brasil before Inter ("banco inter").
 */
function searchBanks(banks: readonly PixAutomaticoBank[], query: string): BankMatch[] {
  const needle = fold(query.trim());
  const matches: BankMatch[] = [];
  for (const bank of banks) {
    const inName = matchIn(fold(bank.name), needle);
    const inShort = bank.shortName ? matchIn(fold(bank.shortName), needle) : null;
    const inKeywords = (bank.keywords ?? []).some((keyword) => fold(keyword).includes(needle));
    const tier = Math.min(inName?.tier ?? 9, inShort?.tier ?? 9, inKeywords ? 3 : 9);
    if (tier < 9) matches.push({ bank, tier, highlight: inName?.at ?? -1 });
  }
  return matches.sort((first, second) => first.tier - second.tier);
}

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

type PixAutomaticoStep = "terms" | "bank";

type PixAutomaticoContextValue = {
  variant: PixAutomaticoVariant;
  status: PixAutomaticoStatus;
  method: PixAutomaticoMethod;
  setMethod: (method: PixAutomaticoMethod) => void;
  /** Internal: which review step shows. Only meaningful while status is "review". */
  step: PixAutomaticoStep;
  /** Opens the bank step. Focus returns to `opener` (or the checked method) on Back. */
  openBankPicker: (opener?: HTMLElement | null) => void;
  closeBankPicker: () => void;
  banks: readonly PixAutomaticoBank[];
  banksStatus: PixAutomaticoBanksStatus;
  onBanksRetry: (() => void) | undefined;
  recentBank: PixAutomaticoBank | null;
  bank: PixAutomaticoBank | null;
  selectBank: (bank: PixAutomaticoBank) => void;
  changeBank: (() => void) | undefined;
  pending: boolean;
  announce: (message: string) => void;
  waitingTitleId: string;
  secondsLeft: number | null;
  code: string | undefined;
  copied: boolean;
  copyFailed: boolean;
  copy: () => Promise<void>;
  titleId: string;
  authorize: () => void;
  sendToBank: () => void;
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
  /** Receives the chosen bank for the app method. Send the request, then set status="awaiting". */
  onAuthorize?: (payload: PixAutomaticoAuthorizePayload) => void;
  /** The bank list, in display order. Defaults to the example list in PIX_AUTOMATICO_DEFAULT_BANKS. */
  banks?: readonly PixAutomaticoBank[];
  banksStatus?: PixAutomaticoBanksStatus;
  /** Shows Tentar de novo when the list fails to load. */
  onBanksRetry?: () => void;
  /** Pinned under "Usado da última vez" and selected by default. The component never stores it. */
  recentBankId?: string;
  bankId?: string | null;
  defaultBankId?: string | null;
  onBankSelect?: (bank: PixAutomaticoBank) => void;
  /** Fires when the bank picker opens or closes, for UI around the card that follows it. */
  onBankPickerOpenChange?: (open: boolean) => void;
  /** Shows Trocar banco while awaiting: cancel the open request, then set status="review". */
  onChangeBank?: () => void;
  /** The request is in flight: the bank step locks and its button reads Enviando…. */
  pending?: boolean;
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
  banks = PIX_AUTOMATICO_DEFAULT_BANKS,
  banksStatus = "ready",
  onBanksRetry,
  recentBankId,
  bankId: bankIdProp,
  defaultBankId = recentBankId ?? null,
  onBankSelect,
  onBankPickerOpenChange,
  onChangeBank,
  pending = false,
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
  const [internalBankId, setInternalBankId] = useState<string | null>(defaultBankId);
  const bankId = bankIdProp === undefined ? internalBankId : bankIdProp;
  const bank = banks.find((item) => item.id === bankId) ?? null;
  const recentBank = banks.find((item) => item.id === recentBankId) ?? null;
  const [step, setStep] = useState<PixAutomaticoStep>("terms");
  const opener = useRef<HTMLElement | null>(null);
  const returnFocus = useRef(false);
  const previousStatus = useRef(status);
  const waitingTitleId = useId();
  const deadline = expiresAt === undefined ? null : toTime(expiresAt);
  // A fixed `now` becomes an offset from the real clock, so the countdown keeps ticking.
  const [offset] = useState(() => (now === undefined ? 0 : toTime(now) - Date.now()));
  const [clock, setClock] = useState(() => (now === undefined ? Date.now() : toTime(now)));
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
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
      setAnnouncement("Falta 1 minuto para o pedido expirar");
    }
  }, [awaiting, secondsLeft]);

  // A new request (back to review) re-arms the one-shot notices.
  useEffect(() => {
    if (status !== "review") return;
    expiredNotified.current = false;
    minuteNotified.current = false;
    setAnnouncement("");
  }, [status]);

  // Leaving review closes the bank step, and a sent request moves focus to the waiting title so it
  // isn't lost to <body> when the review goes inert. Trocar banco reopens the step on its own.
  useEffect(() => {
    const previous = previousStatus.current;
    previousStatus.current = status;
    if (status !== "review") setStep((current) => (previous === "review" ? "terms" : current));
    if (previous === "review" && status === "awaiting") {
      document.getElementById(waitingTitleId)?.focus();
    }
  }, [status, waitingTitleId]);

  // The picker shows only on the review step, so leaving review closes it for the consumer too.
  const bankPickerOpen = status === "review" && step === "bank";
  const bankPickerWasOpen = useRef(bankPickerOpen);
  const onBankPickerOpenChangeRef = useRef(onBankPickerOpenChange);
  onBankPickerOpenChangeRef.current = onBankPickerOpenChange;
  useEffect(() => {
    if (bankPickerWasOpen.current === bankPickerOpen) return;
    bankPickerWasOpen.current = bankPickerOpen;
    onBankPickerOpenChangeRef.current?.(bankPickerOpen);
  }, [bankPickerOpen]);

  // Back returns focus to whatever opened the step.
  useEffect(() => {
    if (step !== "terms" || !returnFocus.current) return;
    returnFocus.current = false;
    const target = opener.current?.isConnected
      ? opener.current
      : document
          .getElementById(titleId)
          ?.closest("section")
          ?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]');
    target?.focus();
  }, [step, titleId]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const setMethod = (next: PixAutomaticoMethod) => {
    if (methodProp === undefined) setInternalMethod(next);
    onMethodChange?.(next);
  };

  const openBankPicker = (from?: HTMLElement | null) => {
    opener.current = from ?? null;
    setStep("bank");
  };

  const closeBankPicker = () => {
    returnFocus.current = true;
    setStep("terms");
  };

  const selectBank = (next: PixAutomaticoBank) => {
    if (next.disabled || pending) return;
    if (bankIdProp === undefined) setInternalBankId(next.id);
    onBankSelect?.(next);
  };

  const sendToBank = () => {
    if (bank && !bank.disabled && !pending) onAuthorize?.({ method: "app", bank });
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
        step,
        openBankPicker,
        closeBankPicker,
        banks,
        banksStatus,
        onBanksRetry,
        recentBank,
        bank,
        selectBank,
        changeBank: onChangeBank
          ? () => {
              opener.current = null;
              setStep("bank");
              onChangeBank();
            }
          : undefined,
        pending,
        announce: setAnnouncement,
        waitingTitleId,
        authorize: () => {
          if (method === "qr") onAuthorize?.({ method: "qr" });
          else if (bank) sendToBank();
          else openBankPicker(document.activeElement as HTMLElement | null);
        },
        sendToBank,
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
          {announcement}
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
  const spoken =
    status === "awaiting" && context.method === "app" && context.bank
      ? `Pedido enviado para o app ${bankShortName(context.bank)}. Aguardando confirmação.`
      : STATUS_SPOKEN[status];
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

const STEP_FLOOR: Record<PixAutomaticoVariant, number> = { card: 340, plain: 340, compact: 300 };

/** The terms leave 8px left in 160ms; they come back in 240ms after a 60ms beat. */
const termsLeave =
  "-translate-x-2 opacity-0 [transition:opacity_160ms_cubic-bezier(0.23,1,0.32,1),translate_160ms_cubic-bezier(0.23,1,0.32,1)]";
const termsEnter =
  "[transition:opacity_240ms_cubic-bezier(0.23,1,0.32,1)_60ms,translate_240ms_cubic-bezier(0.23,1,0.32,1)_60ms]";

/**
 * Holds the review content. It collapses with grid rows once the request is sent. The terms and
 * the bank step share one grid cell, so opening the picker keeps the card's height.
 */
export function PixAutomaticoReview({ className, children, ...props }: ComponentProps<"div">) {
  const context = usePixAutomatico("PixAutomaticoReview");
  const open = context.status === "review";
  const picking = open && context.step === "bank";
  const terms = useRef<HTMLDivElement>(null);
  const [termsHeight, setTermsHeight] = useState(0);

  // Lock the bank step to the terms' height, re-measured while it's open (container or font zoom).
  useLayoutEffect(() => {
    const node = terms.current;
    if (!picking || !node) return;
    const measure = () => setTermsHeight(node.getBoundingClientRect().height);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [picking]);

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
      <div className="grid min-h-0 min-w-0 overflow-hidden">
        <div
          ref={terms}
          inert={picking || undefined}
          className={cn(
            "grid min-w-0 self-start",
            context.variant === "compact" ? "gap-3" : "gap-4",
            "[grid-area:1/1] motion-reduce:transition-none",
            picking ? termsLeave : termsEnter,
          )}
        >
          {children}
        </div>
        {picking ? (
          <PixAutomaticoBankPicker
            style={{ height: Math.max(termsHeight, STEP_FLOOR[context.variant]) }}
          />
        ) : null}
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

/**
 * "Como você quer autorizar?": QR Code or No app do banco, as a two-option radio group. A click,
 * tap, or Space on No app do banco opens the bank step; arrow keys only change the selection
 * (WCAG 3.2.2). Once a bank is chosen it shows under the segment with Trocar.
 */
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
              onClick={(event) => {
                context.setMethod(value);
                if (value === "app") context.openBankPicker(event.currentTarget);
              }}
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
      {/* Added on the way back, not behind the open picker, so opening never changes the height. */}
      {context.method === "app" && context.bank && context.step === "terms" ? (
        <BankSummary bank={context.bank} />
      ) : null}
    </div>
  );
}

/** The chosen bank on the terms step, with Trocar to reopen the picker. */
function BankSummary({ bank }: { bank: PixAutomaticoBank }) {
  const context = usePixAutomatico("PixAutomaticoMethod");
  const compact = context.variant === "compact";
  return (
    <div
      data-slot="pix-automatico-bank-summary"
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-[10px] pr-1.5 pl-2.5 shadow-[inset_0_0_0_1px_var(--border)]",
        // Fades up 4px as the terms come back; instant under reduced motion.
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-180 motion-safe:ease-out-quint",
        compact ? "h-10 rounded-lg" : "h-11",
      )}
    >
      <PixAutomaticoBankMark bank={bank} />
      <span className="min-w-0 flex-1 truncate text-[13px]/[18px] font-medium text-foreground">
        {bank.name}
      </span>
      <Button
        type="button"
        variant="secondary"
        aria-label={`Trocar banco, ${bank.name} escolhido`}
        disabled={context.status !== "review"}
        onClick={(event) => context.openBankPicker(event.currentTarget)}
        className={cn(pillClass, "h-7 bg-secondary px-3 text-[12px] hover:bg-accent")}
      >
        Trocar
      </Button>
    </div>
  );
}

const pillClass =
  "rounded-full border-0 font-medium [transition:background-color_120ms_ease-out,filter_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

/**
 * The one primary action: a full-width 36px pill. With No app do banco and no bank yet it reads
 * Escolher banco and opens the bank step; with a bank it sends the request right away.
 */
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
      {children ??
        (context.method === "app" && !context.bank ? "Escolher banco" : "Autorizar Pix Automático")}
    </Button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Bank picker: the bank step that swaps in for the terms
 * -----------------------------------------------------------------------------------------------*/

const TONE_CLASSES: Record<PixAutomaticoBankTone, string> = {
  neutral: "bg-muted text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]",
  primary: "bg-[color-mix(in_oklab,var(--primary)_12%,var(--card))] text-primary-ink",
  success: "bg-[color-mix(in_oklab,var(--success)_12%,var(--card))] text-success-ink",
  warning: "bg-[color-mix(in_oklab,var(--warning)_12%,var(--card))] text-warning-ink",
};

export type PixAutomaticoBankMarkProps = Omit<ComponentProps<"span">, "children"> & {
  bank: PixAutomaticoBank;
  /** "badge" is the 24px tile on the waiting phone. Defaults to the variant's row size. */
  size?: "row" | "badge";
};

/** The bank's tile: the consumer's logo, or its initials on a stable tone. Always decorative. */
export function PixAutomaticoBankMark({
  bank,
  size = "row",
  className,
  ...props
}: PixAutomaticoBankMarkProps) {
  const context = usePixAutomatico("PixAutomaticoBankMark");
  const [logoFailed, setLogoFailed] = useState(false);
  const small = size === "badge" || context.variant === "compact";
  const logo = bank.logoUrl && !logoFailed;
  return (
    <span
      data-slot="pix-automatico-bank-mark"
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden font-semibold tracking-[0.01em]",
        small ? "size-6 rounded-[7px] text-[10px]/none" : "size-7 rounded-lg text-[11px]/none",
        logo
          ? "bg-white shadow-[inset_0_0_0_1px_var(--border)]"
          : TONE_CLASSES[pixAutomaticoBankTone(bank.id)],
        className,
      )}
      {...props}
    >
      {logo ? (
        // biome-ignore lint/performance/noImgElement: the logo comes from the consumer's assets
        <img
          src={bank.logoUrl}
          alt=""
          loading="lazy"
          onError={() => setLogoFailed(true)}
          className="size-full object-contain"
        />
      ) : (
        pixAutomaticoBankMonogram(bank)
      )}
    </span>
  );
}

const optionRow =
  "flex min-w-0 shrink-0 cursor-pointer items-center [transition:background-color_120ms_ease-out] select-none motion-reduce:transition-none";

/** "Banrisul" with the matched part in a <mark>. */
function Highlight({ text, at, length }: { text: string; at: number; length: number }) {
  const name = text.normalize("NFC");
  if (at < 0 || length === 0) return <>{name}</>;
  return (
    <>
      {name.slice(0, at)}
      <mark className="rounded-[3px] bg-[color-mix(in_oklab,var(--primary)_20%,var(--card))] text-inherit">
        {name.slice(at, at + length)}
      </mark>
      {name.slice(at + length)}
    </>
  );
}

function quoteQuery(query: string) {
  const trimmed = query.trim();
  return `“${trimmed.length > 32 ? `${trimmed.slice(0, 32)}…` : trimmed}”`;
}

/**
 * The bank step: a search combobox controlling a single-select listbox, the recent bank pinned on
 * top, and a footer that sends to the selected bank. Focus stays in the field while arrows move.
 */
function PixAutomaticoBankPicker({ className, style }: { className?: string; style?: object }) {
  const context = usePixAutomatico("PixAutomaticoBankPicker");
  const { banks, bank: selected, recentBank, banksStatus, pending } = context;
  const compact = context.variant === "compact";
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const listId = `${baseId}-list`;
  const optionId = (bank: PixAutomaticoBank) => `${baseId}-${bank.id}`;
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(selected?.id ?? null);
  const [keyboard, setKeyboard] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const send = useRef<HTMLButtonElement>(null);
  const typeahead = useRef({ buffer: "", at: 0 });
  const searching = query.trim() !== "";
  const ready = banksStatus === "ready";

  const results = searching ? searchBanks(banks, query) : [];
  const groups: { label: string; rows: { bank: PixAutomaticoBank; highlight: number }[] }[] =
    searching
      ? [{ label: "Resultados", rows: results }]
      : [
          ...(recentBank
            ? [{ label: "Usado da última vez", rows: [{ bank: recentBank, highlight: -1 }] }]
            : []),
          {
            label: "Bancos",
            rows: banks
              .filter((bank) => bank.id !== recentBank?.id)
              .map((bank) => ({ bank, highlight: -1 })),
          },
        ];
  const visible = groups.flatMap((group) => group.rows.map((row) => row.bank));
  const active = visible.find((bank) => bank.id === activeId) ?? null;

  // Fine pointers land in the search field; coarse pointers on the heading, so the keyboard
  // doesn't cover the list. The same happens when a retried list becomes ready, so focus isn't
  // lost with the error state's buttons.
  const landed = useRef<PixAutomaticoBanksStatus | null>(null);
  useEffect(() => {
    const previous = landed.current;
    landed.current = banksStatus;
    if (previous !== null && (previous === "ready" || banksStatus !== "ready")) return;
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    if (!coarse && search.current && !search.current.disabled) search.current.focus();
    else heading.current?.focus();
  }, [banksStatus]);

  // The result count, 400ms after the last keystroke and only while searching.
  const { announce } = context;
  useEffect(() => {
    if (!searching) {
      announce("");
      return;
    }
    const count = results.length;
    const timer = window.setTimeout(
      () =>
        announce(
          count === 0
            ? "Nenhum banco encontrado"
            : count === 1
              ? "1 banco encontrado"
              : `${count} bancos encontrados`,
        ),
      400,
    );
    return () => window.clearTimeout(timer);
  }, [searching, results.length, announce]);

  useEffect(() => {
    if (banksStatus === "loading") announce("Carregando bancos");
    if (banksStatus === "error") announce("Não deu para carregar a lista de bancos");
  }, [banksStatus, announce]);

  // The fade mask only shows when the list overflows: re-checked after each render (filtering)
  // and when the step resizes.
  const measureOverflow = () => {
    const node = list.current;
    if (node) setOverflowing(node.scrollHeight > node.clientHeight + 1);
  };
  useLayoutEffect(measureOverflow);
  useEffect(() => {
    const node = list.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      setOverflowing(node.scrollHeight > node.clientHeight + 1);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    document.getElementById(`${baseId}-${activeId}`)?.scrollIntoView?.({ block: "nearest" });
  }, [activeId, baseId]);

  const activate = (bank: PixAutomaticoBank | undefined) => {
    if (!bank) return;
    setKeyboard(true);
    setActiveId(bank.id);
    // Selection follows focus; disabled rows are reachable so their reason is read.
    context.selectBank(bank);
  };

  const move = (delta: 1 | -1) => {
    const index = active ? visible.indexOf(active) : -1;
    if (index === -1) {
      const enabled = visible.filter((bank) => !bank.disabled);
      activate(delta === 1 ? enabled[0] : enabled[enabled.length - 1]);
      return;
    }
    activate(visible[Math.min(visible.length - 1, Math.max(0, index + delta))]);
  };

  const commit = () => {
    if (active) context.selectBank(active);
    send.current?.focus();
  };

  const clear = () => {
    setQuery("");
    search.current?.focus();
  };

  const useQr = () => {
    context.setMethod("qr");
    context.closeBankPicker();
  };

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active) commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (query) setQuery("");
      else context.closeBankPicker();
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = visible.filter((bank) => !bank.disabled);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      activate(event.key === "Home" ? enabled[0] : enabled[enabled.length - 1]);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      context.closeBankPicker();
    } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      // Type-ahead: a 500ms buffer; repeating one letter cycles through its matches.
      const now = Date.now();
      const state = typeahead.current;
      state.buffer = now - state.at > 500 ? event.key : state.buffer + event.key;
      state.at = now;
      const needle = fold(state.buffer);
      const cycling = needle.length > 1 && new Set(needle).size === 1;
      const prefix = cycling ? (needle[0] ?? "") : needle;
      const current = active ? enabled.indexOf(active) : -1;
      const start = current === -1 ? 0 : current + (needle.length === 1 || cycling ? 1 : 0);
      const ordered = [...enabled.slice(start), ...enabled.slice(0, start)];
      activate(ordered.find((bank) => fold(bank.name).startsWith(prefix)));
    }
  };

  const sendLabel = pending
    ? "Enviando…"
    : selected
      ? `Enviar para o app ${bankShortName(selected)}`
      : "Escolha um banco";
  const canSend = Boolean(selected) && !pending && ready;
  let position = 0;

  return (
    // biome-ignore lint/a11y/useSemanticElements: the step is a labelled group inside the card, not a fieldset of form inputs.
    <div
      role="group"
      aria-labelledby={headingId}
      aria-busy={pending || undefined}
      data-slot="pix-automatico-bank-picker"
      className={cn(
        "grid min-h-0 min-w-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] [grid-area:1/1]",
        compact ? "gap-2.5" : "gap-3",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-2 motion-safe:duration-240 motion-safe:delay-[60ms] motion-safe:ease-out-quint motion-safe:fill-mode-backwards",
        className,
      )}
      style={style}
      onPointerDown={() => setKeyboard(false)}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Voltar para os termos"
          onClick={context.closeBankPicker}
          className={cn(
            "shrink-0 rounded-md text-muted-foreground [transition:background-color_120ms_ease-out,color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-muted hover:text-foreground active:scale-[0.94] motion-reduce:transition-none motion-reduce:active:scale-100",
            compact ? "size-6" : "size-7",
          )}
        >
          <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </Button>
        <div className="grid min-w-0">
          <h4
            ref={heading}
            id={headingId}
            tabIndex={-1}
            className="m-0 truncate text-[13px]/[18px] font-medium text-foreground outline-none"
          >
            Escolha seu banco
          </h4>
          {!compact ? (
            <p className="m-0 truncate text-[12px]/4 text-subtle-foreground">
              O pedido vai para o app que você escolher.
            </p>
          ) : null}
        </div>
      </div>

      {banksStatus === "error" ? (
        <span />
      ) : (
        <div
          className={cn(
            "flex min-w-0 items-center gap-2 bg-background pr-1.5 pl-[11px] shadow-[inset_0_0_0_1px_var(--border)] [transition:box-shadow_120ms_ease-out] focus-within:shadow-[inset_0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_oklab,var(--ring)_30%,transparent)] motion-reduce:transition-none",
            compact ? "h-8 rounded-lg" : "h-9 rounded-[10px]",
            !ready && "opacity-55",
          )}
        >
          <label htmlFor={`${baseId}-search`} className="sr-only">
            Buscar banco
          </label>
          <Search
            className="size-3.5 shrink-0 text-subtle-foreground"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <Input
            ref={search}
            id={`${baseId}-search`}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active ? optionId(active) : undefined}
            autoComplete="off"
            enterKeyHint="search"
            spellCheck={false}
            placeholder="Buscar banco"
            disabled={!ready}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onSearchKeyDown}
            className="peer h-auto min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-[13px] text-foreground shadow-none outline-none placeholder:text-subtle-foreground focus-visible:border-0 focus-visible:ring-0 disabled:opacity-100 md:text-[13px] dark:bg-transparent [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Limpar busca"
              onClick={clear}
              className="size-6 shrink-0 rounded-md text-subtle-foreground [transition:background-color_120ms_ease-out,color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-muted hover:text-foreground active:scale-[0.94] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      )}

      <div
        ref={list}
        id={listId}
        role="listbox"
        aria-label="Bancos"
        aria-busy={banksStatus === "loading" || undefined}
        aria-activedescendant={active ? optionId(active) : undefined}
        tabIndex={ready && visible.length > 0 ? 0 : -1}
        onKeyDown={onListKeyDown}
        onFocus={() => {
          if (!active && visible.length > 0) setActiveId(selected?.id ?? visible[0]?.id ?? null);
        }}
        className={cn(
          "grid min-h-0 min-w-0 content-start overflow-y-auto overscroll-contain outline-none",
          overflowing && "[mask-image:linear-gradient(black_calc(100%-28px),transparent)]",
          (banksStatus !== "ready" || (searching && results.length === 0)) && "content-center",
        )}
      >
        {banksStatus === "loading" ? (
          <div className="grid gap-1">
            {Array.from({ length: compact ? 3 : 4 }, (_, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed skeleton rows.
                key={index}
                aria-hidden="true"
                className={cn("flex items-center gap-2.5 px-2.5", compact ? "h-10" : "h-11")}
              >
                <span className="size-7 shrink-0 rounded-lg bg-muted" />
                <span className="h-3 w-28 rounded-[4px] bg-[linear-gradient(90deg,var(--muted)_0%,color-mix(in_oklab,var(--muted)_55%,var(--card))_50%,var(--muted)_100%)] bg-size-[200%_100%] motion-safe:animate-skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : banksStatus === "error" ? (
          <div className="grid justify-items-center gap-1 px-3 text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-180">
            <p className="m-0 text-[12.5px]/[18px] font-medium text-destructive-ink">
              Não deu para carregar a lista de bancos.
            </p>
            <p className="m-0 text-[12.5px]/[18px] text-muted-foreground">
              Tente de novo ou use o QR Code.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={useQr}
                className={cn(
                  pillClass,
                  "h-7 gap-1.5 bg-secondary px-3 text-[12px] hover:bg-accent has-[>svg]:px-3",
                )}
              >
                <QrCode className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                Usar QR Code
              </Button>
              {context.onBanksRetry ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={context.onBanksRetry}
                  className={cn(pillClass, "h-7 bg-secondary px-3 text-[12px] hover:bg-accent")}
                >
                  Tentar de novo
                </Button>
              ) : null}
            </div>
          </div>
        ) : searching && results.length === 0 ? (
          <div className="grid justify-items-center gap-2 px-3 text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-180">
            <span
              aria-hidden="true"
              className="mb-1 grid size-10 place-items-center rounded-full bg-muted text-muted-foreground"
            >
              <SearchX className="size-4" strokeWidth={1.75} />
            </span>
            <p className="m-0 text-[13px]/[18px] font-medium text-foreground">
              Nenhum banco encontrado para {quoteQuery(query)}
            </p>
            <p className="m-0 max-w-[280px] text-[12.5px]/[18px] text-muted-foreground">
              Confira o nome ou use o QR Code, que funciona com qualquer banco.
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={clear}
                className={cn(pillClass, "h-7 bg-secondary px-3 text-[12px] hover:bg-accent")}
              >
                Limpar busca
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={useQr}
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
        ) : (
          groups.map((group) => {
            const groupId = `${baseId}-group-${group.label.length}`;
            return (
              // biome-ignore lint/a11y/useSemanticElements: an ARIA group of options inside a listbox; a fieldset can't own options.
              <div
                key={group.label}
                role="group"
                aria-labelledby={groupId}
                className="grid min-w-0"
              >
                <span
                  id={groupId}
                  className="px-2.5 pt-1.5 pb-1 text-[11.5px]/4 font-medium text-subtle-foreground first:pt-0"
                >
                  {group.label}
                </span>
                {group.rows.map(({ bank, highlight }) => {
                  position += 1;
                  const isSelected = bank.id === selected?.id;
                  const isActive = keyboard && bank.id === active?.id;
                  const reasonId = `${optionId(bank)}-reason`;
                  return (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: keys go to the search field or the listbox, which own aria-activedescendant.
                    <div
                      key={bank.id}
                      id={optionId(bank)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={bank.disabled || undefined}
                      aria-describedby={bank.disabled ? reasonId : undefined}
                      aria-setsize={visible.length}
                      aria-posinset={position}
                      tabIndex={-1}
                      data-active={isActive || undefined}
                      onClick={() => {
                        setKeyboard(false);
                        setActiveId(bank.id);
                        context.selectBank(bank);
                      }}
                      className={cn(
                        optionRow,
                        compact
                          ? "h-10 gap-[9px] rounded-lg px-2 pointer-coarse:h-11"
                          : "h-11 gap-2.5 rounded-[10px] px-2.5",
                        "data-active:outline-2 data-active:-outline-offset-2 data-active:outline-primary data-active:outline-solid",
                        bank.disabled
                          ? "cursor-default"
                          : isSelected
                            ? "bg-[color-mix(in_oklab,var(--primary)_6%,var(--card))]"
                            : "hover:bg-muted",
                      )}
                    >
                      <PixAutomaticoBankMark
                        bank={bank}
                        className={cn(bank.disabled && "opacity-60 grayscale")}
                      />
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[13px]/[18px]",
                          bank.disabled
                            ? "font-normal text-subtle-foreground"
                            : "font-medium text-foreground",
                        )}
                      >
                        <Highlight
                          text={bank.name}
                          at={highlight}
                          length={fold(query.trim()).length}
                        />
                      </span>
                      {bank.disabled ? (
                        // Read through aria-describedby, so the option's name stays the bank name.
                        <span
                          id={reasonId}
                          aria-hidden="true"
                          className="shrink-0 text-[11.5px]/4 text-subtle-foreground"
                        >
                          {bank.disabledReason ?? "Indisponível"}
                        </span>
                      ) : (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded-full",
                            isSelected
                              ? "bg-primary text-primary-foreground motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-50 motion-safe:duration-180 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
                              : "shadow-[inset_0_0_0_1.5px_var(--subtle-foreground)]",
                          )}
                        >
                          {isSelected ? <Check className="size-3" strokeWidth={2.6} /> : null}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      <div className="grid min-w-0 gap-2.5">
        <div className="flex min-w-0 items-center justify-between gap-2 text-[12px]/4">
          <span className="text-subtle-foreground">Não achou seu banco?</span>
          <button
            type="button"
            onClick={useQr}
            className="cursor-pointer rounded-sm font-medium text-primary-ink [transition:opacity_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            Usar QR Code
          </button>
        </div>
        <Button
          ref={send}
          type="button"
          data-slot="pix-automatico-bank-send"
          aria-disabled={!canSend || undefined}
          onClick={() => {
            if (canSend) context.sendToBank();
          }}
          className={cn(
            pillClass,
            "h-9 w-full gap-2 bg-primary text-[13px] text-primary-foreground hover:bg-primary",
            canSend ? "hover:brightness-[1.08]" : "cursor-default",
            !canSend && !pending && "opacity-45",
          )}
        >
          {pending ? (
            <LoaderCircle
              className="size-3.5 motion-safe:animate-spin"
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : null}
          <span className="truncate">{sendLabel}</span>
        </Button>
      </div>
    </div>
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
          id={context.waitingTitleId}
          tabIndex={-1}
          className={cn(
            "m-0 grid size-[136px] outline-none animate-in place-items-center justify-self-center rounded-xl bg-white p-2.5 shadow-[0_0_0_1px_var(--border)] delay-120 duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] fill-mode-backwards zoom-in-96 motion-reduce:animate-none [&_img]:size-full [&_svg]:size-full",
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

/**
 * Awaiting in the bank app: a pulsing phone tile badged with the bank, a shimmering title that
 * names it, the QR fallback, and Trocar banco when the consumer passes onChangeBank.
 */
export function PixAutomaticoAppPending({
  className,
  ...props
}: Omit<ComponentProps<"div">, "children">) {
  const context = usePixAutomatico("PixAutomaticoAppPending");
  if (context.status !== "awaiting" || context.method !== "app") return null;
  const compact = context.variant === "compact";
  const { bank } = context;
  const app = bank ? bankShortName(bank) : null;
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
          {bank ? (
            <PixAutomaticoBankMark
              bank={bank}
              size="badge"
              className="absolute -right-2 -bottom-2 z-1 shadow-[0_0_0_2px_var(--card)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-50 motion-safe:duration-180 motion-safe:delay-160 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:fill-mode-backwards"
            />
          ) : null}
        </span>
        <div className="grid min-w-0 gap-1">
          <h4
            id={context.waitingTitleId}
            tabIndex={-1}
            className="m-0 text-[13px]/[18px] font-medium text-foreground outline-none"
          >
            <span className="motion-safe:shimmer-text">
              {app ? `Aguardando confirmação no app ${app}` : "Aguardando confirmação no banco"}
            </span>
          </h4>
          <p className="m-0 text-[12.5px]/[18px] text-muted-foreground">
            {app
              ? `Abra o app ${app} e confirme o Pix Automático. O pedido pode levar alguns minutos para aparecer.`
              : "Enviamos o pedido para o app do seu banco. Pode levar alguns minutos para aparecer."}
          </p>
        </div>
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <span className="text-[11.5px]/4 text-subtle-foreground">Não apareceu?</span>
        <div className="flex flex-wrap justify-end gap-2">
          {context.changeBank ? (
            <Button
              type="button"
              variant="secondary"
              onClick={context.changeBank}
              className={cn(pillClass, "h-7 bg-secondary px-3 text-[12px] hover:bg-accent")}
            >
              Trocar banco
            </Button>
          ) : null}
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
