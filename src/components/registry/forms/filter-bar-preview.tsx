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
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option>Open</option>
            <option>Closed</option>
          </select>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
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
