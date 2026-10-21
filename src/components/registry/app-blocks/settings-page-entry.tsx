import { SETTINGS_PAGE_VARIANTS, type SettingsPageVariant } from "@/components/uai/settings-page";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { SettingsPagePreview } from "./settings-page-preview";

export const entry: PreviewEntry = {
  control: variantControl("settings page layout", SETTINGS_PAGE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Application surfaces" maxWidth={760}>
      <SettingsPagePreview variant={selection as SettingsPageVariant} />
    </SpecimenStage>
  ),
};
