"use client";

import { FileText, Globe } from "lucide-react";
import {
  PromptComposer,
  PromptComposerActions,
  PromptComposerAdd,
  PromptComposerAddItem,
  PromptComposerFileItem,
  PromptComposerInput,
  PromptComposerModelSelect,
  PromptComposerSubmit,
  type PromptComposerVariant,
} from "@/components/ui/uai/prompt-composer";

const composerModels = [
  { id: "your-model", label: "Your model" },
  { id: "fast", label: "Fast" },
  { id: "precise", label: "Precise" },
] as const;

export function PromptComposerPreview({
  variant = "rounded",
}: {
  variant?: PromptComposerVariant;
}) {
  return (
    <PromptComposer variant={variant}>
      <PromptComposerAdd>
        <PromptComposerFileItem />
        <PromptComposerAddItem
          icon={<FileText className="size-4" strokeWidth={1.8} aria-hidden="true" />}
          description="Attach saved context"
        >
          Workspace notes
        </PromptComposerAddItem>
        <PromptComposerAddItem
          icon={<Globe className="size-4" strokeWidth={1.8} aria-hidden="true" />}
          description="Live results"
        >
          Web search
        </PromptComposerAddItem>
        <div className="mt-1 border-t border-[var(--uai-border)] px-2 pt-[7px] pb-[5px] text-[11px] text-[var(--uai-muted)]">
          Attach files or mention a source
        </div>
      </PromptComposerAdd>
      <PromptComposerInput placeholder="Write a message…" />
      <PromptComposerActions>
        <PromptComposerModelSelect models={composerModels} />
        <PromptComposerSubmit />
      </PromptComposerActions>
    </PromptComposer>
  );
}
