"use client";

import { useState } from "react";
import {
  SearchField,
  SearchFieldClear,
  SearchFieldControl,
  SearchFieldInput,
  SearchFieldLabel,
  SearchFieldMessage,
  SearchFieldRecent,
  SearchFieldRecentItem,
  type SearchFieldStatus,
  type SearchFieldVariant,
} from "@/components/ui/uai/search-field";

export function SearchFieldPreview({ variant = "rounded" }: { variant?: SearchFieldVariant }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<SearchFieldStatus>("idle");
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <SearchField
        variant={variant}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          setStatus(next ? "empty" : "idle");
        }}
        status={status}
      >
        <SearchFieldLabel>Search workspace</SearchFieldLabel>
        <SearchFieldControl>
          <SearchFieldInput placeholder="Find a document…" />
          <SearchFieldClear />
        </SearchFieldControl>
        <SearchFieldMessage>{status === "idle" ? "Recent searches" : undefined}</SearchFieldMessage>
        <SearchFieldRecent>
          <SearchFieldRecentItem value="Design guidelines" />
          <SearchFieldRecentItem value="Release notes" />
        </SearchFieldRecent>
      </SearchField>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          fontSize: 12,
          color: "var(--uai-muted)",
        }}
      >
        Preview response
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as SearchFieldStatus)}
        >
          <option value="idle">Idle</option>
          <option value="loading">Loading</option>
          <option value="empty">No results</option>
          <option value="error">Error</option>
        </select>
      </label>
    </div>
  );
}
