import { AGENT_RUN_VARIANTS, type AgentRunVariant } from "@/components/uai/agent-run";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { AgentRunPreview } from "./agent-run-preview";

export const entry: PreviewEntry = {
  control: variantControl("agent run layout", AGENT_RUN_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI" maxWidth={960}>
      <AgentRunPreview key={selection} variant={selection as AgentRunVariant} />
    </SpecimenStage>
  ),
};
