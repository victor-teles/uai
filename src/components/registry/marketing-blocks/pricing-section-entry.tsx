import {
  PRICING_SECTION_VARIANTS,
  type PricingSectionVariant,
} from "@/components/uai/pricing-section";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { PricingSectionPreview } from "./pricing-section-preview";

export const entry: PreviewEntry = {
  control: variantControl("pricing section variant", PRICING_SECTION_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing sites" maxWidth={960}>
      <PricingSectionPreview variant={selection as PricingSectionVariant} />
    </SpecimenStage>
  ),
};
