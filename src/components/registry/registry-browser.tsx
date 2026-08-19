"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Check, ChevronUp, Copy, Search, Slash, Terminal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { InstallCommand } from "@/components/install-command";
import {
  getRegistryItem,
  type RegistryCategory,
  type RegistryItemId,
  registryCatalog,
  registryCategories,
} from "./catalog";
import { RegistryPreview } from "./registry-preview";

type RegistryDocument = {
  files?: { content?: string; path?: string; target?: string }[];
};

type ManualSource = {
  code: string;
  path: string;
};

function formatCatalogIndex(id: RegistryItemId) {
  const index = registryCatalog.findIndex((item) => item.id === id);
  return String(Math.max(index, 0) + 1).padStart(2, "0");
}

export function RegistryBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<RegistryCategory>("All");
  const [selectedId, setSelectedId] = useState<RegistryItemId>("prompt-composer");
  const [codeCopied, setCodeCopied] = useState(false);
  const [manualCodeCopied, setManualCodeCopied] = useState(false);
  const [manualSource, setManualSource] = useState<ManualSource | null>(null);
  const [manualSourceError, setManualSourceError] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing = target?.matches("input, textarea, select, [contenteditable='true']");
      if (event.key === "/" && !editing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!detailsOpen) return;

    const controller = new AbortController();
    setManualSource(null);
    setManualSourceError(false);
    setManualCodeCopied(false);

    const loadManualSource = async () => {
      try {
        const response = await fetch(`/r/${selectedId}.json`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Registry source request failed: ${response.status}`);

        const document = (await response.json()) as RegistryDocument;
        const sourceFile = document.files?.find((file) => file.content);
        if (!sourceFile?.content) throw new Error("Registry source is missing its component file");

        setManualSource({
          code: sourceFile.content,
          path:
            sourceFile.target?.replace(/^@ui\//, "components/ui/") ??
            sourceFile.path ??
            `components/ui/uai/${selectedId}.tsx`,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setManualSourceError(true);
      }
    };

    void loadManualSource();
    return () => controller.abort();
  }, [detailsOpen, selectedId]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return registryCatalog.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const selectedItem = getRegistryItem(selectedId);
  const catalogIndex = formatCatalogIndex(selectedId);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(selectedItem.usage);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 1800);
    } catch {
      setCodeCopied(false);
    }
  };

  const copyManualSource = async () => {
    if (!manualSource) return;

    try {
      await navigator.clipboard.writeText(manualSource.code);
      setManualCodeCopied(true);
      window.setTimeout(() => setManualCodeCopied(false), 1800);
    } catch {
      setManualCodeCopied(false);
    }
  };

  return (
    <main className="uai-registry-page">
      <aside className="uai-registry-sidebar" aria-label="Component registry navigation">
        <label className="uai-registry-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Search components</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            placeholder="Search components…"
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd aria-label="Slash shortcut">
            <Slash aria-hidden="true" />
          </kbd>
        </label>

        <div className="uai-registry-sidebar__scroll">
          <section aria-labelledby="registry-categories-title">
            <h2 id="registry-categories-title">Categories</h2>
            <div className="uai-registry-categories">
              {registryCategories.map((name) => {
                const count =
                  name === "All"
                    ? registryCatalog.length
                    : registryCatalog.filter((item) => item.category === name).length;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={category === name}
                    onClick={() => setCategory(name)}
                  >
                    <span>{name}</span>
                    <span className="uai-registry-category-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="registry-components-title">
            <h2 id="registry-components-title">Components</h2>
            <div className="uai-registry-components">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={selectedId === item.id ? "true" : undefined}
                      onClick={() => {
                        setSelectedId(item.id);
                      }}
                    >
                      <Icon aria-hidden="true" />
                      <span className="uai-registry-component-name">{item.name}</span>
                    </button>
                  );
                })
              ) : (
                <p className="uai-registry-empty">No components match this filter.</p>
              )}
            </div>
          </section>
        </div>

        <p className="uai-registry-shortcut">
          <kbd>/</kbd>
          to search
        </p>
      </aside>

      <section className="uai-registry-workbench" aria-labelledby="registry-component-title">
        <div className="uai-registry-mobile-controls">
          <label>
            <span>Component</span>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value as RegistryItemId)}
            >
              {registryCatalog.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="uai-registry-header">
          <div className="uai-registry-header__copy">
            <h1 id="registry-component-title">
              <span className="uai-registry-header__index">{catalogIndex} </span>
              {selectedItem.name}
            </h1>
            <p>{selectedItem.description}</p>
          </div>
        </div>

        <div className="uai-registry-preview">
          <RegistryPreview
            itemId={selectedId}
            codeExample={
              <div className="uai-registry-source">
                <div className="uai-registry-source__header">
                  <h2>Code example</h2>
                  <button type="button" onClick={copyCode} aria-label="Copy code example">
                    <span className="uai-copy-label">
                      {codeCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                      {codeCopied ? "Copied" : "Copy"}
                    </span>
                  </button>
                </div>
                <DynamicCodeBlock
                  lang="tsx"
                  code={selectedItem.usage}
                  codeblock={{
                    allowCopy: false,
                    className: "uai-syntax-codeblock uai-syntax-codeblock--source",
                  }}
                />
              </div>
            }
          />
        </div>

        <div className="uai-registry-dock" data-open={detailsOpen}>
          <div
            id="registry-install-details"
            className="uai-registry-detail-drawer"
            aria-hidden={!detailsOpen}
            inert={!detailsOpen}
          >
            <div className="uai-registry-details">
              <section
                className="uai-registry-details__section"
                aria-labelledby="registry-manual-install-title"
              >
                <div className="uai-registry-details__heading">
                  <div>
                    <h2 id="registry-manual-install-title">Manual install</h2>
                    <p>
                      Create{" "}
                      <code>{manualSource?.path ?? `components/ui/uai/${selectedId}.tsx`}</code>,
                      then paste the component source.
                    </p>
                  </div>
                  {manualSource ? (
                    <button
                      type="button"
                      onClick={copyManualSource}
                      aria-label="Copy component source"
                    >
                      {manualCodeCopied ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <Copy aria-hidden="true" />
                      )}
                    </button>
                  ) : null}
                </div>
                {manualSource ? (
                  <DynamicCodeBlock
                    lang="tsx"
                    code={manualSource.code}
                    codeblock={{
                      allowCopy: false,
                      className: "uai-syntax-codeblock uai-syntax-codeblock--details",
                    }}
                  />
                ) : manualSourceError ? (
                  <p className="uai-registry-manual-status" role="alert">
                    The component source could not be loaded. Use the registry command below.
                  </p>
                ) : (
                  <p className="uai-registry-manual-status" role="status">
                    Loading component source…
                  </p>
                )}
              </section>

              <section
                className="uai-registry-details__section"
                aria-labelledby="registry-accessibility-title"
              >
                <h2 id="registry-accessibility-title">Accessibility</h2>
                <p>Each registry item ships with its interaction semantics intact.</p>
                <ul>
                  {selectedItem.accessibility.map((item) => (
                    <li key={item}>
                      <Check aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <div className="uai-registry-install-strip">
            <button
              type="button"
              className="uai-registry-install-toggle"
              aria-expanded={detailsOpen}
              aria-controls="registry-install-details"
              onClick={() => setDetailsOpen((open) => !open)}
            >
              <span className="uai-registry-install-label">
                <Terminal aria-hidden="true" />
                Install
              </span>
              <span className="uai-registry-install-detail-label">
                {detailsOpen ? "Close" : "Manual install"}
                <ChevronUp aria-hidden="true" />
              </span>
            </button>
            <InstallCommand item={selectedItem.id} compact />
          </div>
        </div>
      </section>
    </main>
  );
}
