import {
  INLINE_FEEDBACK_VARIANTS,
  type InlineFeedbackVariant,
} from "@/components/ui/uai/inline-feedback";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { InlineFeedbackPreview } from "./inline-feedback-preview";

export const entry: PreviewEntry = {
  control: variantControl("inline feedback variant", INLINE_FEEDBACK_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Feedback and state" maxWidth={460}>
      <InlineFeedbackPreview variant={selection as InlineFeedbackVariant} />
    </SpecimenStage>
  ),
};
