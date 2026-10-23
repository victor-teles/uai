import { PROFILE_PAGE_VARIANTS, type ProfilePageVariant } from "@/components/uai/profile-page";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ProfilePagePreview } from "./profile-page-preview";

export const entry: PreviewEntry = {
  control: variantControl("profile page layout", PROFILE_PAGE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Application surfaces" maxWidth={880}>
      <ProfilePagePreview variant={selection as ProfilePageVariant} />
    </SpecimenStage>
  ),
};
