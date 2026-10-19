import { AttachmentPreview } from "@/components/registry/ai/attachment-preview";
import { CitationPreview } from "@/components/registry/ai/citation-preview";
import { DiffReviewPreview } from "@/components/registry/ai/diff-review-preview";
import { MessagePreview } from "@/components/registry/ai/message-preview";
import { ResponseStatusPreview } from "@/components/registry/ai/response-status-preview";
import { RunSummaryPreview } from "@/components/registry/ai/run-summary-preview";
import { ToolCallPreview } from "@/components/registry/ai/tool-call-preview";

export function AiCompositionFixture() {
  return (
    <>
      <MessagePreview />
      <CitationPreview />
      <DiffReviewPreview />
      <AttachmentPreview />
      <ToolCallPreview />
      <ResponseStatusPreview />
      <RunSummaryPreview />
    </>
  );
}
