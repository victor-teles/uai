"use client";

import { useState } from "react";
import {
  PriceSummary,
  PriceSummaryCode,
  PriceSummaryDescription,
  PriceSummaryHeader,
  PriceSummaryItem,
  PriceSummaryList,
  PriceSummaryNote,
  PriceSummarySavings,
  PriceSummaryTitle,
  PriceSummaryTotal,
  type PriceSummaryVariant,
} from "@/components/ui/uai/price-summary";

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function PriceSummaryPreview({ variant = "card" }: { variant?: PriceSummaryVariant }) {
  const [code, setCode] = useState(true);
  const [express, setExpress] = useState(false);
  const [busy, setBusy] = useState(false);
  const subtotal = 12800;
  const discount = code ? 2000 : 0;
  const shipping = express ? 1500 : 0;
  const tax = Math.round((subtotal - discount + shipping) * 0.09);
  const total = subtotal - discount + shipping + tax;

  function toggleShipping() {
    setBusy(true);
    window.setTimeout(() => {
      setExpress(!express);
      setBusy(false);
    }, 900);
  }

  return (
    <div
      className={
        variant === "compact"
          ? "grid w-full max-w-[320px] gap-3"
          : "grid w-full max-w-[380px] gap-3"
      }
    >
      <PriceSummary variant={variant} aria-busy={busy}>
        <PriceSummaryHeader>
          <PriceSummaryTitle>Order summary</PriceSummaryTitle>
          <PriceSummaryDescription>
            3 items · {busy ? "Updating totals…" : "Ready to check out"}
          </PriceSummaryDescription>
        </PriceSummaryHeader>
        <PriceSummaryList>
          <PriceSummaryItem label="Subtotal">{money(subtotal)}</PriceSummaryItem>
          {code && (
            <PriceSummaryItem
              label={<PriceSummaryCode onRemove={() => setCode(false)}>WELCOME20</PriceSummaryCode>}
              tone="success"
            >
              −{money(discount)}
            </PriceSummaryItem>
          )}
          <PriceSummaryItem
            label={express ? "Express shipping" : "Shipping"}
            tone={shipping ? "default" : "success"}
            aria-busy={busy}
          >
            {shipping ? money(shipping) : "Free"}
          </PriceSummaryItem>
          <PriceSummaryItem label="Estimated tax" aria-busy={busy}>
            {money(tax)}
          </PriceSummaryItem>
          <PriceSummaryTotal hint="Includes estimated tax">{money(total)}</PriceSummaryTotal>
        </PriceSummaryList>
        <PriceSummarySavings>
          {code ? `You’re saving ${money(discount)} on this order` : null}
        </PriceSummarySavings>
        <PriceSummaryNote>
          Totals update before you pay. The final amount is confirmed at payment.
        </PriceSummaryNote>
      </PriceSummary>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={toggleShipping}
          className="h-7 cursor-pointer rounded-full border-0 bg-secondary px-3 text-[12.5px] font-medium text-secondary-foreground transition-[background-color,scale] duration-[120ms,140ms] ease-out enabled:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] enabled:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
        >
          {express ? "Use free shipping" : "Switch to express"}
        </button>
        {!code && (
          <button
            type="button"
            onClick={() => setCode(true)}
            className="h-7 cursor-pointer rounded-full border-0 bg-secondary px-3 text-[12.5px] font-medium text-secondary-foreground transition-[background-color,scale] duration-[120ms,140ms] ease-out hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Apply WELCOME20
          </button>
        )}
      </div>
    </div>
  );
}
