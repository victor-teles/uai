import {
  PRODUCT_DETAIL_VARIANTS,
  type ProductDetailVariant,
} from "@/components/uai/product-detail";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ProductDetailPreview } from "./product-detail-preview";

export const entry: PreviewEntry = {
  control: variantControl("product detail variant", PRODUCT_DETAIL_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Commerce" maxWidth={960}>
      <ProductDetailPreview variant={selection as ProductDetailVariant} />
    </SpecimenStage>
  ),
};
