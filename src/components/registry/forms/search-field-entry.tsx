import { SEARCH_FIELD_VARIANTS, type SearchFieldVariant } from "@/components/ui/uai/search-field";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { SearchFieldPreview } from "./search-field-preview";

export const entry: PreviewEntry = {
  control: variantControl("search field variant", SEARCH_FIELD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Forms and usability" maxWidth={440}>
      <SearchFieldPreview variant={selection as SearchFieldVariant} />
    </SpecimenStage>
  ),
};
