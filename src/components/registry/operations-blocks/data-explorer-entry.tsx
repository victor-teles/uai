import { DATA_EXPLORER_VARIANTS, type DataExplorerVariant } from "@/components/uai/data-explorer";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { DataExplorerPreview } from "./data-explorer-preview";

export const entry: PreviewEntry = {
  control: variantControl("data explorer layout", DATA_EXPLORER_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Operations" maxWidth={960}>
      <DataExplorerPreview variant={selection as DataExplorerVariant} />
    </SpecimenStage>
  ),
};
