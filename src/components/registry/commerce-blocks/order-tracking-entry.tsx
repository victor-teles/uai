import {
  ORDER_TRACKING_VARIANTS,
  type OrderTrackingVariant,
} from "@/components/uai/order-tracking";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { OrderTrackingPreview } from "./order-tracking-preview";

export const entry: PreviewEntry = {
  control: variantControl("order tracking variant", ORDER_TRACKING_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Commerce" maxWidth={960}>
      <OrderTrackingPreview variant={selection as OrderTrackingVariant} />
    </SpecimenStage>
  ),
};
