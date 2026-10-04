"use client";

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
