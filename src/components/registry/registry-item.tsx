"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useId, useState } from "react";

import { InstallCommand } from "@/components/install-command";
import { getAnatomyModules, getAnatomyTree } from "./anatomy";
import {
  getRegistryItem,
  getRegistryItemKind,
  getRegistryPosition,
  type RegistryItemId,
  type RegistryItemKind,
  registryCatalog,
} from "./catalog";
import { CopyButton } from "./copy-button";
import { getPreviewControl, RegistryPreviewCanvas, RegistryVariants } from "./registry-preview";

type RegistryDocument = {
  files?: { content?: string; path?: string; target?: string }[];
};

type ManualSource = {
  code: string;
  path: string;
};

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

function InspectorSection({
  title,
  meta,
  slot,
  children,
}: {
  title: string;
  meta?: string;
  /** Names the section so narrow layouts can place it around the workspace. */
  slot: "install" | "anatomy" | "accessibility";
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section className="uai-inspector__section" data-slot={slot} aria-labelledby={headingId}>
      <h2 id={headingId} className="uai-inspector__label">
        {title}
        {meta ? <span>{meta}</span> : null}
      </h2>
      {children}
    </section>
  );
}

function Anatomy({ usage, kind }: { usage: string; kind: RegistryItemKind }) {
  if (kind === "block") {
    return (
      <ul className="uai-anatomy">
        {getAnatomyModules(usage).map((module) => (
          <li key={module.file}>
            <span className="uai-anatomy__file">{module.file}</span>
            <span className="uai-anatomy__count">{module.parts.length}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="uai-anatomy">
      {getAnatomyTree(usage).map((node) => (
        <li key={node.name} data-root={node.depth === 0 || undefined}>
          <span className="uai-anatomy__guide" aria-hidden="true">
            {node.guide}
          </span>
          {node.name}
        </li>
      ))}
    </ul>
  );
}

export function RegistryItem({ id }: { id: RegistryItemId }) {
  const item = getRegistryItem(id);
  const { number, previous, next } = getRegistryPosition(id);
  const kind = getRegistryItemKind(id);
  const control = getPreviewControl(id);
  const [selection, setSelection] = useState(control?.defaultValue ?? "");

  return (
    <article className="uai-bench" aria-labelledby="uai-doc-title">
      <div className="uai-inspector">
        <header className="uai-inspector__header">
          <p className="uai-inspector__eyebrow">
            {kind} · {number}/{registryCatalog.length}
          </p>
          <h1 id="uai-doc-title">{item.name}</h1>
          <p>{item.description}</p>
        </header>

        <InspectorSection title="Install" slot="install">
          <InstallCommand item={item.id} />
        </InspectorSection>

        <InspectorSection title={kind === "block" ? "Composes" : "Anatomy"} slot="anatomy">
          <Anatomy usage={item.usage} kind={kind} />
        </InspectorSection>

        <InspectorSection
          title="Accessibility"
          slot="accessibility"
          meta={`${item.accessibility.length} checks`}
        >
          <ul className="uai-doc__checklist">
            {item.accessibility.map((note) => (
              <li key={note}>
                <Check aria-hidden="true" />
                {note}
              </li>
            ))}
          </ul>
        </InspectorSection>

        <nav className="uai-inspector__pager" aria-label="Previous and next components">
          {previous ? (
            <Link href={`/components/${previous.id}`} rel="prev">
              <ArrowLeft aria-hidden="true" />
              <span className="sr-only">Previous: </span>
              {previous.name}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/components/${next.id}`} rel="next">
              <span className="sr-only">Next: </span>
              {next.name}
              <ArrowRight aria-hidden="true" />
            </Link>
          ) : null}
        </nav>
      </div>

      <div className="uai-bench__workspace">
        <section className="uai-bench__canvas" aria-label="Live preview">
          <div className="uai-bench__toolbar">
            <span>canvas</span>
            {control ? (
              <span className="uai-bench__toolbar-variant">variant=&quot;{selection}&quot;</span>
            ) : null}
            <span className="uai-bench__toolbar-end">{item.category.toLowerCase()}</span>
          </div>
          <RegistryPreviewCanvas itemId={id} selection={selection} />
          {control ? (
            <RegistryVariants control={control} value={selection} onChange={setSelection} />
          ) : null}
        </section>

        <section className="uai-bench__panel" aria-labelledby="uai-usage-title">
          <div className="uai-bench__panel-head">
            <h2 id="uai-usage-title">Code example</h2>
            <span className="uai-bench__file">usage.tsx</span>
            <CopyButton text={item.usage} label="Copy code example" />
          </div>
          <DynamicCodeBlock
            lang="tsx"
            code={item.usage}
            codeblock={{
              allowCopy: false,
              className: "uai-syntax-codeblock uai-syntax-codeblock--source",
            }}
          />
        </section>

        <section className="uai-bench__panel" aria-label="Manual installation">
          <ManualInstall selectedId={id} />
        </section>
      </div>
    </article>
  );
}
