import {
  PROGRESS_SUMMARY_VARIANTS,
  type ProgressSummaryVariant,
} from "@/components/ui/uai/progress-summary";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ProgressSummaryPreview } from "./progress-summary-preview";

export const entry: PreviewEntry = {
  control: variantControl("progress summary variant", PROGRESS_SUMMARY_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Feedback and state" maxWidth={560}>
      <ProgressSummaryPreview variant={selection as ProgressSummaryVariant} />
    </SpecimenStage>
  ),
};
