"use client";

import { useState } from "react";
import {
  PricingSection,
  PricingSectionDescription,
  PricingSectionFootnote,
  PricingSectionHeader,
  PricingSectionPlan,
  PricingSectionPlanAction,
  PricingSectionPlanBadge,
  PricingSectionPlanDescription,
  PricingSectionPlanFeature,
  PricingSectionPlanFeatures,
  PricingSectionPlanName,
  PricingSectionPlanPeriod,
  PricingSectionPlanPrice,
  PricingSectionPlans,
  PricingSectionTitle,
  type PricingSectionVariant,
} from "@/components/uai/pricing-section";
import {
  PricingToggleList,
  PricingToggleOption,
  PricingTogglePrice,
  PricingToggleSavings,
} from "@/components/ui/uai/pricing-toggle";

const plans = [
  {
    name: "Crew",
    monthly: 18,
    yearly: 15,
    note: "For one team answering its own requests.",
    features: [
      { label: "Up to 5 seats", included: true },
      { label: "2 shared inboxes", included: true },
      { label: "Text arrival updates", included: true },
      { label: "Routing rules", included: false },
    ],
  },
  {
    name: "Operations",
    monthly: 32,
    yearly: 26,
    note: "For dispatchers coordinating several crews.",
    featured: true,
    features: [
      { label: "Up to 50 seats", included: true },
      { label: "Unlimited inboxes", included: true },
      { label: "Routing rules and travel-time scheduling", included: true },
      { label: "Single sign-on", included: false },
    ],
  },
  {
    name: "Enterprise",
    monthly: 54,
    yearly: 45,
    note: "For regional companies with audit needs.",
    features: [
      { label: "Unlimited seats", included: true },
      { label: "Single sign-on and SCIM", included: true },
      { label: "Audit log retention for 2 years", included: true },
      { label: "Named support manager", included: true },
    ],
  },
];

export function PricingSectionPreview({ variant = "cards" }: { variant?: PricingSectionVariant }) {
  const [period, setPeriod] = useState("yearly");
  return (
    <PricingSection variant={variant} value={period} onValueChange={setPeriod}>
      <PricingSectionHeader>
        <PricingSectionTitle>Pay for the crews you dispatch</PricingSectionTitle>
        <PricingSectionDescription>
          Every plan includes the shared inbox and customer updates. Change plans at any time.
        </PricingSectionDescription>
        <PricingToggleList aria-label="Billing period">
          <PricingToggleOption value="monthly">Monthly</PricingToggleOption>
          <PricingToggleOption value="yearly">
            Yearly <PricingToggleSavings>Save 18%</PricingToggleSavings>
          </PricingToggleOption>
        </PricingToggleList>
      </PricingSectionHeader>
      <PricingSectionPlans>
        {plans.map((plan) => (
          <PricingSectionPlan key={plan.name} featured={plan.featured}>
            <PricingSectionPlanName>
              {plan.name}
              {plan.featured ? (
                <PricingSectionPlanBadge>Most popular</PricingSectionPlanBadge>
              ) : null}
            </PricingSectionPlanName>
            <PricingSectionPlanPrice>
              <PricingTogglePrice period="monthly">${plan.monthly}</PricingTogglePrice>
              <PricingTogglePrice period="yearly">${plan.yearly}</PricingTogglePrice>
              <PricingSectionPlanPeriod>per seat / month</PricingSectionPlanPeriod>
            </PricingSectionPlanPrice>
            <PricingSectionPlanDescription>{plan.note}</PricingSectionPlanDescription>
            <PricingSectionPlanFeatures>
              {plan.features.map((feature) => (
                <PricingSectionPlanFeature key={feature.label} included={feature.included}>
                  {feature.label}
                </PricingSectionPlanFeature>
              ))}
            </PricingSectionPlanFeatures>
            <PricingSectionPlanAction href={`#checkout-${plan.name.toLowerCase()}`}>
              {plan.name === "Enterprise" ? "Talk to sales" : `Choose ${plan.name}`}
            </PricingSectionPlanAction>
          </PricingSectionPlan>
        ))}
      </PricingSectionPlans>
      <PricingSectionFootnote>
        Prices in US dollars, before tax. Yearly plans are billed once and renew annually.
      </PricingSectionFootnote>
    </PricingSection>
  );
}
