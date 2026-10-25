import {
  RESEARCH_SESSION_VARIANTS,
  type ResearchSessionVariant,
} from "@/components/uai/research-session";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ResearchSessionPreview } from "./research-session-preview";

export const entry: PreviewEntry = {
  control: variantControl("research session layout", RESEARCH_SESSION_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI" maxWidth={960}>
      <ResearchSessionPreview key={selection} variant={selection as ResearchSessionVariant} />
    </SpecimenStage>
  ),
};
