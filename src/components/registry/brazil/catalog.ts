import { Barcode, CreditCard, IdCard, MapPin, QrCode, Repeat } from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type BrazilItemId =
  | "document-field"
  | "cep-field"
  | "pix-payment"
  | "boleto-payment"
  | "installment-picker"
  | "pix-automatico";

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
    id: "boleto-payment",
    name: "Boleto Payment",
    category: "Brazil",
    icon: Barcode,
    description:
      "A boleto with the grouped linha digitável and copy, an ITF barcode drawn from the code, due-date urgency, and a BolePix tab.",
    usage: `"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  BoletoPayment,
  BoletoPaymentAmount,
  BoletoPaymentBarcode,
  BoletoPaymentDetails,
  BoletoPaymentDigitableLine,
  BoletoPaymentDownload,
  BoletoPaymentFooter,
  BoletoPaymentHeader,
  BoletoPaymentHint,
  BoletoPaymentMethods,
  BoletoPaymentPanel,
  BoletoPaymentPanels,
  BoletoPaymentPix,
  type BoletoPaymentStatus,
  BoletoPaymentStatusBadge,
  BoletoPaymentTitle,
  type BoletoPaymentVariant,
} from "@/components/ui/uai/boleto-payment";

const line = "99990.00095 01234.567897 01234.567814 3 16090000045990";
const pixCode =
  "00020126580014br.gov.bcb.pix01367d9f0335-8dcc-4054-9bf9-0dbd61b2a4b95204000053039865406459.905802BR5912CASA AROEIRA6014BELO HORIZONTE62140510PEDIDO48216304A1B2";

type Scenario = "pending" | "due-today" | "paid" | "overdue" | "cancelled";

const scenarios: Record<Scenario, { status: BoletoPaymentStatus; now: string; hint?: string }> = {
  pending: { status: "pending", now: "2026-10-18T10:00:00-03:00" },
  "due-today": {
    status: "pending",
    now: "2026-10-24T10:00:00-03:00",
    hint: "Pague até as 22h para não atrasar",
  },
  paid: { status: "paid", now: "2026-10-22T10:00:00-03:00" },
  overdue: {
    status: "overdue",
    now: "2026-10-25T10:00:00-03:00",
    hint: "Venceu em 24/10/2026. Pagável até 23/11 com multa de 2%.",
  },
  cancelled: { status: "cancelled", now: "2026-10-20T10:00:00-03:00" },
};

export function BoletoPaymentPreview({ variant = "card" }: { variant?: BoletoPaymentVariant }) {
  const [scenario, setScenario] = useState<Scenario>("pending");
  const { status, now, hint } = scenarios[scenario];
  const compact = variant === "compact";

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ToggleGroup
        type="single"
        aria-label="Simular status"
        value={scenario}
        onValueChange={(next) => next && setScenario(next as Scenario)}
        className="flex-wrap justify-self-center"
      >
        <ToggleGroupItem value="pending">Pendente</ToggleGroupItem>
        <ToggleGroupItem value="due-today">Vence hoje</ToggleGroupItem>
        <ToggleGroupItem value="paid">Pago</ToggleGroupItem>
        <ToggleGroupItem value="overdue">Vencido</ToggleGroupItem>
        <ToggleGroupItem value="cancelled">Cancelado</ToggleGroupItem>
      </ToggleGroup>
      <BoletoPayment
        variant={variant}
        status={status}
        digitableLine={line}
        dueDate="2026-10-24"
        now={now}
        paidAt="2026-10-22"
        pixCode={compact ? undefined : pixCode}
      >
        <BoletoPaymentHeader>
          <div>
            <BoletoPaymentTitle>
              {compact ? "Mensalidade outubro" : "Pedido #4821 · Casa Aroeira"}
            </BoletoPaymentTitle>
            <BoletoPaymentAmount value={compact ? 189 : 459.9} />
          </div>
          <BoletoPaymentStatusBadge />
        </BoletoPaymentHeader>
        <BoletoPaymentMethods />
        <BoletoPaymentPanels>
          <BoletoPaymentPanel value="boleto">
            <BoletoPaymentBarcode />
            <BoletoPaymentDigitableLine />
          </BoletoPaymentPanel>
          <BoletoPaymentPanel value="pix">
            <BoletoPaymentPix>
              {/* biome-ignore lint/performance/noImgElement: the QR comes from the payment provider */}
              <img src="/brazil/pix-qr.svg" alt="QR Code Pix do boleto do pedido #4821" />
            </BoletoPaymentPix>
          </BoletoPaymentPanel>
        </BoletoPaymentPanels>
        {!compact && <BoletoPaymentDetails beneficiary="Casa Aroeira Ltda · 12.345.678/0001-95" />}
        {compact ? (
          hint && (
            <BoletoPaymentHint tone={scenario === "overdue" ? "danger" : "subtle"}>
              {hint}
            </BoletoPaymentHint>
          )
        ) : (
          <BoletoPaymentFooter>
            <BoletoPaymentDownload href="/brazil/boleto-4821.pdf" download />
            <BoletoPaymentHint tone={scenario === "overdue" ? "danger" : "subtle"}>
              {hint}
            </BoletoPaymentHint>
          </BoletoPaymentFooter>
        )}
      </BoletoPayment>
    </div>
  );
}
`,
    accessibility: [
      "The boleto is a section named by its title and amount; the status badge is a polite live region, so payment is announced.",
      "The linha digitável is a labelled group; screen readers hear the 47 digits in blocks of five, and the printed groups are presentational.",
      "Copiar código announces “Linha digitável copiada” (or the failure) in a status region; without clipboard access the digits stay selectable and a hint says so.",
      "The barcode is hidden from assistive technology because the linha digitável is its text alternative; paid and cancelled boletos say so in a caption.",
      "Boleto | Pix is a radio group named “Forma de pagamento”: arrow keys move and select, and the hidden panel is inert.",
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
  {
    id: "pix-automatico",
    name: "Pix Automático",
    category: "Brazil",
    icon: Repeat,
    description:
      "Authorize recurring Pix: clear terms, QR Code or a bank picked from a searchable list, a live waiting state that names the bank, and the next charges once active.",
    usage: `"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  PIX_AUTOMATICO_DEFAULT_BANKS,
  PixAutomatico,
  PixAutomaticoActive,
  PixAutomaticoAmount,
  PixAutomaticoAppPending,
  PixAutomaticoAuthorize,
  PixAutomaticoAvatar,
  type PixAutomaticoBanksStatus,
  PixAutomaticoHeader,
  PixAutomaticoMaxHint,
  PixAutomaticoMethod,
  PixAutomaticoNotice,
  PixAutomaticoOutcome,
  PixAutomaticoQrCode,
  PixAutomaticoReview,
  PixAutomaticoSchedule,
  type PixAutomaticoStatus,
  PixAutomaticoStatusBadge,
  PixAutomaticoTerm,
  PixAutomaticoTerms,
  PixAutomaticoTitle,
  type PixAutomaticoVariant,
} from "@/components/ui/uai/pix-automatico";

const code =
  "00020101021226930014br.gov.bcb.pix2571pix.casaaroeira.com.br/rec/7d9f0335-8dcc-4054-9bf9-0dbd61b2a4b95204000053039865802BR5912CASA AROEIRA6014BELO HORIZONTE62070503***6304A1F2";

const variableCharges = [
  { date: "2026-11-05", amount: 156.8 },
  { date: "2026-12-05", amount: 171.25 },
  { date: "2027-01-05", amount: 163.4 },
];

// The example list plus an invented cooperative, so no real bank is ever shown as unavailable.
const banks = [
  ...PIX_AUTOMATICO_DEFAULT_BANKS.slice(0, 1),
  { id: "ipe", name: "Cooperativa Ipê", disabled: true, disabledReason: "Em manutenção" },
  ...PIX_AUTOMATICO_DEFAULT_BANKS.slice(1),
];

const charges = [
  { date: "2026-11-05", amount: 89.9 },
  { date: "2026-12-05", amount: 89.9 },
  { date: "2027-01-05", amount: 89.9 },
];

export function PixAutomaticoPreview({ variant = "card" }: { variant?: PixAutomaticoVariant }) {
  const [status, setStatus] = useState<PixAutomaticoStatus>("review");
  const [expiresAt, setExpiresAt] = useState<number | undefined>(undefined);
  const [banksStatus, setBanksStatus] = useState<PixAutomaticoBanksStatus>("ready");
  // Your app persists the last-used bank (account preference, cookie); the preview keeps it here.
  const [recentBankId, setRecentBankId] = useState("nubank");
  const [pickerOpen, setPickerOpen] = useState(false);
  const variable = variant === "plain";

  const go = (next: PixAutomaticoStatus) => {
    // Your PSP sends the request and its expiry; the preview gives it ten minutes.
    if (next === "awaiting") setExpiresAt(Date.now() + 10 * 60 * 1000);
    setStatus(next);
  };

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
      <ToggleGroup
        type="single"
        aria-label="Simular status"
        value={status}
        onValueChange={(next) => next && go(next as PixAutomaticoStatus)}
        className="flex-wrap justify-self-center"
      >
        <ToggleGroupItem value="review">Revisão</ToggleGroupItem>
        <ToggleGroupItem value="awaiting">Aguardando</ToggleGroupItem>
        <ToggleGroupItem value="active">Ativo</ToggleGroupItem>
        <ToggleGroupItem value="declined">Recusado</ToggleGroupItem>
        <ToggleGroupItem value="expired">Expirado</ToggleGroupItem>
        <ToggleGroupItem value="cancelled">Cancelado</ToggleGroupItem>
      </ToggleGroup>
      {/* Only the open bank picker reads the list status. The row keeps its space while hidden,
          so the card never moves, and inert takes it out of focus and the accessibility tree. */}
      <div
        inert={!pickerOpen}
        aria-hidden={!pickerOpen || undefined}
        className={
          pickerOpen
            ? "justify-self-center opacity-100 transition-opacity duration-180 ease-out motion-reduce:transition-none"
            : "justify-self-center opacity-0 transition-opacity duration-180 ease-out motion-reduce:transition-none"
        }
      >
        <ToggleGroup
          type="single"
          aria-label="Simular lista de bancos"
          value={banksStatus}
          onValueChange={(next) => next && setBanksStatus(next as PixAutomaticoBanksStatus)}
          className="flex-wrap justify-self-center"
        >
          <ToggleGroupItem value="ready">Lista pronta</ToggleGroupItem>
          <ToggleGroupItem value="loading">Carregando bancos</ToggleGroupItem>
          <ToggleGroupItem value="error">Erro na lista</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <PixAutomatico
        variant={variant}
        status={status}
        code={code}
        expiresAt={status === "awaiting" ? expiresAt : undefined}
        banks={banks}
        banksStatus={banksStatus}
        onBanksRetry={() => setBanksStatus("ready")}
        recentBankId={recentBankId}
        onBankPickerOpenChange={setPickerOpen}
        onAuthorize={(payload) => {
          if (payload.method === "app") setRecentBankId(payload.bank.id);
          go("awaiting");
        }}
        onChangeBank={() => go("review")}
        onRetry={() => go("review")}
        onOtherMethod={() => go("review")}
        onExpire={() => go("expired")}
      >
        <PixAutomaticoHeader>
          <PixAutomaticoAvatar>CA</PixAutomaticoAvatar>
          <PixAutomaticoTitle
            product={variable ? "Clube do Café · Seleção do mês" : "Clube do Café"}
            recipient={
              status === "review" || status === "active"
                ? "Casa Aroeira"
                : variable
                  ? "Valor variável"
                  : "R$ 89,90 por mês"
            }
          />
          <PixAutomaticoStatusBadge />
        </PixAutomaticoHeader>
        <PixAutomaticoReview>
          <PixAutomaticoAmount value={variable ? "variable" : 89.9} period="month" />
          <PixAutomaticoTerms>
            <PixAutomaticoTerm label="Primeira cobrança">05/11/2026</PixAutomaticoTerm>
            <PixAutomaticoTerm label="Periodicidade">
              {variable ? "Mensal" : "Mensal, todo dia 5"}
            </PixAutomaticoTerm>
            <PixAutomaticoTerm label="Vigência">
              {variable ? "Até 12/2027" : "Sem data de término"}
            </PixAutomaticoTerm>
            <PixAutomaticoTerm label="Recebedor" detail="CNPJ 12.345.678/0001-95">
              Casa Aroeira Ltda
            </PixAutomaticoTerm>
            {variable ? (
              <PixAutomaticoTerm label="Valor máximo mínimo">R$ 150,00</PixAutomaticoTerm>
            ) : null}
          </PixAutomaticoTerms>
          {variable ? <PixAutomaticoMaxHint minimum={150} /> : <PixAutomaticoNotice />}
          <PixAutomaticoMethod />
          <PixAutomaticoAuthorize />
        </PixAutomaticoReview>
        <PixAutomaticoQrCode
          src="/brazil/pix-qr.svg"
          alt="QR Code do Pix Automático do Clube do Café"
        />
        <PixAutomaticoAppPending />
        <PixAutomaticoActive>
          {variable
            ? "Valor variável, todo mês, a partir de 05/11."
            : "R$ 89,90 por mês, a partir de 05/11."}
        </PixAutomaticoActive>
        <PixAutomaticoSchedule charges={variable ? variableCharges : charges} />
        <PixAutomaticoOutcome />
      </PixAutomatico>
    </div>
  );
}
`,
    accessibility: [
      "The card is a section named by the product. Terms are a description list, and the CNPJ is read as text.",
      "The authorization method is a radio group named “Como você quer autorizar?” with arrow keys, Home, and End. Arrows only select; a click, tap, or Space on “No app do banco” opens the bank step, so the content never swaps under arrow keys.",
      "The bank step is a group named “Escolha seu banco”. Its search field is a combobox that controls a single-select listbox named “Bancos” through aria-activedescendant, so focus stays in the field while ↑ and ↓ move. The listbox is one tab stop with Home, End, and type-ahead; Enter selects and moves to “Enviar para o app …”, Esc clears the search and then goes back, and the result count is announced politely while searching. Disabled banks stay reachable and read their reason.",
      "Focus goes to the search field on open (the heading on touch screens), back to the opener on Voltar, and to the waiting title once the request is sent, so it's never lost when the review goes inert.",
      "The status badge is a polite live region that speaks “Pedido enviado para o app Itaú. Aguardando confirmação.” (or “Aguardando confirmação no banco” without a bank), “Pix Automático autorizado”, or “Autorização recusada”; the countdown is a time element that announces once, a minute before it expires.",
      "Next charges are an ordered list named “Próximas cobranças”, each read as “5 de novembro, R$ 89,90, próxima”. The pulsing phone ring and the bank monograms are decorative.",
    ],
  },
];
