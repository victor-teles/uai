import { PIX_PAYMENT_VARIANTS, type PixPaymentVariant } from "@/components/ui/uai/pix-payment";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { PixPaymentPreview } from "./pix-payment-preview";

export const entry: PreviewEntry = {
  control: variantControl("Pix payment variant", PIX_PAYMENT_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Brazil" maxWidth={600}>
      <PixPaymentPreview variant={selection as PixPaymentVariant} />
    </SpecimenStage>
  ),
};
