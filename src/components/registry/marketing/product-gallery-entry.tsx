import {
  PRODUCT_GALLERY_VARIANTS,
  type ProductGalleryVariant,
} from "@/components/ui/uai/product-gallery";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ProductGalleryPreview } from "./product-gallery-preview";

export const entry: PreviewEntry = {
  control: variantControl("product gallery variant", PRODUCT_GALLERY_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing and conversion" maxWidth={520}>
      <ProductGalleryPreview variant={selection as ProductGalleryVariant} />
    </SpecimenStage>
  ),
};
