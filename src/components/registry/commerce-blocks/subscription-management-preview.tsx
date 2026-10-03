"use client";

import { useState } from "react";
import {
  SubscriptionManagement,
  SubscriptionManagementCancel,
  SubscriptionManagementColumn,
  SubscriptionManagementDescription,
  SubscriptionManagementHeader,
  SubscriptionManagementMeter,
  SubscriptionManagementMeters,
  SubscriptionManagementPanel,
  SubscriptionManagementPayment,
  SubscriptionManagementPeriod,
  SubscriptionManagementPlanDetail,
  SubscriptionManagementPlanName,
  SubscriptionManagementPlanOption,
  SubscriptionManagementPlanOptions,
  SubscriptionManagementPlanSubmit,
  SubscriptionManagementPlans,
  SubscriptionManagementPrice,
  SubscriptionManagementRenewal,
  SubscriptionManagementStatus,
  SubscriptionManagementTitle,
  type SubscriptionManagementVariant,
} from "@/components/uai/subscription-management";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogImpact,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import {
  DescriptionListAction,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  PricingToggleList,
  PricingToggleOption,
  PricingTogglePrice,
  PricingToggleSavings,
} from "@/components/ui/uai/pricing-toggle";

const plans = [
  { id: "starter", name: "Starter", monthly: 12, yearly: 10, seats: "3 seats · 20 GB" },
  { id: "studio", name: "Studio", monthly: 29, yearly: 24, seats: "10 seats · 200 GB" },
  { id: "business", name: "Business", monthly: 59, yearly: 49, seats: "50 seats · 2 TB" },
];

export function SubscriptionManagementPreview({
  variant = "split",
}: {
  variant?: SubscriptionManagementVariant;
}) {
  const [current, setCurrent] = useState("studio");
  const [canceled, setCanceled] = useState(false);
  const plan = plans.find((item) => item.id === current) ?? plans[1];
  return (
    <SubscriptionManagement variant={variant}>
      <SubscriptionManagementHeader>
        <SubscriptionManagementTitle>Subscription</SubscriptionManagementTitle>
        <SubscriptionManagementDescription>
          Ledgerly workspace · billed to finance@harborpine.example
        </SubscriptionManagementDescription>
      </SubscriptionManagementHeader>
      <SubscriptionManagementColumn>
        <SubscriptionManagementPanel
          title={`${plan?.name} plan`}
          aside={
            <SubscriptionManagementStatus tone={canceled ? "canceled" : "active"}>
              {canceled ? "Ends Nov 1" : "Active"}
            </SubscriptionManagementStatus>
          }
        >
          <SubscriptionManagementPrice>
            ${plan?.monthly}
            <SubscriptionManagementPeriod>per month</SubscriptionManagementPeriod>
          </SubscriptionManagementPrice>
          <SubscriptionManagementRenewal>
            {canceled
              ? "Your plan stays active until Nov 1, 2026, then the workspace becomes read-only."
              : `Renews on Nov 1, 2026 for $${plan?.monthly}.00 plus tax.`}
          </SubscriptionManagementRenewal>
        </SubscriptionManagementPanel>
        <SubscriptionManagementPanel title="Change plan">
          <SubscriptionManagementPlans
            key={current}
            currentPlan={current}
            defaultPeriod="monthly"
            onPlanChange={(next) => setCurrent(next)}
          >
            <PricingToggleList aria-label="Billing period">
              <PricingToggleOption value="monthly">Monthly</PricingToggleOption>
              <PricingToggleOption value="yearly">
                Yearly <PricingToggleSavings>Save 17%</PricingToggleSavings>
              </PricingToggleOption>
            </PricingToggleList>
            <SubscriptionManagementPlanOptions>
              {plans.map((item) => (
                <SubscriptionManagementPlanOption key={item.id} value={item.id}>
                  <SubscriptionManagementPlanName>{item.name}</SubscriptionManagementPlanName>
                  <SubscriptionManagementPlanDetail>
                    <PricingTogglePrice period="monthly">
                      ${item.monthly} / month
                    </PricingTogglePrice>
                    <PricingTogglePrice period="yearly">
                      ${item.yearly} / month, billed yearly
                    </PricingTogglePrice>
                  </SubscriptionManagementPlanDetail>
                  <SubscriptionManagementPlanDetail>{item.seats}</SubscriptionManagementPlanDetail>
                </SubscriptionManagementPlanOption>
              ))}
            </SubscriptionManagementPlanOptions>
            <SubscriptionManagementPlanSubmit />
          </SubscriptionManagementPlans>
        </SubscriptionManagementPanel>
      </SubscriptionManagementColumn>
      <SubscriptionManagementColumn>
        <SubscriptionManagementPanel title="Usage this period">
          <SubscriptionManagementMeters>
            <SubscriptionManagementMeter label="Seats" value={8} max={10} valueText="8 of 10" />
            <SubscriptionManagementMeter
              label="Storage"
              value={64}
              max={200}
              valueText="64 of 200 GB"
            />
          </SubscriptionManagementMeters>
        </SubscriptionManagementPanel>
        <SubscriptionManagementPanel title="Payment">
          <SubscriptionManagementPayment>
            <DescriptionListItem>
              <DescriptionListTerm>Method</DescriptionListTerm>
              <DescriptionListDetails>
                Visa ending in 4242
                <DescriptionListAction aria-label="Update payment method">
                  Update
                </DescriptionListAction>
              </DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Next invoice</DescriptionListTerm>
              <DescriptionListDetails>
                {canceled ? "No further invoices" : `Nov 1, 2026 · $${plan?.monthly}.00 plus tax`}
              </DescriptionListDetails>
            </DescriptionListItem>
          </SubscriptionManagementPayment>
        </SubscriptionManagementPanel>
        {canceled ? null : (
          <SubscriptionManagementPanel title="Cancel subscription">
            <SubscriptionManagementRenewal>
              You keep access until the end of the billing period. Data is kept for 90 days.
            </SubscriptionManagementRenewal>
            <SubscriptionManagementCancel>
              <ConfirmationDialogTrigger style={{ justifySelf: "start" }}>
                Cancel subscription
              </ConfirmationDialogTrigger>
              <ConfirmationDialogContent>
                <ConfirmationDialogTitle>Cancel the {plan?.name} plan?</ConfirmationDialogTitle>
                <ConfirmationDialogDescription>
                  <p style={{ margin: 0 }}>On Nov 1, 2026 the workspace becomes read-only:</p>
                  <ConfirmationDialogImpact>
                    <li>8 members lose edit access</li>
                    <li>Scheduled exports stop</li>
                  </ConfirmationDialogImpact>
                </ConfirmationDialogDescription>
                <ConfirmationDialogActions>
                  <ConfirmationDialogCancel>Keep plan</ConfirmationDialogCancel>
                  <ConfirmationDialogConfirm onClick={() => setCanceled(true)}>
                    Cancel subscription
                  </ConfirmationDialogConfirm>
                </ConfirmationDialogActions>
              </ConfirmationDialogContent>
            </SubscriptionManagementCancel>
          </SubscriptionManagementPanel>
        )}
      </SubscriptionManagementColumn>
    </SubscriptionManagement>
  );
}
