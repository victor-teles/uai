"use client";

import { CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { getRegistryItemKind, registryReadingOrder } from "./catalog";

function matches(query: string, haystack: string) {
  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return registryReadingOrder;
    return registryReadingOrder.filter((item) =>
      matches(normalized, `${item.name} ${item.category} ${item.description}`.toLowerCase()),
    );
  }, [query]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery("");
      setActiveIndex(0);
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const go = (index: number) => {
    const item = results[index];
    if (!item) return;
    onClose();
    router.push(`/components/${item.id}`);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(activeIndex);
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop clicks are pointer-only; Escape closes the native dialog.
    <dialog
      ref={dialogRef}
      className="uai-palette"
      aria-label="Search components"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="uai-palette__panel">
        <div className="uai-palette__field">
          <Search aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
            aria-autocomplete="list"
            placeholder="Search components and blocks…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
          />
          <kbd>esc</kbd>
        </div>
        <div ref={listRef} id={listId} role="listbox" className="uai-palette__list">
          {results.length === 0 ? (
            <p className="uai-palette__empty">No components match “{query}”.</p>
          ) : (
            results.map((item, index) => {
              const Icon = item.icon;
              return (
                // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection is handled by the combobox input.
                <div
                  key={item.id}
                  id={`${listId}-${index}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={index === activeIndex}
                  data-index={index}
                  className="uai-palette__option"
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => go(index)}
                >
                  <Icon aria-hidden="true" />
                  <span className="uai-palette__name">{item.name}</span>
                  <span className="uai-palette__meta">
                    {item.category}
                    {getRegistryItemKind(item.id) === "block" ? " · Block" : ""}
                  </span>
                  <CornerDownLeft aria-hidden="true" className="uai-palette__enter" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </dialog>
  );
}
