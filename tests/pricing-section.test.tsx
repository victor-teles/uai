import { expect, mock, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PricingToggleList,
  PricingToggleOption,
  PricingTogglePrice,
} from "@/components/ui/uai/pricing-toggle";
import {
  PRICING_SECTION_VARIANTS,
  PricingSection,
  PricingSectionHeader,
  PricingSectionPlan,
  PricingSectionPlanAction,
  PricingSectionPlanFeature,
  PricingSectionPlanFeatures,
  PricingSectionPlanName,
  PricingSectionPlanPrice,
  PricingSectionPlans,
  type PricingSectionProps,
  PricingSectionTitle,
} from "@/registry/uai/blocks/pricing-section";

function Fixture(props: PricingSectionProps) {
  return (
    <PricingSection defaultValue="monthly" {...props}>
      <PricingSectionHeader>
        <PricingSectionTitle>Plans</PricingSectionTitle>
        <PricingToggleList aria-label="Billing period">
          <PricingToggleOption value="monthly">Monthly</PricingToggleOption>
          <PricingToggleOption value="yearly">Yearly</PricingToggleOption>
        </PricingToggleList>
      </PricingSectionHeader>
      <PricingSectionPlans>
        <PricingSectionPlan>
          <PricingSectionPlanName>Crew</PricingSectionPlanName>
          <PricingSectionPlanPrice>
            <PricingTogglePrice period="monthly">$18</PricingTogglePrice>
            <PricingTogglePrice period="yearly">$15</PricingTogglePrice>
          </PricingSectionPlanPrice>
          <PricingSectionPlanFeatures>
            <PricingSectionPlanFeature>5 seats</PricingSectionPlanFeature>
            <PricingSectionPlanFeature included={false}>Routing rules</PricingSectionPlanFeature>
          </PricingSectionPlanFeatures>
          <PricingSectionPlanAction href="#crew">Choose Crew</PricingSectionPlanAction>
        </PricingSectionPlan>
        <PricingSectionPlan featured>
          <PricingSectionPlanName>Operations</PricingSectionPlanName>
          <PricingSectionPlanAction href="#ops">Choose Operations</PricingSectionPlanAction>
        </PricingSectionPlan>
      </PricingSectionPlans>
    </PricingSection>
  );
}

test("switches billing period with the keyboard and updates every plan price", async () => {
  const user = userEvent.setup();
  const onValueChange = mock();
  render(<Fixture onValueChange={onValueChange} />);
  const plan = screen.getByRole("listitem", { name: "Crew" });
  expect(within(plan).getByText("$18")).toBeTruthy();
  screen.getByRole("radio", { name: "Monthly" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(onValueChange).toHaveBeenCalledWith("yearly");
  expect(screen.getByRole("radio", { name: "Yearly" }).getAttribute("aria-checked")).toBe("true");
  expect(within(plan).getByText("$15")).toBeTruthy();
  expect(within(plan).queryByText("$18")).toBeNull();
});

test("names plans, states excluded limits in text, and marks the featured plan", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Plans" })).toBeTruthy();
  const crew = screen.getByRole("listitem", { name: "Crew" });
  expect(within(crew).getByText("Routing rules").closest("li")?.textContent).toBe(
    "Not included: Routing rules",
  );
  const featured = screen.getByRole("listitem", { name: "Operations" });
  expect(featured.dataset.featured).toBe("true");
  expect(within(featured).getByRole("link", { name: "Choose Operations" })).toBeTruthy();
});

test("renders every variant and guards regions", () => {
  for (const variant of PRICING_SECTION_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    view.unmount();
  }
  expect(() => render(<PricingSectionPlans />)).toThrow(
    "PricingSectionPlans must be used within PricingSection",
  );
  expect(() =>
    render(
      <PricingSection>
        <PricingSectionPlanAction />
      </PricingSection>,
    ),
  ).toThrow("PricingSectionPlanAction must be used within PricingSectionPlan");
});
