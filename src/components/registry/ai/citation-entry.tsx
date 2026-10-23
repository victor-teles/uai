import { CITATION_VARIANTS, type CitationVariant } from "@/components/ui/uai/citation";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { CitationPreview } from "./citation-preview";

export const entry: PreviewEntry = {
  control: variantControl("citation variant", CITATION_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI and automation" maxWidth={540} minHeight={240}>
      <CitationPreview variant={selection as CitationVariant} />
    </SpecimenStage>
  ),
};
