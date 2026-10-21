import {
  WAITLIST_SECTION_VARIANTS,
  type WaitlistSectionVariant,
} from "@/components/uai/waitlist-section";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { WaitlistSectionPreview } from "./waitlist-section-preview";

export const entry: PreviewEntry = {
  control: variantControl("waitlist section variant", WAITLIST_SECTION_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing sites" maxWidth={840}>
      <WaitlistSectionPreview variant={selection as WaitlistSectionVariant} />
    </SpecimenStage>
  ),
};
