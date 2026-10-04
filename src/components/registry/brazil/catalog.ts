import { CreditCard, IdCard, MapPin, QrCode } from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type BrazilItemId = "document-field" | "cep-field" | "pix-payment" | "installment-picker";

export const brazilCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "document-field",
    name: "Document Field",
    category: "Brazil",
    icon: IdCard,
    description: "CPF and CNPJ entry with masking, check digits, and the alphanumeric CNPJ.",
    usage: `"use client";

import {
  DocumentField,
  DocumentFieldControl,
  DocumentFieldDescription,
  DocumentFieldError,
  DocumentFieldInput,
  DocumentFieldKind,
  DocumentFieldLabel,
  DocumentFieldStatusIcon,
  type DocumentFieldVariant,
} from "@/components/ui/uai/document-field";

export function DocumentFieldPreview({ variant = "rounded" }: { variant?: DocumentFieldVariant }) {
  return (
    <DocumentField variant={variant} accept="any" defaultValue="12ABC34501DE35">
      <DocumentFieldLabel />
      <DocumentFieldControl>
        <DocumentFieldInput name="documento" />
        <DocumentFieldStatusIcon />
        <DocumentFieldKind />
      </DocumentFieldControl>
      <DocumentFieldDescription>
        Aceita CPF e CNPJ, inclusive o novo CNPJ com letras.
      </DocumentFieldDescription>
      <DocumentFieldError />
    </DocumentField>
  );
}
`,
    accessibility: [
      "The input keeps a persistent label; the default names the accepted documents (CPF, CNPJ, or CPF ou CNPJ).",
      "Masking keeps the caret in place while typing or deleting in the middle of the number.",
      "Invalid and incomplete numbers set aria-invalid and swap the description for an alert linked through aria-describedby.",
      "The detected document type is printed as text, and the status icon is decorative.",
    ],
  },
  {
    id: "cep-field",
    name: "CEP Field",
    category: "Brazil",
    icon: MapPin,
    description: "Postal code entry that masks, looks up the address, and reports the result.",
    usage: `"use client";

import { useState } from "react";
import {
  CepField,
  CepFieldAddress,
  CepFieldControl,
  CepFieldInput,
  CepFieldLabel,
  CepFieldLookup,
  CepFieldMessage,
  type CepFieldStatus,
  type CepFieldVariant,
} from "@/components/ui/uai/cep-field";

type Address = { street: string; district: string; city: string; state: string };

const addresses: Record<string, Address> = {
  "01310100": {
    street: "Avenida Paulista",
    district: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  },
  "20040002": {
    street: "Rua da Assembleia",
    district: "Centro",
    city: "Rio de Janeiro",
    state: "RJ",
  },
};

export function CepFieldPreview({ variant = "rounded" }: { variant?: CepFieldVariant }) {
  const [status, setStatus] = useState<CepFieldStatus>("idle");
  const [address, setAddress] = useState<Address | null>(null);

  const lookup = (cep: string) => {
    setStatus("loading");
    window.setTimeout(() => {
      const match = addresses[cep];
      setAddress(match ?? null);
      setStatus(match ? "found" : cep === "99999999" ? "error" : "not-found");
    }, 700);
  };

  return (
    <CepField
      variant={variant}
      status={status}
      onValueChange={() => setStatus("idle")}
      onLookup={lookup}
    >
      <CepFieldLabel>CEP de entrega</CepFieldLabel>
      <CepFieldControl>
        <CepFieldInput name="cep" />
        <CepFieldLookup />
      </CepFieldControl>
      <CepFieldMessage>
        {status === "idle" ? "Experimente 01310-100 ou 20040-002." : undefined}
      </CepFieldMessage>
      {address && (
        <CepFieldAddress>
          <span>{address.street}</span>
          <span>
            {address.district}, {address.city} – {address.state}
          </span>
        </CepFieldAddress>
      )}
    </CepField>
  );
}
`,
    accessibility: [
      "The input uses the numeric keyboard and the postal-code autocomplete token.",
      "Lookup runs once when eight digits are entered, and again from Enter or the Buscar button.",
      "Progress, not-found, and failure messages live in a polite status region linked to the input.",
      "The resolved address renders as an address element after a successful lookup.",
    ],
  },
  {
    id: "pix-payment",
    name: "Pix Payment",
    category: "Brazil",
    icon: QrCode,
    description:
      "A Pix charge with QR code, copy-and-paste code, expiry countdown, and payment status.",
    usage: `"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  PixPayment,
  PixPaymentAmount,
  PixPaymentBody,
  PixPaymentCode,
  PixPaymentCountdown,
  PixPaymentDetails,
  PixPaymentHeader,
  PixPaymentQrCode,
  type PixPaymentStatus,
  PixPaymentStatusBadge,
  PixPaymentStep,
  PixPaymentSteps,
  PixPaymentTitle,
  type PixPaymentVariant,
} from "@/components/ui/uai/pix-payment";

const code =
  "00020126580014br.gov.bcb.pix01367d9f0335-8dcc-4054-9bf9-0dbd61b2a4b95204000053039865406289.905802BR5912CASA AROEIRA6014BELO HORIZONTE62140510PEDIDO4821630449DE";

export function PixPaymentPreview({ variant = "card" }: { variant?: PixPaymentVariant }) {
  const [status, setStatus] = useState<PixPaymentStatus>("pending");

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ToggleGroup
        type="single"
        aria-label="Simular status"
        value={status}
        onValueChange={(next) => next && setStatus(next as PixPaymentStatus)}
        className="justify-self-center"
      >
        <ToggleGroupItem value="pending">Pendente</ToggleGroupItem>
        <ToggleGroupItem value="paid">Pago</ToggleGroupItem>
        <ToggleGroupItem value="expired">Expirado</ToggleGroupItem>
      </ToggleGroup>
      <PixPayment
        variant={variant}
        status={status}
        code={code}
        now="2026-10-03T14:00:00-03:00"
        expiresAt="2026-10-03T14:15:00-03:00"
        onExpire={() => setStatus("expired")}
      >
        <PixPaymentHeader>
          <div>
            <PixPaymentTitle>Pedido #4821 · Casa Aroeira</PixPaymentTitle>
            <PixPaymentAmount value={289.9} />
          </div>
          <PixPaymentStatusBadge />
        </PixPaymentHeader>
        <PixPaymentBody>
          <PixPaymentQrCode>
            {/* biome-ignore lint/performance/noImgElement: the QR comes from the payment provider */}
            <img src="/brazil/pix-qr.svg" alt="QR Code Pix do pedido #4821" />
          </PixPaymentQrCode>
          <PixPaymentDetails>
            <PixPaymentCode />
            <PixPaymentCountdown />
            {variant !== "compact" && (
              <PixPaymentSteps>
                <PixPaymentStep>Abra o app do seu banco e escolha Pix.</PixPaymentStep>
                <PixPaymentStep>Leia o QR Code ou cole o código copiado.</PixPaymentStep>
                <PixPaymentStep>Confirme o pagamento. A confirmação chega aqui.</PixPaymentStep>
              </PixPaymentSteps>
            )}
          </PixPaymentDetails>
        </PixPaymentBody>
      </PixPayment>
    </div>
  );
}
`,
    accessibility: [
      "The charge is a section; the copy-and-paste code is a labelled group with a named copy button.",
      "Copying announces “Código Pix copiado” in a status region, and the button label changes with it.",
      "The status badge is a polite live region, so confirmation and expiry are announced.",
      "Paid and expired QR codes are hidden from assistive technology and replaced by a text caption.",
    ],
  },
  {
    id: "installment-picker",
    name: "Installment Picker",
    category: "Brazil",
    icon: CreditCard,
    description:
      "Card installment choices with per-installment amounts, interest terms, and totals.",
    usage: `"use client";

import {
  formatBrl,
  InstallmentPicker,
  InstallmentPickerAmount,
  InstallmentPickerCount,
  InstallmentPickerLegend,
  InstallmentPickerOption,
  InstallmentPickerOptions,
  InstallmentPickerTerms,
  type InstallmentPickerVariant,
} from "@/components/ui/uai/installment-picker";

const price = 1299;
const monthlyRate = 0.0199;

function installment(count: number) {
  if (count <= 10) return { each: price / count, total: price, interestFree: true };
  const each = (price * monthlyRate) / (1 - (1 + monthlyRate) ** -count);
  return { each, total: each * count, interestFree: false };
}

export function InstallmentPickerPreview({
  variant = "list",
}: {
  variant?: InstallmentPickerVariant;
}) {
  return (
    <InstallmentPicker variant={variant} name="parcelas" defaultValue="3">
      <InstallmentPickerLegend>Parcelamento no cartão</InstallmentPickerLegend>
      <InstallmentPickerOptions>
        <InstallmentPickerOption value="1">
          <InstallmentPickerCount>1x</InstallmentPickerCount>
          <InstallmentPickerAmount>{formatBrl(price * 0.95)}</InstallmentPickerAmount>
          <InstallmentPickerTerms interestFree>5% off à vista</InstallmentPickerTerms>
        </InstallmentPickerOption>
        {[3, 6, 10, 12].map((count) => {
          const { each, total, interestFree } = installment(count);
          return (
            <InstallmentPickerOption key={count} value={String(count)}>
              <InstallmentPickerCount>{count}x</InstallmentPickerCount>
              <InstallmentPickerAmount>{formatBrl(each)}</InstallmentPickerAmount>
              <InstallmentPickerTerms interestFree={interestFree}>
                {interestFree ? "sem juros" : \`total \${formatBrl(total)}\`}
              </InstallmentPickerTerms>
            </InstallmentPickerOption>
          );
        })}
      </InstallmentPickerOptions>
    </InstallmentPicker>
  );
}
`,
    accessibility: [
      "Options are a radio group named by the fieldset legend; arrow keys move and select, and the value submits with forms.",
      "Each radio is labelled by its option text, including the count, amount, and terms, and the whole row selects it.",
      "Interest-free terms are stated in text, not only by the success tint.",
      "Focus draws an outline around the whole option row or tile.",
    ],
  },
];
