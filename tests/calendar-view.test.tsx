import { expect, mock, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CALENDAR_VIEW_VARIANTS,
  CalendarView,
  type CalendarViewEvent,
  CalendarViewGrid,
  CalendarViewHeader,
  CalendarViewModes,
  CalendarViewNavigation,
  type CalendarViewProps,
  CalendarViewTitle,
} from "@/registry/uai/components/calendar-view";

const today = new Date(2026, 8, 30);
const events: CalendarViewEvent[] = [
  { id: "1", title: "Planning", start: new Date(2026, 8, 30), allDay: true },
  {
    id: "2",
    title: "Design review",
    start: new Date(2026, 8, 30, 10),
    end: new Date(2026, 8, 30, 11),
  },
  { id: "3", title: "Billing sync", start: new Date(2026, 8, 30, 13) },
  { id: "4", title: "Customer call", start: new Date(2026, 8, 30, 16) },
];

function Fixture({
  onEventSelect,
  ...props
}: Omit<CalendarViewProps, "children"> & { onEventSelect?: (event: CalendarViewEvent) => void }) {
  return (
    <CalendarView today={today} {...props}>
      <CalendarViewHeader>
        <CalendarViewTitle />
        <CalendarViewNavigation />
        <CalendarViewModes />
      </CalendarViewHeader>
      <CalendarViewGrid events={events} onEventSelect={onEventSelect} />
    </CalendarView>
  );
}

test("renders a month table with today marked and overflow collapsed", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  expect(screen.getByRole("heading", { name: "September 2026" })).toBeTruthy();
  expect(screen.getByRole("table", { name: "September 2026" })).toBeTruthy();
  expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ]);
  const todayCell = document.querySelector('[aria-current="date"]') as HTMLElement;
  expect(todayCell.textContent).toContain("Wednesday, September 30, 2026");
  expect(within(todayCell).getByText("Planning")).toBeTruthy();
  expect(within(todayCell).queryByText("Billing sync")).toBeNull();
  const more = screen.getByRole("button", {
    name: "Show 2 more events on Wednesday, September 30, 2026",
  });
  expect(more.textContent).toBe("+2 more");
  await user.click(more);
  expect(screen.getByRole("heading", { name: "Wednesday, September 30, 2026" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Day" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getAllByRole("listitem")).toHaveLength(4);
});

test("navigates by month, week, and day and returns to today", async () => {
  const user = userEvent.setup();
  const change = mock((_date: Date) => {});
  render(<Fixture onDateChange={change} />);
  await user.click(screen.getByRole("button", { name: "Next month" }));
  expect(screen.getByRole("heading", { name: "October 2026" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Week" }));
  expect(screen.getByRole("heading").textContent).toBe("Sep 27 – Oct 3, 2026");
  await user.click(screen.getByRole("button", { name: "Previous week" }));
  expect(screen.getByRole("heading").textContent).toBe("Sep 20 – 26, 2026");
  await user.click(screen.getByRole("button", { name: "Today" }));
  expect(change).toHaveBeenLastCalledWith(today);
  expect(screen.getByRole("heading").textContent).toBe("Sep 27 – Oct 3, 2026");
});

test("week view shows times, day view lists events, and events are selectable", async () => {
  const user = userEvent.setup();
  const select = mock((_event: CalendarViewEvent) => {});
  const view = render(<Fixture defaultView="week" onEventSelect={select} />);
  expect(screen.getByText("10:00 AM")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: /Design review/ }));
  expect(select).toHaveBeenCalledWith(events[1]);
  view.unmount();
  render(<Fixture view="day" defaultDate={new Date(2026, 9, 5)} />);
  expect(screen.getByText("No events on Monday, October 5, 2026.")).toBeTruthy();
});

test("renders every variant and guards compound children", () => {
  for (const variant of CALENDAR_VIEW_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<CalendarViewGrid />)).toThrow(
    "CalendarViewGrid must be used within CalendarView",
  );
});
