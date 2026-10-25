import {
  PUBLIC_PROFILE_VARIANTS,
  type PublicProfileVariant,
} from "@/components/uai/public-profile";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { PublicProfilePreview } from "./public-profile-preview";

export const entry: PreviewEntry = {
  control: variantControl("public profile layout", PUBLIC_PROFILE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Content and community" maxWidth={880}>
      <PublicProfilePreview variant={selection as PublicProfileVariant} />
    </SpecimenStage>
  ),
};
