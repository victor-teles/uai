import {
  DOCUMENT_FIELD_VARIANTS,
  type DocumentFieldVariant,
} from "@/components/ui/uai/document-field";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { DocumentFieldPreview } from "./document-field-preview";

export const entry: PreviewEntry = {
  control: variantControl("document field variant", DOCUMENT_FIELD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Brazil" maxWidth={400}>
      <DocumentFieldPreview variant={selection as DocumentFieldVariant} />
    </SpecimenStage>
  ),
};
