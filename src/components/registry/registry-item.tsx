"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { InstallCommand } from "@/components/install-command";
import {
  getRegistryItem,
  getRegistryItemKind,
  getRegistryPosition,
  type RegistryItemId,
} from "./catalog";
import { RegistryPreview } from "./registry-preview";

type RegistryDocument = {
  files?: { content?: string; path?: string; target?: string }[];
};

type ManualSource = {
  code: string;
  path: string;
};

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return { copied, copy };
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const { copied, copy } = useCopy();
  return (
    <button type="button" className="uai-copy-button" onClick={() => copy(text)} aria-label={label}>
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Copied to clipboard." : ""}
      </span>
    </button>
  );
}

function ManualInstall({ selectedId }: { selectedId: RegistryItemId }) {
  const [open, setOpen] = useState(false);
  const [manualSource, setManualSource] = useState<ManualSource | null>(null);
  const [manualSourceError, setManualSourceError] = useState(false);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    setManualSource(null);
    setManualSourceError(false);

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
  }, [open, selectedId]);

  return (
    <div className="uai-manual" data-open={open || undefined}>
      <button
        type="button"
        className="uai-manual__toggle"
        aria-expanded={open}
        aria-controls="uai-manual-source"
        onClick={() => setOpen((value) => !value)}
      >
        <ChevronDown aria-hidden="true" />
        Manual installation
      </button>
      <div id="uai-manual-source" className="uai-manual__body" inert={!open}>
        <div className="uai-manual__inner">
          <div className="uai-manual__heading">
            <p>
              Create <code>{manualSource?.path ?? `components/ui/uai/${selectedId}.tsx`}</code> and
              paste the source. Install the <code>uai-theme</code> and <code>uai-utils</code> items
              and the <code>class-variance-authority</code> package first.
            </p>
            {manualSource ? (
              <CopyButton text={manualSource.code} label="Copy component source" />
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
            <p className="uai-manual__status" role="alert">
              The component source could not be loaded. Use the CLI command above.
            </p>
          ) : open ? (
            <p className="uai-manual__status" role="status">
              Loading component source…
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function RegistryItem({ id }: { id: RegistryItemId }) {
  const item = getRegistryItem(id);
  const { number, previous, next } = getRegistryPosition(id);
  const kind = getRegistryItemKind(id);

  return (
    <article className="uai-doc" aria-labelledby="uai-doc-title">
      <header className="uai-doc__header">
        <span className="uai-doc__number">{number}</span>
        <div>
          <h1 id="uai-doc-title">{item.name}</h1>
          <p>{item.description}</p>
        </div>
        <span className="uai-doc__meta">
          {item.category} · {kind === "block" ? "Block" : "Component"}
        </span>
      </header>

      <RegistryPreview key={id} itemId={id} />

      <section className="uai-doc__section" aria-labelledby="uai-usage-title">
        <div className="uai-doc__section-head">
          <h2 id="uai-usage-title">Code example</h2>
          <CopyButton text={item.usage} label="Copy code example" />
        </div>
        <div className="uai-code-card">
          <DynamicCodeBlock
            lang="tsx"
            code={item.usage}
            codeblock={{
              allowCopy: false,
              className: "uai-syntax-codeblock uai-syntax-codeblock--source",
            }}
          />
        </div>
      </section>

      <section className="uai-doc__section" aria-labelledby="uai-install-title">
        <div className="uai-doc__section-head">
          <h2 id="uai-install-title">Installation</h2>
        </div>
        <InstallCommand item={item.id} />
        <ManualInstall key={id} selectedId={id} />
      </section>

      <section className="uai-doc__section" aria-labelledby="uai-a11y-title">
        <div className="uai-doc__section-head">
          <h2 id="uai-a11y-title">Accessibility</h2>
        </div>
        <ul className="uai-doc__checklist">
          {item.accessibility.map((note) => (
            <li key={note}>
              <Check aria-hidden="true" />
              {note}
            </li>
          ))}
        </ul>
      </section>

      <nav className="uai-doc__pager" aria-label="Previous and next components">
        {previous ? (
          <Link href={`/components/${previous.id}`} className="uai-doc__pager-link" rel="prev">
            <span>
              <ArrowLeft aria-hidden="true" /> Previous
            </span>
            {previous.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/components/${next.id}`}
            className="uai-doc__pager-link uai-doc__pager-link--next"
            rel="next"
          >
            <span>
              Next <ArrowRight aria-hidden="true" />
            </span>
            {next.name}
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
