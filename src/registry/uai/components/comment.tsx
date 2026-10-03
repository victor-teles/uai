"use client";

import { cva } from "class-variance-authority";
import { EyeOff, Flag, Pencil } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/uai-utils";

export const COMMENT_VARIANTS = ["thread", "card", "compact"] as const;
export type CommentVariant = (typeof COMMENT_VARIANTS)[number];
export type CommentModeration = "visible" | "hidden" | "flagged" | "removed";
export type CommentProps = ComponentProps<"article"> & {
  variant?: CommentVariant;
  moderation?: CommentModeration;
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
};
type CommentContext = {
  id: string;
  variant: CommentVariant;
  moderation: CommentModeration;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  revealed: boolean;
  setRevealed: (revealed: boolean) => void;
  editTriggerRef: React.RefObject<HTMLButtonElement | null>;
};
const Context = createContext<CommentContext | null>(null);
function useComment(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within Comment`);
  return context;
}
type ControlTone = "ghost" | "secondary" | "primary" | "link";
const controlVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 font-medium whitespace-nowrap [transition:background-color_120ms_ease-out,color_120ms_ease-out,filter_120ms_ease-out,scale_140ms_var(--ease-out-quint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-[0.97] motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
  {
    variants: {
      compact: { true: "h-6 px-2 text-[12px]", false: "h-7 px-2.5 text-[12.5px]" },
      tone: {
        ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
        primary:
          "bg-primary text-primary-foreground enabled:hover:brightness-[1.08] disabled:cursor-not-allowed disabled:opacity-45",
        link: "h-auto bg-transparent p-0 text-foreground underline decoration-border-strong underline-offset-2 hover:decoration-current",
      },
    },
    defaultVariants: { compact: false, tone: "ghost" },
  },
);
const controlClasses = (compact: boolean, tone: ControlTone = "ghost") =>
  cn(controlVariants({ compact, tone }));

const commentVariants = cva("grid min-w-0 rounded-[14px] text-[13px]/[18px] text-foreground", {
  variants: {
    variant: { thread: "gap-1.5", card: "gap-1.5", compact: "gap-1" },
    card: {
      true: "border bg-card px-4 py-3.5 text-card-foreground",
      false: "border-0 bg-transparent p-0",
    },
  },
});

const noticeClasses =
  "m-0 flex flex-wrap items-center gap-1.5 text-[12.5px]/[18px] text-muted-foreground";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function Comment({
  variant = "thread",
  moderation = "visible",
  editing,
  defaultEditing = false,
  onEditingChange,
  className,
  children,
  ...props
}: CommentProps) {
  const id = useId();
  const nested = useContext(Context) !== null;
  const card = variant === "card" && !nested;
  const editTriggerRef = useRef<HTMLButtonElement>(null);
  const [internal, setInternal] = useState(defaultEditing);
  const [revealed, setRevealed] = useState(false);
  const current = (editing ?? internal) && moderation !== "removed";
  return (
    <Context.Provider
      value={{
        id,
        variant,
        moderation,
        editing: current,
        setEditing: (next) => {
          if (editing === undefined) setInternal(next);
          onEditingChange?.(next);
        },
        revealed,
        setRevealed,
        editTriggerRef,
      }}
    >
      <article
        aria-labelledby={`${id}-author`}
        data-slot="comment"
        className={cn(commentVariants({ variant, card }), className)}
        {...props}
        data-variant={variant}
        data-moderation={moderation}
      >
        {children}
      </article>
    </Context.Provider>
  );
}

export function CommentHeader({ className, ...props }: ComponentProps<"header">) {
  useComment("CommentHeader");
  return (
    <header
      data-slot="comment-header"
      className={cn("flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5", className)}
      {...props}
    />
  );
}

export function CommentAvatar({
  name,
  src,
  className,
  ...props
}: Omit<ComponentProps<"span">, "children"> & { name: string; src?: string }) {
  const { variant } = useComment("CommentAvatar");
  const [failed, setFailed] = useState(false);
  return (
    <span
      aria-hidden="true"
      data-slot="comment-avatar"
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground shadow-[0_0_0_1px_oklch(1_0_0/0.08)]",
        variant === "compact" ? "size-5 text-[9.5px]" : "size-6 text-[10.5px]",
        className,
      )}
      {...props}
    >
      {src && !failed ? (
        // biome-ignore lint/performance/noImgElement: distributed source cannot depend on next/image.
        <img src={src} alt="" onError={() => setFailed(true)} className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function CommentAuthor({ className, ...props }: ComponentProps<"span">) {
  const { id } = useComment("CommentAuthor");
  return (
    <span
      data-slot="comment-author"
      className={cn("font-medium", className)}
      {...props}
      id={`${id}-author`}
    />
  );
}

export function CommentTime({
  className,
  ...props
}: ComponentProps<"time"> & { dateTime: string }) {
  useComment("CommentTime");
  return (
    <time
      data-slot="comment-time"
      className={cn("text-[12px] text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}

/** Shows "Edited" once a comment has been changed. */
export function CommentEdited({
  children = "Edited",
  className,
  ...props
}: ComponentProps<"span">) {
  useComment("CommentEdited");
  return (
    <span
      data-slot="comment-edited"
      className={cn("text-[12px] text-subtle-foreground", className)}
      {...props}
    >
      · {children}
    </span>
  );
}

export function CommentBody({ className, children, ...props }: ComponentProps<"div">) {
  const context = useComment("CommentBody");
  const bodyId = `${context.id}-body`;
  if (context.editing) return null;
  if (context.moderation === "removed")
    return (
      <p
        data-slot="comment-body"
        className={cn(noticeClasses, "text-subtle-foreground italic", className)}
        {...props}
      >
        This comment was removed by a moderator.
      </p>
    );
  const hidden = context.moderation === "hidden";
  const text = (
    <div
      id={bodyId}
      className="min-w-0 text-pretty whitespace-pre-line text-foreground wrap-anywhere"
    >
      {children}
    </div>
  );
  return (
    <div data-slot="comment-body" className={cn("grid min-w-0 gap-1.5", className)} {...props}>
      {context.moderation === "flagged" && (
        <p className={noticeClasses}>
          <span className="inline-flex items-center gap-1.25 rounded-full bg-warning/14 px-2 py-0.5 text-[11.5px]/4 font-medium text-warning">
            <Flag size={12} strokeWidth={2} aria-hidden="true" />
            Flagged for review
          </span>
        </p>
      )}
      {hidden && (
        <p className={noticeClasses}>
          <EyeOff size={13} strokeWidth={1.75} aria-hidden="true" />
          This comment is hidden.
          <button
            type="button"
            aria-expanded={context.revealed}
            aria-controls={context.revealed ? bodyId : undefined}
            onClick={() => context.setRevealed(!context.revealed)}
            className={controlClasses(true, "link")}
          >
            {context.revealed ? "Hide" : "Show"}
          </button>
        </p>
      )}
      {(!hidden || context.revealed) && text}
    </div>
  );
}

export type CommentEditorProps = Omit<ComponentProps<"form">, "onSubmit" | "defaultValue"> & {
  defaultValue: string;
  onSave: (value: string) => void;
  label?: string;
};
export function CommentEditor({
  defaultValue,
  onSave,
  label = "Edit comment",
  className,
  ...props
}: CommentEditorProps) {
  const context = useComment("CommentEditor");
  const [value, setValue] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const compact = context.variant === "compact";
  const { editing } = context;
  useEffect(() => {
    if (!editing) return;
    setValue(defaultValue);
    const textarea = textareaRef.current;
    textarea?.focus();
    textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [editing, defaultValue]);
  if (!editing) return null;
  const finish = () => {
    context.setEditing(false);
    requestAnimationFrame(() => context.editTriggerRef.current?.focus());
  };
  const save = () => {
    if (!value.trim()) return;
    onSave(value.trim());
    finish();
  };
  const buttonPadding = compact ? "px-2.5" : "px-3";
  return (
    <form
      data-slot="comment-editor"
      className={cn("grid min-w-0 gap-2", className)}
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <textarea
        ref={textareaRef}
        aria-label={label}
        value={value}
        rows={3}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            finish();
          } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            save();
          }
        }}
        className={cn(
          "box-border w-full min-w-0 resize-y border-0 px-2.5 py-2 text-[13px]/[18px] text-inherit shadow-[0_0_0_1px_var(--border)] transition-shadow duration-120 ease-[ease-out] placeholder:text-subtle-foreground focus-visible:shadow-[0_0_0_1px_var(--border-strong),0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)] focus-visible:outline-none motion-reduce:transition-none",
          compact ? "rounded-lg" : "rounded-[10px]",
          context.variant === "card" ? "bg-background" : "bg-card",
        )}
      />
      <div className="flex justify-end gap-1.5">
        <button
          type="button"
          onClick={finish}
          className={cn(controlClasses(compact, "secondary"), buttonPadding)}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!value.trim()}
          className={cn(controlClasses(compact, "primary"), buttonPadding)}
        >
          Save
        </button>
      </div>
    </form>
  );
}

export function CommentActions({
  "aria-label": label = "Comment actions",
  className,
  ...props
}: ComponentProps<"div">) {
  const context = useComment("CommentActions");
  if (context.editing || context.moderation === "removed") return null;
  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled group of action buttons, not a fieldset.
    <div
      role="group"
      aria-label={label}
      data-slot="comment-actions"
      className={cn(
        "-ms-2 flex flex-wrap items-center gap-1 has-[>:first-child:not([data-slot=comment-action],[data-slot=comment-edit-trigger])]:ms-0",
        className,
      )}
      {...props}
    />
  );
}

export function CommentAction({ className, ...props }: ComponentProps<"button">) {
  const context = useComment("CommentAction");
  return (
    <button
      type="button"
      data-slot="comment-action"
      className={cn(controlClasses(context.variant === "compact"), className)}
      {...props}
    />
  );
}

export function CommentEditTrigger({
  children = "Edit",
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useComment("CommentEditTrigger");
  return (
    <button
      ref={context.editTriggerRef}
      data-slot="comment-edit-trigger"
      className={cn(controlClasses(context.variant === "compact"), className)}
      {...props}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setEditing(true);
      }}
    >
      <Pencil size={12} strokeWidth={1.75} aria-hidden="true" />
      {children}
    </button>
  );
}

export function CommentReplies({
  "aria-label": label = "Replies",
  className,
  ...props
}: ComponentProps<"section">) {
  const context = useComment("CommentReplies");
  const compact = context.variant === "compact";
  return (
    <section
      aria-label={label}
      data-slot="comment-replies"
      className={cn(
        "grid border-s *:animate-in *:fill-mode-both *:fade-in-0 *:slide-in-from-bottom-1 *:duration-240 *:ease-out-quint motion-reduce:*:animate-none [&>:nth-child(2)]:[animation-delay:40ms] [&>:nth-child(3)]:[animation-delay:80ms] [&>:nth-child(4)]:[animation-delay:120ms] [&>:nth-child(n+5)]:[animation-delay:160ms]",
        compact ? "ms-[9.5px] mt-1 gap-3 ps-3.5" : "ms-[11.5px] mt-1.5 gap-4 ps-4.5",
        className,
      )}
      {...props}
    />
  );
}
