"use client";

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
