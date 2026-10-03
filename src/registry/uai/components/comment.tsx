"use client";

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
const muted = "var(--uai-muted)";
const subtle = "var(--uai-subtle)";
const controlStyle = (compact: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  height: compact ? 24 : 28,
  padding: compact ? "0 8px" : "0 10px",
  border: 0,
  borderRadius: 999,
  fontSize: compact ? 12 : 12.5,
  fontWeight: 500,
  whiteSpace: "nowrap",
  cursor: "pointer",
});
const commentCss = `
.uai-comment-control{background:transparent;color:var(--uai-muted);transition:background-color 120ms ease-out,color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-comment-control:hover{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-comment-control[data-tone=secondary]{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-comment-control[data-tone=secondary]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-comment-control[data-tone=primary]{background:var(--uai-accent);color:var(--uai-accent-foreground)}
.uai-comment-control[data-tone=primary]:hover{filter:brightness(1.08)}
.uai-comment-control[data-tone=primary]:disabled{opacity:0.45;filter:none;cursor:not-allowed}
.uai-comment-control[data-tone=link]{color:var(--uai-text);text-decoration:underline;text-decoration-color:var(--uai-border-strong);text-underline-offset:2px}
.uai-comment-control[data-tone=link]:hover{background:transparent;text-decoration-color:currentColor}
.uai-comment-control:not(:disabled):active{transform:scale(0.97)}
.uai-comment-control:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-comment-editor{transition:box-shadow 120ms ease-out}
.uai-comment-editor:focus-visible{outline:none;box-shadow:0 0 0 1px var(--uai-border-strong),0 0 0 4px color-mix(in oklab,var(--uai-accent) 14%,transparent)}
.uai-comment-editor::placeholder{color:var(--uai-subtle)}
.uai-comment-actions{margin-inline-start:-8px}
.uai-comment-actions:has(>:first-child:not(.uai-comment-control)){margin-inline-start:0}
.uai-comment-replies>*{animation:uai-comment-in 240ms cubic-bezier(0.23,1,0.32,1) both}
.uai-comment-replies>:nth-child(2){animation-delay:40ms}
.uai-comment-replies>:nth-child(3){animation-delay:80ms}
.uai-comment-replies>:nth-child(4){animation-delay:120ms}
.uai-comment-replies>:nth-child(n+5){animation-delay:160ms}
@keyframes uai-comment-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){
.uai-comment-control,.uai-comment-editor{transition:none}
.uai-comment-control:not(:disabled):active{transform:none}
.uai-comment-actions{margin-inline-start:-8px}
.uai-comment-actions:has(>:first-child:not(.uai-comment-control)){margin-inline-start:0}
.uai-comment-replies>*{animation:none}
}
`;
const CONTROL = "uai-comment-control";
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
  style,
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
        {...props}
        data-variant={variant}
        data-moderation={moderation}
        style={{
          display: "grid",
          gap: variant === "compact" ? 4 : 6,
          minWidth: 0,
          padding: card ? "14px 16px" : 0,
          border: card ? "1px solid var(--uai-border)" : 0,
          borderRadius: 14,
          background: card ? "var(--uai-surface)" : "transparent",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        {nested ? null : <style>{commentCss}</style>}
        {children}
      </article>
    </Context.Provider>
  );
}

export function CommentHeader({ style, ...props }: ComponentProps<"header">) {
  useComment("CommentHeader");
  return (
    <header
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        columnGap: 8,
        rowGap: 2,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function CommentAvatar({
  name,
  src,
  style,
  ...props
}: Omit<ComponentProps<"span">, "children"> & { name: string; src?: string }) {
  const { variant } = useComment("CommentAvatar");
  const [failed, setFailed] = useState(false);
  const size = variant === "compact" ? 20 : 24;
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        display: "grid",
        placeItems: "center",
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        boxShadow: "0 0 0 1px oklch(1 0 0 / 0.08)",
        color: muted,
        fontSize: size >= 24 ? 10.5 : 9.5,
        fontWeight: 500,
        ...style,
      }}
    >
      {src && !failed ? (
        // biome-ignore lint/performance/noImgElement: distributed source cannot depend on next/image.
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function CommentAuthor({ style, ...props }: ComponentProps<"span">) {
  const { id } = useComment("CommentAuthor");
  return <span {...props} id={`${id}-author`} style={{ fontWeight: 500, ...style }} />;
}

export function CommentTime({ style, ...props }: ComponentProps<"time"> & { dateTime: string }) {
  useComment("CommentTime");
  return (
    <time
      {...props}
      style={{ color: subtle, fontSize: 12, fontVariantNumeric: "tabular-nums", ...style }}
    />
  );
}

/** Shows "Edited" once a comment has been changed. */
export function CommentEdited({ children = "Edited", style, ...props }: ComponentProps<"span">) {
  useComment("CommentEdited");
  return (
    <span {...props} style={{ color: subtle, fontSize: 12, ...style }}>
      · {children}
    </span>
  );
}

const notice: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 6,
  margin: 0,
  color: muted,
  fontSize: 12.5,
  lineHeight: "18px",
};
const flagBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "2px 8px",
  borderRadius: 999,
  background: "color-mix(in oklab, var(--uai-warning) 14%, transparent)",
  color: "var(--uai-warning)",
  fontSize: 11.5,
  fontWeight: 500,
  lineHeight: "16px",
};

export function CommentBody({ style, children, ...props }: ComponentProps<"div">) {
  const context = useComment("CommentBody");
  const bodyId = `${context.id}-body`;
  if (context.editing) return null;
  if (context.moderation === "removed")
    return (
      <p {...props} style={{ ...notice, color: subtle, fontStyle: "italic", ...style }}>
        This comment was removed by a moderator.
      </p>
    );
  const hidden = context.moderation === "hidden";
  const text = (
    <div
      id={bodyId}
      style={{
        minWidth: 0,
        color: "var(--uai-text)",
        textWrap: "pretty",
        overflowWrap: "anywhere",
        whiteSpace: "pre-line",
      }}
    >
      {children}
    </div>
  );
  return (
    <div {...props} style={{ display: "grid", gap: 6, minWidth: 0, ...style }}>
      {context.moderation === "flagged" && (
        <p style={notice}>
          <span style={flagBadge}>
            <Flag size={12} strokeWidth={2} aria-hidden="true" />
            Flagged for review
          </span>
        </p>
      )}
      {hidden && (
        <p style={notice}>
          <EyeOff size={13} strokeWidth={1.75} aria-hidden="true" />
          This comment is hidden.
          <button
            type="button"
            aria-expanded={context.revealed}
            aria-controls={context.revealed ? bodyId : undefined}
            onClick={() => context.setRevealed(!context.revealed)}
            className={CONTROL}
            data-tone="link"
            style={{ ...controlStyle(true), height: "auto", padding: 0 }}
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
  style,
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
  return (
    <form
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      style={{ display: "grid", gap: 8, minWidth: 0, ...style }}
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
        className="uai-comment-editor"
        style={{
          boxSizing: "border-box",
          width: "100%",
          minWidth: 0,
          padding: "8px 10px",
          border: 0,
          borderRadius: compact ? 8 : 10,
          background: context.variant === "card" ? "var(--uai-canvas)" : "var(--uai-surface)",
          boxShadow: "0 0 0 1px var(--uai-border)",
          color: "inherit",
          font: "inherit",
          fontSize: 13,
          lineHeight: "18px",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        <button
          type="button"
          onClick={finish}
          className={CONTROL}
          data-tone="secondary"
          style={{ ...controlStyle(compact), paddingInline: compact ? 10 : 12 }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!value.trim()}
          className={CONTROL}
          data-tone="primary"
          style={{ ...controlStyle(compact), paddingInline: compact ? 10 : 12 }}
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
  style,
  ...props
}: ComponentProps<"div">) {
  const context = useComment("CommentActions");
  if (context.editing || context.moderation === "removed") return null;
  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled group of action buttons, not a fieldset.
    <div
      role="group"
      aria-label={label}
      {...props}
      className={["uai-comment-actions", className].filter(Boolean).join(" ")}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 4,
        ...style,
      }}
    />
  );
}

export function CommentAction({ className, style, ...props }: ComponentProps<"button">) {
  const context = useComment("CommentAction");
  return (
    <button
      type="button"
      {...props}
      className={[CONTROL, className].filter(Boolean).join(" ")}
      style={{ ...controlStyle(context.variant === "compact"), ...style }}
    />
  );
}

export function CommentEditTrigger({
  children = "Edit",
  onClick,
  className,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useComment("CommentEditTrigger");
  return (
    <button
      ref={context.editTriggerRef}
      {...props}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setEditing(true);
      }}
      className={[CONTROL, className].filter(Boolean).join(" ")}
      style={{ ...controlStyle(context.variant === "compact"), ...style }}
    >
      <Pencil size={12} strokeWidth={1.75} aria-hidden="true" />
      {children}
    </button>
  );
}

export function CommentReplies({
  "aria-label": label = "Replies",
  className,
  style,
  ...props
}: ComponentProps<"section">) {
  const context = useComment("CommentReplies");
  const compact = context.variant === "compact";
  return (
    <section
      aria-label={label}
      {...props}
      className={["uai-comment-replies", className].filter(Boolean).join(" ")}
      style={{
        display: "grid",
        gap: compact ? 12 : 16,
        marginTop: compact ? 4 : 6,
        marginInlineStart: compact ? 9.5 : 11.5,
        paddingInlineStart: compact ? 14 : 18,
        borderInlineStart: "1px solid var(--uai-border)",
        ...style,
      }}
    />
  );
}
