"use client";

import { cva } from "class-variance-authority";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useState } from "react";
import { cn } from "@/lib/uai-utils";

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

const calendarViewVariants = cva("grid min-w-0 rounded-[14px] text-[13px]/[18px] text-foreground", {
  variants: {
    variant: {
      card: "gap-3 border bg-card p-3.5 text-card-foreground",
      plain: "gap-3 border-0 bg-transparent p-0",
      compact: "gap-2 border-0 bg-transparent p-0",
    },
  },
});

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
  className,
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
        data-slot="calendar-view"
        className={cn(calendarViewVariants({ variant }), className)}
        {...props}
        data-variant={variant}
        data-view={context.view}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function CalendarViewHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="calendar-view-header"
      className={cn("flex flex-wrap items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

export function CalendarViewTitle({ className, children, ...props }: ComponentProps<"h3">) {
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
      data-slot="calendar-view-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em] tabular-nums",
        context.variant === "compact" ? "text-[13px]/5" : "text-sm/5",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
      aria-live="polite"
    >
      {children ?? label}
    </h3>
  );
}

function controlClass(variant: CalendarViewVariant) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center rounded-full border-0 font-medium",
    variant === "compact" ? "h-6 min-w-6 px-2.5 text-[12px]" : "h-7 min-w-7 px-3 text-[12.5px]",
  );
}
const press =
  "[transition:background-color_120ms_ease-out,color_120ms_ease-out,scale_140ms_var(--ease-out-quint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";
// Ghost icon button and secondary pill, per the shared button rules.
const ghostClass = `bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground ${press}`;
const secondaryClass = `bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] ${press}`;
const modeThumbOffset: Record<CalendarViewMode, string> = {
  month: "translate-x-0",
  week: "translate-x-full",
  day: "translate-x-[200%]",
};

export function CalendarViewNavigation({ className, ...props }: ComponentProps<"div">) {
  const context = useCalendar("CalendarViewNavigation");
  const step = (direction: 1 | -1) => {
    const { date, view } = context;
    if (view === "month")
      context.setDate(new Date(date.getFullYear(), date.getMonth() + direction, 1));
    else context.setDate(addDays(date, direction * (view === "week" ? 7 : 1)));
  };
  const iconButton = cn(controlClass(context.variant), "rounded-lg p-0", ghostClass);
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would add form semantics to calendar navigation buttons.
    <div
      role="group"
      aria-label="Calendar navigation"
      data-slot="calendar-view-navigation"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    >
      <button
        type="button"
        aria-label={`Previous ${context.view}`}
        onClick={() => step(-1)}
        className={iconButton}
      >
        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => context.setDate(context.today)}
        className={cn(controlClass(context.variant), "mx-0.5", secondaryClass)}
      >
        Today
      </button>
      <button
        type="button"
        aria-label={`Next ${context.view}`}
        onClick={() => step(1)}
        className={iconButton}
      >
        <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}

export function CalendarViewModes({ className, ...props }: ComponentProps<"div">) {
  const context = useCalendar("CalendarViewModes");
  return (
    // biome-ignore lint/a11y/useSemanticElements: the layout buttons are a toggle group, not a form fieldset.
    <div
      role="group"
      aria-label="Calendar layout"
      data-slot="calendar-view-modes"
      className={cn(
        "relative isolate inline-grid grid-cols-3 rounded-full bg-muted p-0.5",
        className,
      )}
      {...props}
    >
      {/* One thumb slides under the active layout instead of each button repainting. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0.5 left-0.5 -z-1 w-[calc((100%-4px)/3)] rounded-full bg-card shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.08)] transition-[translate] duration-240 ease-out-quint",
          modeThumbOffset[context.view],
        )}
      />
      {CALENDAR_VIEW_MODES.map((mode) => {
        const active = context.view === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={active}
            onClick={() => context.setView(mode)}
            className={cn(
              controlClass(context.variant),
              context.variant === "compact" ? "h-5.5" : "h-6.5",
              "bg-transparent",
              active ? "text-foreground" : "text-subtle-foreground hover:text-muted-foreground",
              press,
            )}
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
  className,
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
          <span className="shrink-0 font-normal text-subtle-foreground tabular-nums">{when}</span>
        ) : (
          <span className="sr-only">{when}, </span>
        )}
        <span className="truncate">{event.title}</span>
      </>
    );
    // All-day events read as tinted accent chips; timed events as quiet tonal chips.
    const itemClass = cn(
      "flex w-full min-w-0 items-center gap-1.5 rounded-md border-0 px-1.5 text-left font-medium text-foreground",
      compact ? "py-px text-[11px]/4" : "py-0.5 text-[11.5px]/4",
      event.allDay ? "bg-primary/16" : "bg-muted",
    );
    return (
      <li key={event.id} className="min-w-0">
        {onEventSelect ? (
          <button
            type="button"
            onClick={() => onEventSelect(event)}
            className={cn(
              itemClass,
              "cursor-pointer [transition:filter_120ms_ease-out,scale_140ms_var(--ease-out-quint)] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
            )}
          >
            {content}
          </button>
        ) : (
          <span className={itemClass}>{content}</span>
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
        className={cn(
          "border align-top",
          view === "month" ? (compact ? "h-[68px]" : "h-[92px]") : "h-40",
          compact ? "p-0.75" : "p-1",
          muted
            ? "bg-[color-mix(in_oklab,var(--background)_70%,var(--card))] text-subtle-foreground"
            : "bg-card",
        )}
      >
        <time
          dateTime={dateKey(day)}
          className={cn(
            "mb-0.5 inline-grid place-items-center rounded-full px-1.25 font-medium tabular-nums",
            compact ? "h-5 min-w-5 text-[11.5px]" : "h-5.5 min-w-5.5 text-[12px]",
            isToday ? "bg-primary text-primary-foreground" : !muted && "text-muted-foreground",
          )}
        >
          <span aria-hidden="true">{day.getDate()}</span>
          <span className="sr-only">{long.format(day)}</span>
        </time>
        {visible.length > 0 ? (
          <ul className="m-0 grid list-none gap-0.5 p-0">
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
            className={cn(
              "mt-0.5 cursor-pointer rounded-md border-0 bg-transparent px-1.5 text-[11px]/4 font-medium text-subtle-foreground hover:bg-accent hover:text-foreground",
              press,
            )}
          >
            +{hidden} more
          </button>
        ) : null}
      </td>
    );
  };

  const shell = cn("min-w-0 overflow-x-auto", compact ? "rounded-[10px]" : "rounded-xl");

  if (view === "day") {
    const dayEvents = eventsOn(events, date);
    return (
      <div data-slot="calendar-view-grid" className={cn(shell, className)} {...props}>
        {dayEvents.length === 0 ? (
          <p
            className={cn(
              "m-0 border border-dashed px-3 py-8 text-center text-[12.5px] text-subtle-foreground",
              compact ? "rounded-[10px]" : "rounded-xl",
            )}
          >
            No events on {long.format(date)}.
          </p>
        ) : (
          <ol
            aria-label={`Events on ${long.format(date)}`}
            className="m-0 grid list-none gap-1 p-0"
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
                    className={cn(
                      "shrink-0 text-subtle-foreground tabular-nums",
                      compact ? "w-28 text-[12px]" : "w-33 text-[12.5px]",
                    )}
                  >
                    {when}
                  </span>
                  <span className="font-medium wrap-anywhere">{event.title}</span>
                </>
              );
              const rowClass = cn(
                "flex w-full flex-wrap items-baseline gap-2 border-0 text-left text-inherit",
                compact ? "rounded-lg px-2.5 py-1.5" : "rounded-[10px] px-3 py-2.25",
                event.allDay
                  ? "bg-primary/12"
                  : "bg-muted shadow-[inset_2px_0_0_var(--border-strong)]",
              );
              return (
                <li key={event.id}>
                  {onEventSelect ? (
                    <button
                      type="button"
                      onClick={() => onEventSelect(event)}
                      className={cn(
                        rowClass,
                        "cursor-pointer [transition:filter_120ms_ease-out,scale_140ms_var(--ease-out-quint)] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100",
                      )}
                    >
                      {body}
                    </button>
                  ) : (
                    <span className={rowClass}>{body}</span>
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
    <div data-slot="calendar-view-grid" className={cn("border", shell, className)} {...props}>
      {/* border-hidden hides the outer cell edges; the rounded shell draws the frame. */}
      <table
        aria-labelledby={`${context.id}-title`}
        className="w-full min-w-[560px] table-fixed border-collapse border-hidden"
      >
        <thead>
          <tr>
            {headers.map((day) => (
              <th
                key={dateKey(day)}
                scope="col"
                className={cn(
                  "border-b text-left font-medium text-subtle-foreground tabular-nums",
                  compact ? "p-1.5 text-[11px]/4" : "p-2 text-[11.5px]/4",
                )}
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
