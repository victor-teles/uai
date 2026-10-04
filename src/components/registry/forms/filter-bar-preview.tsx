"use client";

import { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const statusId = useId();
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
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Label htmlFor={statusId} className="font-normal text-muted-foreground">
            Status
          </Label>
          <Select
            value={status || "all"}
            onValueChange={(next) => setStatus(next === "all" ? "" : next)}
          >
            <SelectTrigger
              id={statusId}
              size="sm"
              className="h-7 gap-1.5 rounded-full border-0 bg-secondary px-2.5 text-[12.5px] font-medium shadow-none dark:bg-secondary"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </span>
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
