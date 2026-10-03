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
import { cn } from "@/lib/uai-utils";

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

/** A conversation with messages, sources, response state, and a composer. Sources move beside the thread at 760px. */
export function ConversationThread({
  variant = "chat",
  children,
  className,
  ...props
}: ConversationThreadProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="conversation-thread"
        data-variant={variant}
        className={cn(
          "box-border @container min-w-0 text-[13px]/[18px] text-foreground",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "grid min-w-0 items-start",
            variant === "compact"
              ? "gap-3"
              : "gap-4 @min-[760px]:grid-cols-[minmax(0,1fr)_minmax(220px,260px)] @min-[760px]:gap-6",
          )}
        >
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function ConversationThreadHeader({ className, ...props }: ComponentProps<"header">) {
  useThread("ConversationThreadHeader");
  return (
    <header
      data-slot="conversation-thread-header"
      className={cn("grid min-w-0 gap-1 @min-[760px]:col-span-full", className)}
      {...props}
    />
  );
}

export function ConversationThreadTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useThread("ConversationThreadTitle");
  return (
    <h2
      data-slot="conversation-thread-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em] wrap-anywhere",
        variant === "compact" ? "text-[15px]/5" : "text-lg/6",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function ConversationThreadDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="conversation-thread-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** The conversation column: the log, the response status, and the composer. */
export function ConversationThreadMain({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useThread("ConversationThreadMain");
  return (
    <div
      data-slot="conversation-thread-main"
      className={cn(
        "grid min-w-0 content-start",
        variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

/** A scrollable `role="log"` region. It stays pinned to the newest message unless the reader scrolls up. */
export function ConversationThreadLog({ onScroll, className, ...props }: ComponentProps<"div">) {
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
      data-slot="conversation-thread-log"
      className={cn(
        "grid min-w-0 content-start overflow-y-auto overscroll-contain rounded-xl",
        variant === "compact"
          ? "max-h-[360px] gap-3 px-0.5 py-1"
          : "max-h-[520px] gap-5 px-1 pt-1 pb-2",
        className,
      )}
      {...props}
      ref={ref}
      onScroll={(event: UIEvent<HTMLDivElement>) => {
        onScroll?.(event);
        const node = event.currentTarget;
        pinned.current = node.scrollHeight - node.scrollTop - node.clientHeight < 32;
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
export function ConversationThreadSources({ className, ...props }: ComponentProps<"aside">) {
  const { variant } = useThread("ConversationThreadSources");
  const id = useId();
  const compact = variant === "compact";
  return (
    <SourcesContext.Provider value={id}>
      <aside
        aria-labelledby={id}
        data-slot="conversation-thread-sources"
        className={cn(
          "grid min-w-0 content-start border bg-card",
          compact ? "gap-1.5 rounded-xl p-3" : "gap-2.5 rounded-[14px] px-3 pt-3.5 pb-2.5",
          className,
        )}
        {...props}
      />
    </SourcesContext.Provider>
  );
}

export function ConversationThreadSourcesTitle({ className, ...props }: ComponentProps<"h3">) {
  const id = useContext(SourcesContext);
  if (!id)
    throw new Error("ConversationThreadSourcesTitle must be used within ConversationThreadSources");
  return (
    <h3
      data-slot="conversation-thread-sources-title"
      className={cn("m-0 text-[13px]/[18px] font-medium", className)}
      {...props}
      id={id}
    />
  );
}

export function ConversationThreadSourceList({ className, ...props }: ComponentProps<"ol">) {
  const id = useContext(SourcesContext);
  if (!id)
    throw new Error("ConversationThreadSourceList must be used within ConversationThreadSources");
  return (
    <ol
      aria-labelledby={id}
      data-slot="conversation-thread-source-list"
      className={cn("m-0 grid min-w-0 list-none gap-0.5 p-0", className)}
      {...props}
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
  className,
  ...props
}: ConversationThreadSourceProps) {
  useThread("ConversationThreadSource");
  return (
    <li
      data-slot="conversation-thread-source"
      className={cn(
        "grid min-w-0 grid-cols-[20px_minmax(0,1fr)] items-start gap-2 rounded-lg p-1.5 transition-[background-color] duration-120 ease-out hover:bg-accent motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="mt-px grid h-[18px] place-items-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground tabular-nums"
      >
        {index}
      </span>
      <span className="grid min-w-0 gap-0.5">{children}</span>
    </li>
  );
}

export function ConversationThreadSourceLink({ className, ...props }: ComponentProps<"a">) {
  return (
    <a
      data-slot="conversation-thread-source-link"
      className={cn(
        "font-medium wrap-anywhere text-foreground no-underline decoration-border-strong underline-offset-3 hover:underline focus-visible:rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      {...props}
    />
  );
}

export function ConversationThreadSourceMeta({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="conversation-thread-source-meta"
      className={cn("text-[12px] wrap-anywhere text-subtle-foreground", className)}
      {...props}
    />
  );
}
