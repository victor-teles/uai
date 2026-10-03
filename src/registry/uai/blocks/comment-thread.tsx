"use client";

import { ArrowUp } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useId,
  useState,
} from "react";
import { Comment, type CommentProps, type CommentVariant } from "@/components/ui/uai/comment";
import {
  ReactionBar,
  type ReactionBarProps,
  type ReactionBarVariant,
} from "@/components/ui/uai/reaction-bar";
import { cn } from "@/lib/uai-utils";

export const COMMENT_THREAD_VARIANTS = ["threaded", "cards", "compact"] as const;
export type CommentThreadVariant = (typeof COMMENT_THREAD_VARIANTS)[number];
export type CommentThreadProps = ComponentProps<"section"> & {
  variant?: CommentThreadVariant;
  /** The selected sort order. The application sorts the comments it renders. */
  sort?: string;
  defaultSort?: string;
  onSortChange?: (sort: string) => void;
};

type ThreadContext = {
  id: string;
  variant: CommentThreadVariant;
  sort: string;
  setSort: (sort: string) => void;
};
const Context = createContext<ThreadContext | null>(null);
function useThread(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within CommentThread`);
  return context;
}

const commentVariants: Record<CommentThreadVariant, CommentVariant> = {
  threaded: "thread",
  cards: "card",
  compact: "compact",
};
const reactionVariants: Record<CommentThreadVariant, ReactionBarVariant> = {
  threaded: "pill",
  cards: "outlined",
  compact: "compact",
};

/** A discussion with sorting, nested replies, reactions, moderation states, and a composer. */
export function CommentThread({
  variant = "threaded",
  sort,
  defaultSort = "",
  onSortChange,
  children,
  className,
  ...props
}: CommentThreadProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultSort);
  const current = sort ?? internal;
  return (
    <Context.Provider
      value={{
        id,
        variant,
        sort: current,
        setSort: (next) => {
          if (next === current) return;
          if (sort === undefined) setInternal(next);
          onSortChange?.(next);
        },
      }}
    >
      <section
        aria-labelledby={`${id}-title`}
        data-slot="comment-thread"
        className={cn(
          "grid min-w-0 text-[13px]/[18px] text-foreground",
          variant === "compact" ? "gap-3" : "gap-5",
          className,
        )}
        {...props}
        data-variant={variant}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function CommentThreadHeader({ className, ...props }: ComponentProps<"header">) {
  useThread("CommentThreadHeader");
  return (
    <header
      data-slot="comment-thread-header"
      className={cn("flex min-w-0 flex-wrap items-center justify-between gap-3", className)}
      {...props}
    />
  );
}

export function CommentThreadTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useThread("CommentThreadTitle");
  return (
    <h2
      data-slot="comment-thread-title"
      className={cn(
        "m-0 inline-flex items-baseline gap-2 font-semibold tracking-[-0.01em]",
        variant === "compact" ? "text-sm/5" : "text-[15px]/[22px]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

/** A muted count beside the title, such as "14 comments". */
export function CommentThreadCount({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="comment-thread-count"
      className={cn(
        "text-[12.5px] font-normal tracking-normal text-subtle-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

/** A radio group for the sort order. Arrow keys move the selection. */
export function CommentThreadSort({
  "aria-label": label = "Sort comments",
  onKeyDown,
  className,
  ...props
}: ComponentProps<"div">) {
  const { variant } = useThread("CommentThreadSort");
  return (
    <div
      role="radiogroup"
      aria-label={label}
      data-slot="comment-thread-sort"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full bg-card",
        variant === "compact" ? "p-px" : "p-0.5",
        className,
      )}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) moveRadio(event);
      }}
    />
  );
}

export function CommentThreadSortOption({
  value,
  onClick,
  className,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: string }) {
  const context = useThread("CommentThreadSortOption");
  const checked = context.sort === value;
  const compact = context.variant === "compact";
  return (
    // biome-ignore lint/a11y/useSemanticElements: APG radio group built from buttons for custom segmented styling.
    <button
      data-slot="comment-thread-sort-option"
      className={cn(
        "cursor-pointer rounded-full border-0 px-2.5 text-[12px] font-medium [transition:background-color_180ms_cubic-bezier(0.23,1,0.32,1),color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100",
        compact ? "h-5.5" : "h-6",
        checked
          ? "bg-accent text-foreground"
          : "bg-transparent text-subtle-foreground hover:text-foreground",
        className,
      )}
      {...props}
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked ? 0 : -1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setSort(value);
      }}
    />
  );
}

/** Top-level comments. Nest replies with CommentReplies inside a CommentThreadComment. */
export function CommentThreadList({
  "aria-label": label = "Comments",
  className,
  ...props
}: ComponentProps<"div">) {
  const { variant } = useThread("CommentThreadList");
  return (
    // biome-ignore lint/a11y/useSemanticElements: comments are articles; a labelled group keeps them together without list semantics.
    <div
      role="group"
      aria-label={label}
      data-slot="comment-thread-list"
      className={cn("grid min-w-0", variant === "threaded" ? "gap-5" : "gap-3", className)}
      {...props}
    />
  );
}

/** A Comment sized for the thread. Compose Comment parts inside it. */
export function CommentThreadComment(props: Omit<CommentProps, "variant">) {
  const { variant } = useThread("CommentThreadComment");
  return <Comment {...props} variant={commentVariants[variant]} />;
}

/** A Reaction Bar sized for the thread. */
export function CommentThreadReactions(props: Omit<ReactionBarProps, "variant">) {
  const { variant } = useThread("CommentThreadReactions");
  return <ReactionBar {...props} variant={reactionVariants[variant]} />;
}

export type CommentThreadComposerProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  /** Called with the trimmed text. The field clears after submit. */
  onSubmit: (value: string) => void;
  /** Accessible label for the text area. */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};
/** A comment field. Enter with Command or Control submits; the send button is disabled while empty. */
export function CommentThreadComposer({
  onSubmit,
  label = "Add a comment",
  placeholder = "Add a comment…",
  disabled = false,
  className,
  ...props
}: CommentThreadComposerProps) {
  const { variant } = useThread("CommentThreadComposer");
  const [value, setValue] = useState("");
  const compact = variant === "compact";
  const ready = Boolean(value.trim()) && !disabled;
  const submit = () => {
    if (!ready) return;
    onSubmit(value.trim());
    setValue("");
  };
  return (
    <form
      data-slot="comment-thread-composer"
      className={cn(
        "flex min-w-0 items-end gap-2 bg-card shadow-[inset_0_0_0_1px_var(--border)] [transition:box-shadow_120ms_ease-out] focus-within:shadow-[inset_0_0_0_1px_var(--border-strong)] motion-reduce:transition-none",
        compact ? "rounded-xl p-1.5" : "rounded-[14px] p-2",
        className,
      )}
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <textarea
        aria-label={label}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        rows={compact ? 1 : 2}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            submit();
          }
        }}
        className="min-w-0 flex-1 resize-none border-0 bg-transparent px-1.5 py-1.25 text-[13px]/[18px] text-inherit outline-none placeholder:text-subtle-foreground"
      />
      <button
        type="submit"
        aria-label="Post comment"
        disabled={!ready}
        className={cn(
          "grid flex-[0_0_auto] place-items-center rounded-full border-0 [transition:background-color_120ms_ease-out,color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring not-disabled:active:scale-[0.92] motion-reduce:transition-none motion-reduce:not-disabled:active:scale-100",
          compact ? "size-6" : "size-7",
          ready
            ? "cursor-pointer bg-foreground text-card"
            : "cursor-not-allowed bg-border-strong text-card/70",
        )}
      >
        <ArrowUp size={compact ? 14 : 16} strokeWidth={2} aria-hidden="true" />
      </button>
    </form>
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
