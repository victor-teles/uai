"use client";

import { ATTACHMENT_VARIANTS, type AttachmentVariant } from "@/components/ui/uai/attachment";
import { CITATION_VARIANTS, type CitationVariant } from "@/components/ui/uai/citation";
import { MESSAGE_VARIANTS, type MessageVariant } from "@/components/ui/uai/message";
import {
  RESPONSE_STATUS_VARIANTS,
  type ResponseStatusVariant,
} from "@/components/ui/uai/response-status";
import { RUN_SUMMARY_VARIANTS, type RunSummaryVariant } from "@/components/ui/uai/run-summary";
import { TOOL_CALL_VARIANTS, type ToolCallVariant } from "@/components/ui/uai/tool-call";
import type { PreviewControl } from "../preview-chrome";
import { PreviewStage } from "../preview-chrome";
import { AttachmentPreview } from "./attachment-preview";
import { CitationPreview } from "./citation-preview";
import { MessagePreview } from "./message-preview";
import { ResponseStatusPreview } from "./response-status-preview";
import { RunSummaryPreview } from "./run-summary-preview";
import { ToolCallPreview } from "./tool-call-preview";

const controls: Record<string, { label: string; variants: readonly string[] }> = {
  message: { label: "message variant", variants: MESSAGE_VARIANTS },
  citation: { label: "citation variant", variants: CITATION_VARIANTS },
  attachment: { label: "attachment variant", variants: ATTACHMENT_VARIANTS },
  "tool-call": { label: "tool call variant", variants: TOOL_CALL_VARIANTS },
  "response-status": { label: "response status variant", variants: RESPONSE_STATUS_VARIANTS },
  "run-summary": { label: "run summary variant", variants: RUN_SUMMARY_VARIANTS },
};

export function getAiPreviewControl(itemId: string): PreviewControl | undefined {
  const control = controls[itemId];
  if (!control) return undefined;
  return {
    ariaLabel: control.label,
    defaultValue: control.variants[0] ?? "",
    options: control.variants.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  };
}

export function AiPreview({ itemId, selection }: { itemId: string; selection: string }) {
  if (!controls[itemId]) return null;
  return (
    <PreviewStage label="AI and automation">
      <div
        style={{
          width: "100%",
          maxWidth: itemId === "attachment" && selection !== "row" ? 600 : 540,
          minWidth: 0,
          padding: "24px 0",
          minHeight: itemId === "citation" ? 240 : undefined,
        }}
      >
        {itemId === "message" && <MessagePreview variant={selection as MessageVariant} />}
        {itemId === "citation" && <CitationPreview variant={selection as CitationVariant} />}
        {itemId === "attachment" && <AttachmentPreview variant={selection as AttachmentVariant} />}
        {itemId === "tool-call" && <ToolCallPreview variant={selection as ToolCallVariant} />}
        {itemId === "response-status" && (
          <ResponseStatusPreview variant={selection as ResponseStatusVariant} />
        )}
        {itemId === "run-summary" && <RunSummaryPreview variant={selection as RunSummaryVariant} />}
      </div>
    </PreviewStage>
  );
}
