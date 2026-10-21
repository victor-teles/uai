"use client";

import { ADDRESS_FORM_VARIANTS, type AddressFormVariant } from "@/components/uai/address-form";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { AddressFormPreview } from "./address-form-preview";

const controls: Record<string, { label: string; variants: readonly string[] }> = {
  "address-form": { label: "address form variant", variants: ADDRESS_FORM_VARIANTS },
};

const widths: Record<string, Record<string, number>> = {
  "address-form": { stacked: 440, split: 800, compact: 340 },
};

export function getBrazilBlocksPreviewControl(itemId: string): PreviewControl | undefined {
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

export function BrazilBlocksPreview({ itemId, selection }: { itemId: string; selection: string }) {
  return (
    <PreviewStage label="Brazil">
      <div
        style={{
          width: "100%",
          maxWidth: widths[itemId]?.[selection] ?? 800,
          minWidth: 0,
          padding: "24px 0",
        }}
      >
        {itemId === "address-form" && (
          <AddressFormPreview variant={selection as AddressFormVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
