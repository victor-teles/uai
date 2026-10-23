import { ATTACHMENT_VARIANTS, type AttachmentVariant } from "@/components/ui/uai/attachment";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { AttachmentPreview } from "./attachment-preview";

export const entry: PreviewEntry = {
  control: variantControl("attachment variant", ATTACHMENT_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI and automation" maxWidth={selection !== "row" ? 600 : 540}>
      <AttachmentPreview variant={selection as AttachmentVariant} />
    </SpecimenStage>
  ),
};
