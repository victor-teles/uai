import {
  FEATURE_SHOWCASE_VARIANTS,
  type FeatureShowcaseVariant,
} from "@/components/uai/feature-showcase";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { FeatureShowcasePreview } from "./feature-showcase-preview";

export const entry: PreviewEntry = {
  control: variantControl("feature showcase variant", FEATURE_SHOWCASE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing sites" maxWidth={960}>
      <FeatureShowcasePreview variant={selection as FeatureShowcaseVariant} />
    </SpecimenStage>
  ),
};
