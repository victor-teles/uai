import { AgentRunPreview } from "@/components/registry/ai-blocks/agent-run-preview";
import { ConversationThreadPreview } from "@/components/registry/ai-blocks/conversation-thread-preview";
import { FileAnalysisPreview } from "@/components/registry/ai-blocks/file-analysis-preview";
import { ResearchSessionPreview } from "@/components/registry/ai-blocks/research-session-preview";

export function AiBlocksCompositionFixture() {
  return (
    <>
      <ConversationThreadPreview />
      <ResearchSessionPreview />
      <FileAnalysisPreview />
      <AgentRunPreview />
    </>
  );
}
