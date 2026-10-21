"use client";

import {
  BOLETO_PAYMENT_VARIANTS,
  type BoletoPaymentVariant,
} from "@/components/ui/uai/boleto-payment";
import { CEP_FIELD_VARIANTS, type CepFieldVariant } from "@/components/ui/uai/cep-field";
import {
  DOCUMENT_FIELD_VARIANTS,
  type DocumentFieldVariant,
} from "@/components/ui/uai/document-field";
import {
  INSTALLMENT_PICKER_VARIANTS,
  type InstallmentPickerVariant,
} from "@/components/ui/uai/installment-picker";
import {
  PIX_AUTOMATICO_VARIANTS,
  type PixAutomaticoVariant,
} from "@/components/ui/uai/pix-automatico";
import { PIX_PAYMENT_VARIANTS, type PixPaymentVariant } from "@/components/ui/uai/pix-payment";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { BoletoPaymentPreview } from "./boleto-payment-preview";
import { CepFieldPreview } from "./cep-field-preview";
import { DocumentFieldPreview } from "./document-field-preview";
import { InstallmentPickerPreview } from "./installment-picker-preview";
import { PixAutomaticoPreview } from "./pix-automatico-preview";
import { PixPaymentPreview } from "./pix-payment-preview";

const controls: Record<string, { label: string; variants: readonly string[] }> = {
  "document-field": { label: "document field variant", variants: DOCUMENT_FIELD_VARIANTS },
  "cep-field": { label: "CEP field variant", variants: CEP_FIELD_VARIANTS },
  "pix-payment": { label: "Pix payment variant", variants: PIX_PAYMENT_VARIANTS },
  "boleto-payment": { label: "boleto payment variant", variants: BOLETO_PAYMENT_VARIANTS },
  "pix-automatico": { label: "Pix Automático variant", variants: PIX_AUTOMATICO_VARIANTS },
  "installment-picker": {
    label: "installment picker variant",
    variants: INSTALLMENT_PICKER_VARIANTS,
  },
};

export function getBrazilPreviewControl(itemId: string): PreviewControl | undefined {
  const control = controls[itemId];
  if (!control) return undefined;
  return {
    ariaLabel: control.label,
    defaultValue: control.variants[0] ?? "",
    options: control.variants.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  };
}

export function BrazilPreview({ itemId, selection }: { itemId: string; selection: string }) {
  return (
    <PreviewStage label="Brazil">
      <div
        style={{
          width: "100%",
          maxWidth:
            itemId === "pix-payment"
              ? 600
              : itemId === "boleto-payment"
                ? selection === "compact"
                  ? 340
                  : 448
                : itemId === "pix-automatico"
                  ? 560
                  : 400,
          minWidth: 0,
          minHeight: itemId === "cep-field" ? 180 : undefined,
          padding: "24px 0",
        }}
      >
        {itemId === "document-field" && (
          <DocumentFieldPreview variant={selection as DocumentFieldVariant} />
        )}
        {itemId === "cep-field" && <CepFieldPreview variant={selection as CepFieldVariant} />}
        {itemId === "pix-payment" && <PixPaymentPreview variant={selection as PixPaymentVariant} />}
        {itemId === "boleto-payment" && (
          <BoletoPaymentPreview variant={selection as BoletoPaymentVariant} />
        )}
        {itemId === "pix-automatico" && (
          <PixAutomaticoPreview variant={selection as PixAutomaticoVariant} />
        )}
        {itemId === "installment-picker" && (
          <InstallmentPickerPreview variant={selection as InstallmentPickerVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
