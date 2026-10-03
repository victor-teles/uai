"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  AppSidebar,
  type AppSidebarProps,
  type AppSidebarVariant,
} from "@/components/ui/uai/app-sidebar";
import {
  BreadcrumbTrail,
  type BreadcrumbTrailProps,
  type BreadcrumbTrailVariant,
} from "@/components/ui/uai/breadcrumb-trail";

export const DOCUMENTATION_PAGE_VARIANTS = ["columns", "stacked", "compact"] as const;
export type DocumentationPageVariant = (typeof DOCUMENTATION_PAGE_VARIANTS)[number];
export type DocumentationPageProps = ComponentProps<"div"> & {
  variant?: DocumentationPageVariant;
  /** The id of the section marked as current in the table of contents. */
  activeSection?: string;
  defaultActiveSection?: string;
  onActiveSectionChange?: (section: string) => void;
};

type DocsContext = {
  id: string;
  variant: DocumentationPageVariant;
  activeSection: string;
  setActiveSection: (section: string) => void;
};
const Context = createContext<DocsContext | null>(null);
function useDocs(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within DocumentationPage`);
  return context;
}
const SectionContext = createContext<string | null>(null);
const TocContext = createContext<string | null>(null);

const layoutCss = `
[data-uai-docs-layout]{display:grid;gap:20px;min-width:0;grid-template-columns:minmax(0,1fr);grid-template-areas:"nav" "toc" "main"}
[data-uai-docs="compact"]>[data-uai-docs-layout]{gap:12px}
[data-uai-docs-region="nav"]{grid-area:nav;min-width:0}
[data-uai-docs-region="toc"]{grid-area:toc;min-width:0}
[data-uai-docs-region="main"]{grid-area:main;min-width:0}
@container (min-width: 720px){
  [data-uai-docs="columns"]>[data-uai-docs-layout],
  [data-uai-docs="compact"]>[data-uai-docs-layout]{grid-template-columns:220px minmax(0,1fr);grid-template-rows:auto 1fr;grid-template-areas:"nav toc" "nav main";column-gap:32px}
  [data-uai-docs="compact"]>[data-uai-docs-layout]{grid-template-columns:200px minmax(0,1fr);column-gap:20px}
  [data-uai-docs="stacked"]>[data-uai-docs-layout]{grid-template-columns:minmax(0,1fr) 200px;grid-template-areas:"nav nav" "main toc";column-gap:40px}
  [data-uai-docs="stacked"] [data-uai-docs-region="toc"]{position:sticky;top:16px;align-self:start}
  [data-uai-docs-region="nav"]{align-self:start}
}
@container (min-width: 980px){
  [data-uai-docs="columns"]>[data-uai-docs-layout]{grid-template-columns:220px minmax(0,1fr) 180px;grid-template-rows:auto;grid-template-areas:"nav main toc"}
  [data-uai-docs="columns"] [data-uai-docs-region="toc"]{position:sticky;top:16px;align-self:start}
}
[data-uai-docs-content]>*{margin:0}
[data-uai-docs-content]>*+*{margin-top:16px}
[data-uai-docs-content] p{max-width:72ch}
[data-uai-docs-content] p{color:color-mix(in oklab,var(--uai-text) 88%,var(--uai-muted))}
[data-uai-docs-content] code{padding:1px 6px;border-radius:6px;background:var(--uai-surface-raised);font-family:var(--font-mono, ui-monospace, monospace);font-size:0.88em}
[data-uai-docs-content] pre{overflow-x:auto;padding:12px 14px;border-radius:10px;background:var(--uai-surface);font-size:12px;line-height:18px}
[data-uai-docs-content] pre code{padding:0;background:none;box-shadow:none;font-size:inherit}
.uai-docs-toc-link{transition:color 120ms ease-out,border-color 180ms cubic-bezier(0.23,1,0.32,1)}
.uai-docs-toc-link:not([data-active]):hover{color:var(--uai-text)}
.uai-docs-toc-link:focus-visible,.uai-docs-pager:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-docs-action{transition:background-color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-docs-action:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-docs-action:active{transform:scale(0.97)}
.uai-docs-action[data-emphasis=primary]:hover{filter:brightness(1.08)}
.uai-docs-action[data-emphasis=secondary]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-docs-pager{transition:background-color 120ms ease-out}
.uai-docs-pager:hover{background:var(--uai-surface-raised)}
.uai-docs-pager svg{transition:transform 180ms cubic-bezier(0.23,1,0.32,1)}
.uai-docs-pager[rel=next]:hover svg{transform:translateX(2px)}
.uai-docs-pager[rel=prev]:hover svg{transform:translateX(-2px)}
@media (prefers-reduced-motion: reduce){.uai-docs-toc-link,.uai-docs-action,.uai-docs-pager,.uai-docs-pager svg{transition:none}.uai-docs-action:active{transform:none}}
`;

const sidebarVariants: Record<DocumentationPageVariant, AppSidebarVariant> = {
  columns: "inset",
  stacked: "panel",
  compact: "compact",
};
const breadcrumbVariants: Record<DocumentationPageVariant, BreadcrumbTrailVariant> = {
  columns: "chevron",
  stacked: "slash",
  compact: "chevron",
};

/** Documentation with navigation, an in-page table of contents, content, and page actions. */
export function DocumentationPage({
  variant = "columns",
  activeSection,
  defaultActiveSection = "",
  onActiveSectionChange,
  children,
  style,
  ...props
}: DocumentationPageProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultActiveSection);
  const current = activeSection ?? internal;
  const latest = useRef({ current, activeSection, onActiveSectionChange });
  latest.current = { current, activeSection, onActiveSectionChange };
  const setActiveSection = useRef((next: string) => {
    const state = latest.current;
    if (next === state.current) return;
    if (state.activeSection === undefined) setInternal(next);
    state.onActiveSectionChange?.(next);
  }).current;
  return (
    <Context.Provider value={{ id, variant, activeSection: current, setActiveSection }}>
      <div
        {...props}
        data-variant={variant}
        data-uai-docs={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-docs-layout="">{children}</div>
      </div>
    </Context.Provider>
  );
}

/** Site navigation, an App Sidebar. Compose App Sidebar parts inside it. */
export function DocumentationPageNav({ style, ...props }: Omit<AppSidebarProps, "variant">) {
  const { variant } = useDocs("DocumentationPageNav");
  return (
    <AppSidebar
      {...props}
      variant={sidebarVariants[variant]}
      data-uai-docs-region="nav"
      style={{ width: "100%", height: "auto", ...style }}
    />
  );
}

/** The page content, rendered as an article named by DocumentationPageTitle. */
export function DocumentationPageMain({ style, ...props }: ComponentProps<"article">) {
  const { id, variant } = useDocs("DocumentationPageMain");
  return (
    <article
      aria-labelledby={`${id}-title`}
      {...props}
      data-uai-docs-region="main"
      style={{
        display: "grid",
        alignContent: "start",
        gap: variant === "compact" ? 16 : 24,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function DocumentationPageHeader({ style, ...props }: ComponentProps<"header">) {
  const { variant } = useDocs("DocumentationPageHeader");
  return (
    <header
      {...props}
      style={{
        display: "grid",
        gap: variant === "compact" ? 8 : 12,
        minWidth: 0,
        paddingBottom: variant === "compact" ? 12 : 16,
        borderBottom: "1px solid var(--uai-border)",
        ...style,
      }}
    />
  );
}

/** Page hierarchy, a Breadcrumb Trail. Compose BreadcrumbTrailItem parts inside it. */
export function DocumentationPageBreadcrumb(props: Omit<BreadcrumbTrailProps, "variant">) {
  const { variant } = useDocs("DocumentationPageBreadcrumb");
  return <BreadcrumbTrail {...props} variant={breadcrumbVariants[variant]} />;
}

export function DocumentationPageTitle({ style, ...props }: ComponentProps<"h1">) {
  const { id, variant } = useDocs("DocumentationPageTitle");
  return (
    <h1
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 20 : 28,
        lineHeight: variant === "compact" ? "26px" : "34px",
        fontWeight: 600,
        letterSpacing: "-0.015em",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function DocumentationPageDescription({ style, ...props }: ComponentProps<"p">) {
  const { variant } = useDocs("DocumentationPageDescription");
  return (
    <p
      {...props}
      style={{
        maxWidth: "64ch",
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: variant === "compact" ? 13 : 15,
        lineHeight: variant === "compact" ? "18px" : "22px",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

/** Page actions such as copying the page link, editing the source, or sending feedback. */
export function DocumentationPageActions({
  "aria-label": label = "Page actions",
  style,
  ...props
}: ComponentProps<"div">) {
  useDocs("DocumentationPageActions");
  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled group of actions, not a fieldset.
    <div
      role="group"
      aria-label={label}
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, ...style }}
    />
  );
}

type ActionStyleProps = { emphasis?: "primary" | "secondary" };
function actionStyle(variant: DocumentationPageVariant, emphasis: "primary" | "secondary") {
  const primary = emphasis === "primary";
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: variant === "compact" ? 26 : 28,
    padding: "0 12px",
    border: 0,
    borderRadius: 999,
    background: primary ? "var(--uai-accent)" : "var(--uai-surface-raised)",
    color: primary ? "var(--uai-accent-foreground)" : "var(--uai-text)",
    font: "inherit",
    fontSize: 12.5,
    fontWeight: 500,
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
  } as const;
}

export function DocumentationPageAction({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & ActionStyleProps) {
  const { variant } = useDocs("DocumentationPageAction");
  return (
    <button
      {...props}
      type={type}
      className={joinClass("uai-docs-action", props.className)}
      data-emphasis={emphasis}
      style={{ ...actionStyle(variant, emphasis), ...style }}
    />
  );
}

export function DocumentationPageActionLink({
  emphasis = "secondary",
  style,
  ...props
}: ComponentProps<"a"> & ActionStyleProps) {
  const { variant } = useDocs("DocumentationPageActionLink");
  return (
    <a
      {...props}
      className={joinClass("uai-docs-action", props.className)}
      data-emphasis={emphasis}
      style={{ ...actionStyle(variant, emphasis), ...style }}
    />
  );
}

/** Prose wrapper with spacing, inline code, and code block styles. */
export function DocumentationPageContent({ style, ...props }: ComponentProps<"div">) {
  useDocs("DocumentationPageContent");
  return (
    <div
      {...props}
      data-uai-docs-content=""
      style={{
        display: "grid",
        gap: 32,
        minWidth: 0,
        fontSize: 14,
        lineHeight: "22px",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

/** A linkable section. Its `id` is the target of a table of contents link. */
export function DocumentationPageSection({
  id,
  style,
  ...props
}: ComponentProps<"section"> & { id: string }) {
  useDocs("DocumentationPageSection");
  const titleId = useId();
  return (
    <SectionContext.Provider value={titleId}>
      <section
        aria-labelledby={titleId}
        {...props}
        id={id}
        data-uai-docs-section=""
        style={{ display: "grid", gap: 12, minWidth: 0, scrollMarginTop: 16, ...style }}
      />
    </SectionContext.Provider>
  );
}

export function DocumentationPageSectionTitle({ style, ...props }: ComponentProps<"h2">) {
  const id = useContext(SectionContext);
  if (!id) {
    throw new Error("DocumentationPageSectionTitle must be used within DocumentationPageSection");
  }
  return (
    <h2
      {...props}
      id={id}
      style={{
        margin: 0,
        fontSize: 17,
        lineHeight: "24px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

/**
 * In-page links. The link for the section nearest the top of the viewport is marked current;
 * selecting a link marks it current immediately.
 */
export function DocumentationPageToc({
  "aria-label": label,
  "aria-labelledby": labelledBy,
  style,
  ...props
}: ComponentProps<"nav">) {
  const context = useDocs("DocumentationPageToc");
  const titleId = useId();
  const ref = useRef<HTMLElement>(null);
  const { setActiveSection } = context;
  useEffect(() => {
    if (typeof IntersectionObserver !== "function") return;
    const targets = Array.from(ref.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? [])
      .map((link) => link.hash.slice(1))
      .map((hash) => (hash ? document.getElementById(decodeURIComponent(hash)) : null))
      .filter((target): target is HTMLElement => Boolean(target));
    if (!targets.length) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        const first = targets.find((target) => visible.has(target));
        if (first) setActiveSection(first.id);
      },
      { rootMargin: "0px 0px -65% 0px" },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [setActiveSection]);
  return (
    <TocContext.Provider value={titleId}>
      <nav
        ref={ref}
        aria-label={label}
        aria-labelledby={label ? labelledBy : (labelledBy ?? titleId)}
        {...props}
        data-uai-docs-region="toc"
        style={{
          display: "grid",
          gap: 8,
          minWidth: 0,
          padding: context.variant === "compact" ? 0 : "2px 0",
          ...style,
        }}
      />
    </TocContext.Provider>
  );
}

export function DocumentationPageTocTitle({ style, ...props }: ComponentProps<"p">) {
  const id = useContext(TocContext);
  if (!id) throw new Error("DocumentationPageTocTitle must be used within DocumentationPageToc");
  return (
    <p
      {...props}
      id={id}
      style={{
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: "16px",
        ...style,
      }}
    />
  );
}

export function DocumentationPageTocList({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gap: 0,
        margin: 0,
        padding: 0,
        listStyle: "none",
        borderInlineStart: "1px solid var(--uai-border)",
        ...style,
      }}
    />
  );
}

export type DocumentationPageTocItemProps = Omit<ComponentProps<"a">, "href"> & {
  /** The id of the target DocumentationPageSection. */
  section: string;
  /** Indent level: 2 for sections, 3 for subsections. */
  level?: 2 | 3;
};
export function DocumentationPageTocItem({
  section,
  level = 2,
  onClick,
  style,
  children,
  ...props
}: DocumentationPageTocItemProps) {
  const context = useDocs("DocumentationPageTocItem");
  const active = context.activeSection === section;
  return (
    <li style={{ display: "grid", minWidth: 0 }}>
      <a
        {...props}
        href={`#${section}`}
        aria-current={active ? "location" : undefined}
        data-active={active || undefined}
        className={joinClass("uai-docs-toc-link", props.className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) context.setActiveSection(section);
        }}
        style={{
          display: "block",
          minWidth: 0,
          marginInlineStart: -1,
          padding: `4px 8px 4px ${level === 3 ? 22 : 12}px`,
          borderInlineStart: `1px solid ${active ? "var(--uai-text)" : "transparent"}`,
          color: active ? "var(--uai-text)" : "var(--uai-subtle)",
          fontSize: 12.5,
          fontWeight: active ? 500 : 400,
          lineHeight: "16px",
          textDecoration: "none",
          overflowWrap: "anywhere",
          ...style,
        }}
      >
        {children}
      </a>
    </li>
  );
}

/** Previous and next page links at the end of the content. */
export function DocumentationPagePager({
  "aria-label": label = "Pagination",
  style,
  ...props
}: ComponentProps<"nav">) {
  useDocs("DocumentationPagePager");
  return (
    <nav
      aria-label={label}
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
        gap: 8,
        paddingTop: 8,
        ...style,
      }}
    />
  );
}

export function DocumentationPagePagerLink({
  direction,
  label,
  style,
  children,
  ...props
}: ComponentProps<"a"> & {
  direction: "previous" | "next";
  /** Visible eyebrow; defaults to "Previous" or "Next". */
  label?: string;
}) {
  const { variant } = useDocs("DocumentationPagePagerLink");
  const next = direction === "next";
  const Icon = next ? ArrowRight : ArrowLeft;
  return (
    <a
      rel={next ? "next" : "prev"}
      {...props}
      className={joinClass("uai-docs-pager", props.className)}
      style={{
        display: "grid",
        gap: 2,
        gridColumn: next ? "-2 / -1" : undefined,
        justifyItems: next ? "end" : "start",
        minWidth: 0,
        padding: variant === "compact" ? "8px 12px" : "12px 14px",
        borderRadius: variant === "compact" ? 12 : 14,
        background: "var(--uai-surface)",
        color: "var(--uai-text)",
        textAlign: next ? "end" : "start",
        textDecoration: "none",
        ...style,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          color: "var(--uai-subtle)",
          fontSize: 12,
        }}
      >
        {next ? null : <Icon size={12} strokeWidth={1.75} aria-hidden="true" />}
        {label ?? (next ? "Next" : "Previous")}
        {next ? <Icon size={12} strokeWidth={1.75} aria-hidden="true" /> : null}
      </span>
      <span style={{ fontWeight: 500, overflowWrap: "anywhere" }}>{children}</span>
    </a>
  );
}

function joinClass(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}
