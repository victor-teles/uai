import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AuditLogActor,
  AuditLogDetailLabel,
  AuditLogDetailValue,
  AuditLogEvent,
  AuditLogEventDetails,
  AuditLogEventSummary,
  AuditLogList,
  AuditLogTitle,
} from "@/components/ui/uai/audit-log";
import {
  type DateRange,
  DateRangePickerPreset,
  DateRangePickerPresets,
} from "@/components/ui/uai/date-range-picker";
import { FilterBarControls } from "@/components/ui/uai/filter-bar";
import {
  AUDIT_LOG_VIEWER_VARIANTS,
  AuditLogViewer,
  AuditLogViewerAction,
  AuditLogViewerBody,
  AuditLogViewerDateRange,
  AuditLogViewerFilters,
  AuditLogViewerLog,
  AuditLogViewerMain,
  AuditLogViewerStatus,
  AuditLogViewerTitle,
  type AuditLogViewerVariant,
} from "@/registry/uai/blocks/audit-log-viewer";

function Fixture({
  variant,
  onRange,
  onExport,
}: {
  variant?: AuditLogViewerVariant;
  onRange?: (range: DateRange) => void;
  onExport?: () => void;
}) {
  return (
    <AuditLogViewer variant={variant}>
      <AuditLogViewerTitle>Audit log</AuditLogViewerTitle>
      <AuditLogViewerAction onClick={onExport}>Export CSV</AuditLogViewerAction>
      <AuditLogViewerBody>
        <AuditLogViewerFilters>
          <FilterBarControls>
            <label>
              Category
              <select defaultValue="">
                <option value="">All events</option>
              </select>
            </label>
          </FilterBarControls>
          <AuditLogViewerDateRange
            defaultValue={{ start: "2026-09-01", end: "2026-09-30" }}
            onValueChange={onRange}
          >
            <DateRangePickerPresets>
              <DateRangePickerPreset value={{ start: "2026-09-24", end: "2026-09-30" }}>
                Last 7 days
              </DateRangePickerPreset>
            </DateRangePickerPresets>
          </AuditLogViewerDateRange>
        </AuditLogViewerFilters>
        <AuditLogViewerMain>
          <AuditLogViewerLog>
            <AuditLogTitle>Events</AuditLogTitle>
            <AuditLogList>
              <AuditLogEvent>
                <AuditLogEventSummary>
                  <AuditLogActor>Priya Raman</AuditLogActor> removed a member
                </AuditLogEventSummary>
                <AuditLogEventDetails>
                  <AuditLogDetailLabel>Event ID</AuditLogDetailLabel>
                  <AuditLogDetailValue>evt_a41c</AuditLogDetailValue>
                </AuditLogEventDetails>
              </AuditLogEvent>
            </AuditLogList>
          </AuditLogViewerLog>
          <AuditLogViewerStatus>1 of 4 events</AuditLogViewerStatus>
        </AuditLogViewerMain>
      </AuditLogViewerBody>
    </AuditLogViewer>
  );
}

test("names the filters and applies date presets", async () => {
  const user = userEvent.setup();
  const range = mock((_range: DateRange) => {});
  render(<Fixture onRange={range} />);
  expect(screen.getByRole("region", { name: "Audit log" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Audit filters" })).toBeTruthy();
  const preset = screen.getByRole("button", { name: "Last 7 days" });
  expect(preset.getAttribute("aria-pressed")).toBe("false");
  await user.click(preset);
  expect(range).toHaveBeenCalledWith({ start: "2026-09-24", end: "2026-09-30" });
  expect(preset.getAttribute("aria-pressed")).toBe("true");
});

test("expands event details from the keyboard and exposes export and status", async () => {
  const user = userEvent.setup();
  const exported = mock(() => {});
  render(<Fixture onExport={exported} />);
  const summary = screen.getByRole("button", { name: /Priya Raman/ });
  expect(summary.getAttribute("aria-expanded")).toBe("false");
  summary.focus();
  await user.keyboard("{Enter}");
  expect(summary.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText("evt_a41c")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Export CSV" }));
  expect(exported).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status").textContent).toBe("1 of 4 events");
});

test("maps each layout variant onto the composed components and guards its parts", () => {
  const logs = { sidebar: "card", stacked: "timeline", compact: "compact" } as const;
  const filters = { sidebar: "panel", stacked: "toolbar", compact: "compact" } as const;
  for (const variant of AUDIT_LOG_VIEWER_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(screen.getByRole("group", { name: "Audit filters" }).getAttribute("data-variant")).toBe(
      filters[variant],
    );
    expect(screen.getByRole("region", { name: "Events" }).getAttribute("data-variant")).toBe(
      logs[variant],
    );
    view.unmount();
  }
  expect(() => render(<AuditLogViewerLog />)).toThrow(
    "AuditLogViewerLog must be used within AuditLogViewer",
  );
});
