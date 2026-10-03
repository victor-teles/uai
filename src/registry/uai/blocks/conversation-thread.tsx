"use client";

import {
  type ComponentProps,
  createContext,
  type UIEvent,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";
import { Citation, type CitationProps, type CitationVariant } from "@/components/ui/uai/citation";
import { Message, type MessageProps, type MessageVariant } from "@/components/ui/uai/message";
import {
  PromptComposer,
  type PromptComposerProps,
  type PromptComposerVariant,
} from "@/components/ui/uai/prompt-composer";
import {
  ResponseStatus,
  type ResponseStatusProps,
  type ResponseStatusVariant,
} from "@/components/ui/uai/response-status";

export const CONVERSATION_THREAD_VARIANTS = ["chat", "document", "compact"] as const;
export type ConversationThreadVariant = (typeof CONVERSATION_THREAD_VARIANTS)[number];
export type ConversationThreadProps = ComponentProps<"section"> & {
  variant?: ConversationThreadVariant;
};

type ThreadContext = { id: string; variant: ConversationThreadVariant };
const Context = createContext<ThreadContext | null>(null);
function useThread(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ConversationThread`);
  return context;
}
const SourcesContext = createContext<string | null>(null);

const messageVariants: Record<ConversationThreadVariant, MessageVariant> = {
  chat: "bubble",
  document: "plain",
  compact: "compact",
};
const citationVariants: Record<ConversationThreadVariant, CitationVariant> = {
  chat: "number",
  document: "underline",
  compact: "number",
};
const statusVariants: Record<ConversationThreadVariant, ResponseStatusVariant> = {
  chat: "pill",
  document: "inline",
  compact: "inline",
};
const composerVariants: Record<ConversationThreadVariant, PromptComposerVariant> = {
  chat: "rounded",
  document: "rounded",
  compact: "compact",
};

const layoutCss = `
[data-uai-thread-layout]{display:grid;gap:16px;align-items:start;min-width:0}
[data-uai-thread="compact"]>[data-uai-thread-layout]{gap:12px}
@container (min-width: 760px){
  [data-uai-thread="chat"]>[data-uai-thread-layout],
  [data-uai-thread="document"]>[data-uai-thread-layout]{grid-template-columns:minmax(0,1fr) minmax(220px,260px);gap:24px}
  [data-uai-thread-layout]>[data-uai-thread-region="header"]{grid-column:1/-1}
}
[data-uai-thread-source]{transition:background-color 120ms ease-out}
[data-uai-thread-source]:hover{background:var(--uai-surface-raised)}
[data-uai-thread-link]{text-decoration-line:none;text-decoration-color:var(--uai-border-strong);text-underline-offset:3px}
[data-uai-thread-link]:hover{text-decoration-line:underline}
[data-uai-thread-link]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px;border-radius:4px}
@media (prefers-reduced-motion: reduce){[data-uai-thread-source]{transition:none}}`;

/** A conversation with messages, sources, response state, and a composer. Sources move beside the thread at 760px. */
export function ConversationThread({
  variant = "chat",
  children,
  style,
  ...props
}: ConversationThreadProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-thread={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-thread-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function ConversationThreadHeader({ style, ...props }: ComponentProps<"header">) {
  useThread("ConversationThreadHeader");
  return (
    <header
      {...props}
      data-uai-thread-region="header"
      style={{ display: "grid", gap: 4, minWidth: 0, ...style }}
    />
  );
}

export function ConversationThreadTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useThread("ConversationThreadTitle");
  const compact = variant === "compact";
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: compact ? 15 : 18,
        lineHeight: compact ? "20px" : "24px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function ConversationThreadDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

/** The conversation column: the log, the response status, and the composer. */
export function ConversationThreadMain({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useThread("ConversationThreadMain");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: variant === "compact" ? 8 : 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** A scrollable `role="log"` region. It stays pinned to the newest message unless the reader scrolls up. */
export function ConversationThreadLog({ onScroll, style, ...props }: ComponentProps<"div">) {
  const { id, variant } = useThread("ConversationThreadLog");
  const ref = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  useEffect(() => {
    const node = ref.current;
    if (node && pinned.current) node.scrollTop = node.scrollHeight;
  });
  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-labelledby={`${id}-title`}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the scrollable log must be reachable by keyboard.
      tabIndex={0}
      {...props}
      ref={ref}
      onScroll={(event: UIEvent<HTMLDivElement>) => {
        onScroll?.(event);
        const node = event.currentTarget;
        pinned.current = node.scrollHeight - node.scrollTop - node.clientHeight < 32;
      }}
      style={{
        display: "grid",
        alignContent: "start",
        gap: variant === "compact" ? 12 : 20,
        maxHeight: variant === "compact" ? 360 : 520,
        minWidth: 0,
        overflowY: "auto",
        overscrollBehavior: "contain",
        padding: variant === "compact" ? "4px 2px" : "4px 4px 8px",
        borderRadius: 12,
        ...style,
      }}
    />
  );
}

export type ConversationThreadMessageProps = Omit<MessageProps, "variant">;

/** One turn in the conversation. Compose Message parts inside it. */
export function ConversationThreadMessage(props: ConversationThreadMessageProps) {
  const { variant } = useThread("ConversationThreadMessage");
  return <Message {...props} variant={messageVariants[variant]} />;
}

/** An inline source marker inside a message. Compose Citation parts inside it. */
export function ConversationThreadCitation(props: Omit<CitationProps, "variant">) {
  const { variant } = useThread("ConversationThreadCitation");
  return <Citation {...props} variant={citationVariants[variant]} />;
}

/** Where the latest response stands. Compose Response Status parts inside it. */
export function ConversationThreadStatus(props: Omit<ResponseStatusProps, "variant">) {
  const { variant } = useThread("ConversationThreadStatus");
  return <ResponseStatus {...props} variant={statusVariants[variant]} />;
}

/** The prompt form. Compose Prompt Composer parts inside it. */
export function ConversationThreadComposer(props: Omit<PromptComposerProps, "variant">) {
  const { variant } = useThread("ConversationThreadComposer");
  return <PromptComposer {...props} variant={composerVariants[variant]} />;
}

/** Sources referenced in the conversation. Sits beside the thread on wide containers. */
export function ConversationThreadSources({ style, ...props }: ComponentProps<"aside">) {
  const { variant } = useThread("ConversationThreadSources");
  const id = useId();
  const compact = variant === "compact";
  return (
    <SourcesContext.Provider value={id}>
      <aside
        aria-labelledby={id}
        {...props}
        style={{
          display: "grid",
          alignContent: "start",
          gap: compact ? 6 : 10,
          minWidth: 0,
          padding: compact ? 12 : "14px 12px 10px",
          border: "1px solid var(--uai-border)",
          borderRadius: compact ? 12 : 14,
          background: "var(--uai-surface)",
          ...style,
        }}
      />
    </SourcesContext.Provider>
  );
}

export function ConversationThreadSourcesTitle({ style, ...props }: ComponentProps<"h3">) {
  const id = useContext(SourcesContext);
  if (!id)
    throw new Error("ConversationThreadSourcesTitle must be used within ConversationThreadSources");
  return (
    <h3
      {...props}
      id={id}
      style={{ margin: 0, fontSize: 13, lineHeight: "18px", fontWeight: 500, ...style }}
    />
  );
}

export function ConversationThreadSourceList({ style, ...props }: ComponentProps<"ol">) {
  const id = useContext(SourcesContext);
  if (!id)
    throw new Error("ConversationThreadSourceList must be used within ConversationThreadSources");
  return (
    <ol
      aria-labelledby={id}
      {...props}
      style={{
        display: "grid",
        gap: 2,
        margin: 0,
        padding: 0,
        listStyle: "none",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export type ConversationThreadSourceProps = ComponentProps<"li"> & {
  /** Source number, matching the citation markers in the conversation. */
  index: number;
};

export function ConversationThreadSource({
  index,
  children,
  style,
  ...props
}: ConversationThreadSourceProps) {
  useThread("ConversationThreadSource");
  return (
    <li
      {...props}
      data-uai-thread-source=""
      style={{
        display: "grid",
        gridTemplateColumns: "20px minmax(0, 1fr)",
        alignItems: "start",
        gap: 8,
        padding: "6px",
        borderRadius: 8,
        minWidth: 0,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          placeItems: "center",
          height: 18,
          marginTop: 1,
          borderRadius: 999,
          background: "var(--uai-surface-raised)",
          color: "var(--uai-muted)",
          fontSize: 11,
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {index}
      </span>
      <span style={{ display: "grid", gap: 2, minWidth: 0 }}>{children}</span>
    </li>
  );
}

export function ConversationThreadSourceLink({ style, ...props }: ComponentProps<"a">) {
  return (
    <a
      {...props}
      data-uai-thread-link=""
      style={{
        color: "var(--uai-text)",
        fontWeight: 500,

        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function ConversationThreadSourceMeta({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{ color: "var(--uai-subtle)", fontSize: 12, overflowWrap: "anywhere", ...style }}
    />
  );
}
