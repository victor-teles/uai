import { AgentQuestionPreview } from "@/components/registry/ai/agent-question-preview";
import { AttachmentPreview } from "@/components/registry/ai/attachment-preview";
import { CitationPreview } from "@/components/registry/ai/citation-preview";
import { ContextMeterPreview } from "@/components/registry/ai/context-meter-preview";
import { MessagePreview } from "@/components/registry/ai/message-preview";
import { ResponseStatusPreview } from "@/components/registry/ai/response-status-preview";
import { RunSummaryPreview } from "@/components/registry/ai/run-summary-preview";
import { ToolCallPreview } from "@/components/registry/ai/tool-call-preview";
import { VoiceInputPreview } from "@/components/registry/ai/voice-input-preview";

export function AiCompositionFixture() {
  return (
    <>
      <MessagePreview />
      <VoiceInputPreview />
      <CitationPreview />
      <AttachmentPreview />
      <ToolCallPreview />
      <AgentQuestionPreview />
      <ResponseStatusPreview />
      <RunSummaryPreview />
      <ContextMeterPreview />
    </>
  );
}
