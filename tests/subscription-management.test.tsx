import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import {
  PricingToggleList,
  PricingToggleOption,
  PricingTogglePrice,
} from "@/components/ui/uai/pricing-toggle";
import {
  SUBSCRIPTION_MANAGEMENT_VARIANTS,
  SubscriptionManagement,
  SubscriptionManagementCancel,
  SubscriptionManagementMeter,
  SubscriptionManagementPanel,
  SubscriptionManagementPlanOption,
  SubscriptionManagementPlanOptions,
  SubscriptionManagementPlanSubmit,
  SubscriptionManagementPlans,
  type SubscriptionManagementProps,
  SubscriptionManagementTitle,
} from "@/registry/uai/blocks/subscription-management";

function Fixture({
  onPlanChange,
  onCancel,
  ...props
}: SubscriptionManagementProps & {
  onPlanChange?: (plan: string, period: string) => void;
  onCancel?: () => void;
}) {
  return (
    <SubscriptionManagement {...props}>
      <SubscriptionManagementTitle>Subscription</SubscriptionManagementTitle>
      <SubscriptionManagementPanel title="Change plan">
        <SubscriptionManagementPlans
          currentPlan="studio"
          defaultPeriod="monthly"
          onPlanChange={onPlanChange}
        >
          <PricingToggleList aria-label="Billing period">
            <PricingToggleOption value="monthly">Monthly</PricingToggleOption>
            <PricingToggleOption value="yearly">Yearly</PricingToggleOption>
          </PricingToggleList>
          <SubscriptionManagementPlanOptions>
            <SubscriptionManagementPlanOption value="starter">
              Starter
              <PricingTogglePrice period="monthly">$12</PricingTogglePrice>
              <PricingTogglePrice period="yearly">$10</PricingTogglePrice>
            </SubscriptionManagementPlanOption>
            <SubscriptionManagementPlanOption value="studio">
              Studio
            </SubscriptionManagementPlanOption>
          </SubscriptionManagementPlanOptions>
          <SubscriptionManagementPlanSubmit />
        </SubscriptionManagementPlans>
      </SubscriptionManagementPanel>
      <SubscriptionManagementMeter label="Seats" value={8} max={10} valueText="8 of 10" />
      <SubscriptionManagementCancel>
        <ConfirmationDialogTrigger>Cancel subscription</ConfirmationDialogTrigger>
        <ConfirmationDialogContent>
          <ConfirmationDialogTitle>Cancel the Studio plan?</ConfirmationDialogTitle>
          <ConfirmationDialogActions>
            <ConfirmationDialogCancel>Keep plan</ConfirmationDialogCancel>
            <ConfirmationDialogConfirm onClick={onCancel}>Cancel plan</ConfirmationDialogConfirm>
          </ConfirmationDialogActions>
        </ConfirmationDialogContent>
      </SubscriptionManagementCancel>
    </SubscriptionManagement>
  );
}

test("changes plan and billing period with the keyboard", async () => {
  const user = userEvent.setup();
  const onPlanChange = mock();
  render(<Fixture onPlanChange={onPlanChange} />);
  expect(screen.getByRole("region", { name: "Subscription" })).toBeTruthy();
  const submit = screen.getByRole("button", { name: "Change plan" }) as HTMLButtonElement;
  const studio = screen.getByRole("radio", { name: /Studio/ });
  expect(studio.getAttribute("aria-checked")).toBe("true");
  expect(studio.closest("label")?.textContent).toContain("Current plan");
  expect(submit.disabled).toBe(true);
  expect(screen.getByText("$12")).toBeTruthy();
  screen.getByRole("radio", { name: "Monthly" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByText("$10")).toBeTruthy();
  await user.click(screen.getByRole("radio", { name: /Starter/ }));
  expect(submit.disabled).toBe(false);
  await user.click(submit);
  expect(onPlanChange).toHaveBeenCalledWith("starter", "yearly");
});

test("exposes usage as a meter and confirms cancellation in a dialog", async () => {
  const user = userEvent.setup();
  const onCancel = mock();
  render(<Fixture onCancel={onCancel} />);
  const meter = screen.getByRole("meter", { name: "Seats" });
  expect(meter.getAttribute("aria-valuenow")).toBe("8");
  expect(meter.getAttribute("aria-valuetext")).toBe("8 of 10");
  expect(meter.dataset.nearLimit).toBe("true");
  await user.click(screen.getByRole("button", { name: "Cancel subscription" }));
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Keep plan" }));
  await user.click(screen.getByRole("button", { name: "Cancel plan" }));
  expect(onCancel).toHaveBeenCalledTimes(1);
});

test("renders every variant and guards regions", () => {
  const dialogs = { split: "centered", stacked: "sheet", compact: "compact" };
  for (const variant of SUBSCRIPTION_MANAGEMENT_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    expect(view.container.querySelector(`[data-variant="${dialogs[variant]}"]`)).toBeTruthy();
    view.unmount();
  }
  expect(() => render(<SubscriptionManagementPanel title="x" />)).toThrow(
    "SubscriptionManagementPanel must be used within SubscriptionManagement",
  );
  expect(() =>
    render(
      <SubscriptionManagement>
        <SubscriptionManagementPlanSubmit />
      </SubscriptionManagement>,
    ),
  ).toThrow("SubscriptionManagementPlanSubmit must be used within SubscriptionManagementPlans");
});
