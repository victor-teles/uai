import {
  ANNOUNCEMENT_BAR_VARIANTS,
  type AnnouncementBarVariant,
} from "@/components/ui/uai/announcement-bar";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { AnnouncementBarPreview } from "./announcement-bar-preview";

export const entry: PreviewEntry = {
  control: variantControl("announcement bar variant", ANNOUNCEMENT_BAR_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing and conversion" maxWidth={640}>
      <AnnouncementBarPreview variant={selection as AnnouncementBarVariant} />
    </SpecimenStage>
  ),
};
