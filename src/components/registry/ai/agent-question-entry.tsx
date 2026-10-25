import {
  AGENT_QUESTION_VARIANTS,
  type AgentQuestionVariant,
} from "@/components/ui/uai/agent-question";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { AgentQuestionPreview } from "./agent-question-preview";

const STACKED = {
  stacked: { variant: "card", suggested: false },
  "stacked-compact": { variant: "compact", suggested: false },
  "stacked-suggested": { variant: "card", suggested: true },
} as const satisfies Record<string, { variant: AgentQuestionVariant; suggested: boolean }>;

export const entry: PreviewEntry = {
  control: variantControl("agent question variant", AGENT_QUESTION_VARIANTS, [
    { id: "stacked", label: "Stacked" },
    { id: "stacked-compact", label: "Stacked compact" },
    { id: "stacked-suggested", label: "Suggested" },
  ]),
  render: (selection) => {
    const stacked = STACKED[selection as keyof typeof STACKED];
    return (
      <SpecimenStage label="AI and automation" maxWidth={540}>
        {stacked ? (
          <AgentQuestionPreview
            layout="stacked"
            variant={stacked.variant}
            suggested={stacked.suggested}
          />
        ) : (
          <AgentQuestionPreview variant={selection as AgentQuestionVariant} />
        )}
      </SpecimenStage>
    );
  },
};
