"use client";

import { useState } from "react";
import {
  CalendarView,
  CalendarViewGrid,
  CalendarViewHeader,
  CalendarViewModes,
  CalendarViewNavigation,
  CalendarViewTitle,
  type CalendarViewVariant,
} from "@/components/ui/uai/calendar-view";

const events = [
  { id: "1", title: "Quarterly planning", start: new Date(2026, 8, 30), allDay: true },
  {
    id: "2",
    title: "Design review",
    start: new Date(2026, 8, 30, 10),
    end: new Date(2026, 8, 30, 11),
  },
  {
    id: "3",
    title: "Billing sync",
    start: new Date(2026, 8, 30, 13, 30),
    end: new Date(2026, 8, 30, 14),
  },
  {
    id: "4",
    title: "Customer call: Northwind",
    start: new Date(2026, 8, 30, 16),
    end: new Date(2026, 8, 30, 16, 45),
  },
  { id: "5", title: "Release 4.2 freeze", start: new Date(2026, 9, 2, 9) },
  {
    id: "6",
    title: "Team offsite",
    start: new Date(2026, 8, 14),
    end: new Date(2026, 8, 16),
    allDay: true,
  },
  {
    id: "7",
    title: "Security audit kickoff",
    start: new Date(2026, 8, 22, 15),
    end: new Date(2026, 8, 22, 16),
  },
];

export function CalendarViewPreview({ variant = "card" }: { variant?: CalendarViewVariant }) {
  const [selected, setSelected] = useState("");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <CalendarView variant={variant} today={new Date(2026, 8, 30)}>
        <CalendarViewHeader>
          <CalendarViewTitle />
          <CalendarViewNavigation />
          <CalendarViewModes />
        </CalendarViewHeader>
        <CalendarViewGrid events={events} onEventSelect={(event) => setSelected(event.title)} />
      </CalendarView>
      <p
        role="status"
        style={{ margin: 0, minHeight: 18, color: "var(--uai-muted)", fontSize: 12 }}
      >
        {selected ? `Opened ${selected}` : ""}
      </p>
    </div>
  );
}
