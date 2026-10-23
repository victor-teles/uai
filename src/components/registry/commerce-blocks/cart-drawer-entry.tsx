import { CART_DRAWER_VARIANTS, type CartDrawerVariant } from "@/components/uai/cart-drawer";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { CartDrawerPreview } from "./cart-drawer-preview";

export const entry: PreviewEntry = {
  control: variantControl("cart drawer variant", CART_DRAWER_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Commerce" center maxWidth={480}>
      <CartDrawerPreview variant={selection as CartDrawerVariant} />
    </SpecimenStage>
  ),
};
