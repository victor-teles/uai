import { FILTER_BAR_VARIANTS, type FilterBarVariant } from "@/components/ui/uai/filter-bar";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { FilterBarPreview } from "./filter-bar-preview";

export const entry: PreviewEntry = {
  control: variantControl("filter bar variant", FILTER_BAR_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Forms and usability" maxWidth={660}>
      <FilterBarPreview variant={selection as FilterBarVariant} />
    </SpecimenStage>
  ),
};
