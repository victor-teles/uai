import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import { StepIndicatorTitle } from "@/components/ui/uai/step-indicator";
import {
  ONBOARDING_WIZARD_VARIANTS,
  OnboardingWizard,
  OnboardingWizardBack,
  OnboardingWizardBody,
  OnboardingWizardComplete,
  OnboardingWizardError,
  OnboardingWizardFinish,
  OnboardingWizardFooter,
  OnboardingWizardNext,
  OnboardingWizardPanel,
  OnboardingWizardPanelTitle,
  OnboardingWizardProgress,
  OnboardingWizardProgressStep,
  type OnboardingWizardProps,
  OnboardingWizardSkip,
  OnboardingWizardStepCount,
  OnboardingWizardTitle,
} from "@/registry/uai/blocks/onboarding-wizard";

function Fixture({
  validate,
  ...props
}: Partial<OnboardingWizardProps> & { validate?: () => string | null }) {
  return (
    <OnboardingWizard {...props}>
      <OnboardingWizardTitle>Set up</OnboardingWizardTitle>
      <OnboardingWizardStepCount />
      <OnboardingWizardProgress>
        <OnboardingWizardProgressStep value="profile">
          <StepIndicatorTitle>Profile</StepIndicatorTitle>
        </OnboardingWizardProgressStep>
        <OnboardingWizardProgressStep value="team">
          <StepIndicatorTitle>Team</StepIndicatorTitle>
        </OnboardingWizardProgressStep>
        <OnboardingWizardProgressStep value="calendar">
          <StepIndicatorTitle>Calendar</StepIndicatorTitle>
        </OnboardingWizardProgressStep>
      </OnboardingWizardProgress>
      <OnboardingWizardBody>
        <OnboardingWizardPanel value="profile">
          <OnboardingWizardPanelTitle>About you</OnboardingWizardPanelTitle>
          <FormField required>
            <FormFieldLabel>Full name</FormFieldLabel>
            <FormFieldInput />
          </FormField>
        </OnboardingWizardPanel>
        <OnboardingWizardPanel value="team" validate={validate}>
          <OnboardingWizardPanelTitle>Your team</OnboardingWizardPanelTitle>
        </OnboardingWizardPanel>
        <OnboardingWizardPanel value="calendar" optional>
          <OnboardingWizardPanelTitle>Calendar</OnboardingWizardPanelTitle>
        </OnboardingWizardPanel>
        <OnboardingWizardError />
        <OnboardingWizardComplete>All set</OnboardingWizardComplete>
        <OnboardingWizardFooter>
          <OnboardingWizardBack>Back</OnboardingWizardBack>
          <OnboardingWizardSkip>Skip</OnboardingWizardSkip>
          <OnboardingWizardNext>Continue</OnboardingWizardNext>
          <OnboardingWizardFinish>Finish</OnboardingWizardFinish>
        </OnboardingWizardFooter>
      </OnboardingWizardBody>
    </OnboardingWizard>
  );
}

test("blocks on native validation, then advances and moves focus to the new step", async () => {
  const user = userEvent.setup();
  const onValueChange = mock();
  render(<Fixture onValueChange={onValueChange} />);
  expect(screen.getByText("Step 1 of 3")).toBeTruthy();
  expect(screen.getByRole("group", { name: "About you" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByLabelText(/Full name/));
  expect(document.querySelector('[aria-current="step"]')?.textContent).toContain("Profile");
  await user.type(screen.getByLabelText(/Full name/), "Marta");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(onValueChange).toHaveBeenCalledWith("team");
  expect(screen.getByText("Step 2 of 3")).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Your team" }));
  expect(screen.queryByRole("alert")).toBeNull();
});

test("runs custom validation and lets reached steps be revisited", async () => {
  const user = userEvent.setup();
  let message: string | null = "Add at least one teammate.";
  render(<Fixture defaultValue="team" validate={() => message} />);
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByRole("alert").textContent).toContain("Add at least one teammate.");
  message = null;
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByRole("heading", { name: "Calendar" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Profile" }));
  expect(screen.getByRole("heading", { name: "About you" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Calendar" })).toBeTruthy();
});

test("skips optional steps and completes through onComplete", async () => {
  const user = userEvent.setup();
  const onComplete = mock(async () => {});
  render(<Fixture value="calendar" onComplete={onComplete} />);
  expect(screen.queryByRole("button", { name: "Continue" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Skip" }));
  expect(onComplete).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("All set"));
  expect(document.activeElement).toBe(screen.getByRole("status"));
  expect(screen.queryByRole("button", { name: "Finish" })).toBeNull();
});

test("shows completion errors from onComplete", async () => {
  const user = userEvent.setup();
  render(
    <Fixture
      defaultValue="calendar"
      onComplete={async () => {
        throw new Error("Calendar sync is unavailable.");
      }}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Finish" }));
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain("Calendar sync is unavailable."),
  );
});

test("maps variants onto the step indicator and guards its regions", () => {
  const indicator = { sidebar: "vertical", stacked: "horizontal", compact: "compact" };
  for (const variant of ONBOARDING_WIZARD_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    expect(view.container.querySelector("ol")?.dataset.variant).toBe(indicator[variant]);
    view.unmount();
  }
  expect(() => render(<OnboardingWizardNext />)).toThrow(
    "OnboardingWizardNext must be used within OnboardingWizard",
  );
});
