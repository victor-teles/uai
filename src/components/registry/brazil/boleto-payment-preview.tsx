"use client";

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
