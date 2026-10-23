import {
  Activity,
  CircleHelp,
  ClipboardCheck,
  FileDiff,
  Gauge,
  MessageSquareText,
  Paperclip,
  Quote,
  Wrench,
} from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type AiItemId =
  | "message"
  | "citation"
  | "diff-review"
  | "attachment"
  | "tool-call"
  | "agent-question"
  | "response-status"
  | "run-summary"
  | "context-meter";

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
    id: "diff-review",
    name: "Diff Review",
    category: "AI",
    icon: FileDiff,
    description:
      "Review an agent's edits before they land: a quiet, highlighted diff with per-change accept and reject, live counters, undo, and a multi-file summary.",
    usage: `"use client";

import { useState } from "react";
import {
  DiffReview,
  DiffReviewFile,
  type DiffReviewFileData,
  DiffReviewFileHeader,
  DiffReviewFileList,
  DiffReviewFooter,
  DiffReviewHunks,
  DiffReviewStale,
  type DiffReviewValue,
  type DiffReviewVariant,
} from "@/components/ui/uai/diff-review";

// Parse your agent's edit with whatever you already use (or diffReviewFilesFromPatch).
const files: DiffReviewFileData[] = [
  {
    path: "src/lib/pricing.ts",
    hunks: [
      {
        id: "pricing-1",
        header: "export function totalFor(cart)",
        oldStart: 12,
        newStart: 12,
        lines: [
          { kind: "context", content: "export function totalFor(cart: Cart) {" },
          { kind: "del", content: "  const subtotal = sum(cart.items.map((i) => i.price));" },
          { kind: "add", content: "  const subtotal = sum(cart.items, lineTotal);" },
          { kind: "add", content: "  const discount = applyCoupon(subtotal, cart.coupon);" },
          { kind: "context", content: "  const shipping = shippingFor(cart);" },
        ],
      },
      {
        id: "pricing-2",
        oldStart: 19,
        newStart: 22,
        lines: [
          { kind: "del", content: "  return subtotal + shipping;" },
          { kind: "add", content: "  return Math.max(0, subtotal - discount + shipping);" },
          { kind: "add", content: "}" },
          { kind: "add", content: "" },
          { kind: "add", content: "const lineTotal = (i: Item) => i.price * i.qty;" },
        ],
      },
    ],
  },
  {
    path: "src/app/cart/page.tsx",
    hunks: [
      {
        id: "cart-1",
        header: "export default function CartPage()",
        oldStart: 8,
        newStart: 8,
        lines: [
          { kind: "context", content: "  const cart = useCart();" },
          { kind: "del", content: "  const total = cart.total;" },
          { kind: "add", content: "  const total = totalFor(cart);" },
          {
            kind: "add",
            content: '  const saved = cart.coupon ? formatPrice(total.discount) : "";',
          },
          { kind: "context", content: "  return (" },
        ],
      },
    ],
  },
  {
    path: "src/lib/coupons.ts",
    hunks: [
      {
        id: "coupons-1",
        header: "export function applyCoupon(subtotal, code)",
        oldStart: 4,
        newStart: 4,
        lines: [
          {
            kind: "context",
            content: "export function applyCoupon(subtotal: number, code?: string) {",
          },
          { kind: "del", content: "  if (!code) return subtotal;" },
          { kind: "add", content: "  if (!code) return 0;" },
          { kind: "add", content: "  const rate = rates[code.toUpperCase()] ?? 0;" },
          { kind: "add", content: "  return Math.round(subtotal * rate);" },
        ],
      },
    ],
  },
  {
    path: "tests/pricing.test.ts",
    hunks: [
      {
        id: "tests-1",
        oldStart: 30,
        newStart: 30,
        lines: [
          { kind: "context", content: '  it("adds shipping", () => {' },
          { kind: "add", content: "    expect(totalFor(cartWithCoupon)).toBe(4180);" },
          { kind: "add", content: "    expect(totalFor(emptyCart)).toBe(0);" },
          { kind: "context", content: "  });" },
        ],
      },
    ],
  },
];

export function DiffReviewPreview({ variant = "unified" }: { variant?: DiffReviewVariant }) {
  const [value, setValue] = useState<DiffReviewValue>({ "tests-1": "rejected" });
  const [applied, setApplied] = useState(false);

  return (
    <DiffReview
      variant={variant}
      files={files}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        setApplied(false);
      }}
      stale={["src/lib/coupons.ts"]}
      applied={applied}
      onApply={() => setApplied(true)}
    >
      {variant === "compact" ? (
        <DiffReviewFileList />
      ) : (
        files.map((file) => (
          <DiffReviewFile
            key={file.path}
            path={file.path}
            defaultOpen={file.path !== "tests/pricing.test.ts"}
          >
            <DiffReviewFileHeader />
            <DiffReviewStale />
            <DiffReviewHunks />
          </DiffReviewFile>
        ))
      )}
      <DiffReviewFooter />
    </DiffReview>
  );
}
`,
    accessibility: [
      "Each file is a section named by its path, and each change is a section named by its range and counts, such as “Lines 19–25: 4 added, 1 removed”.",
      "Every changed line reaches screen readers with an “added” or “removed” prefix; the highlighted drawing is hidden from them, so color and the +/− signs are never the only signal.",
      "Accept and reject are real buttons named after the range. They stay in the tab order while visually hidden and appear on hover, focus, or touch.",
      "With focus in a change, y accepts, n rejects, and ] or [ move between changes (exposed with aria-keyshortcuts). The keys do nothing inside text fields.",
      "Deciding a change moves focus to its Undo, and Undo returns focus to Accept. A polite status announces each decision and how many remain.",
      "A file that changed after the edit shows a warning and keeps Accept off for its changes. Under reduced motion there is no wash and no collapse animation.",
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
    id: "agent-question",
    name: "Agent Question",
    category: "AI",
    icon: CircleHelp,
    description:
      "Let an agent ask for a decision: single or multiple choice, a recommended option, Something else, number keys, and a record of the answers.",
    usage: `"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AgentQuestion,
  type AgentQuestionAnswers,
  AgentQuestionDescription,
  AgentQuestionFooter,
  AgentQuestionHeader,
  AgentQuestionItem,
  AgentQuestionItems,
  AgentQuestionOption,
  AgentQuestionOptions,
  AgentQuestionOther,
  AgentQuestionSummary,
  AgentQuestionTitle,
  type AgentQuestionVariant,
} from "@/components/ui/uai/agent-question";

export function AgentQuestionPreview({ variant = "card" }: { variant?: AgentQuestionVariant }) {
  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Your agent receives the answers; the preview just waits a moment.
  const send = (_answers: AgentQuestionAnswers) =>
    new Promise<void>((resolve) => {
      timer.current = window.setTimeout(() => {
        setAnswered(true);
        resolve();
      }, 900);
    });

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <p className="m-0 text-[13px]/5 text-muted-foreground">
        Before I scaffold Kiln’s storefront I need three decisions.
      </p>
      <AgentQuestion key={\`\${variant}-\${round}\`} variant={variant} onSubmit={send}>
        <AgentQuestionHeader />
        <AgentQuestionItems>
          <AgentQuestionItem id="database" required>
            <AgentQuestionTitle>Which database should I set up?</AgentQuestionTitle>
            <AgentQuestionDescription>
              I found a Prisma schema and a Drizzle config. Migrations will use the one you pick.
            </AgentQuestionDescription>
            <AgentQuestionOptions>
              <AgentQuestionOption
                value="postgres"
                label="Postgres"
                recommended
                description="Matches DATABASE_URL in .env.example"
              />
              <AgentQuestionOption
                value="sqlite"
                label="SQLite"
                description="Fastest for local work, no server to run"
              />
              <AgentQuestionOther />
            </AgentQuestionOptions>
          </AgentQuestionItem>
          <AgentQuestionItem id="seed" type="multiple" required>
            <AgentQuestionTitle>What should the seed data include?</AgentQuestionTitle>
            <AgentQuestionDescription>Choose all that apply.</AgentQuestionDescription>
            <AgentQuestionOptions>
              <AgentQuestionOption
                value="users"
                label="Demo users"
                description="3 accounts with fixed passwords"
              />
              <AgentQuestionOption
                value="orders"
                label="Sample orders"
                description="40 orders across 2 months"
              />
              <AgentQuestionOther />
            </AgentQuestionOptions>
          </AgentQuestionItem>
          <AgentQuestionItem id="auth">
            <AgentQuestionTitle>Add auth now?</AgentQuestionTitle>
            <AgentQuestionDescription>
              You can add it later with one command.
            </AgentQuestionDescription>
            <AgentQuestionOptions>
              <AgentQuestionOption value="password" label="Email and password" />
              <AgentQuestionOption value="magic-link" label="Magic link" />
              <AgentQuestionOption value="later" label="Not yet" />
            </AgentQuestionOptions>
          </AgentQuestionItem>
        </AgentQuestionItems>
        <AgentQuestionFooter />
        <AgentQuestionSummary time="14:02" />
      </AgentQuestion>
      {answered ? (
        <>
          <p className="m-0 text-[13px]/5 text-foreground">
            Setting up the database and seeding the storefront.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAnswered(false);
              setRound((count) => count + 1);
            }}
          >
            <RotateCcw aria-hidden="true" />
            Ask again
          </Button>
        </>
      ) : null}
    </div>
  );
}
`,
    accessibility: [
      "Each question is a fieldset whose legend is the title. Single choice is a radio group with arrow keys; multiple choice is a labelled group of checkboxes.",
      "Keys 1–9 pick the option at that position while focus is inside the question, except while typing in Something else; Enter continues. The groups expose aria-keyshortcuts and the visible key hints are hidden from assistive technology.",
      "Focus moves to the new question's legend on each step and to the summary heading once answered, which is announced as “Answers sent”.",
      "“Recommended” is part of the option's accessible name, and option descriptions are attached with aria-describedby.",
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
  {
    id: "context-meter",
    name: "Context Meter",
    category: "AI",
    icon: Gauge,
    description:
      "How full the context window is: a composer ring, a stacked breakdown, threshold warnings, and compaction that shows what it freed.",
    usage: `"use client";

import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ContextMeter,
  ContextMeterActions,
  ContextMeterBar,
  ContextMeterCompactAction,
  ContextMeterCompacting,
  ContextMeterContent,
  ContextMeterFreed,
  ContextMeterHeader,
  ContextMeterHint,
  ContextMeterLegend,
  ContextMeterStatus,
  type ContextMeterStatus as ContextMeterStatusValue,
  ContextMeterSummary,
  ContextMeterTitle,
  ContextMeterTrigger,
  ContextMeterUndoAction,
  type ContextMeterVariant,
} from "@/components/ui/uai/context-meter";
import {
  PromptComposer,
  PromptComposerActions,
  PromptComposerInput,
  PromptComposerModelSelect,
  PromptComposerSubmit,
} from "@/components/ui/uai/prompt-composer";

type Scenario = "normal" | "warning" | "full" | "empty";

const conversation: Record<Scenario, number> = {
  normal: 44_700,
  warning: 113_600,
  full: 138_000,
  empty: 0,
};

function segmentsFor(scenario: Scenario, conversationTokens: number) {
  if (scenario === "empty") return [];
  const files = scenario === "normal" ? 18_700 : 41_600;
  return [
    { id: "system", label: "System prompt", tokens: 3_200 },
    { id: "tools", label: "Tools", tokens: 9_800 },
    { id: "files", label: "Files", tokens: files },
    { id: "conversation", label: "Conversation", tokens: conversationTokens },
  ];
}

const models = [
  { id: "your-model", label: "Your model" },
  { id: "fast", label: "Fast" },
] as const;

export function ContextMeterPreview({ variant = "bar" }: { variant?: ContextMeterVariant }) {
  const [scenario, setScenario] = useState<Scenario>("warning");
  const [status, setStatus] = useState<ContextMeterStatusValue>("idle");
  const freed = 61_800;
  const conversationTokens = conversation[scenario] - (status === "compacted" ? freed : 0);
  const segments = segmentsFor(scenario, conversationTokens);
  const used = segments.reduce((sum, segment) => sum + segment.tokens, 0);

  // Your agent summarizes; the meter only shows it happening.
  useEffect(() => {
    if (status !== "compacting") return;
    const timer = window.setTimeout(() => setStatus("compacted"), 1600);
    return () => window.clearTimeout(timer);
  }, [status]);

  const meter = (
    <ContextMeter
      variant={variant}
      used={used}
      limit={200_000}
      segments={segments}
      autoCompactAt={0.9}
      status={status}
      freed={freed}
      onCompact={
        scenario === "normal" || scenario === "empty" ? undefined : () => setStatus("compacting")
      }
      onUndoCompact={() => setStatus("idle")}
    >
      <ContextMeterTrigger />
      <ContextMeterContent>
        <ContextMeterHeader>
          <ContextMeterTitle />
          <ContextMeterStatus />
        </ContextMeterHeader>
        <ContextMeterSummary />
        <ContextMeterBar />
        <ContextMeterLegend />
        <ContextMeterActions>
          <ContextMeterHint />
          <ContextMeterCompacting>Summarizing 38 earlier turns…</ContextMeterCompacting>
          <ContextMeterFreed>38 turns → 1 summary</ContextMeterFreed>
          <ContextMeterCompactAction />
          <ContextMeterUndoAction />
        </ContextMeterActions>
      </ContextMeterContent>
    </ContextMeter>
  );

  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
      <ToggleGroup
        type="single"
        aria-label="Context state"
        value={scenario}
        onValueChange={(next) => {
          if (!next) return;
          setScenario(next as Scenario);
          setStatus("idle");
        }}
        className="flex-wrap justify-self-center"
      >
        <ToggleGroupItem value="normal">38%</ToggleGroupItem>
        <ToggleGroupItem value="warning">84%</ToggleGroupItem>
        <ToggleGroupItem value="full">96%</ToggleGroupItem>
        <ToggleGroupItem value="empty">Empty</ToggleGroupItem>
      </ToggleGroup>
      {variant === "bar" ? (
        <div style={{ width: "100%", maxWidth: 340 }}>{meter}</div>
      ) : (
        <div style={{ width: "100%", minHeight: 400, display: "grid", alignContent: "end" }}>
          <PromptComposer variant={variant === "compact" ? "compact" : "rounded"}>
            <PromptComposerInput
              placeholder="Ask about the Kiln 4.2 build cache…"
              aria-label="Message"
            />
            <PromptComposerActions>
              {meter}
              <PromptComposerModelSelect models={models} />
              <PromptComposerSubmit />
            </PromptComposerActions>
          </PromptComposer>
        </div>
      )}
    </div>
  );
}
`,
    accessibility: [
      "Every variant exposes one meter with full numbers in its value text, such as “76,400 of 200,000 tokens, 38 percent”. The trigger is a button named “Context: 38% used”.",
      "Crossing a threshold, compacting, and finishing compaction are announced once through a visually hidden status, never on the way down.",
      "State is never color alone: warning and full also show a badge, and the legend gives every segment as text.",
      "Under reduced motion the ring, segments, and freed region change instantly, with no shimmer or pulse.",
    ],
  },
];
