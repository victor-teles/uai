"use client";

import { cva } from "class-variance-authority";
import { Check, FoldVertical, LoaderCircle, Undo2 } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NumberTick } from "@/lib/uai-number-tick";
import { cn } from "@/lib/uai-utils";

/** `bar` first: it is the full card. `ring` sits in a composer and `compact` in sidebars and headers. */
export const CONTEXT_METER_VARIANTS = ["bar", "ring", "compact"] as const;
export const CONTEXT_METER_STATUSES = ["idle", "compacting", "compacted"] as const;

export type ContextMeterVariant = (typeof CONTEXT_METER_VARIANTS)[number];
export type ContextMeterStatus = (typeof CONTEXT_METER_STATUSES)[number];
export type ContextMeterLevel = "empty" | "normal" | "warning" | "full";
export type ContextMeterSegment = { id: string; label: string; tokens: number };

/** Compact English token counts: 980, 76.4k, 200k, 1.2M. */
export function formatTokenCount(tokens: number) {
  const trim = (value: number) => value.toFixed(1).replace(/\.0$/, "");
  if (Math.abs(tokens) >= 1_000_000) return `${trim(tokens / 1_000_000)}M`;
  if (Math.abs(tokens) >= 1_000) return `${trim(tokens / 1_000)}k`;
  return String(Math.round(tokens));
}

const fullNumber = new Intl.NumberFormat("en-US");

export type ContextMeterProps = Omit<ComponentProps<"div">, "children"> & {
  variant?: ContextMeterVariant;
  /** Tokens in the context window now. */
  used: number;
  /** The model's context window. */
  limit: number;
  /** What the used tokens are made of, in order. Their sum should equal `used`. */
  segments?: readonly ContextMeterSegment[];
  /** Fraction at which the meter turns warning. */
  warnAt?: number;
  /** Fraction at which the meter turns full. */
  fullAt?: number;
  /** Fraction at which the consumer summarizes older turns automatically, for the hint. */
  autoCompactAt?: number;
  status?: ContextMeterStatus;
  /** Tokens the last compaction freed, drawn as a hatched region after the used tokens. */
  freed?: number;
  /** The segment that compaction summarizes. Defaults to the last segment. */
  compactSegment?: string;
  formatTokens?: (tokens: number) => string;
  onCompact?: () => void;
  onUndoCompact?: () => void;
  children?: ReactNode;
};

type ContextMeterContextValue = {
  variant: ContextMeterVariant;
  used: number;
  limit: number;
  percent: number;
  level: ContextMeterLevel;
  segments: readonly ContextMeterSegment[];
  warnAt: number;
  fullAt: number;
  autoCompactAt: number | undefined;
  status: ContextMeterStatus;
  freed: number | undefined;
  compactSegment: string | undefined;
  format: (tokens: number) => string;
  valueText: string;
  pulse: number;
  onCompact: (() => void) | undefined;
  onUndoCompact: (() => void) | undefined;
};

const ContextMeterContext = createContext<ContextMeterContextValue | null>(null);

function useContextMeter(name: string) {
  const context = useContext(ContextMeterContext);
  if (!context) throw new Error(`${name} must be used within ContextMeter`);
  return context;
}

const LEVEL_ORDER: Record<ContextMeterLevel, number> = { empty: 0, normal: 0, warning: 1, full: 2 };

export function ContextMeter({
  variant = "bar",
  used,
  limit,
  segments = [],
  warnAt = 0.8,
  fullAt = 0.95,
  autoCompactAt,
  status = "idle",
  freed,
  compactSegment,
  formatTokens = formatTokenCount,
  onCompact,
  onUndoCompact,
  children,
  className,
  ...props
}: ContextMeterProps) {
  const ratio = limit > 0 ? Math.min(1, Math.max(0, used / limit)) : 0;
  const percent = Math.round(ratio * 100);
  const level: ContextMeterLevel =
    used <= 0 ? "empty" : ratio >= fullAt ? "full" : ratio >= warnAt ? "warning" : "normal";
  const valueText = `${fullNumber.format(used)} of ${fullNumber.format(limit)} tokens, ${percent} percent`;

  // Announce once per upward crossing, never on the way down or on every render.
  const previousLevel = useRef(level);
  const previousStatus = useRef(status);
  const [announcement, setAnnouncement] = useState("");
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const before = previousLevel.current;
    previousLevel.current = level;
    if (LEVEL_ORDER[level] > LEVEL_ORDER[before]) {
      const hint =
        autoCompactAt !== undefined
          ? ` Older turns will be summarized at ${Math.round(autoCompactAt * 100)}%.`
          : "";
      setAnnouncement(`Context ${percent}% full.${hint}`);
      setPulse((count) => count + 1);
    }
  }, [level, percent, autoCompactAt]);
  useEffect(() => {
    const before = previousStatus.current;
    previousStatus.current = status;
    if (before === status) return;
    if (status === "compacting") setAnnouncement("Compacting conversation");
    if (status === "compacted")
      setAnnouncement(
        freed === undefined ? "Compacted." : `Compacted. Freed ${fullNumber.format(freed)} tokens.`,
      );
  }, [status, freed]);

  const value: ContextMeterContextValue = {
    variant,
    used,
    limit,
    percent,
    level,
    segments,
    warnAt,
    fullAt,
    autoCompactAt,
    status,
    freed,
    compactSegment: compactSegment ?? segments.at(-1)?.id,
    format: formatTokens,
    valueText,
    pulse,
    onCompact,
    onUndoCompact,
  };

  const live = (
    <span role="status" className="sr-only">
      {announcement}
    </span>
  );

  if (variant === "bar") {
    return (
      <ContextMeterContext.Provider value={value}>
        <section
          data-slot="context-meter"
          data-variant={variant}
          data-level={level}
          data-status={status}
          className={cn(
            "grid w-full min-w-0 gap-3.5 rounded-[14px] border border-border bg-card p-4 text-[13px]/[18px] text-card-foreground",
            className,
          )}
          {...(props as ComponentProps<"section">)}
        >
          {children}
          {live}
        </section>
      </ContextMeterContext.Provider>
    );
  }

  return (
    <ContextMeterContext.Provider value={value}>
      <Popover>
        <div
          data-slot="context-meter"
          data-variant={variant}
          data-level={level}
          data-status={status}
          className={cn("relative inline-flex shrink-0 items-center", className)}
          {...props}
        >
          {/* One meter per instance: the trigger carries the name, this carries the value. */}
          {/* biome-ignore lint/a11y/useSemanticElements: matches the bar's styled meter so both variants read alike. */}
          <span
            role="meter"
            aria-label="Context window"
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={Math.min(used, limit)}
            aria-valuetext={valueText}
            className="sr-only"
          />
          {children}
          {live}
        </div>
      </Popover>
    </ContextMeterContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Ring and trigger
 * -----------------------------------------------------------------------------------------------*/

export type ContextMeterRingProps = Omit<ComponentProps<"svg">, "children">;

/** An 18px ring (14px in compact): the value against a strong-border track, colored only by state. */
export function ContextMeterRing({ className, ...props }: ContextMeterRingProps) {
  const context = useContextMeter("ContextMeterRing");
  const value = context.level === "empty" ? 0 : context.percent;
  return (
    <svg
      data-slot="context-meter-ring"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "-rotate-90 fill-none",
        context.variant === "compact" ? "size-3.5" : "size-[18px]",
        className,
      )}
      {...props}
    >
      <circle cx="10" cy="10" r="7.5" strokeWidth="2.5" className="stroke-border-strong" />
      {value > 0 ? (
        <circle
          cx="10"
          cy="10"
          r="7.5"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${value} 100`}
          className={cn(
            "[transition:stroke-dasharray_300ms_cubic-bezier(0.23,1,0.32,1),stroke_240ms_ease-out] motion-reduce:transition-none",
            context.level === "full"
              ? "stroke-destructive"
              : context.level === "warning"
                ? "stroke-warning"
                : "stroke-foreground",
          )}
        />
      ) : null}
    </svg>
  );
}

const triggerVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center border-0 font-medium tabular-nums [transition:background-color_120ms_ease-out,color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        bar: "",
        ring: "h-7 gap-1.5 rounded-lg bg-transparent py-0 pr-2 pl-1.5 text-[11.5px] text-muted-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground has-[>svg]:pr-2 has-[>svg]:pl-1.5",
        compact:
          "h-6 gap-1.5 rounded-full bg-muted py-0 pr-2.5 pl-1.5 text-[11.5px] text-muted-foreground hover:bg-muted hover:text-foreground has-[>svg]:pr-2.5 has-[>svg]:pl-1.5",
      },
      level: {
        empty: "",
        normal: "",
        warning: "",
        full: "",
      },
    },
    compoundVariants: [
      {
        variant: "compact",
        level: "warning",
        className: "bg-warning/14 text-warning-ink hover:bg-warning/14 hover:text-warning-ink",
      },
      {
        variant: "compact",
        level: "full",
        className:
          "bg-destructive/14 text-destructive-ink hover:bg-destructive/14 hover:text-destructive-ink",
      },
    ],
  },
);

export type ContextMeterTriggerProps = ComponentProps<"button">;

/**
 * Ring and compact: a 28px ghost button (a 24px tinted pill in compact) with the ring and the
 * percent. It opens the breakdown in a Popover. Renders nothing in the bar variant.
 */
export function ContextMeterTrigger({ className, children, ...props }: ContextMeterTriggerProps) {
  const context = useContextMeter("ContextMeterTrigger");
  if (context.variant === "bar") return null;
  const label = `Context: ${context.percent}% used`;
  return (
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        data-slot="context-meter-trigger"
        aria-label={label}
        className={cn(
          triggerVariants({ variant: context.variant, level: context.level }),
          context.level === "warning" && "text-warning-ink",
          context.level === "full" && "text-destructive-ink",
          className,
        )}
        {...props}
      >
        <span
          key={context.pulse}
          aria-hidden="true"
          className={cn(
            "grid place-items-center rounded-full",
            context.pulse > 0 &&
              "motion-safe:animate-ring-pulse motion-safe:[animation-iteration-count:1]",
          )}
        >
          <ContextMeterRing />
        </span>
        {children ?? (
          <span>
            {context.percent}%
            {context.variant === "compact" && context.level === "full" ? " · Full" : null}
          </span>
        )}
      </Button>
    </PopoverTrigger>
  );
}

export type ContextMeterContentProps = ComponentProps<"div">;

/**
 * The breakdown. In ring and compact it is a 300px Popover that opens above the trigger; in bar
 * its children render in the card.
 */
export function ContextMeterContent({ className, children, ...props }: ContextMeterContentProps) {
  const context = useContextMeter("ContextMeterContent");
  if (context.variant === "bar") return <>{children}</>;
  return (
    <PopoverContent
      side="top"
      align="end"
      sideOffset={8}
      data-slot="context-meter-content"
      aria-label="Context window"
      className={cn(
        "grid w-[300px] max-w-[calc(100vw-24px)] origin-bottom-right gap-3 rounded-[14px] border-0 bg-popover p-3.5 text-[13px]/[18px] text-popover-foreground shadow-[0_0_0_1px_var(--border-strong),0_16px_32px_-12px_oklch(0_0_0/0.32),0_4px_8px_-4px_oklch(0_0_0/0.12)] data-[side=bottom]:slide-in-from-top-0 data-[side=top]:slide-in-from-bottom-0 data-[state=open]:zoom-in-96 data-open:zoom-in-96 data-[state=open]:duration-180 data-open:duration-180 data-[state=open]:ease-[cubic-bezier(0.16,1,0.3,1)] data-open:ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:zoom-out-96 data-closed:zoom-out-96 motion-reduce:zoom-in-100 motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      {children}
    </PopoverContent>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Header, summary, status
 * -----------------------------------------------------------------------------------------------*/

export function ContextMeterHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="context-meter-header"
      className={cn("flex min-w-0 items-center justify-between gap-3", className)}
      {...props}
    />
  );
}

export function ContextMeterTitle({ children, className, ...props }: ComponentProps<"h3">) {
  const context = useContextMeter("ContextMeterTitle");
  return (
    <h3
      data-slot="context-meter-title"
      className={cn("m-0 text-[13px]/[18px] font-medium text-foreground", className)}
      {...props}
    >
      {children ?? (context.variant === "bar" ? "Context" : "Context window")}
    </h3>
  );
}

/** Bar: the big numeral and "of 200k tokens · 84%". Ring and compact: "76.4k / 200k". */
export function ContextMeterSummary({
  className,
  ...props
}: Omit<ComponentProps<"p">, "children">) {
  const context = useContextMeter("ContextMeterSummary");
  const used = context.format(context.used);
  const limit = context.format(context.limit);
  if (context.variant !== "bar") {
    return (
      <p
        data-slot="context-meter-summary"
        className={cn("m-0 text-[12px]/4 text-subtle-foreground tabular-nums", className)}
        {...props}
      >
        <NumberTick value={used} /> / {limit}
      </p>
    );
  }
  return (
    <p
      data-slot="context-meter-summary"
      className={cn("m-0 flex min-w-0 flex-wrap items-baseline gap-x-1.5", className)}
      {...props}
    >
      <span className="text-[24px]/7 font-semibold tracking-[-0.01em] text-foreground tabular-nums">
        <NumberTick value={used} />
      </span>
      <span className="text-[12px]/4 text-subtle-foreground tabular-nums">
        of {limit} tokens · <NumberTick value={`${context.percent}%`} />
      </span>
    </p>
  );
}

/** Nearing limit / Full / Compacting / Compacted. Renders nothing in the normal state. */
export function ContextMeterStatus({ className, children, ...props }: ComponentProps<"span">) {
  const context = useContextMeter("ContextMeterStatus");
  const kind =
    context.status === "compacting"
      ? "compacting"
      : context.status === "compacted"
        ? "compacted"
        : context.level === "full"
          ? "full"
          : context.level === "warning"
            ? "warning"
            : null;
  if (!kind) return null;
  return (
    <Badge
      key={kind}
      variant="secondary"
      data-slot="context-meter-status"
      data-kind={kind}
      className={cn(
        "h-6 shrink-0 animate-in gap-1.5 rounded-full border-0 px-2.5 py-0 text-[11.5px] font-medium duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] fade-in-0 zoom-in-96 motion-reduce:animate-none",
        kind === "warning" && "bg-warning/14 text-warning-ink",
        kind === "full" && "bg-destructive/14 text-destructive-ink",
        kind === "compacting" && "bg-muted text-muted-foreground",
        kind === "compacted" && "bg-success/14 text-success-ink",
        className,
      )}
      {...props}
    >
      {kind === "compacting" ? (
        <LoaderCircle
          className="size-3 motion-safe:animate-spin"
          strokeWidth={2}
          aria-hidden="true"
        />
      ) : kind === "compacted" ? (
        <Check className="size-3" strokeWidth={2.2} aria-hidden="true" />
      ) : (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      )}
      {children ??
        (kind === "warning" ? (
          "Nearing limit"
        ) : kind === "full" ? (
          "Full"
        ) : kind === "compacting" ? (
          <span className="shimmer-text">Compacting</span>
        ) : (
          "Compacted"
        ))}
    </Badge>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Bar and legend
 * -----------------------------------------------------------------------------------------------*/

/** Tonal ink, never hue: 88, 62, 42 and 26% foreground, cycling. */
const TONES = ["bg-foreground/88", "bg-foreground/62", "bg-foreground/42", "bg-foreground/26"];
/** Segment stagger: 40ms each, first six only. */
const STAGGER = [
  "delay-0",
  "delay-[40ms]",
  "delay-[80ms]",
  "delay-[120ms]",
  "delay-[160ms]",
  "delay-[200ms]",
];

/**
 * The stacked 8px bar. Each segment is a full-width layer scaled from the left to where it ends,
 * so value changes animate `transform` only; 2px card-colored separators mark the boundaries.
 * Threshold ticks sit at `warnAt` and `fullAt`, and the freed region is hatched after compaction.
 */
export function ContextMeterBar({ className, ...props }: Omit<ComponentProps<"div">, "children">) {
  const context = useContextMeter("ContextMeterBar");
  const { limit } = context;
  const meter = context.variant === "bar";
  let end = 0;
  const layers = context.segments.map((segment, index) => {
    end += Math.max(0, segment.tokens);
    return { segment, index, end: limit > 0 ? Math.min(1, end / limit) : 0 };
  });
  const usedEnd = limit > 0 ? Math.min(1, context.used / limit) : 0;
  const freedWidth =
    context.status === "compacted" && context.freed && limit > 0
      ? Math.min(1 - usedEnd, context.freed / limit)
      : 0;
  return (
    <div
      data-slot="context-meter-bar"
      className={cn("relative h-2 w-full", className)}
      {...(meter
        ? {
            role: "meter",
            "aria-label": "Context window",
            "aria-valuemin": 0,
            "aria-valuemax": limit,
            "aria-valuenow": Math.min(context.used, limit),
            "aria-valuetext": context.valueText,
          }
        : { "aria-hidden": true })}
      {...props}
    >
      <div className="absolute inset-0 isolate overflow-hidden rounded-full bg-muted">
        {layers.map(({ segment, index, end: layerEnd }) => {
          const shimmering =
            context.status === "compacting" && segment.id === context.compactSegment;
          return (
            <span
              key={segment.id}
              data-segment={segment.id}
              className={cn(
                "absolute inset-0 origin-left [transition:transform_300ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                STAGGER[Math.min(index, STAGGER.length - 1)],
                shimmering
                  ? "bg-[linear-gradient(90deg,color-mix(in_oklab,var(--foreground)_26%,transparent),color-mix(in_oklab,var(--foreground)_55%,transparent),color-mix(in_oklab,var(--foreground)_26%,transparent))] bg-size-[200%_100%] motion-safe:animate-shimmer"
                  : TONES[index % TONES.length],
              )}
              style={{ transform: `scaleX(${layerEnd})`, zIndex: layers.length - index }}
            />
          );
        })}
        {layers.slice(0, -1).map(({ segment, end: layerEnd }) => (
          <span
            key={`gap-${segment.id}`}
            className="absolute inset-0 z-20 [transition:transform_300ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(${layerEnd * 100}%)` }}
          >
            <span className="absolute inset-y-0 -left-0.5 w-0.5 bg-card" />
          </span>
        ))}
        {freedWidth > 0 ? (
          <span
            data-slot="context-meter-freed-region"
            className="absolute inset-y-0 z-10 animate-in rounded-r-full bg-[repeating-linear-gradient(135deg,color-mix(in_oklab,var(--success)_30%,transparent)_0_2px,transparent_2px_5px)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--success)_45%,transparent)] delay-120 duration-240 fade-in-0 fill-mode-both motion-reduce:animate-none"
            style={{ left: `${usedEnd * 100}%`, width: `${freedWidth * 100}%` }}
          />
        ) : null}
      </div>
      {context.level !== "empty" && context.level !== "normal"
        ? [context.warnAt, context.fullAt].map((at) => (
            <span
              key={at}
              aria-hidden="true"
              className="absolute -top-[3px] h-3.5 w-px bg-border-strong"
              style={{ left: `${at * 100}%` }}
            />
          ))
        : null}
    </div>
  );
}

/** One row per segment, then Free. Each row reads "Files, 18,700 tokens, 9 percent". */
export function ContextMeterLegend({
  className,
  ...props
}: Omit<ComponentProps<"ul">, "children">) {
  const context = useContextMeter("ContextMeterLegend");
  if (context.level === "empty") {
    return (
      <p
        data-slot="context-meter-legend"
        className={cn("m-0 text-[12px]/4 text-subtle-foreground", className)}
      >
        Nothing in context yet
      </p>
    );
  }
  const free = Math.max(0, context.limit - context.used);
  const pct = (tokens: number) =>
    context.limit > 0 ? Math.round((tokens / context.limit) * 100) : 0;
  const rows = [
    ...context.segments.map((segment, index) => ({
      id: segment.id,
      label: segment.label,
      tokens: segment.tokens,
      swatch: TONES[index % TONES.length] ?? "",
    })),
    {
      id: "free",
      label: "Free",
      tokens: free,
      swatch: "bg-muted shadow-[inset_0_0_0_1px_var(--border-strong)]",
    },
  ];
  return (
    <ul
      data-slot="context-meter-legend"
      className={cn("m-0 grid list-none gap-[7px] p-0", className)}
      {...props}
    >
      {rows.map((row) => (
        <li
          key={row.id}
          className="grid grid-cols-[8px_minmax(0,1fr)_auto_30px] items-center gap-2 text-[12px]/4 text-muted-foreground"
        >
          <span aria-hidden="true" className={cn("size-2 rounded-[2px]", row.swatch)} />
          <span className="sr-only">
            {`${row.label}, ${fullNumber.format(row.tokens)} tokens, ${pct(row.tokens)} percent`}
          </span>
          <span aria-hidden="true" className="truncate">
            {row.label}
          </span>
          <span aria-hidden="true" className="text-right font-medium text-foreground tabular-nums">
            <NumberTick value={context.format(row.tokens)} />
          </span>
          <span aria-hidden="true" className="text-right text-subtle-foreground tabular-nums">
            {pct(row.tokens)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Actions row: hint, compacting caption, freed line, Compact now and Undo
 * -----------------------------------------------------------------------------------------------*/

export function ContextMeterActions({ className, ...props }: ComponentProps<"div">) {
  const context = useContextMeter("ContextMeterActions");
  return (
    <div
      data-slot="context-meter-actions"
      className={cn(
        context.variant === "bar"
          ? "flex min-w-0 items-center justify-between gap-2.5"
          : "grid min-w-0 justify-items-start gap-2.5 border-t border-border pt-3",
        className,
      )}
      {...props}
    />
  );
}

/**
 * "Summarizes older turns at 90%." (popover: "Older turns are summarized automatically at 90%.").
 * Shows only when `autoCompactAt` is set and nothing is compacting or compacted.
 */
export function ContextMeterHint({ className, children, ...props }: ComponentProps<"p">) {
  const context = useContextMeter("ContextMeterHint");
  if (context.status !== "idle") return null;
  if (children === undefined && context.autoCompactAt === undefined) return null;
  const at = Math.round((context.autoCompactAt ?? 0) * 100);
  return (
    <p
      data-slot="context-meter-hint"
      className={cn("m-0 text-[11.5px]/4 text-subtle-foreground", className)}
      {...props}
    >
      {children ??
        (context.variant === "bar"
          ? `Summarizes older turns at ${at}%.`
          : `Older turns are summarized automatically at ${at}%.`)}
    </p>
  );
}

/** The consumer's caption while compacting, for example "Summarizing 38 earlier turns…". */
export function ContextMeterCompacting({ className, children, ...props }: ComponentProps<"p">) {
  const context = useContextMeter("ContextMeterCompacting");
  if (context.status !== "compacting") return null;
  return (
    <p
      data-slot="context-meter-compacting"
      className={cn("m-0 text-[12px]/4 shimmer-text", className)}
      {...props}
    >
      {children ?? "Summarizing earlier turns…"}
    </p>
  );
}

/** After compaction: "Freed 61.8k tokens" plus the consumer's detail, such as "38 turns → 1 summary". */
export function ContextMeterFreed({ className, children, ...props }: ComponentProps<"p">) {
  const context = useContextMeter("ContextMeterFreed");
  if (context.status !== "compacted" || context.freed === undefined) return null;
  return (
    <p
      data-slot="context-meter-freed"
      className={cn(
        "m-0 animate-in text-[11.5px]/4 text-subtle-foreground duration-240 fade-in-0 motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <span className="font-medium text-success-ink">
        Freed <NumberTick value={context.format(context.freed)} /> tokens
      </span>
      {children ? <> · {children}</> : null}
    </p>
  );
}

const actionClass =
  "h-7 shrink-0 gap-1.5 rounded-full border-0 bg-secondary px-3 text-[12px] font-medium text-foreground [transition:background-color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-accent focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] has-[>svg]:px-3 motion-reduce:transition-none motion-reduce:active:scale-100";

/** "Compact now": renders when `onCompact` is set and nothing is compacting or compacted. */
export function ContextMeterCompactAction({
  className,
  children,
  onClick,
  ...props
}: ComponentProps<"button">) {
  const context = useContextMeter("ContextMeterCompactAction");
  if (!context.onCompact || context.status !== "idle" || context.level === "empty") return null;
  return (
    <Button
      type="button"
      data-slot="context-meter-compact"
      className={cn(actionClass, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.onCompact?.();
      }}
      {...props}
    >
      <FoldVertical className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      {children ?? "Compact now"}
    </Button>
  );
}

/** "Undo": renders only after compaction, and only when `onUndoCompact` is set. */
export function ContextMeterUndoAction({
  className,
  children,
  onClick,
  ...props
}: ComponentProps<"button">) {
  const context = useContextMeter("ContextMeterUndoAction");
  if (!context.onUndoCompact || context.status !== "compacted") return null;
  return (
    <Button
      type="button"
      data-slot="context-meter-undo"
      className={cn(actionClass, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.onUndoCompact?.();
      }}
      {...props}
    >
      <Undo2 className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      {children ?? "Undo"}
    </Button>
  );
}
