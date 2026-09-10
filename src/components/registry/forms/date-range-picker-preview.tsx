"use client";

import {
  DateRangePicker,
  DateRangePickerBody,
  DateRangePickerCalendar,
  DateRangePickerClear,
  DateRangePickerInput,
  DateRangePickerInputs,
  DateRangePickerPreset,
  DateRangePickerPresets,
  DateRangePickerSummary,
  type DateRangePickerVariant,
} from "@/components/ui/uai/date-range-picker";

export function DateRangePickerPreview({ variant = "card" }: { variant?: DateRangePickerVariant }) {
  return (
    <DateRangePicker
      variant={variant}
      defaultValue={{ start: "2026-09-07", end: "2026-09-11" }}
      min="2026-01-01"
      max="2027-12-31"
    >
      <DateRangePickerInputs>
        <DateRangePickerInput boundary="start" name="start" />
        <DateRangePickerInput boundary="end" name="end" />
      </DateRangePickerInputs>
      <DateRangePickerBody>
        <DateRangePickerPresets>
          <DateRangePickerPreset value={{ start: "2026-09-07", end: "2026-09-11" }}>
            Release week
          </DateRangePickerPreset>
          <DateRangePickerPreset value={{ start: "2026-09-01", end: "2026-09-30" }}>
            September
          </DateRangePickerPreset>
        </DateRangePickerPresets>
        <DateRangePickerCalendar />
      </DateRangePickerBody>
      <DateRangePickerSummary />
      <DateRangePickerClear />
    </DateRangePicker>
  );
}
