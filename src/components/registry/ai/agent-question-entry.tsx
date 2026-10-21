import {
  AGENT_QUESTION_VARIANTS,
  type AgentQuestionVariant,
} from "@/components/ui/uai/agent-question";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { AgentQuestionPreview } from "./agent-question-preview";

export const entry: PreviewEntry = {
  control: variantControl("agent question variant", AGENT_QUESTION_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI and automation" maxWidth={540}>
      <AgentQuestionPreview variant={selection as AgentQuestionVariant} />
    </SpecimenStage>
  ),
};
