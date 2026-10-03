"use client";

import { RotateCw, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAuthor,
  MessageAvatar,
  MessageBody,
  MessageContent,
  MessageCopy,
  MessageHeader,
  MessageTime,
  type MessageVariant,
} from "@/components/ui/uai/message";

const reply =
  "Your Pro plan renews on October 14. Downgrading takes effect at the end of the billing period, so you keep shared workspaces until then.";

export function MessagePreview({ variant = "bubble" }: { variant?: MessageVariant }) {
  const [shown, setShown] = useState(reply.length);
  const streaming = shown < reply.length;
  useEffect(() => {
    if (!streaming) return;
    const timer = window.setTimeout(() => setShown((count) => count + 6), 40);
    return () => window.clearTimeout(timer);
  }, [streaming]);
  return (
    <div role="log" aria-label="Billing conversation" style={{ display: "grid", gap: 20 }}>
      <Message variant={variant} from="system">
        <MessageBody>
          <MessageContent>Conversation shared with the billing team.</MessageContent>
        </MessageBody>
      </Message>
      <Message variant={variant} from="user">
        <MessageAvatar>MR</MessageAvatar>
        <MessageBody>
          <MessageHeader>
            <MessageAuthor>Maya Ruiz</MessageAuthor>
            <MessageTime dateTime="2026-09-30T09:12">9:12</MessageTime>
          </MessageHeader>
          <MessageContent>
            If I downgrade today, do I lose shared workspaces right away?
          </MessageContent>
        </MessageBody>
      </Message>
      <Message variant={variant} from="tool">
        <MessageAvatar />
        <MessageBody>
          <MessageHeader>
            <MessageAuthor>billing.get_subscription</MessageAuthor>
          </MessageHeader>
          <MessageContent>plan: pro · renews: 2026-10-14 · seats: 6</MessageContent>
        </MessageBody>
      </Message>
      <Message variant={variant} from="assistant" streaming={streaming}>
        <MessageAvatar />
        <MessageBody>
          <MessageHeader>
            <MessageAuthor />
            <MessageTime dateTime="2026-09-30T09:12">9:12</MessageTime>
          </MessageHeader>
          <MessageContent>{reply.slice(0, shown)}</MessageContent>
          <MessageActions>
            <MessageCopy />
            <MessageAction label="Good response">
              <ThumbsUp size={14} aria-hidden="true" />
            </MessageAction>
            <MessageAction label="Regenerate response" onClick={() => setShown(0)}>
              <RotateCw size={14} aria-hidden="true" />
            </MessageAction>
          </MessageActions>
        </MessageBody>
      </Message>
    </div>
  );
}
