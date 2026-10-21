import {
  DOCUMENTATION_PAGE_VARIANTS,
  type DocumentationPageVariant,
} from "@/components/uai/documentation-page";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { DocumentationPagePreview } from "./documentation-page-preview";

export const entry: PreviewEntry = {
  control: variantControl("documentation page layout", DOCUMENTATION_PAGE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Content and community" maxWidth={960}>
      <DocumentationPagePreview variant={selection as DocumentationPageVariant} />
    </SpecimenStage>
  ),
};
