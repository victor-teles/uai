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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ComponentProps<typeof SelectTrigger>,
  "id" | "name" | "size" | "value" | "defaultValue" | "onChange"
> & {
  name: ChangelogPageFilterName;
  /** Visible label for the select. */
  label: string;
};

// Radix Select forbids empty item values, so the "All" option ("") maps to this private value.
const ALL_VALUE = "__uai-changelog-all__";

const filterTriggerClass =
  "w-auto max-w-full cursor-pointer gap-1 rounded-full border-0 bg-secondary py-0 pr-2 pl-2.5 text-[12.5px]/[18px] font-medium text-secondary-foreground shadow-none transition-colors duration-120 ease-[ease-out] hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid motion-reduce:transition-none dark:bg-secondary dark:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] [&_svg]:size-3.5";
const filterContentClass =
  "min-w-36 rounded-[14px] border-0 bg-popover text-popover-foreground shadow-[0_0_0_1px_var(--border-strong),0_12px_28px_-10px_oklch(0_0_0/0.32),0_2px_6px_-2px_oklch(0_0_0/0.12)] duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:zoom-out-96 data-[state=open]:zoom-in-96 data-[state=open]:[--tw-enter-translate-x:0]! data-[state=open]:[--tw-enter-translate-y:0]! motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none";

/**
 * A labelled select bound to one page filter. Compose ChangelogPageFilterOption items inside;
 * the page's onCategoryChange / onAreaChange report changes.
 */
export function ChangelogPageFilter({
  name,
  label,
  className,
  children,
  ...props
}: ChangelogPageFilterProps) {
  const context = usePage("ChangelogPageFilter");
  const id = useId();
  const compact = context.variant === "compact";
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Label
        htmlFor={id}
        className="text-[12px] leading-[inherit] font-normal text-subtle-foreground select-auto"
      >
        {label}
      </Label>
      <Select
        name={name}
        value={context.filters[name] || ALL_VALUE}
        onValueChange={(next) => context.setFilter(name, next === ALL_VALUE ? "" : next)}
      >
        <SelectTrigger
          data-slot="changelog-page-filter"
          className={cn(
            filterTriggerClass,
            compact ? "data-[size=default]:h-6" : "data-[size=default]:h-7",
            className,
          )}
          {...props}
          id={id}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" className={filterContentClass}>
          {children}
        </SelectContent>
      </Select>
    </span>
  );
}

export type ChangelogPageFilterOptionProps = Omit<ComponentProps<typeof SelectItem>, "value"> & {
  /** Filter value. Use an empty string for the "All" option. */
  value: string;
};

/** One option inside ChangelogPageFilter. */
export function ChangelogPageFilterOption({
  value,
  className,
  ...props
}: ChangelogPageFilterOptionProps) {
  const context = usePage("ChangelogPageFilterOption");
  return (
    <SelectItem
      data-slot="changelog-page-filter-option"
      className={cn(
        "cursor-pointer rounded-[10px] text-foreground focus:bg-accent focus:text-foreground",
        context.variant === "compact"
          ? "min-h-7 py-1 pr-7 pl-2 text-[12.5px]/[18px]"
          : "min-h-8 py-1.5 pr-8 pl-2.5 text-[13px]/[18px]",
        className,
      )}
      {...props}
      value={value === "" ? ALL_VALUE : value}
    />
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
