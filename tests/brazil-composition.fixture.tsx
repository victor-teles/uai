import { CepFieldPreview } from "@/components/registry/brazil/cep-field-preview";
import { DocumentFieldPreview } from "@/components/registry/brazil/document-field-preview";
import { InstallmentPickerPreview } from "@/components/registry/brazil/installment-picker-preview";
import { PixPaymentPreview } from "@/components/registry/brazil/pix-payment-preview";

export function BrazilCompositionFixture() {
  return (
    <>
      <DocumentFieldPreview />
      <CepFieldPreview />
      <PixPaymentPreview />
      <InstallmentPickerPreview />
    </>
  );
}
