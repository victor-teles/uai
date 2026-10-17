"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/uai-utils";

export const ROUTE_SUMMARY_VARIANTS = ["card", "plain", "compact"] as const;
export type RouteSummaryVariant = (typeof ROUTE_SUMMARY_VARIANTS)[number];
export const ROUTE_SUMMARY_STOP_KINDS = ["origin", "stop", "destination"] as const;
export type RouteSummaryStopKind = (typeof ROUTE_SUMMARY_STOP_KINDS)[number];
export const ROUTE_SUMMARY_ACTION_EMPHASES = ["primary", "secondary"] as const;
export type RouteSummaryActionEmphasis = (typeof ROUTE_SUMMARY_ACTION_EMPHASES)[number];
export type RouteSummaryProps = ComponentProps<"section"> & { variant?: RouteSummaryVariant };

type SummaryContext = { variant: RouteSummaryVariant };
const Context = createContext<SummaryContext | null>(null);
function useSummary(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within RouteSummary`);
  return context;
}

const routeSummaryVariants = cva(
  "grid min-w-0 content-start text-[13px]/[18px] text-card-foreground",
  {
    variants: {
      variant: {
        card: "w-full max-w-sm gap-4 rounded-[14px] bg-card p-4 shadow-[0_0_0_1px_var(--border)]",
        plain: "w-full max-w-sm gap-4 bg-transparent p-0",
        compact:
          "w-full max-w-xs gap-3 rounded-xl bg-card p-3 text-[12.5px]/[18px] shadow-[0_0_0_1px_var(--border)]",
      },
    },
  },
);

/** A route between places: travel mode, stops, totals, and turn-by-turn steps. */
export function RouteSummary({
  variant = "card",
  "aria-label": label = "Route",
  className,
  ...props
}: RouteSummaryProps) {
  return (
    <Context.Provider value={{ variant }}>
      <section
        data-slot="route-summary"
        aria-label={label}
        className={cn(routeSummaryVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      />
    </Context.Provider>
  );
}

export type RouteSummaryModesProps = Omit<
  ComponentProps<"div">,
  "value" | "defaultValue" | "onChange" | "dir"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type ModesContextValue = { selected: string; select: (value: string) => void };
const ModesContext = createContext<ModesContextValue | null>(null);

function useModes(part: string) {
  const context = useContext(ModesContext);
  if (!context) throw new Error(`${part} must be used within RouteSummaryModes`);
  return context;
}

/** Arrows move focus and selection together, as in an APG radio group. */
function moveRadio(event: KeyboardEvent<HTMLElement>) {
  const radios = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'),
  );
  const index = radios.indexOf(document.activeElement as HTMLButtonElement);
  if (index === -1) return;
  const next = {
    ArrowRight: index + 1,
    ArrowDown: index + 1,
    ArrowLeft: index - 1,
    ArrowUp: index - 1,
    Home: 0,
    End: radios.length - 1,
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  const target = radios[(next + radios.length) % radios.length];
  target?.focus();
  target?.click();
}

/**
 * Single-choice segments are plain radio buttons styled like ToggleGroupItem: ToggleGroup's value
 * is a string on Radix but an array on Base UI, so the group's selection stays in uai state.
 */
const segmentClass = "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10";

/** Travel modes. One is always selected; arrow keys move between them. */
export function RouteSummaryModes({
  value,
  defaultValue = "",
  onValueChange,
  "aria-label": label = "Travel mode",
  onKeyDown,
  className,
  children,
  ...props
}: RouteSummaryModesProps) {
  useSummary("RouteSummaryModes");
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const select = (next: string) => {
    // One mode always stays selected: pressing the selected mode again changes nothing.
    if (next === selected) return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  const ref = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; y: number; width: number; height: number }>();
  useIsomorphicLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => {
      const active = list.querySelector<HTMLElement>(
        "[data-slot=route-summary-mode][aria-checked=true]",
      );
      if (!active || active.offsetWidth === 0) return setThumb(undefined);
      setThumb({
        x: active.offsetLeft,
        y: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
      });
    };
    measure();
    if (typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [selected]);
  return (
    <ModesContext.Provider value={{ selected, select }}>
      <div
        role="radiogroup"
        data-slot="route-summary-modes"
        aria-label={label}
        className={cn(
          "group/modes relative isolate flex w-full gap-1 rounded-full bg-muted p-1",
          className,
        )}
        {...props}
        ref={ref}
        data-ready={thumb ? "" : undefined}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) moveRadio(event);
        }}
      >
        {/* One measured thumb slides between modes; until it is measured the active mode paints itself. */}
        <span
          aria-hidden="true"
          data-slot="route-summary-modes-thumb"
          className="pointer-events-none absolute top-0 left-0 -z-1 rounded-full bg-card opacity-0 shadow-[0_1px_2px_oklch(0_0_0/0.12),0_0_0_1px_var(--border)] transition-[translate,width] duration-240 ease-out-quint group-data-ready/modes:opacity-100 motion-reduce:transition-none"
          style={{
            width: thumb?.width ?? 0,
            height: thumb?.height ?? 0,
            translate: thumb ? `${thumb.x}px ${thumb.y}px` : undefined,
          }}
        />
        {children}
      </div>
    </ModesContext.Provider>
  );
}

export type RouteSummaryModeProps = Omit<ComponentProps<"button">, "value"> & {
  value: string;
  /** Spoken name, for example "Drive, 18 minutes". */
  label: string;
};

/** Pass the mode icon and its duration as children. */
export function RouteSummaryMode({
  value,
  label,
  onClick,
  className,
  ...props
}: RouteSummaryModeProps) {
  const context = useSummary("RouteSummaryMode");
  const modes = useModes("RouteSummaryMode");
  const checked = modes.selected === value;
  return (
    // biome-ignore lint/a11y/useSemanticElements: a segment button in a radio group; ToggleGroupItem renders the same role="radio" button.
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      data-slot="route-summary-mode"
      data-state={checked ? "on" : "off"}
      aria-label={label}
      title={label}
      className={cn(
        toggleVariants(),
        segmentClass,
        "h-auto min-w-0 flex-1 gap-1.5 rounded-full! border-0 bg-transparent font-medium text-subtle-foreground tabular-nums shadow-none transition-[color,scale] duration-[120ms,140ms] ease-[ease-out,cubic-bezier(0.23,1,0.32,1)] hover:bg-transparent hover:text-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-[0_1px_2px_oklch(0_0_0/0.12),0_0_0_1px_var(--border)] group-data-ready/modes:data-[state=on]:bg-transparent group-data-ready/modes:data-[state=on]:shadow-none motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:stroke-[1.75]",
        context.variant === "compact"
          ? "min-h-6 px-2 text-[11.5px]/4 [&_svg:not([class*='size-'])]:size-3.5"
          : "min-h-7 px-2.5 text-[12px]/4 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
      tabIndex={checked || modes.selected === "" ? 0 : -1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) modes.select(value);
      }}
    />
  );
}

/** Totals for the selected mode. */
export function RouteSummaryOverview({ className, ...props }: ComponentProps<"div">) {
  useSummary("RouteSummaryOverview");
  return (
    <div
      data-slot="route-summary-overview"
      className={cn("flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1", className)}
      {...props}
    />
  );
}

export function RouteSummaryDuration({ className, ...props }: ComponentProps<"p">) {
  const context = useSummary("RouteSummaryDuration");
  return (
    <p
      data-slot="route-summary-duration"
      className={cn(
        "m-0 font-semibold text-foreground tabular-nums tracking-[-0.015em]",
        context.variant === "compact" ? "text-[17px]/[22px]" : "text-[22px]/7",
        className,
      )}
      {...props}
    />
  );
}

/** Distance, arrival time, or traffic, as muted text after the duration. */
export function RouteSummaryDetail({ className, ...props }: ComponentProps<"p">) {
  useSummary("RouteSummaryDetail");
  return (
    <p
      data-slot="route-summary-detail"
      className={cn(
        "m-0 text-[12px]/4 text-muted-foreground tabular-nums data-[tone=warning]:text-warning-ink data-[tone=success]:text-success-ink",
        className,
      )}
      {...props}
    />
  );
}

export function RouteSummaryStops({
  "aria-label": label = "Stops",
  className,
  ...props
}: ComponentProps<"ol">) {
  useSummary("RouteSummaryStops");
  return (
    <ol
      data-slot="route-summary-stops"
      aria-label={label}
      className={cn("m-0 grid list-none gap-0 p-0", className)}
      {...props}
    />
  );
}

export type RouteSummaryStopProps = ComponentProps<"li"> & { kind?: RouteSummaryStopKind };

/** A waypoint on the rail. The first stop is the origin and the last is the destination. */
export function RouteSummaryStop({
  kind = "stop",
  className,
  children,
  ...props
}: RouteSummaryStopProps) {
  const context = useSummary("RouteSummaryStop");
  const compact = context.variant === "compact";
  return (
    <li
      data-slot="route-summary-stop"
      data-kind={kind}
      className={cn(
        "relative grid min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-x-2.5 text-foreground not-last:pb-3 not-last:after:absolute not-last:after:top-1/2 not-last:after:bottom-[calc(-50%+12px)] not-last:after:left-[7.5px] not-last:after:border-l-[1.5px] not-last:after:border-dotted not-last:after:border-border-strong",
        compact &&
          "not-last:pb-2 not-last:after:top-[calc(50%+2px)] not-last:after:bottom-[calc(-50%+10px)]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mx-auto rounded-full",
          kind === "origin" && "size-2.5 shadow-[inset_0_0_0_2.5px_var(--foreground)]",
          kind === "stop" && "size-2 bg-muted-foreground",
          kind === "destination" &&
            "size-3 bg-primary shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_22%,transparent)]",
        )}
      />
      <span className="min-w-0 truncate">{children}</span>
    </li>
  );
}

export type RouteSummaryStepsProps = ComponentProps<"ol">;

/** Turn-by-turn directions, in order. */
export function RouteSummarySteps({
  "aria-label": label = "Directions",
  className,
  ...props
}: RouteSummaryStepsProps) {
  useSummary("RouteSummarySteps");
  return (
    <ol
      data-slot="route-summary-steps"
      aria-label={label}
      className={cn("m-0 grid list-none gap-0 border-t p-0 pt-1", className)}
      {...props}
    />
  );
}

export type RouteSummaryStepProps = ComponentProps<"li"> & {
  /** Distance or time until the next step, for example "0.3 mi". */
  distance?: string;
};

/** One maneuver. Pass a direction icon followed by the instruction. */
export function RouteSummaryStep({
  distance,
  className,
  children,
  ...props
}: RouteSummaryStepProps) {
  const context = useSummary("RouteSummaryStep");
  const id = useId();
  return (
    <li
      data-slot="route-summary-step"
      aria-describedby={distance ? id : undefined}
      className={cn(
        "flex min-w-0 items-center gap-2.5 border-b border-border/60 text-foreground last:border-b-0 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:stroke-[1.75] [&>svg]:text-muted-foreground",
        context.variant === "compact" ? "min-h-8 py-1" : "min-h-10 py-1.5",
        className,
      )}
      {...props}
    >
      {children}
      {distance && (
        <span
          id={id}
          className="ml-auto shrink-0 pl-2 text-[11.5px]/4 text-subtle-foreground tabular-nums"
        >
          {distance}
        </span>
      )}
    </li>
  );
}

export function RouteSummaryActions({ className, ...props }: ComponentProps<"div">) {
  useSummary("RouteSummaryActions");
  return (
    <div
      data-slot="route-summary-actions"
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

const routeSummaryActionVariants = cva(
  "h-auto gap-1.5 rounded-full border-0 py-0 shadow-none transition-[scale,background-color,filter] duration-140 ease-out-quint focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        card: "min-h-8 px-3.5 text-[13px]/4 has-[>svg]:px-3",
        plain: "min-h-8 px-3.5 text-[13px]/4 has-[>svg]:px-3",
        compact: "min-h-7 px-3 text-[12px]/4 has-[>svg]:px-2.5",
      },
      emphasis: {
        primary: "bg-primary text-primary-foreground hover:bg-primary hover:brightness-[1.08]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
      },
    },
  },
);

export type RouteSummaryActionProps = ComponentProps<"button"> & {
  emphasis?: RouteSummaryActionEmphasis;
};

/** Use the primary emphasis once, usually for Start. */
export function RouteSummaryAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: RouteSummaryActionProps) {
  const context = useSummary("RouteSummaryAction");
  return (
    <Button
      data-slot="route-summary-action"
      type={type}
      variant={emphasis === "primary" ? "default" : "secondary"}
      className={cn(routeSummaryActionVariants({ variant: context.variant, emphasis }), className)}
      {...props}
    />
  );
}
