import {
  PRODUCT_LISTING_VARIANTS,
  type ProductListingVariant,
} from "@/components/uai/product-listing";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ProductListingPreview } from "./product-listing-preview";

export const entry: PreviewEntry = {
  control: variantControl("product listing variant", PRODUCT_LISTING_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Commerce" maxWidth={960}>
      <ProductListingPreview variant={selection as ProductListingVariant} />
    </SpecimenStage>
  ),
};
