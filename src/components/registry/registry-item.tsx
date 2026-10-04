"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { ArrowDown, ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from "react";

import { InstallCommand } from "@/components/install-command";
import { getAnatomyModules, getAnatomyTree } from "./anatomy";
import {
  findRegistryItem,
  getRegistryItem,
  getRegistryItemKind,
  getRegistryPosition,
  type RegistryItemId,
  type RegistryItemKind,
  registryCatalog,
} from "./catalog";
import { CopyButton } from "./copy-button";
import { getPreviewControl, RegistryPreviewCanvas, RegistryVariants } from "./registry-preview";
import { ResizeHandle, usePersistentSize } from "./resize-handle";

const inspectorBounds = { defaultValue: 316, min: 260, max: 560 };
const dockBounds = { defaultValue: 320, min: 120, max: 960 };

type RegistryDocument = {
  dependencies?: string[];
  registryDependencies?: string[];
  files?: { content?: string; path?: string; target?: string }[];
};

type ManualSource = {
  code: string;
  path: string;
  packages: readonly string[];
  primitives: readonly string[];
  registryItems: readonly string[];
};

/** Maps a registry file target such as `@ui/uai/x.tsx` to its project path. */
function toProjectPath(target: string) {
  return target.replace(/^@ui\//, "components/ui/").replace(/^@components\//, "components/");
}

/** Where a registry dependency is documented: its own page, or Theming for the base items. */
function registryItemHref(name: string) {
  return findRegistryItem(name) ? `/components/${name}` : "/theming";
}

function useManualSource(selectedId: RegistryItemId, enabled: boolean) {
  const [manualSource, setManualSource] = useState<ManualSource | null>(null);
  const [manualSourceError, setManualSourceError] = useState(false);

  useEffect(() => {
    if (!enabled) return;

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
          path: sourceFile.target
            ? toProjectPath(sourceFile.target)
            : (sourceFile.path ?? `components/ui/uai/${selectedId}.tsx`),
          packages: document.dependencies ?? [],
          // Bare names are shadcn primitives; full URLs are Uai registry items.
          primitives: (document.registryDependencies ?? []).filter((dep) => !dep.includes("/")),
          registryItems: (document.registryDependencies ?? [])
            .filter((dep) => dep.includes("/"))
            .map(
              (url) =>
                url
                  .split("/")
                  .at(-1)
                  ?.replace(/\.json$/, "") ?? url,
            ),
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setManualSourceError(true);
      }
    };

    void loadManualSource();
    return () => controller.abort();
  }, [enabled, selectedId]);

  return { manualSource, manualSourceError };
}

const manualAnchor = "manual-installation";

/** Manual installation as numbered steps. The source loads once the panel nears the viewport. */
function ManualInstall({ selectedId }: { selectedId: RegistryItemId }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { manualSource, manualSourceError } = useManualSource(selectedId, visible);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "240px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // "Install manually" links here by hash. Load right away, then re-align once
  // the source has rendered, because the anchor scroll ran against the loading state.
  useEffect(() => {
    const reveal = () => {
      if (window.location.hash === `#${manualAnchor}`) setVisible(true);
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);

  useEffect(() => {
    if (manualSource && window.location.hash === `#${manualAnchor}`) {
      sectionRef.current?.scrollIntoView({ block: "start" });
    }
  }, [manualSource]);

  const installPackages = manualSource?.packages.length
    ? `bun add ${manualSource.packages.join(" ")}`
    : null;
  const installPrimitives = manualSource?.primitives.length
    ? `bunx shadcn@latest add ${manualSource.primitives.join(" ")}`
    : null;

  return (
    <section
      ref={sectionRef}
      id={manualAnchor}
      className="uai-bench__panel"
      aria-labelledby="uai-manual-title"
    >
      <div className="uai-bench__panel-head">
        <h2 id="uai-manual-title">Manual installation</h2>
        <span className="uai-bench__file">{manualSource?.path ?? `${selectedId}.tsx`}</span>
        {manualSource ? (
          <CopyButton text={manualSource.code} label="Copy component source" />
        ) : null}
      </div>

      {manualSource ? (
        <ol className="uai-manual">
          {installPackages ? (
            <li>
              <p>Install the packages.</p>
              <div className="uai-manual__command">
                <code>{installPackages}</code>
                <CopyButton text={installPackages} label="Copy package install command" />
              </div>
            </li>
          ) : null}
          {installPrimitives ? (
            <li>
              <p>Add the shadcn primitives it composes.</p>
              <div className="uai-manual__command">
                <code>{installPrimitives}</code>
                <CopyButton text={installPrimitives} label="Copy primitive install command" />
              </div>
            </li>
          ) : null}
          <li>
            <p>Add the Uai items it builds on, by hand or with the CLI.</p>
            <ul className="uai-manual__deps">
              {manualSource.registryItems.map((name) => (
                <li key={name}>
                  <Link href={registryItemHref(name)}>{name}</Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <p>
              Create <code>{manualSource.path}</code> and paste the source.
            </p>
            <DynamicCodeBlock
              lang="tsx"
              code={manualSource.code}
              codeblock={{
                allowCopy: false,
                className: "uai-syntax-codeblock uai-syntax-codeblock--details",
              }}
            />
          </li>
        </ol>
      ) : manualSourceError ? (
        <p className="uai-manual__status" role="alert">
          The component source could not be loaded. Use the install command instead.
        </p>
      ) : (
        <p className="uai-manual__status" role="status">
          Loading component source…
        </p>
      )}
    </section>
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
  const inspector = usePersistentSize("uai:inspector-width", inspectorBounds);
  const dock = usePersistentSize("uai:dock-height", dockBounds);
  const paneSizes = {
    "--uai-inspector-width": `${inspector.size}px`,
    "--uai-dock-height": `${dock.size}px`,
  } as CSSProperties;

  return (
    <article className="uai-bench" style={paneSizes} aria-labelledby="uai-doc-title">
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
          <a href={`#${manualAnchor}`} className="uai-inspector__link">
            <ArrowDown aria-hidden="true" />
            Install manually
          </a>
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

      <ResizeHandle
        label="Resize inspector"
        axis="x"
        grow="backward"
        size={inspector.size}
        bounds={inspectorBounds}
        onResize={inspector.setSize}
        onReset={inspector.reset}
        className="uai-bench__inspector-handle"
      />

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

        <ResizeHandle
          label="Resize code panel"
          axis="y"
          grow="backward"
          size={dock.size}
          bounds={dockBounds}
          onResize={dock.setSize}
          onReset={dock.reset}
          className="uai-bench__dock-handle"
        />

        <div className="uai-bench__dock">
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

          <ManualInstall selectedId={id} />
        </div>
      </div>
    </article>
  );
}
