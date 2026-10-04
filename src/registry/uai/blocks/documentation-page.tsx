"use client";

import { cva } from "class-variance-authority";
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
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/uai-utils";

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

const documentationPageLayoutVariants = cva(
  "grid min-w-0 grid-cols-[minmax(0,1fr)] [grid-template-areas:'nav'_'toc'_'main']",
  {
    variants: {
      variant: {
        columns:
          "gap-5 @min-[720px]:grid-cols-[220px_minmax(0,1fr)] @min-[720px]:grid-rows-[auto_1fr] @min-[720px]:gap-x-8 @min-[720px]:[grid-template-areas:'nav_toc'_'nav_main'] @min-[980px]:grid-cols-[220px_minmax(0,1fr)_180px] @min-[980px]:grid-rows-[auto] @min-[980px]:[grid-template-areas:'nav_main_toc']",
        stacked:
          "gap-5 @min-[720px]:grid-cols-[minmax(0,1fr)_200px] @min-[720px]:gap-x-10 @min-[720px]:[grid-template-areas:'nav_nav'_'main_toc']",
        compact:
          "gap-3 @min-[720px]:grid-cols-[200px_minmax(0,1fr)] @min-[720px]:grid-rows-[auto_1fr] @min-[720px]:gap-x-5 @min-[720px]:[grid-template-areas:'nav_toc'_'nav_main']",
      },
    },
  },
);

/** Documentation with navigation, an in-page table of contents, content, and page actions. */
export function DocumentationPage({
  variant = "columns",
  activeSection,
  defaultActiveSection = "",
  onActiveSectionChange,
  children,
  className,
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
        data-slot="documentation-page"
        className={cn(
          "@container box-border min-w-0 text-[13px]/[18px] text-foreground",
          className,
        )}
        {...props}
        data-variant={variant}
      >
        <div
          data-slot="documentation-page-layout"
          className={documentationPageLayoutVariants({ variant })}
        >
          {children}
        </div>
      </div>
    </Context.Provider>
  );
}

/** Site navigation, an App Sidebar. Compose App Sidebar parts inside it. */
export function DocumentationPageNav({ className, ...props }: Omit<AppSidebarProps, "variant">) {
  const { variant } = useDocs("DocumentationPageNav");
  return (
    <AppSidebar
      {...props}
      variant={sidebarVariants[variant]}
      className={cn("h-auto w-full min-w-0 [grid-area:nav] @min-[720px]:self-start", className)}
    />
  );
}

/** The page content, rendered as an article named by DocumentationPageTitle. */
export function DocumentationPageMain({ className, ...props }: ComponentProps<"article">) {
  const { id, variant } = useDocs("DocumentationPageMain");
  return (
    <article
      aria-labelledby={`${id}-title`}
      data-slot="documentation-page-main"
      className={cn(
        "grid min-w-0 content-start [grid-area:main]",
        variant === "compact" ? "gap-4" : "gap-6",
        className,
      )}
      {...props}
    />
  );
}

export function DocumentationPageHeader({ className, ...props }: ComponentProps<"header">) {
  const { variant } = useDocs("DocumentationPageHeader");
  return (
    <header
      data-slot="documentation-page-header"
      className={cn(
        "grid min-w-0 border-b",
        variant === "compact" ? "gap-2 pb-3" : "gap-3 pb-4",
        className,
      )}
      {...props}
    />
  );
}

/** Page hierarchy, a Breadcrumb Trail. Compose BreadcrumbTrailItem parts inside it. */
export function DocumentationPageBreadcrumb(props: Omit<BreadcrumbTrailProps, "variant">) {
  const { variant } = useDocs("DocumentationPageBreadcrumb");
  return <BreadcrumbTrail {...props} variant={breadcrumbVariants[variant]} />;
}

export function DocumentationPageTitle({ className, ...props }: ComponentProps<"h1">) {
  const { id, variant } = useDocs("DocumentationPageTitle");
  return (
    <h1
      data-slot="documentation-page-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.015em] text-balance",
        variant === "compact" ? "text-xl/[26px]" : "text-[28px]/[34px]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function DocumentationPageDescription({ className, ...props }: ComponentProps<"p">) {
  const { variant } = useDocs("DocumentationPageDescription");
  return (
    <p
      data-slot="documentation-page-description"
      className={cn(
        "m-0 max-w-[64ch] text-pretty text-muted-foreground",
        variant === "compact" ? "text-[13px]/[18px]" : "text-[15px]/[22px]",
        className,
      )}
      {...props}
    />
  );
}

/** Page actions such as copying the page link, editing the source, or sending feedback. */
export function DocumentationPageActions({
  "aria-label": label = "Page actions",
  className,
  ...props
}: ComponentProps<"div">) {
  useDocs("DocumentationPageActions");
  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled group of actions, not a fieldset.
    <div
      role="group"
      aria-label={label}
      data-slot="documentation-page-actions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

type ActionStyleProps = { emphasis?: "primary" | "secondary" };
const documentationPageActionVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 px-3 has-[>svg]:px-3 text-[12.5px] font-medium whitespace-nowrap no-underline [transition:background-color_120ms_ease-out,filter_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] py-0 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:[transform:scale(0.97)] motion-reduce:transition-none motion-reduce:active:[transform:none] [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      emphasis: {
        primary: "bg-primary text-primary-foreground hover:bg-primary hover:brightness-108",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
      },
      compact: { true: "h-[26px]", false: "h-7" },
    },
  },
);

export function DocumentationPageAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & ActionStyleProps) {
  const { variant } = useDocs("DocumentationPageAction");
  return (
    <Button
      data-slot="documentation-page-action"
      variant={emphasis === "primary" ? "default" : "secondary"}
      className={cn(
        documentationPageActionVariants({ emphasis, compact: variant === "compact" }),
        className,
      )}
      {...props}
      type={type}
      data-emphasis={emphasis}
    />
  );
}

export function DocumentationPageActionLink({
  emphasis = "secondary",
  className,
  ...props
}: ComponentProps<"a"> & ActionStyleProps) {
  const { variant } = useDocs("DocumentationPageActionLink");
  return (
    <Button
      asChild
      variant={emphasis === "primary" ? "default" : "secondary"}
      className={cn(
        documentationPageActionVariants({ emphasis, compact: variant === "compact" }),
        className,
      )}
    >
      <a data-slot="documentation-page-action-link" {...props} data-emphasis={emphasis} />
    </Button>
  );
}

/** Prose wrapper with spacing, inline code, and code block styles. */
export function DocumentationPageContent({ className, ...props }: ComponentProps<"div">) {
  useDocs("DocumentationPageContent");
  return (
    <div
      data-slot="documentation-page-content"
      className={cn(
        "grid min-w-0 gap-8 text-sm/[22px] text-pretty",
        "[&>*]:mx-0 [&>*]:mb-0 [&>*+*]:mt-4 [&>:first-child]:mt-0",
        "[&_p]:max-w-[72ch] [&_p]:text-[color-mix(in_oklab,var(--foreground)_88%,var(--muted-foreground))]",
        "[&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-px [&_code]:font-mono [&_code]:text-[0.88em]",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-[10px] [&_pre]:bg-card [&_pre]:px-3.5 [&_pre]:py-3 [&_pre]:text-[12px]/[18px]",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[length:inherit] [&_pre_code]:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

/** A linkable section. Its `id` is the target of a table of contents link. */
export function DocumentationPageSection({
  id,
  className,
  ...props
}: ComponentProps<"section"> & { id: string }) {
  useDocs("DocumentationPageSection");
  const titleId = useId();
  return (
    <SectionContext.Provider value={titleId}>
      <section
        aria-labelledby={titleId}
        data-slot="documentation-page-section"
        className={cn("grid min-w-0 scroll-mt-4 gap-3", className)}
        {...props}
        id={id}
      />
    </SectionContext.Provider>
  );
}

export function DocumentationPageSectionTitle({ className, ...props }: ComponentProps<"h2">) {
  const id = useContext(SectionContext);
  if (!id) {
    throw new Error("DocumentationPageSectionTitle must be used within DocumentationPageSection");
  }
  return (
    <h2
      data-slot="documentation-page-section-title"
      className={cn("m-0 text-[17px]/6 font-semibold tracking-[-0.01em]", className)}
      {...props}
      id={id}
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
  className,
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
        data-slot="documentation-page-toc"
        className={cn(
          "grid min-w-0 gap-2 [grid-area:toc]",
          context.variant === "compact" ? "p-0" : "py-0.5",
          context.variant === "stacked" &&
            "@min-[720px]:sticky @min-[720px]:top-4 @min-[720px]:self-start",
          context.variant === "columns" &&
            "@min-[980px]:sticky @min-[980px]:top-4 @min-[980px]:self-start",
          className,
        )}
        {...props}
      />
    </TocContext.Provider>
  );
}

export function DocumentationPageTocTitle({ className, ...props }: ComponentProps<"p">) {
  const id = useContext(TocContext);
  if (!id) throw new Error("DocumentationPageTocTitle must be used within DocumentationPageToc");
  return (
    <p
      data-slot="documentation-page-toc-title"
      className={cn("m-0 text-[11.5px]/4 font-medium text-subtle-foreground", className)}
      {...props}
      id={id}
    />
  );
}

export function DocumentationPageTocList({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="documentation-page-toc-list"
      className={cn("m-0 grid list-none gap-0 border-s p-0", className)}
      {...props}
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
  className,
  children,
  ...props
}: DocumentationPageTocItemProps) {
  const context = useDocs("DocumentationPageTocItem");
  const active = context.activeSection === section;
  return (
    <li data-slot="documentation-page-toc-entry" className="grid min-w-0">
      <a
        data-slot="documentation-page-toc-item"
        className={cn(
          "-ms-px block min-w-0 border-s py-1 pr-2 text-[12.5px]/4 no-underline wrap-anywhere [transition:color_120ms_ease-out,border-color_180ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
          level === 3 ? "pl-[22px]" : "pl-3",
          active
            ? "border-s-foreground font-medium text-foreground"
            : "border-s-transparent font-normal text-subtle-foreground hover:text-foreground",
          className,
        )}
        {...props}
        href={`#${section}`}
        aria-current={active ? "location" : undefined}
        data-active={active || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) context.setActiveSection(section);
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
  className,
  ...props
}: ComponentProps<"nav">) {
  useDocs("DocumentationPagePager");
  return (
    <nav
      aria-label={label}
      data-slot="documentation-page-pager"
      className={cn(
        "grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-2 pt-2",
        className,
      )}
      {...props}
    />
  );
}

export function DocumentationPagePagerLink({
  direction,
  label,
  className,
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
      data-slot="documentation-page-pager-link"
      data-direction={direction}
      className={cn(
        "grid min-w-0 gap-0.5 bg-card text-foreground no-underline transition-[background-color] duration-120 ease-[ease-out] hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:transition-transform [&_svg]:duration-180 [&_svg]:ease-out-quint motion-reduce:transition-none motion-reduce:[&_svg]:transition-none",
        next
          ? "col-[-2/-1] justify-items-end text-end hover:[&_svg]:translate-x-0.5"
          : "justify-items-start text-start hover:[&_svg]:-translate-x-0.5",
        variant === "compact" ? "rounded-xl px-3 py-2" : "rounded-[14px] px-3.5 py-3",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1 text-[12px] text-subtle-foreground">
        {next ? null : <Icon size={12} className="size-3" strokeWidth={1.75} aria-hidden="true" />}
        {label ?? (next ? "Next" : "Previous")}
        {next ? <Icon size={12} className="size-3" strokeWidth={1.75} aria-hidden="true" /> : null}
      </span>
      <span className="font-medium wrap-anywhere">{children}</span>
    </a>
  );
}
