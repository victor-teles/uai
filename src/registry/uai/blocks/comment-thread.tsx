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

const threadCss = `
.uai-comment-thread-sort{transition:background-color 180ms cubic-bezier(0.23,1,0.32,1),color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-comment-thread-sort[aria-checked=false]:hover{color:var(--uai-text)}
.uai-comment-thread-sort:active{transform:scale(0.96)}
.uai-comment-thread-sort:focus-visible,.uai-comment-thread-send:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-comment-thread-composer{transition:box-shadow 120ms ease-out}
.uai-comment-thread-composer:focus-within{box-shadow:inset 0 0 0 1px var(--uai-border-strong)}
.uai-comment-thread-composer textarea{outline:none}
.uai-comment-thread-composer textarea::placeholder{color:var(--uai-subtle)}
.uai-comment-thread-send{transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-comment-thread-send:active:not(:disabled){transform:scale(0.92)}
@media (prefers-reduced-motion: reduce){.uai-comment-thread-sort,.uai-comment-thread-composer,.uai-comment-thread-send{transition:none}.uai-comment-thread-sort:active,.uai-comment-thread-send:active:not(:disabled){transform:none}}
`;

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
  style,
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
        <style>{threadCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function CommentThreadHeader({ style, ...props }: ComponentProps<"header">) {
  useThread("CommentThreadHeader");
  return (
    <header
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function CommentThreadTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useThread("CommentThreadTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 8,
        margin: 0,
        fontSize: variant === "compact" ? 14 : 15,
        lineHeight: variant === "compact" ? "20px" : "22px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

/** A muted count beside the title, such as "14 comments". */
export function CommentThreadCount({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 12.5,
        fontWeight: 400,
        letterSpacing: 0,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

/** A radio group for the sort order. Arrow keys move the selection. */
export function CommentThreadSort({
  "aria-label": label = "Sort comments",
  onKeyDown,
  style,
  ...props
}: ComponentProps<"div">) {
  const { variant } = useThread("CommentThreadSort");
  return (
    <div
      role="radiogroup"
      aria-label={label}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) moveRadio(event);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: variant === "compact" ? 1 : 2,
        borderRadius: 999,
        background: "var(--uai-surface)",
        ...style,
      }}
    />
  );
}

export function CommentThreadSortOption({
  value,
  onClick,
  style,
  ...props
}: Omit<ComponentProps<"button">, "value"> & { value: string }) {
  const context = useThread("CommentThreadSortOption");
  const checked = context.sort === value;
  const compact = context.variant === "compact";
  return (
    // biome-ignore lint/a11y/useSemanticElements: APG radio group built from buttons for custom segmented styling.
    <button
      {...props}
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked ? 0 : -1}
      className={
        props.className ? `uai-comment-thread-sort ${props.className}` : "uai-comment-thread-sort"
      }
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setSort(value);
      }}
      style={{
        height: compact ? 22 : 24,
        padding: "0 10px",
        border: 0,
        borderRadius: 999,
        background: checked ? "var(--uai-surface-raised)" : "transparent",
        color: checked ? "var(--uai-text)" : "var(--uai-subtle)",
        font: "inherit",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    />
  );
}

/** Top-level comments. Nest replies with CommentReplies inside a CommentThreadComment. */
export function CommentThreadList({
  "aria-label": label = "Comments",
  style,
  ...props
}: ComponentProps<"div">) {
  const { variant } = useThread("CommentThreadList");
  return (
    // biome-ignore lint/a11y/useSemanticElements: comments are articles; a labelled group keeps them together without list semantics.
    <div
      role="group"
      aria-label={label}
      {...props}
      data-uai-comment-thread-list=""
      style={{
        display: "grid",
        gap: variant === "threaded" ? 20 : 12,
        minWidth: 0,
        ...style,
      }}
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
  style,
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
      {...props}
      className={
        props.className
          ? `uai-comment-thread-composer ${props.className}`
          : "uai-comment-thread-composer"
      }
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        minWidth: 0,
        padding: compact ? 6 : 8,
        boxShadow: "inset 0 0 0 1px var(--uai-border)",
        borderRadius: compact ? 12 : 14,
        background: "var(--uai-surface)",
        ...style,
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
        style={{
          flex: 1,
          minWidth: 0,
          padding: "5px 6px",
          border: 0,
          background: "transparent",
          color: "inherit",
          font: "inherit",
          fontSize: 13,
          lineHeight: "18px",
          resize: "none",
        }}
      />
      <button
        type="submit"
        aria-label="Post comment"
        disabled={!ready}
        className="uai-comment-thread-send"
        style={{
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
          width: compact ? 24 : 28,
          height: compact ? 24 : 28,
          border: 0,
          borderRadius: 999,
          background: ready ? "var(--uai-text)" : "var(--uai-border-strong)",
          color: ready
            ? "var(--uai-surface)"
            : "color-mix(in oklab, var(--uai-surface) 70%, transparent)",
          cursor: ready ? "pointer" : "not-allowed",
        }}
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
