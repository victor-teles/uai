"use client";

import { cva } from "class-variance-authority";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { NumberTick } from "@/lib/uai-number-tick";
import { cn } from "@/lib/uai-utils";

export const METRIC_CARD_VARIANTS = ["card", "plain", "compact"] as const;
export type MetricCardVariant = (typeof METRIC_CARD_VARIANTS)[number];
export type MetricCardTrendDirection = "up" | "down" | "flat";
export type MetricCardTrendSentiment = "positive" | "negative" | "neutral";
/** Set `aria-busy` while the figure loads: every part renders a skeleton at its real geometry. */
export type MetricCardProps = ComponentProps<"div"> & { variant?: MetricCardVariant };

type MetricContext = {
  labelId: string;
  variant: MetricCardVariant;
  loading: boolean;
  sentiment: MetricCardTrendSentiment | null;
  setSentiment: (sentiment: MetricCardTrendSentiment | null) => void;
  /** The chart point being scrubbed, shown in place of the comparison. */
  scrub: string | null;
  setScrub: (text: string | null) => void;
};
const Context = createContext<MetricContext | null>(null);
function useMetric(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within MetricCard`);
  return context;
}
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Stand-ins for `--success-ink` / `--destructive-ink` until the ink tokens land.
const successInk = "text-[color-mix(in_oklab,var(--success)_75%,var(--foreground))]";
const destructiveInk = "text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]";
const skeleton =
  "block rounded-[4px] bg-[linear-gradient(90deg,var(--muted)_0%,color-mix(in_oklab,var(--muted)_55%,var(--card))_50%,var(--muted)_100%)] bg-size-[200%_100%] motion-safe:animate-skeleton-shimmer";

const metricCardVariants = cva(
  "relative grid min-w-0 content-start overflow-hidden text-[13px]/[18px] text-card-foreground",
  {
    variants: {
      variant: {
        card: "gap-1 rounded-[14px] border bg-card p-4",
        plain: "gap-1 overflow-visible bg-transparent p-0",
        compact: "gap-1 rounded-xl border bg-card p-3",
      },
    },
  },
);

export function MetricCard({
  variant = "card",
  className,
  children,
  "aria-busy": ariaBusy,
  ...props
}: MetricCardProps) {
  const labelId = useId();
  const [sentiment, setSentiment] = useState<MetricCardTrendSentiment | null>(null);
  const [scrub, setScrub] = useState<string | null>(null);
  const loading = ariaBusy === true || ariaBusy === "true";
  return (
    <Context.Provider
      value={{ labelId, variant, loading, sentiment, setSentiment, scrub, setScrub }}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: a fieldset is for form controls; this labels a metric summary. */}
      <div
        role="group"
        aria-labelledby={labelId}
        aria-busy={ariaBusy}
        data-slot="metric-card"
        data-variant={variant}
        className={cn(
          metricCardVariants({ variant }),
          variant !== "plain" &&
            "transition-[border-color] duration-120 ease-out motion-reduce:transition-none pointer-fine:has-[[data-slot=metric-card-chart]:hover]:border-border-strong",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

export function MetricCardLabel({ className, children, ...props }: ComponentProps<"span">) {
  const context = useMetric("MetricCardLabel");
  return (
    <span
      data-slot="metric-card-label"
      className={cn(
        "text-[12.5px]/4 font-medium text-muted-foreground",
        context.variant === "compact" && "text-xs/4",
        className,
      )}
      {...props}
      id={context.labelId}
    >
      {context.loading ? (
        <>
          <span className="sr-only">{children}</span>
          <span aria-hidden="true" className={cn(skeleton, "my-0.75 h-2.5 w-30 max-w-full")} />
        </>
      ) : (
        children
      )}
    </span>
  );
}

/** Ticks a plain-text value with NumberTick; other children render as given. */
function tickable(children: ReactNode) {
  return typeof children === "string" || typeof children === "number" ? (
    <NumberTick value={String(children)} />
  ) : (
    children
  );
}

/** The figure. Put a unit in `<span data-unit>` to set it 15px muted beside the number. */
export function MetricCardValue({ className, children, ...props }: ComponentProps<"p">) {
  const context = useMetric("MetricCardValue");
  const compact = context.variant === "compact";
  if (context.loading) {
    return (
      <p data-slot="metric-card-value" aria-hidden="true" className={cn("m-0", className)}>
        <span
          className={cn(skeleton, compact ? "mt-2 mb-1 h-5 w-24" : "mt-2.75 mb-1.25 h-6 w-33")}
        />
      </p>
    );
  }
  return (
    <p
      data-slot="metric-card-value"
      className={cn(
        "m-0 mt-1.5 flex flex-wrap items-baseline gap-x-2 font-semibold tabular-nums wrap-anywhere",
        compact
          ? "text-xl/[26px] tracking-[-0.015em] [&_[data-unit]]:text-[13px]"
          : "text-[28px]/[34px] tracking-[-0.025em] [&_[data-unit]]:text-[15px]",
        "[&_[data-unit]]:font-medium [&_[data-unit]]:tracking-normal [&_[data-unit]]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {tickable(children)}
    </p>
  );
}

const trendIcons = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight };
const trendWords = { up: "Increased", down: "Decreased", flat: "Unchanged" };

const metricCardTrendVariants = cva(
  "w-fit gap-0.75 rounded-full border-0 py-0.5 pr-2 pl-1.25 text-[11.5px]/4 font-medium tabular-nums transition-[background-color,color] duration-200 ease-out-quint motion-reduce:transition-none [&>svg]:size-[13px]",
  {
    variants: {
      sentiment: {
        positive: cn("bg-success/14", successInk),
        negative: cn("bg-destructive/14", destructiveInk),
        neutral: "bg-foreground/7 text-muted-foreground",
      },
    },
  },
);

export function MetricCardTrend({
  direction,
  sentiment = direction === "up" ? "positive" : direction === "down" ? "negative" : "neutral",
  className,
  children,
  ...props
}: ComponentProps<"span"> & {
  direction: MetricCardTrendDirection;
  sentiment?: MetricCardTrendSentiment;
}) {
  const context = useMetric("MetricCardTrend");
  const { setSentiment } = context;
  useIsomorphicLayoutEffect(() => {
    setSentiment(sentiment);
    return () => setSentiment(null);
  }, [sentiment, setSentiment]);
  if (context.loading) {
    return (
      <span
        data-slot="metric-card-trend"
        aria-hidden="true"
        className={cn(skeleton, "h-4.5 w-12 rounded-full")}
      />
    );
  }
  const Icon = trendIcons[direction];
  return (
    <Badge
      variant="secondary"
      data-slot="metric-card-trend"
      data-direction={direction}
      data-sentiment={sentiment}
      className={cn(metricCardTrendVariants({ sentiment }), className)}
      {...props}
    >
      <Icon size={13} className="size-[13px]" strokeWidth={2} aria-hidden="true" />
      <span className="sr-only">{trendWords[direction]} </span>
      {tickable(children)}
    </Badge>
  );
}

/** The comparison line. While the chart is scrubbed it shows the scrubbed point instead. */
export function MetricCardComparison({ className, children, ...props }: ComponentProps<"p">) {
  const context = useMetric("MetricCardComparison");
  if (context.loading) {
    return (
      <p data-slot="metric-card-comparison" aria-hidden="true" className={cn("m-0", className)}>
        <span className={cn(skeleton, "my-1 h-2.25 w-27.5 max-w-full")} />
      </p>
    );
  }
  return (
    <p
      data-slot="metric-card-comparison"
      className={cn("m-0 grid text-[12px]/4 text-subtle-foreground tabular-nums", className)}
      {...props}
    >
      <span
        key={context.scrub ?? "comparison"}
        className="[grid-area:1/1] animate-in fade-in-0 duration-120 ease-out motion-reduce:animate-none"
      >
        {context.scrub ?? children}
      </span>
    </p>
  );
}

export function MetricCardDescription({ className, ...props }: ComponentProps<"p">) {
  const context = useMetric("MetricCardDescription");
  if (context.loading) return null;
  return (
    <p
      data-slot="metric-card-description"
      className={cn("m-0 mt-1 text-[12.5px]/[18px] text-muted-foreground", className)}
      {...props}
    />
  );
}

export function MetricCardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="metric-card-header"
      className={cn("flex flex-wrap items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

const chartTone: Record<MetricCardTrendSentiment, string> = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-muted-foreground/70",
};
const WIDTH = 280;

export type MetricCardChartProps = Omit<ComponentProps<"div">, "children"> & {
  /** The series, oldest first. An empty series draws a flat dashed baseline. */
  data: number[];
  /** A one-line summary for assistive tech, for example "MRR rose from $31k to $48k since April". */
  label: string;
  /** Text for each point, shown in place of the comparison while that point is scrubbed. */
  pointLabels?: string[];
  /** Defaults to the sentiment of the card's trend badge. */
  sentiment?: MetricCardTrendSentiment;
};

/**
 * A sparkline under the figure. It bleeds to the card edges, draws in once when it scrolls
 * into view, and can be scrubbed with a fine pointer or with ← → when focused.
 */
export function MetricCardChart({
  data,
  label,
  pointLabels,
  sentiment,
  className,
  ...props
}: MetricCardChartProps) {
  const context = useMetric("MetricCardChart");
  const tone = sentiment ?? context.sentiment ?? "neutral";
  const compact = context.variant === "compact";
  const height = compact ? 36 : 56;
  const gradientId = useId();
  const [index, setIndex] = useState<number | null>(null);
  const [keyboard, setKeyboard] = useState(false);
  const [phase, setPhase] = useState<"rest" | "waiting" | "drawing" | "drawn">("rest");
  const ref = useRef<HTMLDivElement>(null);
  const { setScrub } = context;

  // Draw in once, the first time the chart is 30% in view. Reduced motion renders at rest.
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setPhase("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setPhase("drawing");
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The area and end dot follow once the line has drawn (480ms, the data-viz exception).
  useEffect(() => {
    if (phase !== "drawing") return;
    const timer = window.setTimeout(() => setPhase("drawn"), 480);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const empty = data.length < 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = 4;
  const points = data.map((value, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * (WIDTH - 12),
    y: max === min ? height / 2 : pad + (1 - (value - min) / (max - min)) * (height - pad * 2 - 4),
  }));
  const line = points
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const last = points.at(-1);
  const active = index === null ? null : points[index];

  function scrubTo(next: number | null) {
    setIndex(next);
    setScrub(next === null ? null : (pointLabels?.[next] ?? null));
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || empty) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * WIDTH;
    let nearest = 0;
    for (const [i, p] of points.entries()) {
      if (Math.abs(p.x - x) < Math.abs((points[nearest]?.x ?? 0) - x)) nearest = i;
    }
    setKeyboard(false);
    scrubTo(nearest);
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (empty) return;
    const step = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    if (!step && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? data.length - 1
          : Math.min(Math.max((index ?? data.length - 1) + step, 0), data.length - 1);
    setKeyboard(true);
    scrubTo(next);
  }

  if (context.loading) {
    return (
      <div
        data-slot="metric-card-chart"
        aria-hidden="true"
        className={cn(skeleton, "mt-3 rounded-md opacity-60", compact ? "h-7" : "h-11", className)}
      />
    );
  }
  return (
    <>
      <div
        ref={ref}
        role="img"
        aria-label={label}
        tabIndex={empty ? undefined : 0}
        data-slot="metric-card-chart"
        data-sentiment={tone}
        data-state={phase}
        className={cn(
          "relative block outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid",
          context.variant === "plain"
            ? "mt-2.5"
            : compact
              ? "-mx-3 mt-2 -mb-3 rounded-b-xl"
              : "-mx-4 mt-2.5 -mb-4 rounded-b-[14px]",
          chartTone[tone],
          className,
        )}
        style={{ height }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => scrubTo(null)}
        onBlur={() => scrubTo(null)}
        onKeyDown={onKeyDown}
        {...props}
      >
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${WIDTH} ${height}`}
          preserveAspectRatio="none"
          className="block size-full overflow-visible"
        >
          {empty ? (
            <line
              x1="0"
              x2={WIDTH}
              y1={height - 12}
              y2={height - 12}
              stroke="var(--border-strong)"
              strokeDasharray="2 3"
              vectorEffect="non-scaling-stroke"
            />
          ) : (
            <>
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
                <clipPath id={`${gradientId}-draw`}>
                  <rect
                    width={WIDTH}
                    height={height}
                    className={cn(
                      "origin-left [transform-box:fill-box]",
                      phase === "waiting" && "scale-x-0",
                      phase === "drawing" && "motion-safe:animate-grow-x",
                    )}
                  />
                </clipPath>
              </defs>
              {tone !== "neutral" && (
                <path
                  d={`${line} V${height} H0 Z`}
                  fill={`url(#${gradientId})`}
                  className={cn(
                    "transition-opacity duration-240 ease-out-quint motion-reduce:transition-none",
                    (phase === "waiting" || phase === "drawing") && "opacity-0",
                  )}
                />
              )}
              <path
                d={line}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                clipPath={`url(#${gradientId}-draw)`}
              />
              {active && (
                <line
                  x1={active.x}
                  x2={active.x}
                  y1="0"
                  y2={height}
                  stroke="var(--border-strong)"
                  strokeDasharray="2 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </>
          )}
        </svg>
        {!empty && (active ?? last) && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute size-1.5 -translate-1/2 rounded-full border-2 border-current bg-card",
              !active &&
                "shadow-[0_0_0_4px_color-mix(in_oklab,currentColor_25%,transparent)] transition-opacity duration-200 ease-out-quint motion-reduce:transition-none",
              !active && (phase === "waiting" || phase === "drawing") && "opacity-0",
              active && "text-foreground",
            )}
            style={{
              left: `${(((active ?? last)?.x ?? 0) / WIDTH) * 100}%`,
              top: (active ?? last)?.y,
            }}
          />
        )}
      </div>
      {keyboard && (
        <span className="sr-only" aria-live="polite">
          {index === null ? "" : (pointLabels?.[index] ?? String(data[index]))}
        </span>
      )}
    </>
  );
}
