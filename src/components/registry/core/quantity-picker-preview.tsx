"use client";

import { useState } from "react";
import {
  QuantityPicker,
  QuantityPickerControl,
  QuantityPickerDecrease,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
  QuantityPickerMessage,
  type QuantityPickerVariant,
} from "@/components/ui/uai/quantity-picker";

export function QuantityPickerPreview({
  variant = "rounded",
}: {
  variant?: QuantityPickerVariant;
}) {
  const [quantity, setQuantity] = useState(2);
  const atLimit = quantity === 5;

  return (
    <article className="w-full max-w-[380px]">
      <div className="border-b border-[color-mix(in_oklab,var(--uai-border)_60%,transparent)] pb-4">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 className="text-sm leading-5 font-medium">Everyday Tote</h2>
            <p className="mt-0.5 text-[12px] leading-4 text-[var(--uai-muted)]">
              Natural canvas · One size
            </p>
          </div>
          <p className="shrink-0 text-sm leading-5 font-medium tabular-nums">$48.00</p>
        </div>
        <p className="mt-3 text-[12px] leading-4 text-[var(--uai-muted)]">
          Ships in 1–2 business days
        </p>
      </div>

      <div className="mt-5 flex items-end justify-between gap-6">
        <QuantityPicker
          variant={variant}
          value={quantity}
          onValueChange={setQuantity}
          min={1}
          max={5}
        >
          <QuantityPickerLabel>Quantity for Everyday Tote</QuantityPickerLabel>
          <QuantityPickerControl>
            <QuantityPickerDecrease />
            <QuantityPickerInput />
            <QuantityPickerIncrease />
          </QuantityPickerControl>
          <QuantityPickerMessage tone={atLimit ? "warning" : "muted"} role="status">
            {atLimit ? "Limit reached · 5 available" : "5 available · max per order"}
          </QuantityPickerMessage>
        </QuantityPicker>

        <div className="shrink-0 pb-5 text-right tabular-nums">
          <span className="block text-[0.72rem] leading-4 text-[var(--uai-muted)]">Line total</span>
          <strong className="mt-0.5 block text-base leading-5 font-semibold tracking-[-0.02em]">
            ${(quantity * 48).toFixed(2)}
          </strong>
        </div>
      </div>
    </article>
  );
}
