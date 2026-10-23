import {
  UNSAVED_CHANGES_BAR_VARIANTS,
  type UnsavedChangesBarVariant,
} from "@/components/ui/uai/unsaved-changes-bar";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { UnsavedChangesBarPreview } from "./unsaved-changes-bar-preview";

export const entry: PreviewEntry = {
  control: variantControl("unsaved changes bar variant", UNSAVED_CHANGES_BAR_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Forms and usability" maxWidth={440}>
      <UnsavedChangesBarPreview variant={selection as UnsavedChangesBarVariant} />
    </SpecimenStage>
  ),
};
