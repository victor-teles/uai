"use client";

import { useEffect, useRef, useState } from "react";
import {
  ConversationThread,
  ConversationThreadCitation,
  ConversationThreadComposer,
  ConversationThreadDescription,
  ConversationThreadHeader,
  ConversationThreadLog,
  ConversationThreadMain,
  ConversationThreadMessage,
  ConversationThreadSource,
  ConversationThreadSourceLink,
  ConversationThreadSourceList,
  ConversationThreadSourceMeta,
  ConversationThreadSources,
  ConversationThreadSourcesTitle,
  ConversationThreadStatus,
  ConversationThreadTitle,
  type ConversationThreadVariant,
} from "@/components/uai/conversation-thread";
import {
  CitationExcerpt,
  CitationLink,
  CitationPopover,
  CitationSource,
  CitationTitle,
  CitationTrigger,
} from "@/components/ui/uai/citation";
import {
  MessageActions,
  MessageAuthor,
  MessageAvatar,
  MessageBody,
  MessageContent,
  MessageCopy,
  MessageHeader,
  MessageTime,
} from "@/components/ui/uai/message";
import {
  PromptComposerActions,
  PromptComposerInput,
  PromptComposerSubmit,
} from "@/components/ui/uai/prompt-composer";
import {
  ResponseStatusActions,
  ResponseStatusDetail,
  ResponseStatusIndicator,
  ResponseStatusLabel,
  ResponseStatusRetry,
  ResponseStatusStop,
  type ResponseStatusValue,
} from "@/components/ui/uai/response-status";

type Turn = { id: number; from: "user" | "assistant"; text: string; time: string };

const sources = [
  {
    index: 1,
    title: "Release 4.2 support review",
    meta: "Support Ops · Sep 18",
    excerpt: "Ticket volume rose 31% in the two weeks after 4.2, led by invoice export questions.",
  },
  {
    index: 2,
    title: "Invoice export changelog",
    meta: "Product docs · Sep 4",
    excerpt: "Exports now default to the workspace currency instead of the customer currency.",
  },
];

const reply =
  "Most of the follow-up tickets came from teams in the EU and UK. Exports now default to the workspace currency, so customers billing in euros saw totals in dollars. A banner on the export screen and a currency setting in the export dialog would cover the largest group.";

function CitedReply() {
  return (
    <>
      Most of the follow-up tickets came from teams in the EU and UK
      <SourceCitation index={1} />. Exports now default to the workspace currency, so customers
      billing in euros saw totals in dollars
      <SourceCitation index={2} />. A banner on the export screen and a currency setting in the
      export dialog would cover the largest group.
    </>
  );
}

function SourceCitation({ index }: { index: number }) {
  const source = sources[index - 1];
  if (!source) return null;
  return (
    <ConversationThreadCitation index={index}>
      <CitationTrigger />
      <CitationPopover>
        <CitationSource>{source.meta}</CitationSource>
        <CitationTitle>{source.title}</CitationTitle>
        <CitationExcerpt>{source.excerpt}</CitationExcerpt>
        <CitationLink href="#sources">Open document</CitationLink>
      </CitationPopover>
    </ConversationThreadCitation>
  );
}

export function ConversationThreadPreview({
  variant = "chat",
}: {
  variant?: ConversationThreadVariant;
}) {
  const [turns, setTurns] = useState<Turn[]>([
    {
      id: 1,
      from: "user",
      text: "Why did support tickets jump after the 4.2 release?",
      time: "09:41",
    },
    { id: 2, from: "assistant", text: reply, time: "09:41" },
  ]);
  const [streamed, setStreamed] = useState(reply.length);
  const [status, setStatus] = useState<ResponseStatusValue>("complete");
  const timers = useRef<number[]>([]);
  const nextId = useRef(3);

  const clearTimers = () => {
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
  };
  useEffect(
    () => () => {
      for (const timer of timers.current) window.clearTimeout(timer);
    },
    [],
  );

  // Simulates a streamed reply locally. Applications connect their own transport.
  const respond = () => {
    clearTimers();
    setStatus("queued");
    setStreamed(0);
    const words = reply.split(" ");
    timers.current.push(
      window.setTimeout(() => {
        setStatus("streaming");
        words.forEach((_, index) => {
          timers.current.push(
            window.setTimeout(() => {
              setStreamed(words.slice(0, index + 1).join(" ").length);
              if (index === words.length - 1) setStatus("complete");
            }, index * 45),
          );
        });
      }, 500),
    );
  };

  const streaming = status === "queued" || status === "streaming";
  const latest = turns[turns.length - 1]?.id;

  return (
    <ConversationThread variant={variant}>
      <ConversationThreadHeader>
        <ConversationThreadTitle>Support volume after 4.2</ConversationThreadTitle>
        <ConversationThreadDescription>
          Answers cite the support review and the product changelog.
        </ConversationThreadDescription>
      </ConversationThreadHeader>
      <ConversationThreadMain>
        <ConversationThreadLog>
          {turns.map((turn) => {
            const live = turn.id === latest && turn.from === "assistant";
            return (
              <ConversationThreadMessage
                key={turn.id}
                from={turn.from}
                streaming={live && streaming}
              >
                <MessageAvatar />
                <MessageBody>
                  <MessageHeader>
                    <MessageAuthor>
                      {turn.from === "assistant" ? "Ledger assistant" : "You"}
                    </MessageAuthor>
                    <MessageTime dateTime={`2026-09-30T${turn.time}`}>{turn.time}</MessageTime>
                  </MessageHeader>
                  <MessageContent>
                    {turn.from === "user" ? (
                      turn.text
                    ) : live && status !== "complete" ? (
                      reply.slice(0, streamed)
                    ) : (
                      <CitedReply />
                    )}
                  </MessageContent>
                  {turn.from === "assistant" ? (
                    <MessageActions>
                      <MessageCopy text={reply} />
                    </MessageActions>
                  ) : null}
                </MessageBody>
              </ConversationThreadMessage>
            );
          })}
        </ConversationThreadLog>
        <ConversationThreadStatus status={status}>
          <ResponseStatusIndicator />
          <ResponseStatusLabel />
          {status === "complete" ? <ResponseStatusDetail>2 sources</ResponseStatusDetail> : null}
          <ResponseStatusActions>
            <ResponseStatusStop
              onClick={() => {
                clearTimers();
                setStatus("stopped");
              }}
            />
            <ResponseStatusRetry onClick={respond} />
          </ResponseStatusActions>
        </ConversationThreadStatus>
        <ConversationThreadComposer
          busy={streaming}
          onSubmit={(prompt) => {
            setTurns((current) => [
              ...current.slice(-4),
              { id: nextId.current++, from: "user", text: prompt, time: "09:44" },
              { id: nextId.current++, from: "assistant", text: reply, time: "09:44" },
            ]);
            respond();
          }}
        >
          <PromptComposerInput placeholder="Ask a follow-up…" />
          <PromptComposerActions>
            <PromptComposerSubmit />
          </PromptComposerActions>
        </ConversationThreadComposer>
      </ConversationThreadMain>
      <ConversationThreadSources id="sources">
        <ConversationThreadSourcesTitle>Sources</ConversationThreadSourcesTitle>
        <ConversationThreadSourceList>
          {sources.map((source) => (
            <ConversationThreadSource key={source.index} index={source.index}>
              <ConversationThreadSourceLink href="#sources">
                {source.title}
              </ConversationThreadSourceLink>
              <ConversationThreadSourceMeta>{source.meta}</ConversationThreadSourceMeta>
            </ConversationThreadSource>
          ))}
        </ConversationThreadSourceList>
      </ConversationThreadSources>
    </ConversationThread>
  );
}
