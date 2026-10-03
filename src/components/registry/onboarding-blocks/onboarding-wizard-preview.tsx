"use client";

import { useState } from "react";
import {
  OnboardingWizard,
  OnboardingWizardBack,
  OnboardingWizardBody,
  OnboardingWizardComplete,
  OnboardingWizardDescription,
  OnboardingWizardError,
  OnboardingWizardFinish,
  OnboardingWizardFooter,
  OnboardingWizardHeader,
  OnboardingWizardNext,
  OnboardingWizardPanel,
  OnboardingWizardPanelDescription,
  OnboardingWizardPanelTitle,
  OnboardingWizardProgress,
  OnboardingWizardProgressStep,
  OnboardingWizardSkip,
  OnboardingWizardStepCount,
  OnboardingWizardTitle,
  type OnboardingWizardVariant,
} from "@/components/uai/onboarding-wizard";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import { StatusBannerTitle } from "@/components/ui/uai/status-banner";
import { StepIndicatorDescription, StepIndicatorTitle } from "@/components/ui/uai/step-indicator";

export function OnboardingWizardPreview({
  variant = "sidebar",
}: {
  variant?: OnboardingWizardVariant;
}) {
  // Persist this value (for example per account) to resume setup later.
  const [step, setStep] = useState("profile");
  const [stops, setStops] = useState("");
  return (
    <OnboardingWizard
      variant={variant}
      value={step}
      onValueChange={setStep}
      onComplete={() => new Promise((resolve) => setTimeout(resolve, 600))}
    >
      <OnboardingWizardHeader>
        <OnboardingWizardStepCount />
        <OnboardingWizardTitle>Set up Ferrow Routes</OnboardingWizardTitle>
        <OnboardingWizardDescription>
          Your progress is saved after each step, so you can finish later.
        </OnboardingWizardDescription>
      </OnboardingWizardHeader>
      <OnboardingWizardProgress>
        <OnboardingWizardProgressStep value="profile">
          <StepIndicatorTitle>Your profile</StepIndicatorTitle>
          <StepIndicatorDescription>Name and role</StepIndicatorDescription>
        </OnboardingWizardProgressStep>
        <OnboardingWizardProgressStep value="routes">
          <StepIndicatorTitle>Daily routes</StepIndicatorTitle>
          <StepIndicatorDescription>Stops and depot</StepIndicatorDescription>
        </OnboardingWizardProgressStep>
        <OnboardingWizardProgressStep value="calendar">
          <StepIndicatorTitle>Calendar</StepIndicatorTitle>
          <StepIndicatorDescription>Sync bookings</StepIndicatorDescription>
        </OnboardingWizardProgressStep>
      </OnboardingWizardProgress>
      <OnboardingWizardBody>
        <OnboardingWizardPanel value="profile">
          <OnboardingWizardPanelTitle>Tell us about you</OnboardingWizardPanelTitle>
          <FormField variant="compact" required>
            <FormFieldLabel>Full name</FormFieldLabel>
            <FormFieldInput name="name" autoComplete="name" placeholder="Marta Okafor" />
          </FormField>
          <FormField variant="compact">
            <FormFieldLabel>Role</FormFieldLabel>
            <FormFieldInput
              name="role"
              autoComplete="organization-title"
              placeholder="Dispatcher"
            />
          </FormField>
        </OnboardingWizardPanel>
        <OnboardingWizardPanel
          value="routes"
          validate={() =>
            Number(stops) > 0 ? null : "Enter how many stops your crews make on a typical day."
          }
        >
          <OnboardingWizardPanelTitle>Plan your daily routes</OnboardingWizardPanelTitle>
          <OnboardingWizardPanelDescription>
            We use this to size your first schedule. You can change it later.
          </OnboardingWizardPanelDescription>
          <FormField variant="compact" value={stops} onValueChange={setStops}>
            <FormFieldLabel>Stops per day</FormFieldLabel>
            <FormFieldInput name="stops" inputMode="numeric" placeholder="24" />
          </FormField>
          <FormField variant="compact">
            <FormFieldLabel>Depot address</FormFieldLabel>
            <FormFieldInput name="depot" autoComplete="street-address" placeholder="18 Mill Lane" />
          </FormField>
        </OnboardingWizardPanel>
        <OnboardingWizardPanel value="calendar" optional>
          <OnboardingWizardPanelTitle>Connect a calendar</OnboardingWizardPanelTitle>
          <OnboardingWizardPanelDescription>
            Bookings from a shared calendar become stops automatically.
          </OnboardingWizardPanelDescription>
          <FormField variant="compact">
            <FormFieldLabel>Calendar address</FormFieldLabel>
            <FormFieldInput name="calendar" type="email" placeholder="bookings@larkspur.example" />
          </FormField>
        </OnboardingWizardPanel>
        <OnboardingWizardError>
          <StatusBannerTitle>Check this step</StatusBannerTitle>
        </OnboardingWizardError>
        <OnboardingWizardComplete>
          <strong>You’re all set</strong>
          <span style={{ color: "var(--uai-muted)" }}>
            Your first schedule is ready in Ferrow Routes.
          </span>
        </OnboardingWizardComplete>
        <OnboardingWizardFooter>
          <OnboardingWizardBack>Back</OnboardingWizardBack>
          <OnboardingWizardSkip>Skip for now</OnboardingWizardSkip>
          <OnboardingWizardNext>Continue</OnboardingWizardNext>
          <OnboardingWizardFinish>Finish setup</OnboardingWizardFinish>
        </OnboardingWizardFooter>
      </OnboardingWizardBody>
    </OnboardingWizard>
  );
}
