import {
  BOLETO_PAYMENT_VARIANTS,
  type BoletoPaymentVariant,
} from "@/components/ui/uai/boleto-payment";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { BoletoPaymentPreview } from "./boleto-payment-preview";

export const entry: PreviewEntry = {
  control: variantControl("boleto payment variant", BOLETO_PAYMENT_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Brazil" maxWidth={selection === "compact" ? 340 : 448}>
      <BoletoPaymentPreview variant={selection as BoletoPaymentVariant} />
    </SpecimenStage>
  ),
};
