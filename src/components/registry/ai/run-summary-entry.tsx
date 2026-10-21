import { RUN_SUMMARY_VARIANTS, type RunSummaryVariant } from "@/components/ui/uai/run-summary";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { RunSummaryPreview } from "./run-summary-preview";

export const entry: PreviewEntry = {
  control: variantControl("run summary variant", RUN_SUMMARY_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI and automation" maxWidth={540}>
      <RunSummaryPreview variant={selection as RunSummaryVariant} />
    </SpecimenStage>
  ),
};
