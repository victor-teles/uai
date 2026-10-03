"use client";

import { Check, Copy, Info, type LucideIcon, Sparkles, User, Wrench } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export const MESSAGE_VARIANTS = ["bubble", "plain", "compact"] as const;
export const MESSAGE_ROLES = ["user", "assistant", "system", "tool"] as const;
export type MessageVariant = (typeof MESSAGE_VARIANTS)[number];
export type MessageRole = (typeof MESSAGE_ROLES)[number];
export type MessageProps = ComponentProps<"article"> & {
  variant?: MessageVariant;
  /** Who authored the message. */
  from?: MessageRole;
  /** Marks the message as still receiving content. */
  streaming?: boolean;
};

type MessageContextValue = {
  id: string;
  role: MessageRole;
  variant: MessageVariant;
  streaming: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const MessageContext = createContext<MessageContextValue | null>(null);

function useMessage(part: string) {
  const context = useContext(MessageContext);
  if (!context) throw new Error(`${part} must be used within Message`);
  return context;
}

const roleDetails: Record<MessageRole, { label: string; icon: LucideIcon }> = {
  user: { label: "You", icon: User },
  assistant: { label: "Assistant", icon: Sparkles },
  system: { label: "System", icon: Info },
  tool: { label: "Tool", icon: Wrench },
};

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const messageCss = `
@keyframes uai-message-in{from{opacity:0;transform:translateY(4px)}}
[data-uai-message]{animation:uai-message-in 240ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-message-action]{transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-message-action]:hover{background:var(--uai-surface-raised)!important;color:var(--uai-text)!important}
[data-uai-message-action]:active{transform:scale(0.94)}
[data-uai-message-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:1px}
@media (prefers-reduced-motion:reduce){[data-uai-message],[data-uai-message-action]{animation:none;transition:none}[data-uai-message-action]:active{transform:none}}
`;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function Message({
  variant = "bubble",
  from: role = "assistant",
  streaming = false,
  children,
  style,
  "aria-label": ariaLabel,
  ...props
}: MessageProps) {
  const id = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const alignEnd = variant === "bubble" && role === "user";
  return (
    <MessageContext.Provider value={{ id, role, variant, streaming, contentRef }}>
      <article
        aria-label={ariaLabel ?? `${roleDetails[role].label} message`}
        {...props}
        aria-busy={streaming || undefined}
        data-variant={variant}
        data-role={role}
        data-streaming={streaming || undefined}
        data-uai-message=""
        style={{
          display: "flex",
          flexDirection: alignEnd ? "row-reverse" : "row",
          alignItems: "flex-start",
          gap: variant === "compact" ? 8 : 12,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style href="uai-message" precedence="default">
          {messageCss}
        </style>
        {children}
      </article>
    </MessageContext.Provider>
  );
}

export function MessageAvatar({ children, style, ...props }: ComponentProps<"span">) {
  const context = useMessage("MessageAvatar");
  const Icon = roleDetails[context.role].icon;
  const size = context.variant === "compact" ? 24 : 28;
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        display: "grid",
        placeItems: "center",
        flex: "none",
        width: size,
        height: size,
        overflow: "hidden",
        borderRadius: 999,
        boxShadow: "0 0 0 1px color-mix(in oklab, var(--uai-text) 8%, transparent)",
        background:
          context.role === "assistant"
            ? "color-mix(in oklab, var(--uai-accent) 18%, var(--uai-surface))"
            : "var(--uai-surface-raised)",
        color:
          context.role === "assistant"
            ? "color-mix(in oklab, var(--uai-accent) 70%, var(--uai-text))"
            : "var(--uai-muted)",
        fontSize: context.variant === "compact" ? 10 : 10.5,
        fontWeight: 500,
        letterSpacing: "0.01em",
        ...style,
      }}
    >
      {children ?? <Icon size={context.variant === "compact" ? 12 : 14} strokeWidth={1.8} />}
    </span>
  );
}

export function MessageBody({ style, ...props }: ComponentProps<"div">) {
  const context = useMessage("MessageBody");
  const alignEnd = context.variant === "bubble" && context.role === "user";
  return (
    <div
      {...props}
      style={{
        display: "grid",
        justifyItems: alignEnd ? "end" : "start",
        gap: context.variant === "compact" ? 4 : 6,
        flex: "1 1 auto",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function MessageHeader({ style, ...props }: ComponentProps<"div">) {
  useMessage("MessageHeader");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: 6,
        minWidth: 0,
        lineHeight: "18px",
        ...style,
      }}
    />
  );
}

export function MessageAuthor({ children, style, ...props }: ComponentProps<"span">) {
  const context = useMessage("MessageAuthor");
  return (
    <span {...props} style={{ fontSize: 12.5, fontWeight: 500, ...style }}>
      {children ?? roleDetails[context.role].label}
    </span>
  );
}

export function MessageTime({ style, ...props }: ComponentProps<"time">) {
  return (
    <time
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

function StreamingCaret() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const animation = ref.current?.animate?.([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], {
      duration: 1000,
      iterations: Number.POSITIVE_INFINITY,
      easing: "ease-in-out",
    });
    return () => animation?.cancel();
  }, []);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-message-caret=""
      style={{
        display: "inline-block",
        width: 2,
        height: 15,
        marginLeft: 2,
        verticalAlign: "-3px",
        borderRadius: 1,
        background: "var(--uai-text)",
      }}
    />
  );
}

export function MessageContent({ children, style, ...props }: ComponentProps<"div">) {
  const context = useMessage("MessageContent");
  const { role, variant } = context;
  const bubble = variant !== "plain" && role === "user";
  const tool = role === "tool";
  const system = role === "system";
  return (
    <div
      {...props}
      ref={context.contentRef}
      id={`${context.id}-content`}
      style={{
        minWidth: 0,
        maxWidth: "100%",
        overflowWrap: "anywhere",
        padding: bubble || tool ? (variant === "compact" ? "6px 10px" : "8px 12px") : 0,
        borderRadius: tool ? (variant === "compact" ? 8 : 10) : variant === "compact" ? 12 : 16,
        border: 0,
        background: bubble
          ? "var(--uai-surface-raised)"
          : tool
            ? "color-mix(in oklab, var(--uai-surface-raised) 55%, transparent)"
            : "transparent",
        color: system ? "var(--uai-subtle)" : tool ? "var(--uai-muted)" : "var(--uai-text)",
        fontFamily: tool ? "var(--font-mono, ui-monospace, monospace)" : undefined,
        fontSize: tool ? 12 : system ? 12 : variant === "compact" ? 12.5 : 13,
        lineHeight: tool || system ? "17px" : variant === "compact" ? "18px" : "20px",
        textWrap: "pretty",
        ...style,
      }}
    >
      {children}
      {context.streaming ? <StreamingCaret /> : null}
    </div>
  );
}

export function MessageActions({ style, ...props }: ComponentProps<"div">) {
  const context = useMessage("MessageActions");
  if (context.streaming) return null;
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset is for form controls, not message actions.
    <div
      role="group"
      aria-label="Message actions"
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 0,
        marginTop: -2,
        marginLeft: context.variant === "bubble" && context.role === "user" ? 0 : -6,
        ...style,
      }}
    />
  );
}

function actionStyle(variant: MessageVariant): CSSProperties {
  const size = variant === "compact" ? 24 : 28;
  return {
    display: "grid",
    placeItems: "center",
    width: size,
    height: size,
    padding: 0,
    border: 0,
    borderRadius: 8,
    background: "transparent",
    color: "var(--uai-subtle)",
    cursor: "pointer",
  };
}

export type MessageActionProps = ComponentProps<"button"> & {
  /** Accessible name for the icon-only action. */
  label: string;
};

export function MessageAction({ label, style, ...props }: MessageActionProps) {
  const context = useMessage("MessageAction");
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-uai-message-action=""
      {...props}
      style={{ ...actionStyle(context.variant), ...style }}
    />
  );
}

export type MessageCopyProps = Omit<ComponentProps<"button">, "children"> & {
  /** Text to copy. Defaults to the text of MessageContent. */
  text?: string;
  onCopied?: (text: string) => void;
  children?: ReactNode;
};

export function MessageCopy({
  text,
  onCopied,
  onClick,
  children,
  style,
  ...props
}: MessageCopyProps) {
  const context = useMessage("MessageCopy");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);
  return (
    <>
      <button
        type="button"
        aria-label="Copy message"
        title="Copy message"
        data-uai-message-action=""
        {...props}
        style={{ ...actionStyle(context.variant), ...style }}
        onClick={async (event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const value = text ?? context.contentRef.current?.textContent ?? "";
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            onCopied?.(value);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? (
          <Check size={14} aria-hidden="true" style={{ color: "var(--uai-success)" }} />
        ) : (
          (children ?? <Copy size={14} aria-hidden="true" />)
        )}
      </button>
      <span role="status" style={visuallyHidden}>
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}
