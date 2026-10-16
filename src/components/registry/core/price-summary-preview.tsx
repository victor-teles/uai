"use client";

import {
  PriceSummary,
  PriceSummaryDescription,
  PriceSummaryHeader,
  PriceSummaryItem,
  PriceSummaryList,
  PriceSummaryNote,
  PriceSummaryTitle,
  PriceSummaryTotal,
  type PriceSummaryVariant,
} from "@/components/ui/uai/price-summary";

export function PriceSummaryPreview({ variant = "card" }: { variant?: PriceSummaryVariant }) {
  return (
    <div className={variant === "compact" ? "w-full max-w-[320px]" : "w-full max-w-[380px]"}>
      <PriceSummary variant={variant}>
        <PriceSummaryHeader>
          <PriceSummaryTitle>Order summary</PriceSummaryTitle>
          <PriceSummaryDescription>3 items · Ready to check out</PriceSummaryDescription>
        </PriceSummaryHeader>
        <PriceSummaryList>
          <PriceSummaryItem label="Subtotal">$128.00</PriceSummaryItem>
          <PriceSummaryItem label="WELCOME20" tone="success">
            −$20.00
          </PriceSummaryItem>
          <PriceSummaryItem label="Shipping" tone="success">
            Free
          </PriceSummaryItem>
          <PriceSummaryItem label="Estimated tax">$9.72</PriceSummaryItem>
          <PriceSummaryTotal hint="Includes estimated tax">$117.72</PriceSummaryTotal>
        </PriceSummaryList>
        <PriceSummaryNote>The final amount is confirmed at payment.</PriceSummaryNote>
      </PriceSummary>
    </div>
  );
}
