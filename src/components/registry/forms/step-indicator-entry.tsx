import {
  STEP_INDICATOR_VARIANTS,
  type StepIndicatorVariant,
} from "@/components/ui/uai/step-indicator";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { StepIndicatorPreview } from "./step-indicator-preview";

export const entry: PreviewEntry = {
  control: variantControl("step indicator variant", STEP_INDICATOR_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Forms and usability" maxWidth={660}>
      <StepIndicatorPreview variant={selection as StepIndicatorVariant} />
    </SpecimenStage>
  ),
};
