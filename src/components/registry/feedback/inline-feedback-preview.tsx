"use client";

import {
  InlineFeedback,
  InlineFeedbackAction,
  InlineFeedbackMessage,
  InlineFeedbackStatus,
  type InlineFeedbackVariant,
} from "@/components/ui/uai/inline-feedback";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function InlineFeedbackPreview({ variant = "text" }: { variant?: InlineFeedbackVariant }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <InlineFeedback variant={variant} duration={2400}>
        <InlineFeedbackAction onAction={() => wait(500)}>Copy invite link</InlineFeedbackAction>
        <InlineFeedbackStatus>
          <InlineFeedbackMessage status="pending">Copying…</InlineFeedbackMessage>
          <InlineFeedbackMessage status="success">Link copied</InlineFeedbackMessage>
        </InlineFeedbackStatus>
      </InlineFeedback>
      <InlineFeedback variant={variant} duration={4000}>
        <InlineFeedbackAction
          onAction={async () => {
            await wait(700);
            throw new Error("Network unavailable");
          }}
        >
          Archive thread
        </InlineFeedbackAction>
        <InlineFeedbackStatus>
          <InlineFeedbackMessage status="pending">Archiving…</InlineFeedbackMessage>
          <InlineFeedbackMessage status="success">Archived</InlineFeedbackMessage>
          <InlineFeedbackMessage status="error">Couldn’t archive. Try again.</InlineFeedbackMessage>
        </InlineFeedbackStatus>
      </InlineFeedback>
    </div>
  );
}
