import {
  CONFIRMATION_DIALOG_VARIANTS,
  type ConfirmationDialogVariant,
} from "@/components/ui/uai/confirmation-dialog";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ConfirmationDialogPreview } from "./confirmation-dialog-preview";

export const entry: PreviewEntry = {
  control: variantControl("confirmation dialog variant", CONFIRMATION_DIALOG_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Feedback and state" maxWidth={460}>
      <ConfirmationDialogPreview variant={selection as ConfirmationDialogVariant} />
    </SpecimenStage>
  ),
};
