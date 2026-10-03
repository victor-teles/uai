"use client";

import { useState } from "react";
import {
  PricingToggle,
  PricingToggleList,
  PricingToggleOption,
  PricingTogglePrice,
  PricingToggleSavings,
  type PricingToggleVariant,
} from "@/components/ui/uai/pricing-toggle";

const plans = [
  { name: "Starter", monthly: 12, yearly: 10, note: "For small teams getting organized." },
  { name: "Team", monthly: 24, yearly: 19, note: "Shared workspaces, roles, and audit history." },
];

export function PricingTogglePreview({
  variant = "segmented",
}: {
  variant?: PricingToggleVariant;
}) {
  const [period, setPeriod] = useState("yearly");
  return (
    <PricingToggle variant={variant} value={period} onValueChange={setPeriod}>
      <PricingToggleList aria-label="Billing period">
        <PricingToggleOption value="monthly">Monthly</PricingToggleOption>
        <PricingToggleOption value="yearly">
          Yearly <PricingToggleSavings>Save 20%</PricingToggleSavings>
        </PricingToggleOption>
      </PricingToggleList>
      <div
        aria-live="polite"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              display: "grid",
              alignContent: "start",
              gap: 6,
              padding: 16,
              border: "1px solid var(--uai-border)",
              borderRadius: 14,
              background: "var(--uai-surface)",
            }}
          >
            <strong style={{ fontWeight: 500 }}>{plan.name}</strong>
            <p
              style={{
                margin: 0,
                fontSize: 24,
                lineHeight: "28px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <PricingTogglePrice period="monthly">${plan.monthly}</PricingTogglePrice>
              <PricingTogglePrice period="yearly">${plan.yearly}</PricingTogglePrice>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  letterSpacing: 0,
                  color: "var(--uai-subtle)",
                }}
              >
                {" "}
                per seat / month
              </span>
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--uai-muted)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <PricingTogglePrice period="monthly">
                Billed monthly. Cancel anytime.
              </PricingTogglePrice>
              <PricingTogglePrice period="yearly">
                Billed ${plan.yearly * 12} yearly instead of ${plan.monthly * 12}.
              </PricingTogglePrice>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--uai-subtle)" }}>{plan.note}</p>
          </div>
        ))}
      </div>
    </PricingToggle>
  );
}
