"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import {
  ChangelogEntry,
  type ChangelogEntryProps,
  type ChangelogEntryVariant,
} from "@/components/ui/uai/changelog-entry";
import { EmptyState, type EmptyStateProps } from "@/components/ui/uai/empty-state";
import {
  FilterBar,
  type FilterBarProps,
  type FilterBarVariant,
} from "@/components/ui/uai/filter-bar";
import { cn } from "@/lib/uai-utils";

export const CHANGELOG_PAGE_VARIANTS = ["timeline", "cards", "compact"] as const;
export type ChangelogPageVariant = (typeof CHANGELOG_PAGE_VARIANTS)[number];
export type ChangelogPageFilterName = "category" | "area";
export type ChangelogPageProps = ComponentProps<"section"> & {
  variant?: ChangelogPageVariant;
  /** Selected category filter. An empty string shows every category. */
  category?: string;
  defaultCategory?: string;
  onCategoryChange?: (category: string) => void;
  /** Selected product area filter. An empty string shows every area. */
  area?: string;
  defaultArea?: string;
  onAreaChange?: (area: string) => void;
};

type Registry = {
  register: (key: string, visible: boolean) => void;
  remove: (key: string) => void;
};
type PageContext = Registry & {
  id: string;
  variant: ChangelogPageVariant;
  filters: Record<ChangelogPageFilterName, string>;
  setFilter: (name: ChangelogPageFilterName, value: string) => void;
  total: number;
  visible: number;
};
const Context = createContext<PageContext | null>(null);
function usePage(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ChangelogPage`);
  return context;
}
const GroupContext = createContext<(Registry & { titleId: string }) | null>(null);

const changelogPageVariants = cva("grid min-w-0 text-[13px]/[18px] text-foreground", {
  variants: {
    variant: { timeline: "gap-7", cards: "gap-7", compact: "gap-4" },
  },
});

const entryVariants: Record<ChangelogPageVariant, ChangelogEntryVariant> = {
  timeline: "timeline",
  cards: "card",
  compact: "compact",
};
const filterVariants: Record<ChangelogPageVariant, FilterBarVariant> = {
  timeline: "toolbar",
  cards: "toolbar",
  compact: "compact",
};

function useRegistry() {
  const [entries, setEntries] = useState<Record<string, boolean>>({});
  const register = useCallback(
    (key: string, visible: boolean) =>
      setEntries((current) =>
        current[key] === visible ? current : { ...current, [key]: visible },
      ),
    [],
  );
  const remove = useCallback(
    (key: string) =>
      setEntries((current) => {
        if (!(key in current)) return current;
        const { [key]: _, ...rest } = current;
        return rest;
      }),
    [],
  );
  const values = Object.values(entries);
  return {
    register,
    remove,
    total: values.length,
    visible: values.filter(Boolean).length,
  };
}

/** Releases grouped by date, with version, category, and product area filters. */
export function ChangelogPage({
  variant = "timeline",
  category,
  defaultCategory = "",
  onCategoryChange,
  area,
  defaultArea = "",
  onAreaChange,
  children,
  className,
  ...props
}: ChangelogPageProps) {
  const id = useId();
  const [internalCategory, setInternalCategory] = useState(defaultCategory);
  const [internalArea, setInternalArea] = useState(defaultArea);
  const filters = { category: category ?? internalCategory, area: area ?? internalArea };
  const registry = useRegistry();
  const setFilter = (name: ChangelogPageFilterName, value: string) => {
    if (filters[name] === value) return;
    if (name === "category") {
      if (category === undefined) setInternalCategory(value);
      onCategoryChange?.(value);
    } else {
      if (area === undefined) setInternalArea(value);
      onAreaChange?.(value);
    }
  };
  return (
    <Context.Provider value={{ id, variant, filters, setFilter, ...registry }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="changelog-page"
        className={cn(changelogPageVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function ChangelogPageHeader({ className, ...props }: ComponentProps<"header">) {
  const { variant } = usePage("ChangelogPageHeader");
  return (
    <header
      data-slot="changelog-page-header"
      className={cn(
        "flex min-w-0 flex-wrap items-end justify-between",
        variant === "compact" ? "gap-2" : "gap-4",
        className,
      )}
      {...props}
    />
  );
}

export function ChangelogPageTitle({ className, ...props }: ComponentProps<"h1">) {
  const { id, variant } = usePage("ChangelogPageTitle");
  return (
    <h1
      data-slot="changelog-page-title"
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

export function ChangelogPageDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="changelog-page-description"
      className={cn("m-0 max-w-[60ch] text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** A Filter Bar whose reset clears the category and area filters. */
export function ChangelogPageFilters(
  props: Omit<FilterBarProps, "variant" | "activeCount" | "onReset">,
) {
  const context = usePage("ChangelogPageFilters");
  return (
    <FilterBar
      data-slot="changelog-page-filters"
      {...props}
      variant={filterVariants[context.variant]}
      activeCount={[context.filters.category, context.filters.area].filter(Boolean).length}
      onReset={() => {
        context.setFilter("category", "");
        context.setFilter("area", "");
      }}
    />
  );
}

export type ChangelogPageFilterProps = Omit<
  ComponentProps<"select">,
  "value" | "defaultValue" | "name"
> & {
  name: ChangelogPageFilterName;
  /** Visible label for the select. */
  label: string;
};
/** A labelled native select. Use an option with an empty value for "All". */
export function ChangelogPageFilter({
  name,
  label,
  onChange,
  className,
  children,
  ...props
}: ChangelogPageFilterProps) {
  const context = usePage("ChangelogPageFilter");
  const id = useId();
  const compact = context.variant === "compact";
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <label htmlFor={id} className="text-[12px] text-subtle-foreground">
        {label}
      </label>
      <select
        data-slot="changelog-page-filter"
        className={cn(
          "max-w-full cursor-pointer rounded-full border-0 bg-secondary px-2.5 text-[12.5px] font-medium text-secondary-foreground transition-colors duration-120 ease-[ease-out] hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
          compact ? "h-6" : "h-7",
          className,
        )}
        {...props}
        id={id}
        name={name}
        value={context.filters[name]}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented) context.setFilter(name, event.target.value);
        }}
      >
        {children}
      </select>
    </span>
  );
}

/** A polite status with the number of matching releases. */
export function ChangelogPageCount({ className, children, ...props }: ComponentProps<"p">) {
  const { visible, total } = usePage("ChangelogPageCount");
  return (
    <p
      role="status"
      data-slot="changelog-page-count"
      className={cn("m-0 text-[12px] text-subtle-foreground tabular-nums", className)}
      {...props}
    >
      {children ??
        (visible === total
          ? `${total} ${total === 1 ? "release" : "releases"}`
          : `Showing ${visible} of ${total} releases`)}
    </p>
  );
}

/** Releases for one period. The group hides itself when none of its releases match. */
export function ChangelogPageGroup({ className, ...props }: ComponentProps<"section">) {
  const { variant } = usePage("ChangelogPageGroup");
  const titleId = useId();
  const registry = useRegistry();
  const empty = registry.total > 0 && registry.visible === 0;
  const value = useMemo(
    () => ({ titleId, register: registry.register, remove: registry.remove }),
    [titleId, registry.register, registry.remove],
  );
  return (
    <GroupContext.Provider value={value}>
      <section
        aria-labelledby={titleId}
        hidden={empty}
        data-slot="changelog-page-group"
        className={cn(
          "min-w-0",
          empty ? "hidden" : "grid",
          variant === "compact" ? "gap-2" : "gap-4",
          className,
        )}
        {...props}
      />
    </GroupContext.Provider>
  );
}

export function ChangelogPageGroupTitle({ className, ...props }: ComponentProps<"h2">) {
  const group = useContext(GroupContext);
  const { variant } = usePage("ChangelogPageGroupTitle");
  if (!group) throw new Error("ChangelogPageGroupTitle must be used within ChangelogPageGroup");
  return (
    <h2
      data-slot="changelog-page-group-title"
      className={cn(
        "m-0 border-b text-[11.5px]/4 font-medium text-subtle-foreground tabular-nums",
        variant === "compact" ? "pb-1" : "pb-2",
        className,
      )}
      {...props}
      id={group.titleId}
    />
  );
}

export type ChangelogPageReleaseProps = Omit<ChangelogEntryProps, "variant"> & {
  /** Category values matched by the category filter, for example ["added", "fixed"]. */
  categories?: readonly string[];
  /** Product area matched by the area filter. */
  area?: string;
};
/** One release, a Changelog Entry. It renders nothing while the filters exclude it. */
export function ChangelogPageRelease({
  categories = [],
  area,
  className,
  ...props
}: ChangelogPageReleaseProps) {
  const context = usePage("ChangelogPageRelease");
  const group = useContext(GroupContext);
  const key = useId();
  const { filters, register, remove } = context;
  const visible =
    (!filters.category || categories.includes(filters.category)) &&
    (!filters.area || filters.area === area);
  useEffect(() => {
    register(key, visible);
    group?.register(key, visible);
  }, [key, visible, register, group]);
  useEffect(
    () => () => {
      remove(key);
      group?.remove(key);
    },
    [key, remove, group],
  );
  if (!visible) return null;
  return (
    <ChangelogEntry
      data-slot="changelog-page-release"
      {...props}
      className={cn(
        "animate-in fill-mode-both duration-240 ease-out-quint fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none",
        className,
      )}
      variant={entryVariants[context.variant]}
      data-area={area}
      data-categories={categories.join(" ") || undefined}
    />
  );
}

/** Shown when the filters match no releases. Compose Empty State parts inside it. */
export function ChangelogPageEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = usePage("ChangelogPageEmpty");
  if (context.total === 0 || context.visible > 0) return null;
  return (
    <EmptyState
      data-slot="changelog-page-empty"
      {...props}
      variant={context.variant === "compact" ? "compact" : "card"}
    />
  );
}
