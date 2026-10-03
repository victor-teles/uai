import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PRICING_TOGGLE_VARIANTS,
  PricingToggle,
  PricingToggleList,
  PricingToggleOption,
  PricingTogglePrice,
  type PricingToggleProps,
  PricingToggleSavings,
  usePricingPeriod,
} from "@/registry/uai/components/pricing-toggle";

function Period() {
  return <output>{usePricingPeriod()}</output>;
}

function Fixture(props: PricingToggleProps) {
  return (
    <PricingToggle defaultValue="monthly" {...props}>
      <PricingToggleList aria-label="Billing period">
        <PricingToggleOption value="monthly">Monthly</PricingToggleOption>
        <PricingToggleOption value="yearly">
          Yearly <PricingToggleSavings>Save 20%</PricingToggleSavings>
        </PricingToggleOption>
      </PricingToggleList>
      <p>
        <PricingTogglePrice period="monthly">$12</PricingTogglePrice>
        <PricingTogglePrice period="yearly">$10</PricingTogglePrice>
      </p>
      <Period />
    </PricingToggle>
  );
}

test("exposes a radio group with savings in the option name and per-period prices", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  expect(screen.getByRole("radiogroup", { name: "Billing period" })).toBeTruthy();
  const yearly = screen.getByRole("radio", { name: "Yearly Save 20%" });
  expect(screen.getByText("$12")).toBeTruthy();
  expect(screen.queryByText("$10")).toBeNull();
  await user.click(yearly);
  expect(yearly.getAttribute("aria-checked")).toBe("true");
  expect(screen.getByText("$10")).toBeTruthy();
  expect(screen.queryByText("$12")).toBeNull();
  expect(screen.getByRole("status").textContent).toBe("yearly");
});

test("uses one tab stop and arrow, Home, and End keys to select", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const [monthly, yearly] = screen.getAllByRole("radio") as [HTMLElement, HTMLElement];
  expect(monthly.tabIndex).toBe(0);
  expect(yearly.tabIndex).toBe(-1);
  await user.tab();
  expect(document.activeElement).toBe(monthly);
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(yearly);
  expect(yearly.getAttribute("aria-checked")).toBe("true");
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(monthly);
  await user.keyboard("{End}");
  expect(document.activeElement).toBe(yearly);
  await user.keyboard("{Home}");
  expect(monthly.getAttribute("aria-checked")).toBe("true");
});

test("respects a controlled value", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string) => {});
  render(<Fixture value="monthly" onValueChange={change} />);
  await user.click(screen.getByRole("radio", { name: /Yearly/ }));
  expect(change).toHaveBeenCalledWith("yearly");
  expect(screen.getByRole("radio", { name: "Monthly" }).getAttribute("aria-checked")).toBe("true");
});

test("renders every variant and guards compound children", () => {
  for (const variant of PRICING_TOGGLE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<PricingToggleOption value="monthly" />)).toThrow(
    "PricingToggleOption must be used within PricingToggle",
  );
  expect(() => render(<Period />)).toThrow("usePricingPeriod must be used within PricingToggle");
});
