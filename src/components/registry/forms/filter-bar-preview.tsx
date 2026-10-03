"use client";

import { useState } from "react";
import {
  FilterBar,
  FilterBarChip,
  FilterBarChips,
  FilterBarControls,
  FilterBarCount,
  FilterBarReset,
  type FilterBarVariant,
} from "@/components/ui/uai/filter-bar";

export function FilterBarPreview({ variant = "toolbar" }: { variant?: FilterBarVariant }) {
  const [status, setStatus] = useState("Open");
  const [mine, setMine] = useState(false);
  return (
    <FilterBar
      variant={variant}
      activeCount={Number(Boolean(status)) + Number(mine)}
      onReset={() => {
        setStatus("");
        setMine(false);
      }}
    >
      <FilterBarControls>
        <label style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--uai-muted)" }}>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={{
              height: 28,
              padding: "0 10px",
              border: 0,
              borderRadius: 999,
              background: "var(--uai-surface-raised)",
              color: "var(--uai-text)",
              font: "inherit",
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <option value="">All statuses</option>
            <option>Open</option>
            <option>Closed</option>
          </select>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--uai-muted)" }}>
          <input
            type="checkbox"
            style={{ accentColor: "var(--uai-accent)" }}
            checked={mine}
            onChange={(event) => setMine(event.target.checked)}
          />
          Assigned to me
        </label>
      </FilterBarControls>
      <FilterBarChips>
        {status && <FilterBarChip onRemove={() => setStatus("")}>Status: {status}</FilterBarChip>}
        {mine && <FilterBarChip onRemove={() => setMine(false)}>Assigned to me</FilterBarChip>}
      </FilterBarChips>
      <FilterBarCount>{mine ? "3" : status ? "12" : "24"} example results</FilterBarCount>
      <FilterBarReset />
    </FilterBar>
  );
}
