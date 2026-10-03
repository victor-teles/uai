"use client";

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

const pageCss = `
.uai-changelog-select{transition:background-color 120ms ease-out}
.uai-changelog-select:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-changelog-select:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
[data-uai-changelog-release]{animation:uai-changelog-fade-up 240ms cubic-bezier(0.23,1,0.32,1) both}
@keyframes uai-changelog-fade-up{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.uai-changelog-select{transition:none}[data-uai-changelog-release]{animation:none}}
`;

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
  style,
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
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          gap: variant === "compact" ? 16 : 28,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{pageCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function ChangelogPageHeader({ style, ...props }: ComponentProps<"header">) {
  const { variant } = usePage("ChangelogPageHeader");
  return (
    <header
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: variant === "compact" ? 8 : 16,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function ChangelogPageTitle({ style, ...props }: ComponentProps<"h1">) {
  const { id, variant } = usePage("ChangelogPageTitle");
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

export function ChangelogPageDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        maxWidth: "60ch",
        margin: 0,
        color: "var(--uai-muted)",
        textWrap: "pretty",
        ...style,
      }}
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
  style,
  children,
  ...props
}: ChangelogPageFilterProps) {
  const context = usePage("ChangelogPageFilter");
  const id = useId();
  const compact = context.variant === "compact";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <label htmlFor={id} style={{ color: "var(--uai-subtle)", fontSize: 12 }}>
        {label}
      </label>
      <select
        {...props}
        id={id}
        name={name}
        value={context.filters[name]}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented) context.setFilter(name, event.target.value);
        }}
        className={
          props.className ? `uai-changelog-select ${props.className}` : "uai-changelog-select"
        }
        style={{
          height: compact ? 24 : 28,
          maxWidth: "100%",
          padding: "0 10px",
          border: 0,
          borderRadius: 999,
          background: "var(--uai-surface-raised)",
          color: "var(--uai-text)",
          font: "inherit",
          fontSize: 12.5,
          fontWeight: 500,
          cursor: "pointer",
          ...style,
        }}
      >
        {children}
      </select>
    </span>
  );
}

/** A polite status with the number of matching releases. */
export function ChangelogPageCount({ style, children, ...props }: ComponentProps<"p">) {
  const { visible, total } = usePage("ChangelogPageCount");
  return (
    <p
      role="status"
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {children ??
        (visible === total
          ? `${total} ${total === 1 ? "release" : "releases"}`
          : `Showing ${visible} of ${total} releases`)}
    </p>
  );
}

/** Releases for one period. The group hides itself when none of its releases match. */
export function ChangelogPageGroup({ style, ...props }: ComponentProps<"section">) {
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
        {...props}
        style={{
          display: empty ? "none" : "grid",
          gap: variant === "compact" ? 8 : 16,
          minWidth: 0,
          ...style,
        }}
      />
    </GroupContext.Provider>
  );
}

export function ChangelogPageGroupTitle({ style, ...props }: ComponentProps<"h2">) {
  const group = useContext(GroupContext);
  const { variant } = usePage("ChangelogPageGroupTitle");
  if (!group) throw new Error("ChangelogPageGroupTitle must be used within ChangelogPageGroup");
  return (
    <h2
      {...props}
      id={group.titleId}
      style={{
        margin: 0,
        paddingBottom: variant === "compact" ? 4 : 8,
        borderBottom: "1px solid var(--uai-border)",
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: "16px",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
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
      {...props}
      variant={entryVariants[context.variant]}
      data-uai-changelog-release=""
      data-area={area}
      data-categories={categories.join(" ") || undefined}
    />
  );
}

/** Shown when the filters match no releases. Compose Empty State parts inside it. */
export function ChangelogPageEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = usePage("ChangelogPageEmpty");
  if (context.total === 0 || context.visible > 0) return null;
  return <EmptyState {...props} variant={context.variant === "compact" ? "compact" : "card"} />;
}
