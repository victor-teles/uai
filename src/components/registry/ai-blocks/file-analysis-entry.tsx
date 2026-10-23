import { FILE_ANALYSIS_VARIANTS, type FileAnalysisVariant } from "@/components/uai/file-analysis";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { FileAnalysisPreview } from "./file-analysis-preview";

export const entry: PreviewEntry = {
  control: variantControl("file analysis layout", FILE_ANALYSIS_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI" maxWidth={960}>
      <FileAnalysisPreview key={selection} variant={selection as FileAnalysisVariant} />
    </SpecimenStage>
  ),
};
