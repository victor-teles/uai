"use client";

import { useState } from "react";
import {
  Checkout,
  CheckoutConfirmation,
  CheckoutConfirmationTitle,
  CheckoutDescription,
  CheckoutError,
  CheckoutFieldRow,
  CheckoutHeader,
  CheckoutMain,
  CheckoutPayment,
  CheckoutPaymentNote,
  CheckoutPlaceOrder,
  CheckoutProgress,
  CheckoutProgressStep,
  CheckoutSection,
  CheckoutSectionContinue,
  CheckoutSectionEdit,
  CheckoutSectionForm,
  CheckoutSectionHeader,
  CheckoutSectionSummary,
  CheckoutSectionTitle,
  CheckoutSummary,
  CheckoutSummaryTotals,
  CheckoutTitle,
  type CheckoutVariant,
} from "@/components/uai/checkout";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import {
  PriceSummaryHeader,
  PriceSummaryItem,
  PriceSummaryList,
  PriceSummaryTitle,
  PriceSummaryTotal,
} from "@/components/ui/uai/price-summary";
import { StatusBannerDescription, StatusBannerTitle } from "@/components/ui/uai/status-banner";

const steps = ["contact", "delivery", "payment", "review"] as const;
const labels = { contact: "Contact", delivery: "Delivery", payment: "Payment", review: "Review" };

function PaymentPlaceholder({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</span>
      <span
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          background: "var(--uai-surface)",
          boxShadow: "inset 0 0 0 1px var(--uai-border)",
          color: "var(--uai-subtle)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function CheckoutPreview({ variant = "split" }: { variant?: CheckoutVariant }) {
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(0);
  const field = (name: string, label: string, type = "text", autoComplete?: string) => (
    <FormField required variant={variant === "compact" ? "compact" : "outlined"}>
      <FormFieldLabel>{label}</FormFieldLabel>
      <FormFieldInput name={name} type={type} autoComplete={autoComplete} />
    </FormField>
  );
  return (
    <Checkout
      variant={variant}
      steps={steps}
      onStepComplete={(_step, data) =>
        setEntries((current) => ({
          ...current,
          ...Object.fromEntries([...data.entries()].map(([key, value]) => [key, String(value)])),
        }))
      }
      onPlaceOrder={async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setAttempts((count) => count + 1);
        if (attempts === 0) throw new Error("declined");
      }}
    >
      <CheckoutHeader>
        <CheckoutTitle>Checkout</CheckoutTitle>
        <CheckoutDescription>Fieldhouse Ceramics · 3 items</CheckoutDescription>
      </CheckoutHeader>
      <CheckoutProgress>
        {steps.map((step, index) => (
          <CheckoutProgressStep key={step} value={step}>
            {index + 1}. {labels[step]}
          </CheckoutProgressStep>
        ))}
      </CheckoutProgress>
      <CheckoutMain>
        <CheckoutSection value="contact">
          <CheckoutSectionHeader>
            <CheckoutSectionTitle>Contact</CheckoutSectionTitle>
            <CheckoutSectionEdit />
          </CheckoutSectionHeader>
          <CheckoutSectionSummary>{entries.email}</CheckoutSectionSummary>
          <CheckoutSectionForm>
            {field("email", "Email", "email", "email")}
            <CheckoutSectionContinue>Continue to delivery</CheckoutSectionContinue>
          </CheckoutSectionForm>
        </CheckoutSection>
        <CheckoutSection value="delivery">
          <CheckoutSectionHeader>
            <CheckoutSectionTitle>Delivery</CheckoutSectionTitle>
            <CheckoutSectionEdit />
          </CheckoutSectionHeader>
          <CheckoutSectionSummary>
            {entries.name}, {entries.address}, {entries.postal}
          </CheckoutSectionSummary>
          <CheckoutSectionForm>
            {field("name", "Full name", "text", "name")}
            {field("address", "Street address", "text", "street-address")}
            <CheckoutFieldRow>
              {field("city", "City", "text", "address-level2")}
              {field("postal", "Postal code", "text", "postal-code")}
            </CheckoutFieldRow>
            <CheckoutSectionContinue>Continue to payment</CheckoutSectionContinue>
          </CheckoutSectionForm>
        </CheckoutSection>
        <CheckoutSection value="payment">
          <CheckoutSectionHeader>
            <CheckoutSectionTitle>Payment</CheckoutSectionTitle>
            <CheckoutSectionEdit />
          </CheckoutSectionHeader>
          <CheckoutSectionSummary>Visa ending in 4242 · expires 08/29</CheckoutSectionSummary>
          <CheckoutSectionForm>
            <CheckoutPayment>
              <PaymentPlaceholder label="Card number" value="Hosted by your payment provider" />
              <CheckoutFieldRow>
                <PaymentPlaceholder label="Expiry" value="MM / YY" />
                <PaymentPlaceholder label="Security code" value="•••" />
              </CheckoutFieldRow>
              <CheckoutPaymentNote>
                Placeholder region. Card fields come from your payment provider; this preview
                collects nothing.
              </CheckoutPaymentNote>
            </CheckoutPayment>
            <CheckoutSectionContinue>Review order</CheckoutSectionContinue>
          </CheckoutSectionForm>
        </CheckoutSection>
        <CheckoutSection value="review">
          <CheckoutSectionHeader>
            <CheckoutSectionTitle>Review</CheckoutSectionTitle>
          </CheckoutSectionHeader>
          <CheckoutSectionForm>
            <p style={{ margin: 0, color: "var(--uai-muted)" }}>
              Check your details, then place the order. The first attempt in this preview is
              declined so you can see the error state.
            </p>
            <CheckoutError>
              <StatusBannerTitle>Your card was declined</StatusBannerTitle>
              <StatusBannerDescription>
                Nothing was charged. Try again or use another payment method.
              </StatusBannerDescription>
            </CheckoutError>
            <CheckoutPlaceOrder>Place order · $142.00</CheckoutPlaceOrder>
          </CheckoutSectionForm>
        </CheckoutSection>
      </CheckoutMain>
      <CheckoutConfirmation>
        <CheckoutConfirmationTitle>Order FH-20418 is confirmed</CheckoutConfirmationTitle>
        <p style={{ margin: 0 }}>
          A receipt is on its way to {entries.email || "your inbox"}. We will email tracking as soon
          as your order ships.
        </p>
      </CheckoutConfirmation>
      <CheckoutSummary>
        <CheckoutSummaryTotals>
          <PriceSummaryHeader>
            <PriceSummaryTitle>Order summary</PriceSummaryTitle>
          </PriceSummaryHeader>
          <PriceSummaryList>
            <PriceSummaryItem label="Pour-over set × 1">$68.00</PriceSummaryItem>
            <PriceSummaryItem label="Low tumbler × 2">$68.00</PriceSummaryItem>
            <PriceSummaryItem label="Shipping" tone="success">
              Free
            </PriceSummaryItem>
            <PriceSummaryItem label="Tax" tone="muted">
              $6.00
            </PriceSummaryItem>
            <PriceSummaryTotal>$142.00</PriceSummaryTotal>
          </PriceSummaryList>
        </CheckoutSummaryTotals>
      </CheckoutSummary>
    </Checkout>
  );
}
