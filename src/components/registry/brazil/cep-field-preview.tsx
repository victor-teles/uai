"use client";

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
