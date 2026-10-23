import {
  REPORT_BUILDER_VARIANTS,
  type ReportBuilderVariant,
} from "@/components/uai/report-builder";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ReportBuilderPreview } from "./report-builder-preview";

export const entry: PreviewEntry = {
  control: variantControl("report builder layout", REPORT_BUILDER_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Operations" maxWidth={960}>
      <ReportBuilderPreview variant={selection as ReportBuilderVariant} />
    </SpecimenStage>
  ),
};
