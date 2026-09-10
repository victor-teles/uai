import { expect, mock, test } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DATE_RANGE_PICKER_VARIANTS,
  DateRangePicker,
  DateRangePickerCalendar,
  DateRangePickerClear,
  DateRangePickerInput,
  DateRangePickerPreset,
  type DateRangePickerProps,
  DateRangePickerSummary,
} from "@/registry/uai/components/date-range-picker";

function Fixture(props: DateRangePickerProps) {
  return (
    <DateRangePicker defaultValue={{ start: "2026-09-07", end: "2026-09-11" }} {...props}>
      <DateRangePickerInput boundary="start" />
      <DateRangePickerInput boundary="end" />
      <DateRangePickerPreset value={{ start: "2026-09-01", end: "2026-09-30" }}>
        September
      </DateRangePickerPreset>
      <DateRangePickerCalendar />
      <DateRangePickerSummary />
      <DateRangePickerClear />
    </DateRangePicker>
  );
}
function day(name: string) {
  return screen.getByRole("button", { name });
}
test("selects custom ranges, restarts a completed range, and clears dates", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  await user.click(day("Tuesday, September 15, 2026"));
  expect(screen.getByRole("status").textContent).toContain("Choose an end date");
  await user.click(day("Friday, September 18, 2026"));
  expect(screen.getByRole("status").textContent).toBe("2026-09-15 to 2026-09-18");
  expect(day("Wednesday, September 16, 2026").getAttribute("aria-pressed")).toBe("true");
  await user.click(day("Monday, September 21, 2026"));
  await user.click(day("Sunday, September 20, 2026"));
  expect((screen.getByLabelText("Start date") as HTMLInputElement).value).toBe("2026-09-20");
  expect((screen.getByLabelText("End date") as HTMLInputElement).value).toBe("");
  await user.click(screen.getByRole("button", { name: "Clear dates" }));
  expect(screen.getByRole("status").textContent).toBe("Choose a start date.");
});
test("supports presets and controlled ranges without UTC conversion", async () => {
  const user = userEvent.setup();
  const change = mock(() => {});
  const view = render(
    <Fixture value={{ start: "2026-09-07", end: "2026-09-11" }} onValueChange={change} />,
  );
  await user.click(screen.getByRole("button", { name: "September" }));
  expect(change).toHaveBeenCalledWith({ start: "2026-09-01", end: "2026-09-30" });
  expect((screen.getByLabelText("Start date") as HTMLInputElement).value).toBe("2026-09-07");
  view.rerender(<Fixture value={{ start: "2026-09-01", end: "2026-09-30" }} />);
  expect(screen.getByRole("button", { name: "September" }).getAttribute("aria-pressed")).toBe(
    "true",
  );
});
test("enforces date bounds for presets, calendar, and direct input", async () => {
  const user = userEvent.setup();
  render(<Fixture min="2026-09-05" max="2026-09-20" />);
  expect((screen.getByRole("button", { name: "September" }) as HTMLButtonElement).disabled).toBe(
    true,
  );
  expect((day("Friday, September 4, 2026") as HTMLButtonElement).disabled).toBe(true);
  expect(
    (screen.getByRole("button", { name: "Previous month" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-09-14" } });
  expect((screen.getByLabelText("End date") as HTMLInputElement).value).toBe("");
  fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2026-09-10" } });
  expect((screen.getByLabelText("End date") as HTMLInputElement).value).toBe("");
  await user.click(day("Sunday, September 20, 2026"));
  expect(screen.getByRole("status").textContent).toBe("2026-09-14 to 2026-09-20");
});
test("navigates day, week, month and year by keyboard with one calendar tab stop", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  day("Monday, September 7, 2026").focus();
  await user.keyboard("{ArrowRight}");
  await waitFor(() => expect(document.activeElement).toBe(day("Tuesday, September 8, 2026")));
  await user.keyboard("{ArrowDown}");
  await waitFor(() => expect(document.activeElement).toBe(day("Tuesday, September 15, 2026")));
  await user.keyboard("{Home}");
  await waitFor(() => expect(document.activeElement).toBe(day("Sunday, September 13, 2026")));
  await user.keyboard("{End}");
  await waitFor(() => expect(document.activeElement).toBe(day("Saturday, September 19, 2026")));
  await user.keyboard("{PageDown}");
  await waitFor(() => expect(document.activeElement).toBe(day("Monday, October 19, 2026")));
  await user.keyboard("{Shift>}{PageUp}{/Shift}");
  await waitFor(() => expect(document.activeElement).toBe(day("Sunday, October 19, 2025")));
  expect(
    screen
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("data-date") && button.tabIndex === 0),
  ).toHaveLength(1);
  await user.keyboard("{Enter}");
  expect((screen.getByLabelText("Start date") as HTMLInputElement).value).toBe("2025-10-19");
});
test("clamps keyboard focus at bounds, respects disabled, and rejects malformed bounds", async () => {
  const user = userEvent.setup();
  const view = render(<Fixture min="2026-09-07" max="2026-09-11" />);
  day("Monday, September 7, 2026").focus();
  await user.keyboard("{ArrowLeft}");
  await waitFor(() => expect(document.activeElement).toBe(day("Monday, September 7, 2026")));
  view.rerender(<Fixture disabled />);
  expect((screen.getByLabelText("Start date") as HTMLInputElement).disabled).toBe(true);
  for (const button of screen.getAllByRole("button"))
    expect((button as HTMLButtonElement).disabled).toBe(true);
  view.unmount();
  expect(() => render(<DateRangePicker min="bad" />)).toThrow("YYYY-MM-DD bounds");
});
test("renders all date range variants and guards children", () => {
  for (const variant of DATE_RANGE_PICKER_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<DateRangePickerCalendar />)).toThrow("within DateRangePicker");
});
