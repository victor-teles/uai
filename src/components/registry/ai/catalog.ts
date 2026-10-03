import {
  Activity,
  ClipboardCheck,
  MessageSquareText,
  Paperclip,
  Quote,
  Wrench,
} from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type AiItemId =
  | "message"
  | "citation"
  | "attachment"
  | "tool-call"
  | "response-status"
  | "run-summary";

export const aiCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "message",
    name: "Message",
    category: "AI",
    icon: MessageSquareText,
    description: "User, assistant, system, and tool messages with replaceable content.",
    usage: `"use client";

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
`,
    accessibility: [
      "Each message is an article named by its author role; streaming messages set aria-busy until content settles.",
      'Wrap a conversation in a role="log" container so new messages are announced politely.',
      "Icon-only actions require a label; Copy confirms through a visually hidden status message.",
      "Actions are hidden while streaming, and the streaming caret is decorative and stops blinking under reduced motion.",
    ],
  },
  {
    id: "citation",
    name: "Citation",
    category: "AI",
    icon: Quote,
    description: "Connect an inline claim to a source preview and destination.",
    usage: `"use client";

import {
  Citation,
  CitationClaim,
  CitationExcerpt,
  CitationLink,
  CitationPopover,
  CitationSource,
  CitationTitle,
  CitationTrigger,
  type CitationVariant,
} from "@/components/ui/uai/citation";

export function CitationPreview({ variant = "number" }: { variant?: CitationVariant }) {
  return (
    <p style={{ margin: 0, fontSize: 14, lineHeight: "24px", color: "var(--uai-text)" }}>
      Heat pumps cut household heating emissions{" "}
      <Citation variant={variant} index={1}>
        <CitationClaim>by roughly 45% compared with gas boilers</CitationClaim>
        <CitationTrigger aria-label="Source 1: The Future of Heat Pumps">
          {variant === "chip" ? "iea.org" : undefined}
        </CitationTrigger>
        <CitationPopover>
          <CitationSource>iea.org · Report · 2022</CitationSource>
          <CitationTitle>The Future of Heat Pumps</CitationTitle>
          <CitationExcerpt>
            Switching from a gas boiler to a heat pump reduces greenhouse gas emissions by at least
            20% today, and by around 45% in countries with cleaner electricity.
          </CitationExcerpt>
          <CitationLink
            href="https://www.iea.org/reports/the-future-of-heat-pumps"
            target="_blank"
            rel="noreferrer"
          >
            Open report
          </CitationLink>
        </CitationPopover>
      </Citation>
      , and the gap widens as grids decarbonize{" "}
      <Citation variant={variant} index={2}>
        <CitationTrigger aria-label="Source 2: Heat pumps in Europe">
          {variant === "chip" ? "ember-energy.org" : undefined}
        </CitationTrigger>
        <CitationPopover>
          <CitationSource>ember-energy.org · Analysis · 2024</CitationSource>
          <CitationTitle>Heat pumps in Europe</CitationTitle>
          <CitationExcerpt>
            Each percentage point of clean power added to the grid lowers the lifetime emissions of
            an installed heat pump.
          </CitationExcerpt>
          <CitationLink href="https://ember-energy.org" target="_blank" rel="noreferrer">
            Open analysis
          </CitationLink>
        </CitationPopover>
      </Citation>
      .
    </p>
  );
}
`,
    accessibility: [
      "The marker is a button with aria-expanded and aria-controls that opens the source preview on hover, focus, or press.",
      "The preview follows the marker in tab order, so keyboard users can reach the destination link; Escape closes it and returns focus.",
      "Give numbered markers an aria-label that names the source, such as “Source 1: The Future of Heat Pumps”.",
      "All parts render as phrasing content, so citations are valid inside paragraphs. The pop-in is skipped under reduced motion.",
    ],
  },
  {
    id: "attachment",
    name: "Attachment",
    category: "AI",
    icon: Paperclip,
    description: "File type, upload progress, failure, preview, and removal.",
    usage: `"use client";

import { useEffect, useState } from "react";
import {
  Attachment,
  AttachmentDetails,
  AttachmentError,
  AttachmentMeta,
  AttachmentName,
  AttachmentProgress,
  AttachmentRemove,
  AttachmentRetry,
  type AttachmentStatus,
  AttachmentThumbnail,
  type AttachmentVariant,
} from "@/components/ui/uai/attachment";

const thumbnail =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 96'><rect width='160' height='96' fill='%23e8e6e1'/><rect x='14' y='14' width='58' height='68' rx='6' fill='%23ffffff'/><rect x='84' y='14' width='62' height='30' rx='6' fill='%23cfccc5'/><rect x='84' y='52' width='62' height='30' rx='6' fill='%23ffffff'/></svg>";

export function AttachmentPreview({ variant = "row" }: { variant?: AttachmentVariant }) {
  const [progress, setProgress] = useState(18);
  const [contract, setContract] = useState<AttachmentStatus>("error");
  const [files, setFiles] = useState(["mockup", "deck", "contract"]);
  const uploading = progress < 100;
  useEffect(() => {
    if (!uploading) return;
    const timer = window.setTimeout(() => setProgress((value) => Math.min(100, value + 7)), 240);
    return () => window.clearTimeout(timer);
  }, [uploading]);
  const remove = (file: string) => setFiles((current) => current.filter((item) => item !== file));
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "flex",
          flexDirection: variant === "row" ? "column" : "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {files.includes("mockup") && (
          <Attachment variant={variant} mimeType="image/png">
            <AttachmentThumbnail src={thumbnail} />
            <AttachmentDetails>
              <AttachmentName>checkout-redesign.png</AttachmentName>
              <AttachmentMeta>PNG · 1.4 MB</AttachmentMeta>
            </AttachmentDetails>
            <AttachmentRemove onClick={() => remove("mockup")} />
          </Attachment>
        )}
        {files.includes("deck") && (
          <Attachment
            variant={variant}
            mimeType="application/pdf"
            status={uploading ? "uploading" : "ready"}
            progress={progress}
          >
            <AttachmentThumbnail />
            <AttachmentDetails>
              <AttachmentName>Q3 board update.pdf</AttachmentName>
              <AttachmentMeta>
                {uploading ? \`\${progress}% of 8.2 MB\` : "PDF · 8.2 MB"}
              </AttachmentMeta>
              <AttachmentProgress />
            </AttachmentDetails>
            <AttachmentRemove onClick={() => remove("deck")} />
          </Attachment>
        )}
        {files.includes("contract") && (
          <Attachment variant={variant} mimeType="application/pdf" status={contract}>
            <AttachmentThumbnail />
            <AttachmentDetails>
              <AttachmentName>Vendor agreement (signed).pdf</AttachmentName>
              <AttachmentMeta>PDF · 640 KB</AttachmentMeta>
              <AttachmentError>Connection lost at 62%</AttachmentError>
            </AttachmentDetails>
            <AttachmentRetry onClick={() => setContract("ready")} />
            <AttachmentRemove onClick={() => remove("contract")} />
          </Attachment>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setFiles(["mockup", "deck", "contract"]);
          setProgress(18);
          setContract("error");
        }}
        style={{
          justifySelf: "start",
          height: 28,
          padding: "0 12px",
          border: 0,
          borderRadius: 999,
          background: "var(--uai-surface-raised)",
          color: "var(--uai-text)",
          font: "inherit",
          fontSize: 12.5,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Reset attachments
      </button>
    </div>
  );
}
`,
    accessibility: [
      "Each attachment is a group named by its file name; retry and remove buttons are described by the same name.",
      'Upload progress uses role="progressbar" with a percentage value text, and failures are announced with role="alert".',
      "Remove becomes “Cancel upload” while uploading. Thumbnails default to empty alt text because the file name is already announced.",
    ],
  },
  {
    id: "tool-call",
    name: "Tool Call",
    category: "AI",
    icon: Wrench,
    description: "Queued, running, successful, and failed tool activity with input and output.",
    usage: `"use client";

import { useState } from "react";
import {
  ToolCall,
  ToolCallContent,
  ToolCallError,
  ToolCallHeader,
  ToolCallInput,
  ToolCallName,
  ToolCallOutput,
  ToolCallStatus,
  type ToolCallStatus as ToolCallStatusValue,
  ToolCallSummary,
  ToolCallTrigger,
  type ToolCallVariant,
} from "@/components/ui/uai/tool-call";

export function ToolCallPreview({ variant = "card" }: { variant?: ToolCallVariant }) {
  const [status, setStatus] = useState<ToolCallStatusValue>("running");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ToolCall variant={variant} status="success" defaultOpen>
        <ToolCallHeader>
          <ToolCallTrigger>
            <ToolCallName>search_docs</ToolCallName>
            <ToolCallSummary>“refund window for annual plans”</ToolCallSummary>
          </ToolCallTrigger>
          <ToolCallStatus>0.8s</ToolCallStatus>
        </ToolCallHeader>
        <ToolCallContent>
          <ToolCallInput>{\`{ "query": "refund window for annual plans", "limit": 3 }\`}</ToolCallInput>
          <ToolCallOutput>{\`3 results
1. Billing › Refunds — "Annual plans are refundable within 30 days."
2. Billing › Downgrades
3. Legal › Terms of service §7\`}</ToolCallOutput>
        </ToolCallContent>
      </ToolCall>
      <ToolCall variant={variant} status={status}>
        <ToolCallHeader>
          <ToolCallTrigger>
            <ToolCallName>create_refund</ToolCallName>
            <ToolCallSummary>INV-20931 · $1,188.00</ToolCallSummary>
          </ToolCallTrigger>
          <ToolCallStatus />
        </ToolCallHeader>
        <ToolCallContent>
          <ToolCallInput>{\`{ "invoice": "INV-20931", "amount": 118800, "currency": "usd" }\`}</ToolCallInput>
          <ToolCallOutput>
            {status === "success"
              ? \`{ "refund": "re_3PqL", "status": "pending" }\`
              : "Waiting for Stripe…"}
          </ToolCallOutput>
          <ToolCallError>
            Stripe rejected the request: the charge was already refunded.
          </ToolCallError>
        </ToolCallContent>
      </ToolCall>
      <ToolCall variant={variant} status="queued">
        <ToolCallHeader>
          <ToolCallTrigger>
            <ToolCallName>send_email</ToolCallName>
            <ToolCallSummary>Refund confirmation to maya@northwind.co</ToolCallSummary>
          </ToolCallTrigger>
          <ToolCallStatus />
        </ToolCallHeader>
        <ToolCallContent>
          <ToolCallInput>{\`{ "template": "refund_confirmation", "to": "maya@northwind.co" }\`}</ToolCallInput>
        </ToolCallContent>
      </ToolCall>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginTop: 8,
          fontSize: 12,
          color: "var(--uai-muted)",
        }}
      >
        Refund result
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ToolCallStatusValue)}
        >
          <option value="queued">Queued</option>
          <option value="running">Running</option>
          <option value="success">Succeeded</option>
          <option value="error">Failed</option>
        </select>
      </label>
    </div>
  );
}
`,
    accessibility: [
      "The header is a disclosure button with aria-expanded and aria-controls for the input and output panel.",
      "Status text sits outside the button in a polite status region, so changes are announced without renaming the control.",
      "Status is conveyed by text as well as icon and color; the running spinner stops under reduced motion.",
    ],
  },
  {
    id: "response-status",
    name: "Response Status",
    category: "AI",
    icon: Activity,
    description: "Queued, streaming, stopped, complete, and failed responses with stop and retry.",
    usage: `"use client";

import { type CSSProperties, useEffect, useState } from "react";
import {
  ResponseStatus,
  ResponseStatusActions,
  ResponseStatusDetail,
  ResponseStatusIndicator,
  ResponseStatusLabel,
  ResponseStatusRetry,
  ResponseStatusStop,
  type ResponseStatusValue,
  type ResponseStatusVariant,
} from "@/components/ui/uai/response-status";

const demoButton: CSSProperties = {
  height: 28,
  padding: "0 12px",
  border: 0,
  borderRadius: 999,
  background: "var(--uai-surface-raised)",
  color: "var(--uai-text)",
  font: "inherit",
  fontSize: 12.5,
  fontWeight: 500,
  cursor: "pointer",
};

export function ResponseStatusPreview({ variant = "inline" }: { variant?: ResponseStatusVariant }) {
  const [status, setStatus] = useState<ResponseStatusValue>("queued");
  const [tokens, setTokens] = useState(0);
  useEffect(() => {
    if (status === "queued") {
      const timer = window.setTimeout(() => setStatus("streaming"), 1200);
      return () => window.clearTimeout(timer);
    }
    if (status !== "streaming") return;
    if (tokens >= 420) {
      setStatus("complete");
      return;
    }
    const timer = window.setTimeout(() => setTokens((count) => count + 12), 80);
    return () => window.clearTimeout(timer);
  }, [status, tokens]);
  const restart = () => {
    setTokens(0);
    setStatus("queued");
  };
  return (
    <div
      style={{ display: "grid", gap: 20, justifyItems: variant === "bar" ? "stretch" : "start" }}
    >
      <ResponseStatus variant={variant} status={status}>
        <ResponseStatusIndicator />
        <ResponseStatusLabel />
        <ResponseStatusDetail>
          {status === "queued" ? "2nd in queue" : \`\${tokens} tokens\`}
        </ResponseStatusDetail>
        <ResponseStatusActions>
          <ResponseStatusStop onClick={() => setStatus("stopped")} />
          <ResponseStatusRetry onClick={restart} />
        </ResponseStatusActions>
      </ResponseStatus>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={restart} style={demoButton}>
          Restart
        </button>
        <button type="button" onClick={() => setStatus("failed")} style={demoButton}>
          Simulate failure
        </button>
      </div>
    </div>
  );
}
`,
    accessibility: [
      "The label is a polite, atomic live region; the root sets aria-busy while queued or streaming.",
      "Stop appears only while a response is active, and Retry only after it stops or fails. Both are described by the status label.",
      "When the focused action disappears, focus moves to the replacement action or to the status itself.",
      "The streaming dots are decorative and hold still under reduced motion.",
    ],
  },
  {
    id: "run-summary",
    name: "Run Summary",
    category: "AI",
    icon: ClipboardCheck,
    description: "Summarize completed work, changed artifacts, warnings, and next actions.",
    usage: `"use client";

import {
  RunSummary,
  RunSummaryAction,
  RunSummaryActions,
  RunSummaryArtifact,
  RunSummaryArtifactMeta,
  RunSummaryArtifactName,
  RunSummaryArtifacts,
  RunSummaryDescription,
  RunSummaryHeader,
  RunSummaryNextStep,
  RunSummaryNextSteps,
  RunSummaryStat,
  RunSummaryStats,
  RunSummaryTitle,
  type RunSummaryVariant,
  RunSummaryWarning,
  RunSummaryWarnings,
} from "@/components/ui/uai/run-summary";

export function RunSummaryPreview({ variant = "card" }: { variant?: RunSummaryVariant }) {
  return (
    <RunSummary variant={variant} outcome="partial">
      <RunSummaryHeader>
        <RunSummaryTitle>Migrated billing emails to the new template</RunSummaryTitle>
        <RunSummaryDescription>
          Finished in 4m 12s · 18 steps · branch billing/email-templates
        </RunSummaryDescription>
      </RunSummaryHeader>
      <RunSummaryStats>
        <RunSummaryStat label="Files changed">5</RunSummaryStat>
        <RunSummaryStat label="Tests">42 passed</RunSummaryStat>
        <RunSummaryStat label="Warnings">2</RunSummaryStat>
      </RunSummaryStats>
      <RunSummaryArtifacts label="Changed files (5)">
        <RunSummaryArtifact change="added">
          <RunSummaryArtifactName>emails/receipt.tsx</RunSummaryArtifactName>
          <RunSummaryArtifactMeta>+128</RunSummaryArtifactMeta>
        </RunSummaryArtifact>
        <RunSummaryArtifact change="added">
          <RunSummaryArtifactName>emails/refund-issued.tsx</RunSummaryArtifactName>
          <RunSummaryArtifactMeta>+96</RunSummaryArtifactMeta>
        </RunSummaryArtifact>
        <RunSummaryArtifact>
          <RunSummaryArtifactName>lib/billing/notify.ts</RunSummaryArtifactName>
          <RunSummaryArtifactMeta>+31 −44</RunSummaryArtifactMeta>
        </RunSummaryArtifact>
        <RunSummaryArtifact>
          <RunSummaryArtifactName>lib/billing/notify.test.ts</RunSummaryArtifactName>
          <RunSummaryArtifactMeta>+58 −12</RunSummaryArtifactMeta>
        </RunSummaryArtifact>
        <RunSummaryArtifact change="deleted">
          <RunSummaryArtifactName>templates/receipt.html</RunSummaryArtifactName>
          <RunSummaryArtifactMeta>−210</RunSummaryArtifactMeta>
        </RunSummaryArtifact>
      </RunSummaryArtifacts>
      <RunSummaryWarnings>
        <RunSummaryWarning>
          The Spanish receipt still uses the old footer. No translation for “VAT ID” was found.
        </RunSummaryWarning>
        <RunSummaryWarning>Snapshot tests were updated, not reviewed.</RunSummaryWarning>
      </RunSummaryWarnings>
      <RunSummaryNextSteps>
        <RunSummaryNextStep>Review the updated receipt snapshots.</RunSummaryNextStep>
        <RunSummaryNextStep>Add the Spanish “VAT ID” string to the locale file.</RunSummaryNextStep>
      </RunSummaryNextSteps>
      <RunSummaryActions>
        <RunSummaryAction>View diff</RunSummaryAction>
        <RunSummaryAction primary>Open pull request</RunSummaryAction>
      </RunSummaryActions>
    </RunSummary>
  );
}
`,
    accessibility: [
      "The summary is a section labelled by its title; the outcome icon carries a visually hidden outcome label.",
      "Artifacts, warnings, and next steps are lists labelled by their headings. Next steps are ordered.",
      "Each artifact announces its change type (added, modified, or deleted) as text, not only as an icon or strikethrough.",
    ],
  },
];
