import { SHARE_MENU_VARIANTS, type ShareMenuVariant } from "@/components/ui/uai/share-menu";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ShareMenuPreview } from "./share-menu-preview";

export const entry: PreviewEntry = {
  control: variantControl("share menu variant", SHARE_MENU_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Content and community" maxWidth={420} minHeight={220}>
      <ShareMenuPreview variant={selection as ShareMenuVariant} />
    </SpecimenStage>
  ),
};
