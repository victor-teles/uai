import {
  SKELETON_GROUP_VARIANTS,
  type SkeletonGroupVariant,
} from "@/components/ui/uai/skeleton-group";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { SkeletonGroupPreview } from "./skeleton-group-preview";

export const entry: PreviewEntry = {
  control: variantControl("skeleton group variant", SKELETON_GROUP_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Feedback and state" maxWidth={460}>
      <SkeletonGroupPreview variant={selection as SkeletonGroupVariant} />
    </SpecimenStage>
  ),
};
