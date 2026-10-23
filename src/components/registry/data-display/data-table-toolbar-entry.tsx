import {
  DATA_TABLE_TOOLBAR_VARIANTS,
  type DataTableToolbarVariant,
} from "@/components/ui/uai/data-table-toolbar";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { DataTableToolbarPreview } from "./data-table-toolbar-preview";

export const entry: PreviewEntry = {
  control: variantControl("data table toolbar variant", DATA_TABLE_TOOLBAR_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Data display" maxWidth={860}>
      <DataTableToolbarPreview variant={selection as DataTableToolbarVariant} />
    </SpecimenStage>
  ),
};
