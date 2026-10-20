"use client";

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
      <PixAutomatico
        variant={variant}
        status={status}
        code={code}
        expiresAt={status === "awaiting" ? expiresAt : undefined}
        banks={banks}
        banksStatus={banksStatus}
        onBanksRetry={() => setBanksStatus("ready")}
        recentBankId={recentBankId}
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
