import { CHECKOUT_VARIANTS, type CheckoutVariant } from "@/components/uai/checkout";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { CheckoutPreview } from "./checkout-preview";

export const entry: PreviewEntry = {
  control: variantControl("checkout variant", CHECKOUT_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Commerce" maxWidth={960}>
      <CheckoutPreview variant={selection as CheckoutVariant} />
    </SpecimenStage>
  ),
};
