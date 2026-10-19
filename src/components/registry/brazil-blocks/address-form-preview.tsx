"use client";

import { Truck } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  type Address,
  AddressForm,
  AddressFormActions,
  AddressFormBack,
  AddressFormCep,
  AddressFormCity,
  AddressFormComplement,
  AddressFormDistrict,
  AddressFormFields,
  AddressFormHeader,
  type AddressFormLookupStatus,
  AddressFormNumber,
  AddressFormState,
  AddressFormStreet,
  AddressFormSubmit,
  AddressFormSummary,
  AddressFormTitle,
  type AddressFormVariant,
  type AddressLookupResult,
  EMPTY_ADDRESS,
} from "@/components/uai/address-form";

// Fixed preview data, resolved locally. It is not a claim about the real CEP database.
const previewCeps: Record<string, AddressLookupResult | "error"> = {
  "30130110": {
    street: "Avenida Afonso Pena",
    district: "Centro",
    city: "Belo Horizonte",
    state: "MG",
  },
  "35460000": { city: "Brumadinho", state: "MG" },
  "00000000": "error",
};

/**
 * In your app, resolve the CEP with your own API, for example ViaCEP:
 *   const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
 *   const data = await response.json(); // { erro } | { logradouro, bairro, localidade, uf }
 * then map logradouro → street, bairro → district, localidade → city, uf → state.
 */
function resolvePreviewCep(cep: string): Promise<AddressLookupResult | null> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      const match = previewCeps[cep];
      if (match === "error") reject(new Error("offline"));
      else resolve(match ?? null);
    }, 900);
  });
}

export function AddressFormPreview({ variant = "stacked" }: { variant?: AddressFormVariant }) {
  const [address, setAddress] = useState<Address>({ ...EMPTY_ADDRESS, cep: "30130110" });
  const [status, setStatus] = useState<AddressFormLookupStatus>("found");
  const [result, setResult] = useState<AddressLookupResult | null>(
    previewCeps["30130110"] as AddressLookupResult,
  );
  const latestCep = useRef(address.cep);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const lookup = async (cep: string) => {
    latestCep.current = cep;
    setStatus("looking-up");
    try {
      const found = await resolvePreviewCep(cep);
      if (!mounted.current || latestCep.current !== cep) return;
      setResult(found);
      setStatus(!found ? "not-found" : found.street ? "found" : "partial");
    } catch {
      if (mounted.current && latestCep.current === cep) setStatus("error");
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const compact = variant === "compact";

  return (
    <form onSubmit={submit} style={{ display: "grid", justifyItems: "center" }}>
      <AddressForm
        variant={variant}
        value={address}
        onValueChange={setAddress}
        lookupStatus={status}
        lookupResult={result}
        onLookup={lookup}
      >
        {compact ? (
          <AddressFormHeader>
            <AddressFormTitle>Endereço</AddressFormTitle>
          </AddressFormHeader>
        ) : (
          <AddressFormHeader />
        )}
        <AddressFormFields>
          <AddressFormCep helpHref="https://buscacepinter.correios.com.br/app/endereco/index.php" />
          <AddressFormStreet />
          <AddressFormNumber />
          <AddressFormComplement />
          <AddressFormDistrict />
          <AddressFormCity />
          <AddressFormState />
        </AddressFormFields>
        <AddressFormSummary>
          <p className="flex items-center gap-1.5 text-[12px] leading-4 text-muted-foreground">
            <Truck className="size-3.5" aria-hidden="true" />
            Chega em 2 a 4 dias úteis
          </p>
        </AddressFormSummary>
        <AddressFormActions>
          {compact ? null : <AddressFormBack />}
          <AddressFormSubmit />
        </AddressFormActions>
      </AddressForm>
      <p className="mt-3 text-center text-[12px] leading-4 text-muted-foreground">
        Experimente 30130-110, 35460-000 (só a cidade), 99999-999 ou 00000-000 (sem conexão).
      </p>
    </form>
  );
}
