import {
  COMMUNITY_FEED_VARIANTS,
  type CommunityFeedVariant,
} from "@/components/uai/community-feed";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { CommunityFeedPreview } from "./community-feed-preview";

export const entry: PreviewEntry = {
  control: variantControl("community feed layout", COMMUNITY_FEED_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Content and community" maxWidth={780}>
      <CommunityFeedPreview variant={selection as CommunityFeedVariant} />
    </SpecimenStage>
  ),
};
