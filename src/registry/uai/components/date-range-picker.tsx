"use client";

import { cva } from "class-variance-authority";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/uai-utils";

export const DATE_RANGE_PICKER_VARIANTS = ["card", "split", "compact"] as const;
export type DateRangePickerVariant = (typeof DATE_RANGE_PICKER_VARIANTS)[number];
/** Local calendar dates in YYYY-MM-DD format; no UTC conversion. */
export type DateRange = { start: string; end: string };
export type DateRangePickerProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  variant?: DateRangePickerVariant;
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
};
function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function parseDate(value: string) {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  return new Date(year, month - 1, day, 12);
}
function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && dateKey(parseDate(value)) === value;
}
function inBounds(value: string, min?: string, max?: string) {
  return validDate(value) && (!min || value >= min) && (!max || value <= max);
}
function clampDate(value: string, min?: string, max?: string) {
  return min && value < min ? min : max && value > max ? max : value;
}
function moveDate(value: string, days: number) {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}
function moveMonth(value: string, months: number) {
  const date = parseDate(value);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, last));
  return dateKey(date);
}
type RangeContext = {
  id: string;
  variant: DateRangePickerVariant;
  value: DateRange;
  change: (value: DateRange) => void;
  min?: string;
  max?: string;
  disabled: boolean;
};
const Context = createContext<RangeContext | null>(null);
const dateRangePickerVariants = cva(
  "grid min-w-0 border bg-card text-[13px]/[18px] text-card-foreground",
  {
    variants: {
      variant: {
        card: "gap-3.5 rounded-[14px] p-4",
        split: "gap-3.5 rounded-[14px] p-4",
        compact: "gap-2.5 rounded-xl p-3",
      },
    },
  },
);
const focusRing =
  "focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";
// Shared ghost treatment for presets, month navigation, and the clear button. The neutral
// hover, ring and pointer-event resets replace the Button/Toggle base so only enabled
// controls react and disabled ones keep the not-allowed cursor.
const ghostButton = cn(
  "cursor-pointer border-0 bg-transparent text-muted-foreground [transition:background-color_120ms_ease-out,color_120ms_ease-out,scale_140ms_var(--ease-out-quint)] hover:bg-transparent hover:text-muted-foreground enabled:hover:bg-accent enabled:hover:text-foreground enabled:active:scale-[0.97] focus-visible:ring-0 focus-visible:outline-solid disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none dark:hover:bg-transparent",
  focusRing,
);
function useRange() {
  const context = useContext(Context);
  if (!context) throw new Error("DateRangePicker children must be used within DateRangePicker");
  return context;
}
export function DateRangePicker({
  variant = "card",
  value,
  defaultValue = { start: "", end: "" },
  onValueChange,
  min,
  max,
  disabled = false,
  children,
  className,
  ...props
}: DateRangePickerProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  if ((min && !validDate(min)) || (max && !validDate(max)) || (min && max && min > max))
    throw new Error("DateRangePicker requires valid, ordered YYYY-MM-DD bounds");
  const range = value ?? internal;
  const change = (next: DateRange) => {
    if (
      disabled ||
      (next.start && !inBounds(next.start, min, max)) ||
      (next.end && (!next.start || !inBounds(next.end, min, max) || next.end < next.start))
    )
      return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <Context.Provider value={{ id, variant, value: range, change, min, max, disabled }}>
      <div
        data-slot="date-range-picker"
        className={cn(dateRangePickerVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </div>
    </Context.Provider>
  );
}
export function DateRangePickerInputs({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="date-range-picker-inputs"
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  );
}
export function DateRangePickerInput({
  boundary,
  children,
  className,
  onChange,
  ...props
}: Omit<ComponentProps<"input">, "value" | "defaultValue" | "type" | "min" | "max" | "id"> & {
  boundary: "start" | "end";
}) {
  const context = useRange();
  const id = `${context.id}-${boundary}`;
  const compact = context.variant === "compact";
  return (
    <Label
      htmlFor={id}
      data-slot="date-range-picker-input-label"
      className="grid min-w-0 flex-[1_1_120px] items-stretch gap-1.5 text-xs/4 font-medium text-muted-foreground select-auto"
    >
      {children ?? (boundary === "start" ? "Start date" : "End date")}
      <Input
        data-slot="date-range-picker-input"
        className={cn(
          "box-border w-full min-w-0 border border-border bg-background px-2.5 py-0 font-normal text-foreground tabular-nums shadow-none transition-[border-color,box-shadow] duration-120 ease-[ease-out] enabled:hover:not-focus:border-border-strong focus:border-border-strong focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_24%,transparent)] focus:outline-none focus-visible:border-border-strong focus-visible:ring-0 disabled:pointer-events-auto disabled:opacity-100 motion-reduce:transition-none dark:bg-background [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-55",
          compact
            ? "h-[30px] rounded-lg text-[12.5px] md:text-[12.5px]"
            : "h-[34px] rounded-[10px] text-[13px] md:text-[13px]",
          className,
        )}
        {...props}
        id={id}
        type="date"
        value={context.value[boundary]}
        disabled={context.disabled || props.disabled}
        min={boundary === "end" ? context.value.start || context.min : context.min}
        max={context.max}
        onChange={(event) => {
          onChange?.(event);
          if (event.defaultPrevented) return;
          const date = event.target.value;
          if (boundary === "start")
            context.change({
              start: date,
              end: !date || date > context.value.end ? "" : context.value.end,
            });
          else context.change({ ...context.value, end: date });
        }}
      />
    </Label>
  );
}
export function DateRangePickerBody({ className, ...props }: ComponentProps<"div">) {
  const context = useRange();
  return (
    <div
      data-slot="date-range-picker-body"
      className={cn(
        "flex flex-wrap",
        context.variant === "split" ? "flex-row" : "flex-col",
        context.variant === "compact" ? "gap-2.5" : "gap-3.5",
        className,
      )}
      {...props}
    />
  );
}
export function DateRangePickerPresets({ className, ...props }: ComponentProps<"div">) {
  const context = useRange();
  return (
    <div
      data-slot="date-range-picker-presets"
      className={cn(
        "flex flex-wrap",
        context.variant === "split"
          ? "min-w-[120px] flex-col gap-0.5 border-r pr-3"
          : "flex-row gap-1",
        className,
      )}
      {...props}
    />
  );
}
export function DateRangePickerPreset({
  value,
  onClick,
  className,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: DateRange }) {
  const context = useRange();
  const selected = value.start === context.value.start && value.end === context.value.end;
  const allowed =
    inBounds(value.start, context.min, context.max) &&
    inBounds(value.end, context.min, context.max) &&
    value.start <= value.end;
  return (
    <Toggle
      data-slot="date-range-picker-preset"
      className={cn(
        ghostButton,
        "h-7 min-w-0 justify-start px-3 text-left text-[12.5px] font-medium whitespace-nowrap aria-pressed:bg-accent aria-pressed:text-foreground data-[state=on]:bg-accent data-[state=on]:text-foreground",
        context.variant === "split" ? "rounded-lg" : "rounded-full",
        className,
      )}
      {...props}
      type="button"
      pressed={selected}
      disabled={context.disabled || !allowed || props.disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.change(value);
      }}
    />
  );
}
export function DateRangePickerCalendar({
  locale = "en-US",
  className,
  ...props
}: ComponentProps<"div"> & { locale?: string }) {
  const context = useRange();
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(() =>
    clampDate(context.value.start || dateKey(new Date()), context.min, context.max),
  );
  const [month, setMonth] = useState(focused.slice(0, 7));
  useEffect(() => {
    if (context.value.start && inBounds(context.value.start, context.min, context.max)) {
      setFocused(context.value.start);
      setMonth(context.value.start.slice(0, 7));
    }
  }, [context.value.start, context.min, context.max]);
  const first = parseDate(`${month}-01`);
  const gridStart = moveDate(`${month}-01`, -first.getDay());
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const navigate = (next: string, focus: boolean) => {
    const target = clampDate(next, context.min, context.max);
    setFocused(target);
    setMonth(target.slice(0, 7));
    if (focus)
      requestAnimationFrame(() =>
        ref.current?.querySelector<HTMLButtonElement>(`[data-date="${target}"]`)?.focus(),
      );
  };
  const select = (date: string) => {
    if (!context.value.start || context.value.end || date < context.value.start)
      context.change({ start: date, end: "" });
    else context.change({ start: context.value.start, end: date });
  };
  return (
    <div
      data-slot="date-range-picker-calendar"
      className={cn("min-w-0 flex-[1_1_210px]", className)}
      {...props}
      ref={ref}
    >
      <div className="mb-2 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Previous month"
          disabled={context.disabled || Boolean(context.min && month <= context.min.slice(0, 7))}
          onClick={() => navigate(moveMonth(`${month}-01`, -1), false)}
          className={monthButton}
        >
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        </Button>
        <span id={titleId} aria-live="polite" className="font-medium">
          {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(first)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Next month"
          disabled={context.disabled || Boolean(context.max && month >= context.max.slice(0, 7))}
          onClick={() => navigate(moveMonth(`${month}-01`, 1), false)}
          className={monthButton}
        >
          <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </Button>
      </div>
      <table
        aria-labelledby={titleId}
        className="w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-0.5"
      >
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, day) => (
              <th
                scope="col"
                key={moveDate("2026-09-06", day)}
                className="pb-1 text-[11px] font-normal text-subtle-foreground"
              >
                {new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
                  parseDate(moveDate("2026-09-06", day)),
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => (
            <tr key={moveDate(gridStart, week * 7)}>
              {Array.from({ length: 7 }, (_, day) => {
                const date = moveDate(gridStart, week * 7 + day);
                const selected = Boolean(
                  context.value.start &&
                    date >= context.value.start &&
                    date <= (context.value.end || context.value.start),
                );
                const endpoint = date === context.value.start || date === context.value.end;
                const ranged = Boolean(
                  context.value.end && context.value.end !== context.value.start,
                );
                const isStart = date === context.value.start;
                const isEnd = date === (context.value.end || context.value.start);
                const roundStart = !selected || (ranged ? isStart || day === 0 : true);
                const roundEnd = !selected || (ranged ? isEnd || day === 6 : true);
                const unavailable = context.disabled || !inBounds(date, context.min, context.max);
                return (
                  <td key={date} className="p-0">
                    <button
                      type="button"
                      aria-pressed={selected}
                      data-date={date}
                      data-endpoint={endpoint || undefined}
                      className={cn(
                        "block w-full cursor-pointer border-0 p-0 text-[12.5px] tabular-nums transition-colors duration-120 ease-[ease-out] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none",
                        focusRing,
                        context.variant === "compact" ? "min-h-7" : "min-h-8",
                        roundStart && "rounded-l-lg",
                        roundEnd && "rounded-r-lg",
                        endpoint
                          ? "bg-primary font-medium text-primary-foreground"
                          : cn(
                              "font-normal aria-[current=date]:font-semibold aria-[current=date]:text-primary",
                              selected
                                ? "bg-primary/16 enabled:hover:bg-primary/26"
                                : "bg-transparent enabled:hover:bg-accent",
                              date.slice(0, 7) !== month
                                ? "text-subtle-foreground"
                                : "text-foreground",
                            ),
                      )}
                      aria-label={formatter.format(parseDate(date))}
                      aria-current={date === dateKey(new Date()) ? "date" : undefined}
                      tabIndex={date === focused ? 0 : -1}
                      disabled={unavailable}
                      onFocus={() => setFocused(date)}
                      onClick={() => select(date)}
                      onKeyDown={(event) => {
                        const offsets: Record<string, number> = {
                          ArrowLeft: -1,
                          ArrowRight: 1,
                          ArrowUp: -7,
                          ArrowDown: 7,
                          Home: -parseDate(date).getDay(),
                          End: 6 - parseDate(date).getDay(),
                        };
                        let next: string;
                        if (event.key in offsets) next = moveDate(date, offsets[event.key] ?? 0);
                        else if (event.key === "PageUp" || event.key === "PageDown")
                          next = moveMonth(
                            date,
                            (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1),
                          );
                        else return;
                        event.preventDefault();
                        navigate(next, true);
                      }}
                    >
                      {parseDate(date).getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const monthButton = cn(ghostButton, "grid size-7 place-items-center rounded-lg p-0");
export function DateRangePickerSummary({ className, ...props }: ComponentProps<"p">) {
  const context = useRange();
  return (
    <p
      role="status"
      data-slot="date-range-picker-summary"
      className={cn("m-0 text-xs/4 text-subtle-foreground tabular-nums", className)}
      {...props}
    >
      {!context.value.start
        ? "Choose a start date."
        : !context.value.end
          ? `${context.value.start} selected. Choose an end date.`
          : `${context.value.start} to ${context.value.end}`}
    </p>
  );
}
export function DateRangePickerClear({
  children = "Clear dates",
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useRange();
  return (
    <Button
      data-slot="date-range-picker-clear"
      variant="ghost"
      className={cn(
        ghostButton,
        "-ml-3 h-7 justify-self-start rounded-full px-3 py-0 text-[12.5px] font-medium has-[>svg]:px-3",
        className,
      )}
      {...props}
      type="button"
      disabled={context.disabled || !context.value.start || props.disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.change({ start: "", end: "" });
      }}
    >
      {children}
    </Button>
  );
}
