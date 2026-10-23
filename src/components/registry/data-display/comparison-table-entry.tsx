import {
  COMPARISON_TABLE_VARIANTS,
  type ComparisonTableVariant,
} from "@/components/ui/uai/comparison-table";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ComparisonTablePreview } from "./comparison-table-preview";

export const entry: PreviewEntry = {
  control: variantControl("comparison table variant", COMPARISON_TABLE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Data display" maxWidth={860}>
      <ComparisonTablePreview variant={selection as ComparisonTableVariant} />
    </SpecimenStage>
  ),
};
