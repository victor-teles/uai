import { FILE_UPLOAD_VARIANTS, type FileUploadVariant } from "@/components/ui/uai/file-upload";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { FileUploadPreview } from "./file-upload-preview";

export const entry: PreviewEntry = {
  control: variantControl("file upload variant", FILE_UPLOAD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Forms and usability" maxWidth={440}>
      <FileUploadPreview variant={selection as FileUploadVariant} />
    </SpecimenStage>
  ),
};
