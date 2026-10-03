"use client";

import { AGENT_RUN_VARIANTS, type AgentRunVariant } from "@/components/uai/agent-run";
import {
  CONVERSATION_THREAD_VARIANTS,
  type ConversationThreadVariant,
} from "@/components/uai/conversation-thread";
import { FILE_ANALYSIS_VARIANTS, type FileAnalysisVariant } from "@/components/uai/file-analysis";
import {
  RESEARCH_SESSION_VARIANTS,
  type ResearchSessionVariant,
} from "@/components/uai/research-session";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { AgentRunPreview } from "./agent-run-preview";
import type { AiBlocksItemId } from "./catalog";
import { ConversationThreadPreview } from "./conversation-thread-preview";
import { FileAnalysisPreview } from "./file-analysis-preview";
import { ResearchSessionPreview } from "./research-session-preview";

const controls: Record<AiBlocksItemId, { variants: readonly string[]; label: string }> = {
  "conversation-thread": { variants: CONVERSATION_THREAD_VARIANTS, label: "conversation thread" },
  "research-session": { variants: RESEARCH_SESSION_VARIANTS, label: "research session" },
  "file-analysis": { variants: FILE_ANALYSIS_VARIANTS, label: "file analysis" },
  "agent-run": { variants: AGENT_RUN_VARIANTS, label: "agent run" },
};

export function getAiBlocksPreviewControl(itemId: string): PreviewControl | undefined {
  const control = controls[itemId as AiBlocksItemId];
  if (!control) return undefined;
  return {
    ariaLabel: `${control.label} layout`,
    defaultValue: control.variants[0] ?? "",
    options: control.variants.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  };
}

export function AiBlocksPreview({ itemId, selection }: { itemId: string; selection: string }) {
  return (
    <PreviewStage label="AI">
      <div style={{ width: "100%", maxWidth: 960, minWidth: 0, padding: "24px 0" }}>
        {itemId === "conversation-thread" && (
          <ConversationThreadPreview
            key={selection}
            variant={selection as ConversationThreadVariant}
          />
        )}
        {itemId === "research-session" && (
          <ResearchSessionPreview key={selection} variant={selection as ResearchSessionVariant} />
        )}
        {itemId === "file-analysis" && (
          <FileAnalysisPreview key={selection} variant={selection as FileAnalysisVariant} />
        )}
        {itemId === "agent-run" && (
          <AgentRunPreview key={selection} variant={selection as AgentRunVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
