"use client";

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
  style,
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
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          gap: variant === "compact" ? 10 : 16,
          padding: variant === "compact" ? 12 : 18,
          border: "1px solid var(--uai-border)",
          borderRadius: variant === "compact" ? 12 : 14,
          background: "var(--uai-surface)",
          color: "var(--uai-text)",
          fontSize: 13,
          minWidth: 0,
          ...style,
        }}
      >
        {children}
      </div>
    </Context.Provider>
  );
}
export function DateRangePickerInputs({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "flex", flexWrap: "wrap", gap: 10, ...style }} />;
}
export function DateRangePickerInput({
  boundary,
  children,
  style,
  onChange,
  ...props
}: Omit<ComponentProps<"input">, "value" | "defaultValue" | "type" | "min" | "max" | "id"> & {
  boundary: "start" | "end";
}) {
  const context = useRange();
  const id = `${context.id}-${boundary}`;
  return (
    <label htmlFor={id} style={{ display: "grid", flex: "1 1 120px", gap: 6, minWidth: 0 }}>
      {children ?? (boundary === "start" ? "Start date" : "End date")}
      <input
        {...props}
        id={id}
        type="date"
        value={context.value[boundary]}
        disabled={context.disabled || props.disabled}
        min={boundary === "end" ? context.value.start || context.min : context.min}
        max={context.max}
        style={{
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          padding: 8,
          border: "1px solid var(--uai-border-strong)",
          borderRadius: 8,
          background: "transparent",
          color: "inherit",
          font: "inherit",
          ...style,
        }}
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
    </label>
  );
}
export function DateRangePickerBody({ style, ...props }: ComponentProps<"div">) {
  const context = useRange();
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexDirection: context.variant === "split" ? "row" : "column",
        flexWrap: "wrap",
        gap: 16,
        ...style,
      }}
    />
  );
}
export function DateRangePickerPresets({ style, ...props }: ComponentProps<"div">) {
  const context = useRange();
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexDirection: context.variant === "split" ? "column" : "row",
        flexWrap: "wrap",
        gap: 6,
        ...style,
      }}
    />
  );
}
export function DateRangePickerPreset({
  value,
  onClick,
  style,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: DateRange }) {
  const context = useRange();
  const selected = value.start === context.value.start && value.end === context.value.end;
  const allowed =
    inBounds(value.start, context.min, context.max) &&
    inBounds(value.end, context.min, context.max) &&
    value.start <= value.end;
  return (
    <button
      {...props}
      type="button"
      aria-pressed={selected}
      disabled={context.disabled || !allowed || props.disabled}
      style={{
        padding: "6px 10px",
        border: "1px solid var(--uai-border)",
        borderRadius: 8,
        background: selected ? "var(--uai-text)" : "transparent",
        color: selected ? "var(--uai-surface)" : "inherit",
        fontSize: 12,
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.change(value);
      }}
    />
  );
}
export function DateRangePickerCalendar({
  locale = "en-US",
  style,
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
    <div {...props} ref={ref} style={{ flex: "1 1 210px", minWidth: 0, ...style }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <button
          type="button"
          aria-label="Previous month"
          disabled={context.disabled || Boolean(context.min && month <= context.min.slice(0, 7))}
          onClick={() => navigate(moveMonth(`${month}-01`, -1), false)}
          style={monthButton}
        >
          <ChevronLeft size={14} aria-hidden="true" />
        </button>
        <span id={titleId} aria-live="polite" style={{ fontWeight: 550 }}>
          {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(first)}
        </span>
        <button
          type="button"
          aria-label="Next month"
          disabled={context.disabled || Boolean(context.max && month >= context.max.slice(0, 7))}
          onClick={() => navigate(moveMonth(`${month}-01`, 1), false)}
          style={monthButton}
        >
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
      <table
        aria-labelledby={titleId}
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 2,
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, day) => (
              <th
                scope="col"
                key={moveDate("2026-09-06", day)}
                style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: "var(--uai-muted)",
                  paddingBottom: 6,
                }}
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
                const unavailable = context.disabled || !inBounds(date, context.min, context.max);
                return (
                  <td key={date} style={{ padding: 0 }}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      data-date={date}
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
                      style={{
                        width: "100%",
                        minHeight: context.variant === "compact" ? 28 : 32,
                        padding: 0,
                        border: 0,
                        borderRadius: endpoint ? 8 : 4,
                        background: endpoint
                          ? "var(--uai-text)"
                          : selected
                            ? "var(--uai-surface-raised)"
                            : "transparent",
                        color: endpoint
                          ? "var(--uai-surface)"
                          : date.slice(0, 7) !== month
                            ? "var(--uai-muted)"
                            : "var(--uai-text)",
                        opacity: unavailable ? 0.3 : 1,
                        fontSize: 12,
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
const monthButton = {
  display: "grid",
  placeItems: "center",
  width: 28,
  height: 28,
  border: "1px solid var(--uai-border)",
  borderRadius: 8,
  background: "transparent",
  color: "inherit",
};
export function DateRangePickerSummary({ style, ...props }: ComponentProps<"p">) {
  const context = useRange();
  return (
    <p
      role="status"
      {...props}
      style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12, ...style }}
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
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useRange();
  return (
    <button
      {...props}
      type="button"
      disabled={context.disabled || !context.value.start || props.disabled}
      style={{
        justifySelf: "start",
        border: 0,
        background: "transparent",
        color: "inherit",
        padding: "6px 0",
        textDecoration: "underline",
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.change({ start: "", end: "" });
      }}
    >
      {children}
    </button>
  );
}
