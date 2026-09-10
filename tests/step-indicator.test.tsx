import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import {
  STEP_INDICATOR_VARIANTS,
  StepIndicator,
  type StepIndicatorStatus,
  StepIndicatorStep,
  StepIndicatorTitle,
} from "@/registry/uai/components/step-indicator";

test("retains ordered steps and makes every status and optional state explicit", () => {
  const statuses: StepIndicatorStatus[] = ["complete", "current", "upcoming", "blocked", "error"];
  render(
    <StepIndicator>
      {statuses.map((status) => (
        <StepIndicatorStep key={status} status={status} optional={status === "blocked"}>
          <StepIndicatorTitle>{status} step</StepIndicatorTitle>
        </StepIndicatorStep>
      ))}
    </StepIndicator>,
  );
  expect(screen.getByRole("list").tagName).toBe("OL");
  expect(
    screen.getAllByRole("listitem").filter((item) => item.getAttribute("aria-current") === "step"),
  ).toHaveLength(1);
  expect(screen.getByText("Blocked · Optional")).toBeDefined();
  expect(screen.getByText("Error")).toBeDefined();
});
test("renders all step layouts and guards state-dependent children", () => {
  for (const variant of STEP_INDICATOR_VARIANTS) {
    const view = render(
      <StepIndicator variant={variant}>
        <StepIndicatorStep>Details</StepIndicatorStep>
      </StepIndicator>,
    );
    expect(screen.getByRole("list").getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<StepIndicatorStep />)).toThrow("within StepIndicator");
});
