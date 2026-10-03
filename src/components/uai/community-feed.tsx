"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useId,
  useState,
} from "react";
import { AuthorCard, type AuthorCardProps } from "@/components/ui/uai/author-card";
import { EmptyState, type EmptyStateProps } from "@/components/ui/uai/empty-state";
import {
  ReactionBar,
  type ReactionBarProps,
  type ReactionBarVariant,
} from "@/components/ui/uai/reaction-bar";

export const COMMUNITY_FEED_VARIANTS = ["list", "cards", "compact"] as const;
export type CommunityFeedVariant = (typeof COMMUNITY_FEED_VARIANTS)[number];
export type CommunityFeedProps = ComponentProps<"section"> & {
  variant?: CommunityFeedVariant;
  /** The selected filter. The application filters the posts it renders. */
  filter?: string;
  defaultFilter?: string;
  onFilterChange?: (filter: string) => void;
  /** The current page, starting at 1. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
};

type FeedContext = {
  id: string;
  variant: CommunityFeedVariant;
  filter: string;
  setFilter: (filter: string) => void;
  page: number;
  setPage: (page: number) => void;
};
const Context = createContext<FeedContext | null>(null);
function useFeed(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within CommunityFeed`);
  return context;
}
const PostContext = createContext<string | null>(null);
function usePost(part: string) {
  const id = useContext(PostContext);
  if (!id) throw new Error(`${part} must be used within CommunityFeedPost`);
  return id;
}

const feedCss = `
.uai-community-feed-pill{transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-community-feed-pill:not([aria-checked=true]):not([aria-current]):not(:disabled):hover{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-community-feed-pill:not(:disabled):active{transform:scale(0.96)}
.uai-community-feed-pill:focus-visible,.uai-community-feed-link:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-community-feed-link{transition:color 120ms ease-out}
.uai-community-feed-link:hover{color:var(--uai-text)}
[data-uai-community-feed-post]{animation:uai-community-feed-fade-up 240ms cubic-bezier(0.23,1,0.32,1) both}
li:nth-child(2)>[data-uai-community-feed-post]{animation-delay:40ms}
li:nth-child(3)>[data-uai-community-feed-post]{animation-delay:80ms}
li:nth-child(4)>[data-uai-community-feed-post]{animation-delay:120ms}
li:nth-child(5)>[data-uai-community-feed-post]{animation-delay:160ms}
li:nth-child(n+6)>[data-uai-community-feed-post]{animation-delay:200ms}
@keyframes uai-community-feed-fade-up{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.uai-community-feed-pill,.uai-community-feed-link{transition:none}.uai-community-feed-pill:not(:disabled):active{transform:none}[data-uai-community-feed-post]{animation:none}}
`;

const reactionVariants: Record<CommunityFeedVariant, ReactionBarVariant> = {
  list: "pill",
  cards: "outlined",
  compact: "compact",
};

function useControllable<T>(value: T | undefined, initial: T, onChange?: (value: T) => void) {
  const [internal, setInternal] = useState(initial);
  const current = value ?? internal;
  const set = (next: T) => {
    if (Object.is(next, current)) return;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  return [current, set] as const;
}

/** Community posts with authors, reactions, filters, and pagination. */
export function CommunityFeed({
  variant = "list",
  filter,
  defaultFilter = "",
  onFilterChange,
  page,
  defaultPage = 1,
  onPageChange,
  children,
  style,
  ...props
}: CommunityFeedProps) {
  const id = useId();
  const [currentPage, setPage] = useControllable(page, defaultPage, onPageChange);
  const [currentFilter, setFilter] = useControllable(filter, defaultFilter, (next: string) => {
    onFilterChange?.(next);
    setPage(1);
  });
  return (
    <Context.Provider
      value={{
        id,
        variant,
        filter: currentFilter,
        setFilter,
        page: currentPage,
        setPage,
      }}
    >
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          gap: variant === "compact" ? 12 : 20,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{feedCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function CommunityFeedHeader({ style, ...props }: ComponentProps<"header">) {
  useFeed("CommunityFeedHeader");
  return (
    <header
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function CommunityFeedTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useFeed("CommunityFeedTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 16 : 20,
        lineHeight: variant === "compact" ? "22px" : "26px",
        fontWeight: 600,
        letterSpacing: "-0.015em",
        ...style,
      }}
    />
  );
}

export function CommunityFeedDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

/** A radio group of feed filters. Arrow keys move the selection; changing it returns to page 1. */
export function CommunityFeedFilters({
  "aria-label": label = "Filter posts",
  onKeyDown,
  style,
  ...props
}: ComponentProps<"div">) {
  useFeed("CommunityFeedFilters");
  return (
    <div
      role="radiogroup"
      aria-label={label}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) moveRadio(event);
      }}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, ...style }}
    />
  );
}

export function CommunityFeedFilter({
  value,
  onClick,
  style,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: string }) {
  const context = useFeed("CommunityFeedFilter");
  const checked = context.filter === value;
  return (
    // biome-ignore lint/a11y/useSemanticElements: APG radio group built from buttons for custom segmented styling.
    <button
      {...props}
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked ? 0 : -1}
      className={joinClass("uai-community-feed-pill", props.className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setFilter(value);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: context.variant === "compact" ? 24 : 28,
        padding: "0 12px",
        border: 0,
        borderRadius: 999,
        background: checked ? "var(--uai-surface-raised)" : "transparent",
        color: checked ? "var(--uai-text)" : "var(--uai-muted)",
        font: "inherit",
        fontSize: 12.5,
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: "pointer",
        ...style,
      }}
    />
  );
}

export function CommunityFeedPosts({ style, ...props }: ComponentProps<"ol">) {
  const { variant } = useFeed("CommunityFeedPosts");
  return (
    <ol
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns:
          variant === "cards" ? "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" : undefined,
        gap: variant === "list" ? 0 : variant === "cards" ? 12 : 6,
        margin: 0,
        padding: 0,
        listStyle: "none",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** One post, an article named by CommunityFeedPostTitle. */
export function CommunityFeedPost({ style, ...props }: ComponentProps<"article">) {
  const { variant } = useFeed("CommunityFeedPost");
  const id = useId();
  const list = variant === "list";
  return (
    <li style={{ display: "grid", minWidth: 0 }}>
      <PostContext.Provider value={id}>
        <article
          aria-labelledby={`${id}-title`}
          {...props}
          data-uai-community-feed-post=""
          style={{
            display: "grid",
            alignContent: "start",
            gap: variant === "compact" ? 6 : 10,
            minWidth: 0,
            padding: list ? "16px 0" : variant === "compact" ? 12 : 16,
            border: 0,
            borderBottom: list ? "1px solid var(--uai-border)" : undefined,
            borderRadius: list ? 0 : variant === "compact" ? 12 : 14,
            background: list ? "transparent" : "var(--uai-surface)",
            ...style,
          }}
        />
      </PostContext.Provider>
    </li>
  );
}

/** Author and posting time. */
export function CommunityFeedPostHeader({ style, ...props }: ComponentProps<"header">) {
  usePost("CommunityFeedPostHeader");
  return (
    <header
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

/** The post author, an inline Author Card. Compose Author Card parts inside it. */
export function CommunityFeedPostAuthor({ style, ...props }: Omit<AuthorCardProps, "variant">) {
  usePost("CommunityFeedPostAuthor");
  return (
    <AuthorCard {...props} variant="inline" style={{ alignItems: "center", rowGap: 0, ...style }} />
  );
}

export function CommunityFeedPostTime({
  style,
  ...props
}: ComponentProps<"time"> & { dateTime: string }) {
  usePost("CommunityFeedPostTime");
  return (
    <time
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

/** The post title. Pass `href` to link to the full post. */
export function CommunityFeedPostTitle({
  href,
  style,
  children,
  ...props
}: ComponentProps<"h3"> & { href?: string }) {
  const id = usePost("CommunityFeedPostTitle");
  const { variant } = useFeed("CommunityFeedPostTitle");
  return (
    <h3
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 13 : 15,
        lineHeight: variant === "compact" ? "18px" : "22px",
        fontWeight: 500,
        textWrap: "balance",
        ...style,
      }}
    >
      {href ? (
        <a
          href={href}
          className="uai-community-feed-link"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          {children}
        </a>
      ) : (
        children
      )}
    </h3>
  );
}

export function CommunityFeedPostBody({ style, ...props }: ComponentProps<"p">) {
  const { variant } = useFeed("CommunityFeedPostBody");
  return (
    <p
      {...props}
      style={{
        display: variant === "compact" ? "-webkit-box" : undefined,
        WebkitLineClamp: variant === "compact" ? 2 : undefined,
        WebkitBoxOrient: variant === "compact" ? "vertical" : undefined,
        overflow: variant === "compact" ? "hidden" : undefined,
        margin: 0,
        color: "var(--uai-muted)",
        textWrap: "pretty",
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function CommunityFeedPostTags({
  "aria-label": label = "Tags",
  style,
  ...props
}: ComponentProps<"ul">) {
  usePost("CommunityFeedPostTags");
  return (
    <ul
      aria-label={label}
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
    />
  );
}

export function CommunityFeedPostTag({ style, ...props }: ComponentProps<"li">) {
  return (
    <li
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 8px",
        borderRadius: 6,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-muted)",
        fontSize: 11.5,
        fontWeight: 500,
        ...style,
      }}
    />
  );
}

/** Reactions, reply counts, and post actions. */
export function CommunityFeedPostFooter({ style, ...props }: ComponentProps<"footer">) {
  usePost("CommunityFeedPostFooter");
  return (
    <footer
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** A Reaction Bar sized for the feed. */
export function CommunityFeedPostReactions(props: Omit<ReactionBarProps, "variant">) {
  const { variant } = useFeed("CommunityFeedPostReactions");
  return <ReactionBar {...props} variant={reactionVariants[variant]} />;
}

/** A muted link or label such as "12 replies". */
export function CommunityFeedPostMeta({ style, ...props }: ComponentProps<"a">) {
  usePost("CommunityFeedPostMeta");
  return (
    <a
      {...props}
      className={joinClass("uai-community-feed-link", props.className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginInlineStart: "auto",
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        textDecoration: "none",
        ...style,
      }}
    />
  );
}

/** Shown when no posts match. Compose Empty State parts inside it. */
export function CommunityFeedEmpty(props: Omit<EmptyStateProps, "variant">) {
  const { variant } = useFeed("CommunityFeedEmpty");
  return <EmptyState {...props} variant={variant === "compact" ? "compact" : "card"} />;
}

function pageItems(page: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const pages = new Set([1, count, page - 1, page, page + 1]);
  const sorted = [...pages].filter((item) => item >= 1 && item <= count).sort((a, b) => a - b);
  return sorted.flatMap((item, index) =>
    index > 0 && item - (sorted[index - 1] ?? item) > 1 ? ["gap" as const, item] : [item],
  );
}

/** Numbered pagination. The current page is marked with aria-current. */
export function CommunityFeedPagination({
  pageCount,
  "aria-label": label = "Pagination",
  style,
  ...props
}: ComponentProps<"nav"> & { pageCount: number }) {
  const context = useFeed("CommunityFeedPagination");
  if (pageCount <= 1) return null;
  const size = context.variant === "compact" ? 24 : 28;
  const button = (current: boolean) =>
    ({
      display: "inline-grid",
      placeItems: "center",
      minWidth: size,
      height: size,
      padding: "0 6px",
      border: 0,
      borderRadius: 999,
      background: current ? "var(--uai-surface-raised)" : "transparent",
      color: current ? "var(--uai-text)" : "var(--uai-muted)",
      font: "inherit",
      fontSize: 12.5,
      fontWeight: 500,
      fontVariantNumeric: "tabular-nums",
      cursor: "pointer",
    }) as const;
  const { page, setPage } = context;
  return (
    <nav
      aria-label={label}
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        ...style,
      }}
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className="uai-community-feed-pill"
        style={{ ...button(false), opacity: page <= 1 ? 0.4 : 1 }}
      >
        <ChevronLeft size={14} strokeWidth={1.75} aria-hidden="true" />
      </button>
      {pageItems(page, pageCount).map((item, index) =>
        item === "gap" ? (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: gaps have no identity beyond their position.
            key={`gap-${index}`}
            aria-hidden="true"
            style={{ color: "var(--uai-subtle)", padding: "0 4px" }}
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => setPage(item)}
            className="uai-community-feed-pill"
            style={button(item === page)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => setPage(page + 1)}
        className="uai-community-feed-pill"
        style={{ ...button(false), opacity: page >= pageCount ? 0.4 : 1 }}
      >
        <ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </nav>
  );
}

function moveRadio(event: KeyboardEvent<HTMLElement>) {
  const radios = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'),
  );
  const index = radios.indexOf(document.activeElement as HTMLButtonElement);
  if (index === -1) return;
  const next = {
    ArrowRight: index + 1,
    ArrowDown: index + 1,
    ArrowLeft: index - 1,
    ArrowUp: index - 1,
    Home: 0,
    End: radios.length - 1,
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  const target = radios[(next + radios.length) % radios.length];
  target?.focus();
  target?.click();
}

function joinClass(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}
