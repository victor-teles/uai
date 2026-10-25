import {
  PRICING_TOGGLE_VARIANTS,
  type PricingToggleVariant,
} from "@/components/ui/uai/pricing-toggle";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { PricingTogglePreview } from "./pricing-toggle-preview";

export const entry: PreviewEntry = {
  control: variantControl("pricing toggle variant", PRICING_TOGGLE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing and conversion" maxWidth={560}>
      <PricingTogglePreview variant={selection as PricingToggleVariant} />
    </SpecimenStage>
  ),
};
