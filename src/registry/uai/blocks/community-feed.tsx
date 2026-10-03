"use client";

import { cva } from "class-variance-authority";
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
import { cn } from "@/lib/uai-utils";

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

const pill =
  "[transition:background-color_120ms_ease-out,color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-[0.96] motion-reduce:transition-none motion-reduce:enabled:active:scale-100";
const pillIdle =
  "bg-transparent text-muted-foreground enabled:hover:bg-accent enabled:hover:text-foreground";
const pillSelected = "bg-accent text-foreground";
const feedLink =
  "no-underline transition-[color] duration-120 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none";

const communityFeedVariants = cva("grid min-w-0 text-[13px]/[18px] text-foreground", {
  variants: {
    variant: {
      list: "gap-5",
      cards: "gap-5",
      compact: "gap-3",
    },
  },
});

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
  className,
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
        data-slot="community-feed"
        data-variant={variant}
        className={cn(communityFeedVariants({ variant }), className)}
        {...props}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function CommunityFeedHeader({ className, ...props }: ComponentProps<"header">) {
  useFeed("CommunityFeedHeader");
  return (
    <header
      data-slot="community-feed-header"
      className={cn("flex min-w-0 flex-wrap items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export function CommunityFeedTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useFeed("CommunityFeedTitle");
  return (
    <h2
      data-slot="community-feed-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.015em]",
        variant === "compact" ? "text-base/[22px]" : "text-xl/[26px]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function CommunityFeedDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="community-feed-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** A radio group of feed filters. Arrow keys move the selection; changing it returns to page 1. */
export function CommunityFeedFilters({
  "aria-label": label = "Filter posts",
  onKeyDown,
  className,
  ...props
}: ComponentProps<"div">) {
  useFeed("CommunityFeedFilters");
  return (
    <div
      role="radiogroup"
      aria-label={label}
      data-slot="community-feed-filters"
      className={cn("flex flex-wrap items-center gap-1", className)}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) moveRadio(event);
      }}
    />
  );
}

export function CommunityFeedFilter({
  value,
  onClick,
  className,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: string }) {
  const context = useFeed("CommunityFeedFilter");
  const checked = context.filter === value;
  return (
    // biome-ignore lint/a11y/useSemanticElements: APG radio group built from buttons for custom segmented styling.
    <button
      data-slot="community-feed-filter"
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 px-3 text-[12.5px] font-medium whitespace-nowrap",
        context.variant === "compact" ? "h-6" : "h-7",
        checked ? pillSelected : pillIdle,
        pill,
        className,
      )}
      {...props}
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked ? 0 : -1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setFilter(value);
      }}
    />
  );
}

export function CommunityFeedPosts({ className, ...props }: ComponentProps<"ol">) {
  const { variant } = useFeed("CommunityFeedPosts");
  return (
    <ol
      data-slot="community-feed-posts"
      className={cn(
        "m-0 grid min-w-0 list-none p-0",
        variant === "list" && "gap-0",
        variant === "cards" && "grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3",
        variant === "compact" && "gap-1.5",
        className,
      )}
      {...props}
    />
  );
}

/** One post, an article named by CommunityFeedPostTitle. */
export function CommunityFeedPost({ className, ...props }: ComponentProps<"article">) {
  const { variant } = useFeed("CommunityFeedPost");
  const id = useId();
  return (
    <li className="grid min-w-0 [&:nth-child(2)>*]:[animation-delay:40ms] [&:nth-child(3)>*]:[animation-delay:80ms] [&:nth-child(4)>*]:[animation-delay:120ms] [&:nth-child(5)>*]:[animation-delay:160ms] [&:nth-child(n+6)>*]:[animation-delay:200ms]">
      <PostContext.Provider value={id}>
        <article
          aria-labelledby={`${id}-title`}
          data-slot="community-feed-post"
          className={cn(
            "grid min-w-0 animate-in content-start fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint fill-mode-both motion-reduce:animate-none",
            variant === "list" && "gap-2.5 rounded-none border-b bg-transparent px-0 py-4",
            variant === "cards" && "gap-2.5 rounded-[14px] bg-card p-4",
            variant === "compact" && "gap-1.5 rounded-xl bg-card p-3",
            className,
          )}
          {...props}
        />
      </PostContext.Provider>
    </li>
  );
}

/** Author and posting time. */
export function CommunityFeedPostHeader({ className, ...props }: ComponentProps<"header">) {
  usePost("CommunityFeedPostHeader");
  return (
    <header
      data-slot="community-feed-post-header"
      className={cn("flex min-w-0 flex-wrap items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

/** The post author, an inline Author Card. Compose Author Card parts inside it. */
export function CommunityFeedPostAuthor({ className, ...props }: Omit<AuthorCardProps, "variant">) {
  usePost("CommunityFeedPostAuthor");
  return (
    <AuthorCard {...props} variant="inline" className={cn("items-center gap-y-0", className)} />
  );
}

export function CommunityFeedPostTime({
  className,
  ...props
}: ComponentProps<"time"> & { dateTime: string }) {
  usePost("CommunityFeedPostTime");
  return (
    <time
      data-slot="community-feed-post-time"
      className={cn("text-[12px] text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}

/** The post title. Pass `href` to link to the full post. */
export function CommunityFeedPostTitle({
  href,
  className,
  children,
  ...props
}: ComponentProps<"h3"> & { href?: string }) {
  const id = usePost("CommunityFeedPostTitle");
  const { variant } = useFeed("CommunityFeedPostTitle");
  return (
    <h3
      data-slot="community-feed-post-title"
      className={cn(
        "m-0 font-medium text-balance",
        variant === "compact" ? "text-[13px]/[18px]" : "text-[15px]/[22px]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    >
      {href ? (
        <a href={href} className={cn("text-inherit", feedLink)}>
          {children}
        </a>
      ) : (
        children
      )}
    </h3>
  );
}

export function CommunityFeedPostBody({ className, ...props }: ComponentProps<"p">) {
  const { variant } = useFeed("CommunityFeedPostBody");
  return (
    <p
      data-slot="community-feed-post-body"
      className={cn(
        "m-0 text-pretty wrap-anywhere text-muted-foreground",
        variant === "compact" && "line-clamp-2",
        className,
      )}
      {...props}
    />
  );
}

export function CommunityFeedPostTags({
  "aria-label": label = "Tags",
  className,
  ...props
}: ComponentProps<"ul">) {
  usePost("CommunityFeedPostTags");
  return (
    <ul
      aria-label={label}
      data-slot="community-feed-post-tags"
      className={cn("m-0 flex list-none flex-wrap gap-1 p-0", className)}
      {...props}
    />
  );
}

export function CommunityFeedPostTag({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="community-feed-post-tag"
      className={cn(
        "inline-flex h-5 items-center rounded-md bg-muted px-2 text-[11.5px] font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Reactions, reply counts, and post actions. */
export function CommunityFeedPostFooter({ className, ...props }: ComponentProps<"footer">) {
  usePost("CommunityFeedPostFooter");
  return (
    <footer
      data-slot="community-feed-post-footer"
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

/** A Reaction Bar sized for the feed. */
export function CommunityFeedPostReactions(props: Omit<ReactionBarProps, "variant">) {
  const { variant } = useFeed("CommunityFeedPostReactions");
  return <ReactionBar {...props} variant={reactionVariants[variant]} />;
}

/** A muted link or label such as "12 replies". */
export function CommunityFeedPostMeta({ className, ...props }: ComponentProps<"a">) {
  usePost("CommunityFeedPostMeta");
  return (
    <a
      data-slot="community-feed-post-meta"
      className={cn(
        "ms-auto inline-flex items-center gap-1.5 text-[12px] text-subtle-foreground tabular-nums",
        feedLink,
        className,
      )}
      {...props}
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
  className,
  ...props
}: ComponentProps<"nav"> & { pageCount: number }) {
  const context = useFeed("CommunityFeedPagination");
  if (pageCount <= 1) return null;
  const button = (current: boolean) =>
    cn(
      "inline-grid cursor-pointer place-items-center rounded-full border-0 px-1.5 text-[12.5px] font-medium tabular-nums disabled:opacity-40",
      context.variant === "compact" ? "h-6 min-w-6" : "h-7 min-w-7",
      current ? pillSelected : pillIdle,
      pill,
    );
  const { page, setPage } = context;
  return (
    <nav
      aria-label={label}
      data-slot="community-feed-pagination"
      className={cn("flex flex-wrap items-center justify-center gap-0.5", className)}
      {...props}
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className={button(false)}
      >
        <ChevronLeft size={14} strokeWidth={1.75} aria-hidden="true" />
      </button>
      {pageItems(page, pageCount).map((item, index) =>
        item === "gap" ? (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: gaps have no identity beyond their position.
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1 text-subtle-foreground"
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
            className={button(item === page)}
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
        className={button(false)}
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
