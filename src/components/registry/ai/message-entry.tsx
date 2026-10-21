import { MESSAGE_VARIANTS, type MessageVariant } from "@/components/ui/uai/message";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { MessagePreview } from "./message-preview";

export const entry: PreviewEntry = {
  control: variantControl("message variant", MESSAGE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI and automation" maxWidth={540}>
      <MessagePreview variant={selection as MessageVariant} />
    </SpecimenStage>
  ),
};
