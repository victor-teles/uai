"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import {
  AuditLogViewer,
  AuditLogViewerAction,
  AuditLogViewerActions,
  AuditLogViewerBody,
  AuditLogViewerDateRange,
  AuditLogViewerDescription,
  AuditLogViewerFilters,
  AuditLogViewerHeader,
  AuditLogViewerHeading,
  AuditLogViewerLog,
  AuditLogViewerMain,
  AuditLogViewerStatus,
  AuditLogViewerTitle,
  type AuditLogViewerVariant,
} from "@/components/uai/audit-log-viewer";
import {
  AuditLogAction,
  AuditLogActor,
  AuditLogDetailLabel,
  AuditLogDetailValue,
  AuditLogEmpty,
  AuditLogEvent,
  AuditLogEventDetails,
  AuditLogEventSummary,
  AuditLogHeader,
  AuditLogList,
  AuditLogResource,
  AuditLogTimestamp,
  AuditLogTitle,
} from "@/components/ui/uai/audit-log";
import {
  DateRangePickerInput,
  DateRangePickerInputs,
  DateRangePickerPreset,
  DateRangePickerPresets,
} from "@/components/ui/uai/date-range-picker";
import {
  FilterBarChip,
  FilterBarChips,
  FilterBarControls,
  FilterBarReset,
} from "@/components/ui/uai/filter-bar";

const events = [
  {
    id: "evt_a41c",
    actor: "Priya Raman",
    action: "removed",
    resource: "jonas@orbit-dental.com",
    category: "Members",
    date: "2026-09-30",
    time: "2026-09-30T15:22:00",
    label: "Today, 3:22 PM",
    details: { Reason: "Offboarding request #4471", "IP address": "84.21.190.4" },
  },
  {
    id: "evt_a3f0",
    actor: "Deploy bot",
    action: "rotated",
    resource: "WAREHOUSE_READ_TOKEN",
    category: "Security",
    date: "2026-09-30",
    time: "2026-09-30T06:00:00",
    label: "Today, 6:00 AM",
    details: { Trigger: "Scheduled rotation", Environment: "Production" },
  },
  {
    id: "evt_a2b9",
    actor: "Marcus Lee",
    action: "changed SSO enforcement on",
    resource: "Sales workspace",
    category: "Security",
    date: "2026-09-26",
    time: "2026-09-26T11:48:00",
    label: "Sep 26, 11:48 AM",
    details: { Change: "Optional → Required", Client: "Web · Firefox 142" },
  },
  {
    id: "evt_a17e",
    actor: "Ana Duarte",
    action: "exported",
    resource: "contacts-q3.csv",
    category: "Data",
    date: "2026-09-12",
    time: "2026-09-12T09:15:00",
    label: "Sep 12, 9:15 AM",
    details: { Rows: "2,415", Filters: "Region is EU" },
  },
];

const allTime = { start: "2026-09-01", end: "2026-09-30" };

export function AuditLogViewerPreview({
  variant = "sidebar",
}: {
  variant?: AuditLogViewerVariant;
}) {
  const [category, setCategory] = useState("");
  const [range, setRange] = useState(allTime);
  const [exported, setExported] = useState(false);
  const visible = events.filter(
    (event) =>
      (!category || event.category === category) &&
      (!range.start || event.date >= range.start) &&
      (!range.end || event.date <= range.end),
  );
  const ranged = range.start !== allTime.start || range.end !== allTime.end;

  return (
    <AuditLogViewer variant={variant}>
      <AuditLogViewerHeader>
        <AuditLogViewerHeading>
          <AuditLogViewerTitle>Audit log</AuditLogViewerTitle>
          <AuditLogViewerDescription>
            Events are retained for 400 days on the Business plan.
          </AuditLogViewerDescription>
        </AuditLogViewerHeading>
        <AuditLogViewerActions>
          <AuditLogViewerAction disabled={!visible.length} onClick={() => setExported(true)}>
            <Download size={14} strokeWidth={1.75} aria-hidden="true" />
            Export CSV
          </AuditLogViewerAction>
        </AuditLogViewerActions>
      </AuditLogViewerHeader>
      <AuditLogViewerBody>
        <AuditLogViewerFilters
          activeCount={Number(Boolean(category)) + Number(ranged)}
          onReset={() => {
            setCategory("");
            setRange(allTime);
          }}
        >
          <FilterBarControls>
            <label
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                color: "var(--uai-subtle)",
                fontSize: 12,
              }}
            >
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                style={{
                  height: 28,
                  padding: "0 8px",
                  border: 0,
                  borderRadius: 8,
                  background: "var(--uai-surface-raised)",
                  color: "var(--uai-text)",
                  fontSize: 13,
                }}
              >
                <option value="">All events</option>
                <option>Members</option>
                <option>Security</option>
                <option>Data</option>
              </select>
            </label>
          </FilterBarControls>
          <AuditLogViewerDateRange
            value={range}
            onValueChange={setRange}
            min="2026-01-01"
            max="2026-09-30"
          >
            <DateRangePickerPresets>
              <DateRangePickerPreset value={{ start: "2026-09-30", end: "2026-09-30" }}>
                Today
              </DateRangePickerPreset>
              <DateRangePickerPreset value={{ start: "2026-09-24", end: "2026-09-30" }}>
                Last 7 days
              </DateRangePickerPreset>
              <DateRangePickerPreset value={allTime}>September</DateRangePickerPreset>
            </DateRangePickerPresets>
            <DateRangePickerInputs>
              <DateRangePickerInput boundary="start">From</DateRangePickerInput>
              <DateRangePickerInput boundary="end">To</DateRangePickerInput>
            </DateRangePickerInputs>
          </AuditLogViewerDateRange>
          <FilterBarChips>
            {category ? (
              <FilterBarChip onRemove={() => setCategory("")}>Category: {category}</FilterBarChip>
            ) : null}
          </FilterBarChips>
          <FilterBarReset />
        </AuditLogViewerFilters>
        <AuditLogViewerMain>
          <AuditLogViewerLog>
            <AuditLogHeader>
              <AuditLogTitle>Events</AuditLogTitle>
            </AuditLogHeader>
            {visible.length ? (
              <AuditLogList>
                {visible.map((event) => (
                  <AuditLogEvent key={event.id}>
                    <AuditLogEventSummary>
                      <AuditLogActor>{event.actor}</AuditLogActor>
                      <AuditLogAction>{event.action}</AuditLogAction>
                      <AuditLogResource>{event.resource}</AuditLogResource>
                      <AuditLogTimestamp dateTime={event.time}>{event.label}</AuditLogTimestamp>
                    </AuditLogEventSummary>
                    <AuditLogEventDetails>
                      <AuditLogDetailLabel>Event ID</AuditLogDetailLabel>
                      <AuditLogDetailValue>{event.id}</AuditLogDetailValue>
                      {Object.entries(event.details).map(([label, value]) => (
                        <div key={label} style={{ display: "contents" }}>
                          <AuditLogDetailLabel>{label}</AuditLogDetailLabel>
                          <AuditLogDetailValue>{value}</AuditLogDetailValue>
                        </div>
                      ))}
                    </AuditLogEventDetails>
                  </AuditLogEvent>
                ))}
              </AuditLogList>
            ) : (
              <AuditLogEmpty>No events match these filters.</AuditLogEmpty>
            )}
          </AuditLogViewerLog>
          <AuditLogViewerStatus>
            {exported
              ? `Exported ${visible.length} events to audit-log.csv`
              : `${visible.length} of ${events.length} events`}
          </AuditLogViewerStatus>
        </AuditLogViewerMain>
      </AuditLogViewerBody>
    </AuditLogViewer>
  );
}
