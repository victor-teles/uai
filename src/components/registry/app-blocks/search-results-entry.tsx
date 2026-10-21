import {
  SEARCH_RESULTS_VARIANTS,
  type SearchResultsVariant,
} from "@/components/uai/search-results";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { SearchResultsPreview } from "./search-results-preview";

export const entry: PreviewEntry = {
  control: variantControl("search results layout", SEARCH_RESULTS_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Application surfaces" maxWidth={860}>
      <SearchResultsPreview variant={selection as SearchResultsVariant} />
    </SpecimenStage>
  ),
};
