"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useState } from "react";

export const CALENDAR_VIEW_VARIANTS = ["card", "plain", "compact"] as const;
export type CalendarViewVariant = (typeof CALENDAR_VIEW_VARIANTS)[number];
export const CALENDAR_VIEW_MODES = ["month", "week", "day"] as const;
export type CalendarViewMode = (typeof CALENDAR_VIEW_MODES)[number];
export type CalendarViewEvent = {
  id: string;
  title: string;
  /** Local start time. */
  start: Date;
  /** Local end time. */
  end?: Date;
  allDay?: boolean;
};
export type CalendarViewProps = ComponentProps<"section"> & {
  variant?: CalendarViewVariant;
  view?: CalendarViewMode;
  defaultView?: CalendarViewMode;
  onViewChange?: (view: CalendarViewMode) => void;
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  /** The local day shown as today. Pass a fixed date to avoid hydration mismatches. */
  today?: Date;
  weekStartsOn?: 0 | 1;
  locale?: string;
};

type CalendarContext = {
  id: string;
  variant: CalendarViewVariant;
  view: CalendarViewMode;
  setView: (view: CalendarViewMode) => void;
  date: Date;
  setDate: (date: Date) => void;
  today: Date;
  weekStartsOn: 0 | 1;
  locale: string;
};
const Context = createContext<CalendarContext | null>(null);
function useCalendar(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within CalendarView`);
  return context;
}

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function startOfWeek(date: Date, weekStartsOn: 0 | 1) {
  return addDays(date, -((date.getDay() - weekStartsOn + 7) % 7));
}
function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function eventsOn(events: readonly CalendarViewEvent[], day: Date) {
  const start = startOfDay(day).getTime();
  const end = addDays(day, 1).getTime();
  return events
    .filter((event) => {
      const from = event.start.getTime();
      const to = (event.end ?? event.start).getTime();
      return from < end && (to > start || (to === from && from >= start));
    })
    .sort(
      (a, b) =>
        Number(Boolean(b.allDay)) - Number(Boolean(a.allDay)) ||
        a.start.getTime() - b.start.getTime(),
    );
}

export function CalendarView({
  variant = "card",
  view,
  defaultView = "month",
  onViewChange,
  date,
  defaultDate,
  onDateChange,
  today,
  weekStartsOn = 0,
  locale = "en-US",
  style,
  children,
  ...props
}: CalendarViewProps) {
  const id = useId();
  const [now] = useState(() => startOfDay(today ?? new Date()));
  const [internalView, setInternalView] = useState(defaultView);
  const [internalDate, setInternalDate] = useState(() =>
    startOfDay(defaultDate ?? today ?? new Date()),
  );
  const context: CalendarContext = {
    id,
    variant,
    view: view ?? internalView,
    setView: (next) => {
      if (view === undefined) setInternalView(next);
      onViewChange?.(next);
    },
    date: startOfDay(date ?? internalDate),
    setDate: (next) => {
      if (date === undefined) setInternalDate(startOfDay(next));
      onDateChange?.(startOfDay(next));
    },
    today: today ? startOfDay(today) : now,
    weekStartsOn,
    locale,
  };
  return (
    <Context.Provider value={context}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-view={context.view}
        style={{
          display: "grid",
          gap: variant === "compact" ? 8 : 12,
          minWidth: 0,
          padding: variant === "card" ? 14 : 0,
          border: variant === "card" ? "1px solid var(--uai-border)" : 0,
          borderRadius: 14,
          background: variant === "card" ? "var(--uai-surface)" : "transparent",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function CalendarViewHeader({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
        ...style,
      }}
    />
  );
}

export function CalendarViewTitle({ style, children, ...props }: ComponentProps<"h3">) {
  const context = useCalendar("CalendarViewTitle");
  const { date, view, locale, weekStartsOn } = context;
  let label: string;
  if (view === "month") {
    label = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
  } else if (view === "day") {
    label = new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date);
  } else {
    const start = startOfWeek(date, weekStartsOn);
    label = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).formatRange(start, addDays(start, 6));
  }
  return (
    <h3
      {...props}
      id={`${context.id}-title`}
      aria-live="polite"
      style={{
        margin: 0,
        fontSize: context.variant === "compact" ? 13 : 14,
        lineHeight: "20px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {children ?? label}
    </h3>
  );
}

function controlStyle(variant: CalendarViewVariant) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: variant === "compact" ? 24 : 28,
    height: variant === "compact" ? 24 : 28,
    padding: variant === "compact" ? "0 10px" : "0 12px",
    border: 0,
    borderRadius: 999,
    fontSize: variant === "compact" ? 12 : 12.5,
    fontWeight: 500,
    cursor: "pointer",
  } as const;
}
const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";
const press =
  "[transition:background-color_120ms_ease-out,color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] motion-reduce:transition-none motion-reduce:active:scale-100";
// Ghost icon button and secondary pill, per the shared button rules.
const ghostClass = `bg-transparent text-[var(--uai-muted)] hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] ${press}`;
const secondaryClass = `bg-[var(--uai-surface-raised)] text-[var(--uai-text)] hover:bg-[color-mix(in_oklab,var(--uai-surface-raised)_85%,var(--uai-text))] ${press}`;

export function CalendarViewNavigation({ style, ...props }: ComponentProps<"div">) {
  const context = useCalendar("CalendarViewNavigation");
  const step = (direction: 1 | -1) => {
    const { date, view } = context;
    if (view === "month")
      context.setDate(new Date(date.getFullYear(), date.getMonth() + direction, 1));
    else context.setDate(addDays(date, direction * (view === "week" ? 7 : 1)));
  };
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would add form semantics to calendar navigation buttons.
    <div
      role="group"
      aria-label="Calendar navigation"
      {...props}
      style={{ display: "flex", alignItems: "center", gap: 2, ...style }}
    >
      <button
        type="button"
        aria-label={`Previous ${context.view}`}
        onClick={() => step(-1)}
        className={ghostClass}
        style={{ ...controlStyle(context.variant), padding: 0, borderRadius: 8 }}
      >
        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => context.setDate(context.today)}
        className={secondaryClass}
        style={{ ...controlStyle(context.variant), marginInline: 2 }}
      >
        Today
      </button>
      <button
        type="button"
        aria-label={`Next ${context.view}`}
        onClick={() => step(1)}
        className={ghostClass}
        style={{ ...controlStyle(context.variant), padding: 0, borderRadius: 8 }}
      >
        <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}

export function CalendarViewModes({ style, ...props }: ComponentProps<"div">) {
  const context = useCalendar("CalendarViewModes");
  return (
    // biome-ignore lint/a11y/useSemanticElements: the layout buttons are a toggle group, not a form fieldset.
    <div
      role="group"
      aria-label="Calendar layout"
      {...props}
      style={{
        position: "relative",
        isolation: "isolate",
        display: "inline-grid",
        gridTemplateColumns: `repeat(${CALENDAR_VIEW_MODES.length}, minmax(0, 1fr))`,
        padding: 2,
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        ...style,
      }}
    >
      {/* One thumb slides under the active layout instead of each button repainting. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          zIndex: -1,
          top: 2,
          bottom: 2,
          left: 2,
          width: `calc((100% - 4px) / ${CALENDAR_VIEW_MODES.length})`,
          borderRadius: 999,
          background: "var(--uai-surface)",
          boxShadow: "0 0 0 1px var(--uai-border), 0 1px 2px oklch(0 0 0 / 0.08)",
          transform: `translateX(${CALENDAR_VIEW_MODES.indexOf(context.view) * 100}%)`,
          transition: `transform 240ms ${easeOut}`,
        }}
      />
      {CALENDAR_VIEW_MODES.map((mode) => {
        const active = context.view === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={active}
            onClick={() => context.setView(mode)}
            className={`bg-transparent ${active ? "text-[var(--uai-text)]" : "text-[var(--uai-subtle)] hover:text-[var(--uai-muted)]"} ${press}`}
            style={{
              ...controlStyle(context.variant),
              height: context.variant === "compact" ? 22 : 26,
            }}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

export type CalendarViewGridProps = ComponentProps<"div"> & {
  events?: readonly CalendarViewEvent[];
  /** Events shown per month cell before "+N more". Week view shows twice as many. */
  maxEvents?: number;
  onEventSelect?: (event: CalendarViewEvent) => void;
};

export function CalendarViewGrid({
  events = [],
  maxEvents = 2,
  onEventSelect,
  style,
  ...props
}: CalendarViewGridProps) {
  const context = useCalendar("CalendarViewGrid");
  const { date, view, locale, weekStartsOn, variant } = context;
  const time = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" });
  const long = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const compact = variant === "compact";

  const eventItem = (event: CalendarViewEvent, showTime: boolean) => {
    const when = event.allDay ? "All day" : time.format(event.start);
    const content = (
      <>
        {showTime ? (
          <span
            style={{
              flexShrink: 0,
              color: "var(--uai-subtle)",
              fontWeight: 400,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {when}
          </span>
        ) : (
          <span style={srOnly}>{when}, </span>
        )}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {event.title}
        </span>
      </>
    );
    // All-day events read as tinted accent chips; timed events as quiet tonal chips.
    const itemStyle = {
      display: "flex",
      alignItems: "center",
      gap: 6,
      width: "100%",
      minWidth: 0,
      padding: compact ? "1px 6px" : "2px 6px",
      border: 0,
      borderRadius: 6,
      background: event.allDay
        ? "color-mix(in oklab, var(--uai-accent) 16%, transparent)"
        : "var(--uai-surface-raised)",
      color: "var(--uai-text)",
      font: "inherit",
      fontSize: compact ? 11 : 11.5,
      lineHeight: "16px",
      fontWeight: 500,
      textAlign: "left",
    } as const;
    return (
      <li key={event.id} style={{ minWidth: 0 }}>
        {onEventSelect ? (
          <button
            type="button"
            onClick={() => onEventSelect(event)}
            className="[transition:filter_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] hover:brightness-110 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--uai-accent)] motion-reduce:transition-none motion-reduce:active:scale-100"
            style={{ ...itemStyle, cursor: "pointer" }}
          >
            {content}
          </button>
        ) : (
          <span style={itemStyle}>{content}</span>
        )}
      </li>
    );
  };

  const dayCell = (day: Date, limit: number, muted: boolean) => {
    const dayEvents = eventsOn(events, day);
    const visible = dayEvents.slice(0, limit);
    const hidden = dayEvents.length - visible.length;
    const isToday = sameDay(day, context.today);
    return (
      <td
        key={dateKey(day)}
        aria-current={isToday ? "date" : undefined}
        style={{
          height: view === "month" ? (compact ? 68 : 92) : 160,
          padding: compact ? 3 : 4,
          border: "1px solid var(--uai-border)",
          verticalAlign: "top",
          background: muted
            ? "color-mix(in oklab, var(--uai-canvas) 70%, var(--uai-surface))"
            : "var(--uai-surface)",
          color: muted ? "var(--uai-subtle)" : undefined,
        }}
      >
        <time
          dateTime={dateKey(day)}
          style={{
            display: "inline-grid",
            placeItems: "center",
            minWidth: compact ? 20 : 22,
            height: compact ? 20 : 22,
            marginBottom: 2,
            padding: "0 5px",
            borderRadius: 999,
            background: isToday ? "var(--uai-accent)" : undefined,
            color: isToday
              ? "var(--uai-accent-foreground)"
              : muted
                ? undefined
                : "var(--uai-muted)",
            fontSize: compact ? 11.5 : 12,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span aria-hidden="true">{day.getDate()}</span>
          <span style={srOnly}>{long.format(day)}</span>
        </time>
        {visible.length > 0 ? (
          <ul style={{ display: "grid", gap: 2, margin: 0, padding: 0, listStyle: "none" }}>
            {visible.map((event) => eventItem(event, view === "week"))}
          </ul>
        ) : null}
        {hidden > 0 ? (
          <button
            type="button"
            aria-label={`Show ${hidden} more ${hidden === 1 ? "event" : "events"} on ${long.format(day)}`}
            onClick={() => {
              context.setDate(day);
              context.setView("day");
            }}
            className={`bg-transparent text-[var(--uai-subtle)] hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] ${press}`}
            style={{
              marginTop: 2,
              padding: "0 6px",
              border: 0,
              borderRadius: 6,
              fontSize: 11,
              lineHeight: "16px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            +{hidden} more
          </button>
        ) : null}
      </td>
    );
  };

  const shell = {
    minWidth: 0,
    overflowX: "auto",
    borderRadius: compact ? 10 : 12,
    ...style,
  } as const;

  if (view === "day") {
    const dayEvents = eventsOn(events, date);
    return (
      <div {...props} style={shell}>
        {dayEvents.length === 0 ? (
          <p
            style={{
              margin: 0,
              padding: "32px 12px",
              border: "1px dashed var(--uai-border)",
              borderRadius: compact ? 10 : 12,
              color: "var(--uai-subtle)",
              fontSize: 12.5,
              textAlign: "center",
            }}
          >
            No events on {long.format(date)}.
          </p>
        ) : (
          <ol
            aria-label={`Events on ${long.format(date)}`}
            style={{ display: "grid", gap: 4, margin: 0, padding: 0, listStyle: "none" }}
          >
            {dayEvents.map((event) => {
              const when = event.allDay
                ? "All day"
                : event.end
                  ? time.formatRange(event.start, event.end)
                  : time.format(event.start);
              const body = (
                <>
                  <span
                    style={{
                      width: compact ? 112 : 132,
                      flexShrink: 0,
                      color: "var(--uai-subtle)",
                      fontSize: compact ? 12 : 12.5,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {when}
                  </span>
                  <span style={{ fontWeight: 500, overflowWrap: "anywhere" }}>{event.title}</span>
                </>
              );
              const rowStyle = {
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                gap: 8,
                width: "100%",
                padding: compact ? "6px 10px" : "9px 12px",
                border: 0,
                borderRadius: compact ? 8 : 10,
                background: event.allDay
                  ? "color-mix(in oklab, var(--uai-accent) 12%, transparent)"
                  : "var(--uai-surface-raised)",
                boxShadow: event.allDay ? undefined : "inset 2px 0 0 var(--uai-border-strong)",
                color: "inherit",
                font: "inherit",
                textAlign: "left",
              } as const;
              return (
                <li key={event.id}>
                  {onEventSelect ? (
                    <button
                      type="button"
                      onClick={() => onEventSelect(event)}
                      className="[transition:filter_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] hover:brightness-110 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] motion-reduce:transition-none motion-reduce:active:scale-100"
                      style={{ ...rowStyle, cursor: "pointer" }}
                    >
                      {body}
                    </button>
                  ) : (
                    <span style={rowStyle}>{body}</span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    );
  }

  const weekStart = startOfWeek(date, weekStartsOn);
  const headers = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weeks: Date[][] = [];
  if (view === "week") {
    weeks.push(headers);
  } else {
    let cursor = startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1), weekStartsOn);
    do {
      weeks.push(Array.from({ length: 7 }, (_, index) => addDays(cursor, index)));
      cursor = addDays(cursor, 7);
    } while (cursor.getMonth() === date.getMonth());
  }

  return (
    <div {...props} style={{ border: "1px solid var(--uai-border)", ...shell }}>
      <table
        aria-labelledby={`${context.id}-title`}
        style={{
          width: "100%",
          minWidth: 560,
          tableLayout: "fixed",
          borderCollapse: "collapse",
          // Hide the outer cell edges; the rounded shell draws the frame.
          borderStyle: "hidden",
        }}
      >
        <thead>
          <tr>
            {headers.map((day) => (
              <th
                key={dateKey(day)}
                scope="col"
                style={{
                  padding: compact ? "6px 6px" : "8px 8px",
                  borderBottom: "1px solid var(--uai-border)",
                  color: "var(--uai-subtle)",
                  fontSize: compact ? 11 : 11.5,
                  lineHeight: "16px",
                  fontWeight: 500,
                  textAlign: "left",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {weekday.format(day)}
                {view === "week" ? ` ${day.getDate()}` : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.map(dateKey).join()}>
              {week.map((day) =>
                dayCell(
                  day,
                  view === "week" ? maxEvents * 2 : maxEvents,
                  view === "month" && day.getMonth() !== date.getMonth(),
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
