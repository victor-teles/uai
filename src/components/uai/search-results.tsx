"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useState } from "react";
import {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateVariant,
} from "@/components/ui/uai/empty-state";
import {
  FilterBar,
  type FilterBarProps,
  type FilterBarVariant,
} from "@/components/ui/uai/filter-bar";
import {
  SearchField,
  type SearchFieldProps,
  type SearchFieldVariant,
} from "@/components/ui/uai/search-field";
import { SkeletonGroup, type SkeletonGroupProps } from "@/components/ui/uai/skeleton-group";

export const SEARCH_RESULTS_VARIANTS = ["list", "sidebar", "compact"] as const;
export type SearchResultsVariant = (typeof SEARCH_RESULTS_VARIANTS)[number];
export type SearchResultsProps = ComponentProps<"div"> & { variant?: SearchResultsVariant };

type ResultsContext = { id: string; variant: SearchResultsVariant };
const Context = createContext<ResultsContext | null>(null);
function useResults(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within SearchResults`);
  return context;
}
const ItemContext = createContext<string | null>(null);

const fieldVariants: Record<SearchResultsVariant, SearchFieldVariant> = {
  list: "rounded",
  sidebar: "pill",
  compact: "compact",
};
const filterVariants: Record<SearchResultsVariant, FilterBarVariant> = {
  list: "toolbar",
  sidebar: "panel",
  compact: "compact",
};
const emptyVariants: Record<SearchResultsVariant, EmptyStateVariant> = {
  list: "plain",
  sidebar: "plain",
  compact: "compact",
};

const interactionCss = `
[data-uai-search-sort],[data-uai-search-page],[data-uai-search-item]{transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-search-sort]{background:var(--uai-surface-raised)}
[data-uai-search-sort]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
[data-uai-search-page]{background:transparent;color:var(--uai-muted)}
[data-uai-search-page]:hover:not(:disabled){background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-search-page][aria-current="page"]{background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-search-page]:active:not(:disabled){transform:scale(0.97)}
[data-uai-search-page]:disabled{cursor:default}
[data-uai-search-item]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 60%,transparent)}
[data-uai-search-item] h3 a{text-decoration-line:none}
[data-uai-search-item] h3 a:hover{text-decoration-line:underline}
[data-uai-search-sort]:focus-visible,[data-uai-search-page]:focus-visible,[data-uai-search-item] a:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@keyframes uai-search-enter{from{opacity:0;transform:translateY(4px)}}
[data-uai-search-item]{animation:uai-search-enter 240ms cubic-bezier(0.23,1,0.32,1) both}
[data-uai-search-item]:nth-child(2){animation-delay:40ms}
[data-uai-search-item]:nth-child(3){animation-delay:80ms}
[data-uai-search-item]:nth-child(4){animation-delay:120ms}
[data-uai-search-item]:nth-child(5){animation-delay:160ms}
[data-uai-search-item]:nth-child(n+6){animation-delay:200ms}
@media (prefers-reduced-motion: reduce){[data-uai-search-sort],[data-uai-search-page],[data-uai-search-item]{transition:none;animation:none}[data-uai-search-page]:active:not(:disabled){transform:none}}`;

/** Query, filters, and ranked results. Sidebar filters wrap above the results on narrow widths. */
export function SearchResults({ variant = "list", children, style, ...props }: SearchResultsProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <div
        {...props}
        data-variant={variant}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: variant === "compact" ? 8 : 16,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{interactionCss}</style>
        {children}
      </div>
    </Context.Provider>
  );
}

/** The query field inside a search landmark. Compose Search Field parts inside it. */
export function SearchResultsQuery({ style, ...props }: Omit<SearchFieldProps, "variant">) {
  const context = useResults("SearchResultsQuery");
  return (
    // biome-ignore lint/a11y/useSemanticElements: the search element is not yet recognized everywhere React runs.
    <div role="search" style={{ flex: "1 1 100%", minWidth: 0 }}>
      <SearchField {...props} variant={fieldVariants[context.variant]} style={style} />
    </div>
  );
}

/** Refinements for the result set. Compose Filter Bar parts inside it. */
export function SearchResultsFilters({
  "aria-label": label = "Filters",
  style,
  ...props
}: Omit<FilterBarProps, "variant">) {
  const context = useResults("SearchResultsFilters");
  const sidebar = context.variant === "sidebar";
  return (
    <FilterBar
      role="group"
      aria-label={label}
      {...props}
      variant={filterVariants[context.variant]}
      style={{
        flex: sidebar ? "1 1 200px" : "1 1 100%",
        maxWidth: sidebar ? 240 : undefined,
        ...style,
      }}
    />
  );
}

export function SearchResultsMain({ style, ...props }: ComponentProps<"div">) {
  const context = useResults("SearchResultsMain");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: context.variant === "compact" ? 8 : 12,
        flex: "999 1 360px",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function SearchResultsBar({ style, ...props }: ComponentProps<"div">) {
  useResults("SearchResultsBar");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** Result count and query, announced politely when it changes. */
export function SearchResultsSummary({ style, ...props }: ComponentProps<"p">) {
  const context = useResults("SearchResultsSummary");
  return (
    <p
      role="status"
      {...props}
      id={`${context.id}-summary`}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 12.5,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

/** A labelled native select for ranking. The consumer supplies the options. */
export function SearchResultsSort({
  label = "Sort by",
  style,
  ...props
}: Omit<ComponentProps<"select">, "id"> & { label?: string }) {
  const context = useResults("SearchResultsSort");
  const compact = context.variant === "compact";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <label htmlFor={`${context.id}-sort`} style={{ color: "var(--uai-subtle)", fontSize: 12 }}>
        {label}
      </label>
      <select
        {...props}
        id={`${context.id}-sort`}
        data-uai-search-sort=""
        style={{
          height: compact ? 26 : 28,
          padding: "0 6px 0 10px",
          border: 0,
          borderRadius: 8,
          color: "var(--uai-text)",
          font: "inherit",
          fontSize: compact ? 12 : 12.5,
          fontWeight: 500,
          cursor: "pointer",
          ...style,
        }}
      />
    </span>
  );
}

export function SearchResultsList({ style, ...props }: ComponentProps<"ol">) {
  const context = useResults("SearchResultsList");
  return (
    <ol
      aria-describedby={`${context.id}-summary`}
      {...props}
      style={{
        display: "grid",
        gap: context.variant === "compact" ? 0 : 2,
        margin: context.variant === "compact" ? "0 -8px" : "0 -12px",
        padding: 0,
        listStyle: "none",
        ...style,
      }}
    />
  );
}

export function SearchResultsItem({ children, style, ...props }: ComponentProps<"li">) {
  const { variant } = useResults("SearchResultsItem");
  const id = useId();
  return (
    <ItemContext.Provider value={id}>
      <li
        {...props}
        data-uai-search-item=""
        style={{
          padding: variant === "compact" ? "7px 8px" : "12px 12px",
          borderRadius: variant === "compact" ? 8 : 12,
          ...style,
        }}
      >
        <article
          aria-labelledby={id}
          style={{ display: "grid", gap: variant === "compact" ? 2 : 4, minWidth: 0 }}
        >
          {children}
        </article>
      </li>
    </ItemContext.Provider>
  );
}

export function SearchResultsItemTitle({
  href,
  children,
  style,
  ...props
}: ComponentProps<"h3"> & { href?: string }) {
  const id = useContext(ItemContext);
  const { variant } = useResults("SearchResultsItemTitle");
  if (!id) throw new Error("SearchResultsItemTitle must be used within SearchResultsItem");
  return (
    <h3
      {...props}
      id={id}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 13 : 14,
        lineHeight: "20px",
        fontWeight: 500,
        overflowWrap: "anywhere",
        ...style,
      }}
    >
      {href ? (
        <a
          href={href}
          style={{
            color: "inherit",
            textDecorationColor: "var(--uai-border-strong)",
            textUnderlineOffset: 3,
          }}
        >
          {children}
        </a>
      ) : (
        children
      )}
    </h3>
  );
}

/** Source, path, date, or ranking context for a result. */
export function SearchResultsItemMeta({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        ...style,
      }}
    />
  );
}

export function SearchResultsItemSnippet({ style, ...props }: ComponentProps<"p">) {
  const { variant } = useResults("SearchResultsItemSnippet");
  if (variant === "compact") return null;
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        textWrap: "pretty",
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

/** Marks query terms inside a title or snippet. */
export function SearchResultsHighlight({ style, ...props }: ComponentProps<"mark">) {
  return (
    <mark
      {...props}
      style={{
        padding: "0 2px",
        borderRadius: 4,
        background: "color-mix(in oklab, var(--uai-accent) 20%, transparent)",
        color: "var(--uai-text)",
        fontWeight: 500,
        ...style,
      }}
    />
  );
}

/** No-results state. Compose Empty State parts inside it. */
export function SearchResultsEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = useResults("SearchResultsEmpty");
  return <EmptyState {...props} variant={emptyVariants[context.variant]} />;
}

/** Placeholder results while a query runs. Compose Skeleton Group parts inside it. */
export function SearchResultsLoading({ label = "Loading results…", ...props }: SkeletonGroupProps) {
  useResults("SearchResultsLoading");
  return <SkeletonGroup {...props} label={label} />;
}

export type SearchResultsPaginationProps = Omit<ComponentProps<"nav">, "onChange"> & {
  pageCount: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
};

function visiblePages(page: number, count: number) {
  const pages = new Set([1, count, page - 1, page, page + 1]);
  const sorted = [...pages].filter((value) => value >= 1 && value <= count).sort((a, b) => a - b);
  const output: (number | "gap")[] = [];
  for (const value of sorted) {
    const previous = output[output.length - 1];
    if (typeof previous === "number" && value - previous > 1) output.push("gap");
    output.push(value);
  }
  return output;
}

/** Previous, numbered, and next page buttons. The current page uses aria-current. */
export function SearchResultsPagination({
  pageCount,
  page,
  defaultPage = 1,
  onPageChange,
  "aria-label": label = "Pagination",
  style,
  ...props
}: SearchResultsPaginationProps) {
  const { variant } = useResults("SearchResultsPagination");
  const [internal, setInternal] = useState(defaultPage);
  const current = Math.min(Math.max(page ?? internal, 1), Math.max(pageCount, 1));
  const go = (next: number) => {
    if (next === current || next < 1 || next > pageCount) return;
    if (page === undefined) setInternal(next);
    onPageChange?.(next);
  };
  const size = variant === "compact" ? 24 : 28;
  const button = {
    display: "inline-grid",
    placeItems: "center",
    minWidth: size,
    height: size,
    padding: "0 6px",
    border: 0,
    borderRadius: 8,
    font: "inherit",
    fontSize: 12.5,
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
    cursor: "pointer",
  } as const;
  if (pageCount <= 1) return null;
  return (
    <nav aria-label={label} {...props} style={{ minWidth: 0, ...style }}>
      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        <li>
          <button
            type="button"
            aria-label="Previous page"
            disabled={current === 1}
            onClick={() => go(current - 1)}
            data-uai-search-page=""
            style={{ ...button, opacity: current === 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={15} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </li>
        {visiblePages(current, pageCount).map((value, index) =>
          value === "gap" ? (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: gaps have no identity beyond their position.
              key={`gap-${index}`}
              aria-hidden="true"
              style={{ minWidth: size, textAlign: "center", color: "var(--uai-subtle)" }}
            >
              …
            </li>
          ) : (
            <li key={value}>
              <button
                type="button"
                aria-label={`Page ${value}`}
                aria-current={value === current ? "page" : undefined}
                onClick={() => go(value)}
                data-uai-search-page=""
                style={button}
              >
                {value}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            aria-label="Next page"
            disabled={current === pageCount}
            onClick={() => go(current + 1)}
            data-uai-search-page=""
            style={{ ...button, opacity: current === pageCount ? 0.4 : 1 }}
          >
            <ChevronRight size={15} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
