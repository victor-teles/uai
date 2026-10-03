"use client";

import { cva } from "class-variance-authority";
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
import { cn } from "@/lib/uai-utils";

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

const interactiveTransition =
  "[transition:background-color_120ms_ease-out,color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const searchResultsVariants = cva(
  "flex min-w-0 flex-wrap items-start text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        list: "gap-4",
        sidebar: "gap-4",
        compact: "gap-2",
      },
    },
  },
);

/** Query, filters, and ranked results. Sidebar filters wrap above the results on narrow widths. */
export function SearchResults({
  variant = "list",
  children,
  className,
  ...props
}: SearchResultsProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <div
        data-slot="search-results"
        data-variant={variant}
        className={cn(searchResultsVariants({ variant }), className)}
        {...props}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

/** The query field inside a search landmark. Compose Search Field parts inside it. */
export function SearchResultsQuery(props: Omit<SearchFieldProps, "variant">) {
  const context = useResults("SearchResultsQuery");
  return (
    // biome-ignore lint/a11y/useSemanticElements: the search element is not yet recognized everywhere React runs.
    <div role="search" data-slot="search-results-query" className="min-w-0 flex-[1_1_100%]">
      <SearchField {...props} variant={fieldVariants[context.variant]} />
    </div>
  );
}

/** Refinements for the result set. Compose Filter Bar parts inside it. */
export function SearchResultsFilters({
  "aria-label": label = "Filters",
  className,
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
      className={cn(sidebar ? "max-w-[240px] flex-[1_1_200px]" : "flex-[1_1_100%]", className)}
    />
  );
}

export function SearchResultsMain({ className, ...props }: ComponentProps<"div">) {
  const context = useResults("SearchResultsMain");
  return (
    <div
      data-slot="search-results-main"
      className={cn(
        "grid min-w-0 flex-[999_1_360px] content-start",
        context.variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function SearchResultsBar({ className, ...props }: ComponentProps<"div">) {
  useResults("SearchResultsBar");
  return (
    <div
      data-slot="search-results-bar"
      className={cn("flex min-w-0 flex-wrap items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

/** Result count and query, announced politely when it changes. */
export function SearchResultsSummary({ className, ...props }: ComponentProps<"p">) {
  const context = useResults("SearchResultsSummary");
  return (
    <p
      role="status"
      data-slot="search-results-summary"
      className={cn("m-0 text-[12.5px] text-muted-foreground tabular-nums", className)}
      {...props}
      id={`${context.id}-summary`}
    />
  );
}

/** A labelled native select for ranking. The consumer supplies the options. */
export function SearchResultsSort({
  label = "Sort by",
  className,
  ...props
}: Omit<ComponentProps<"select">, "id"> & { label?: string }) {
  const context = useResults("SearchResultsSort");
  const compact = context.variant === "compact";
  return (
    <span className="inline-flex items-center gap-2">
      <label htmlFor={`${context.id}-sort`} className="text-[12px] text-subtle-foreground">
        {label}
      </label>
      <select
        data-slot="search-results-sort"
        className={cn(
          "cursor-pointer rounded-lg border-0 bg-secondary pr-1.5 pl-2.5 font-medium text-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
          compact ? "h-[26px] text-[12px]" : "h-7 text-[12.5px]",
          interactiveTransition,
          focusRing,
          className,
        )}
        {...props}
        id={`${context.id}-sort`}
      />
    </span>
  );
}

export function SearchResultsList({ className, ...props }: ComponentProps<"ol">) {
  const context = useResults("SearchResultsList");
  return (
    <ol
      aria-describedby={`${context.id}-summary`}
      data-slot="search-results-list"
      className={cn(
        "my-0 grid list-none p-0",
        context.variant === "compact" ? "-mx-2 gap-0" : "-mx-3 gap-0.5",
        className,
      )}
      {...props}
    />
  );
}

export function SearchResultsItem({ children, className, ...props }: ComponentProps<"li">) {
  const { variant } = useResults("SearchResultsItem");
  const id = useId();
  const compact = variant === "compact";
  return (
    <ItemContext.Provider value={id}>
      <li
        data-slot="search-results-item"
        className={cn(
          "animate-in fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint fill-mode-both nth-2:[animation-delay:40ms] nth-3:[animation-delay:80ms] nth-4:[animation-delay:120ms] nth-5:[animation-delay:160ms] nth-[n+6]:[animation-delay:200ms] hover:bg-accent/60 motion-reduce:animate-none [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-ring [&_h3_a]:no-underline [&_h3_a]:hover:underline",
          interactiveTransition,
          compact ? "rounded-lg px-2 py-[7px]" : "rounded-xl p-3",
          className,
        )}
        {...props}
      >
        <article aria-labelledby={id} className={cn("grid min-w-0", compact ? "gap-0.5" : "gap-1")}>
          {children}
        </article>
      </li>
    </ItemContext.Provider>
  );
}

export function SearchResultsItemTitle({
  href,
  children,
  className,
  ...props
}: ComponentProps<"h3"> & { href?: string }) {
  const id = useContext(ItemContext);
  const { variant } = useResults("SearchResultsItemTitle");
  if (!id) throw new Error("SearchResultsItemTitle must be used within SearchResultsItem");
  return (
    <h3
      data-slot="search-results-item-title"
      className={cn(
        "m-0 font-medium wrap-anywhere",
        variant === "compact" ? "text-[13px]/5" : "text-sm/5",
        className,
      )}
      {...props}
      id={id}
    >
      {href ? (
        <a href={href} className="text-inherit decoration-border-strong underline-offset-3">
          {children}
        </a>
      ) : (
        children
      )}
    </h3>
  );
}

/** Source, path, date, or ranking context for a result. */
export function SearchResultsItemMeta({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="search-results-item-meta"
      className={cn("m-0 flex flex-wrap gap-1.5 text-[12px] text-subtle-foreground", className)}
      {...props}
    />
  );
}

export function SearchResultsItemSnippet({ className, ...props }: ComponentProps<"p">) {
  const { variant } = useResults("SearchResultsItemSnippet");
  if (variant === "compact") return null;
  return (
    <p
      data-slot="search-results-item-snippet"
      className={cn("m-0 text-pretty wrap-anywhere text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Marks query terms inside a title or snippet. */
export function SearchResultsHighlight({ className, ...props }: ComponentProps<"mark">) {
  return (
    <mark
      data-slot="search-results-highlight"
      className={cn("rounded-[4px] bg-primary/20 px-0.5 font-medium text-foreground", className)}
      {...props}
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
  className,
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
  const size = variant === "compact" ? "min-w-6" : "min-w-7";
  const button = cn(
    "inline-grid cursor-pointer place-items-center rounded-lg border-0 bg-transparent px-1.5 text-[12.5px] font-medium text-muted-foreground tabular-nums enabled:hover:bg-accent enabled:hover:text-foreground enabled:active:scale-[0.97] disabled:cursor-default disabled:opacity-40 aria-[current=page]:bg-accent aria-[current=page]:text-foreground motion-reduce:enabled:active:scale-100",
    size,
    variant === "compact" ? "h-6" : "h-7",
    interactiveTransition,
    focusRing,
  );
  if (pageCount <= 1) return null;
  return (
    <nav
      aria-label={label}
      data-slot="search-results-pagination"
      className={cn("min-w-0", className)}
      {...props}
    >
      <ul className="m-0 flex list-none flex-wrap items-center gap-0.5 p-0">
        <li>
          <button
            type="button"
            aria-label="Previous page"
            disabled={current === 1}
            onClick={() => go(current - 1)}
            className={button}
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
              className={cn("text-center text-subtle-foreground", size)}
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
                className={button}
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
            className={button}
          >
            <ChevronRight size={15} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
