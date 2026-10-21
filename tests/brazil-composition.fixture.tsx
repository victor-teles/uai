import { BoletoPaymentPreview } from "@/components/registry/brazil/boleto-payment-preview";
import { CepFieldPreview } from "@/components/registry/brazil/cep-field-preview";
import { DocumentFieldPreview } from "@/components/registry/brazil/document-field-preview";
import { InstallmentPickerPreview } from "@/components/registry/brazil/installment-picker-preview";
import { PixAutomaticoPreview } from "@/components/registry/brazil/pix-automatico-preview";
import { PixPaymentPreview } from "@/components/registry/brazil/pix-payment-preview";

export function BrazilCompositionFixture() {
  return (
    <>
      <DocumentFieldPreview />
      <CepFieldPreview />
      <PixPaymentPreview />
      <BoletoPaymentPreview />
      <InstallmentPickerPreview />
      <PixAutomaticoPreview />
    </>
  );
}
