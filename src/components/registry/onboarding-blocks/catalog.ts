import { Building2, ListChecks, ShieldCheck } from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type OnboardingBlocksItemId = "code-verification" | "onboarding-wizard" | "workspace-setup";

export const onboardingBlocksCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "code-verification",
    name: "Code Verification",
    category: "Authentication",
    icon: ShieldCheck,
    description: "One-time code entry with paste, resend timing, errors, and alternate methods.",
    usage: `"use client";

import {
  CodeVerification,
  CodeVerificationAlternative,
  CodeVerificationAlternatives,
  CodeVerificationDescription,
  CodeVerificationDestination,
  CodeVerificationForm,
  CodeVerificationHeader,
  CodeVerificationInput,
  CodeVerificationMessage,
  CodeVerificationResend,
  CodeVerificationResendButton,
  CodeVerificationSubmit,
  CodeVerificationTitle,
  type CodeVerificationVariant,
} from "@/components/uai/code-verification";
import { InlineFeedbackMessage, InlineFeedbackStatus } from "@/components/ui/uai/inline-feedback";
import { StatusBannerDescription, StatusBannerTitle } from "@/components/ui/uai/status-banner";

async function checkCode(code: string) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (code === "000000") return "expired" as const;
  return code === "482913" ? ("success" as const) : ("invalid" as const);
}

async function sendNewCode() {
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export function CodeVerificationPreview({
  variant = "card",
}: {
  variant?: CodeVerificationVariant;
}) {
  return (
    <CodeVerification
      variant={variant}
      onVerify={checkCode}
      onResend={sendNewCode}
      resendAfter={30}
    >
      <CodeVerificationHeader>
        <CodeVerificationTitle>Check your email</CodeVerificationTitle>
        <CodeVerificationDescription>
          We sent a 6-digit code to{" "}
          <CodeVerificationDestination>marta@larkspur.example</CodeVerificationDestination>. It
          expires in 10 minutes. Try 482913, or 000000 for an expired code.
        </CodeVerificationDescription>
      </CodeVerificationHeader>
      <CodeVerificationForm>
        <CodeVerificationInput label="6-digit code" />
        <CodeVerificationMessage status="invalid">
          <StatusBannerTitle>That code doesn’t match</StatusBannerTitle>
          <StatusBannerDescription>Check the latest email and try again.</StatusBannerDescription>
        </CodeVerificationMessage>
        <CodeVerificationMessage status="expired">
          <StatusBannerTitle>This code has expired</StatusBannerTitle>
          <StatusBannerDescription>Request a new code to continue.</StatusBannerDescription>
        </CodeVerificationMessage>
        <CodeVerificationMessage status="verified">
          <StatusBannerTitle>Email verified</StatusBannerTitle>
          <StatusBannerDescription>Taking you to your workspace…</StatusBannerDescription>
        </CodeVerificationMessage>
        <CodeVerificationSubmit>Verify email</CodeVerificationSubmit>
        <CodeVerificationResend>
          <CodeVerificationResendButton>Resend code</CodeVerificationResendButton>
          <InlineFeedbackStatus>
            <InlineFeedbackMessage status="success">New code sent</InlineFeedbackMessage>
            <InlineFeedbackMessage status="error">Couldn’t send. Try again.</InlineFeedbackMessage>
          </InlineFeedbackStatus>
        </CodeVerificationResend>
        <CodeVerificationAlternatives>
          <span>Can’t get the email?</span>
          <CodeVerificationAlternative>Text me instead</CodeVerificationAlternative>
          <CodeVerificationAlternative>Use a backup code</CodeVerificationAlternative>
        </CodeVerificationAlternatives>
      </CodeVerificationForm>
    </CodeVerification>
  );
}
`,
    accessibility: [
      'Each box is a labelled input inside a named group; the first carries autocomplete="one-time-code" so browsers and phones can autofill the whole code.',
      "Typing advances, Backspace steps back, Left, Right, Home, and End move between boxes, and pasting fills every box at once.",
      "Invalid and expired codes mark the boxes with aria-invalid, render as an alert Status Banner, and return focus to the first box.",
      "The resend button stays disabled during the countdown and shows the remaining time in text; its result is announced through Inline Feedback.",
    ],
  },
  {
    id: "onboarding-wizard",
    name: "Onboarding Wizard",
    category: "Authentication",
    icon: ListChecks,
    description: "Resumable setup steps with validation, progress, optional steps, and completion.",
    usage: `"use client";

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
`,
    accessibility: [
      'Progress renders as a Step Indicator list; the current step carries aria-current="step" and every status is spoken in text, not color.',
      "Each step is a fieldset named by its heading; focus moves to the new heading when the step changes, and the step count is announced politely.",
      "Continue runs native field validation first, focuses the first invalid field, and shows the message in an alert Status Banner.",
      "Reached steps become buttons in the progress list, so keyboard users can return to earlier answers without losing them.",
    ],
  },
  {
    id: "workspace-setup",
    name: "Workspace Setup",
    category: "Authentication",
    icon: Building2,
    description: "Create a workspace, invite teammates, and choose initial settings.",
    usage: `"use client";

import {
  WorkspaceSetup,
  WorkspaceSetupActions,
  WorkspaceSetupChoice,
  WorkspaceSetupChoiceDescription,
  WorkspaceSetupChoiceLabel,
  WorkspaceSetupCreated,
  WorkspaceSetupDescription,
  WorkspaceSetupError,
  WorkspaceSetupHeader,
  WorkspaceSetupInvite,
  WorkspaceSetupInviteAdd,
  WorkspaceSetupInviteError,
  WorkspaceSetupInviteInput,
  WorkspaceSetupInviteList,
  WorkspaceSetupInviteRow,
  WorkspaceSetupMain,
  WorkspaceSetupName,
  WorkspaceSetupSection,
  WorkspaceSetupSectionDescription,
  WorkspaceSetupSectionTitle,
  WorkspaceSetupSubmit,
  WorkspaceSetupSummary,
  WorkspaceSetupSummaryTitle,
  WorkspaceSetupTitle,
  WorkspaceSetupUrl,
  WorkspaceSetupValue,
  type WorkspaceSetupValues,
  type WorkspaceSetupVariant,
} from "@/components/uai/workspace-setup";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  FormFieldDescription,
  FormFieldError,
  FormFieldInput,
  FormFieldLabel,
} from "@/components/ui/uai/form-field";
import { StatusBannerDescription, StatusBannerTitle } from "@/components/ui/uai/status-banner";

const takenUrls = new Set(["larkspur"]);

async function createWorkspace({ slug }: WorkspaceSetupValues) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (takenUrls.has(slug)) throw new Error("ferrow.app/larkspur is taken. Choose another URL.");
}

export function WorkspaceSetupPreview({ variant = "card" }: { variant?: WorkspaceSetupVariant }) {
  return (
    <WorkspaceSetup variant={variant} onCreate={createWorkspace}>
      <WorkspaceSetupHeader>
        <WorkspaceSetupTitle>Create your workspace</WorkspaceSetupTitle>
        <WorkspaceSetupDescription>
          A workspace holds your crews, routes, and customers. Try the name Larkspur to see a taken
          URL.
        </WorkspaceSetupDescription>
      </WorkspaceSetupHeader>
      <WorkspaceSetupMain>
        <WorkspaceSetupSection>
          <WorkspaceSetupSectionTitle>Details</WorkspaceSetupSectionTitle>
          <WorkspaceSetupName>
            <FormFieldLabel>Workspace name</FormFieldLabel>
            <FormFieldInput name="name" autoComplete="organization" placeholder="Larkspur Crews" />
            <FormFieldError>Enter a workspace name.</FormFieldError>
          </WorkspaceSetupName>
          <WorkspaceSetupUrl>
            <FormFieldLabel>Workspace URL</FormFieldLabel>
            <FormFieldInput name="slug" spellCheck={false} placeholder="larkspur-crews" />
            <FormFieldDescription>
              ferrow.app/<WorkspaceSetupValue field="slug">your-team</WorkspaceSetupValue>
            </FormFieldDescription>
            <FormFieldError>Use 3–40 lowercase letters, numbers, or hyphens.</FormFieldError>
          </WorkspaceSetupUrl>
        </WorkspaceSetupSection>
        <WorkspaceSetupSection>
          <WorkspaceSetupSectionTitle>Invite teammates</WorkspaceSetupSectionTitle>
          <WorkspaceSetupSectionDescription>
            Invitations are sent when the workspace is created.
          </WorkspaceSetupSectionDescription>
          <WorkspaceSetupInvite>
            <FormFieldLabel>Email addresses</FormFieldLabel>
            <WorkspaceSetupInviteRow>
              <WorkspaceSetupInviteInput placeholder="theo@larkspur.example" />
              <WorkspaceSetupInviteAdd>Add</WorkspaceSetupInviteAdd>
            </WorkspaceSetupInviteRow>
            <FormFieldDescription>Separate several addresses with commas.</FormFieldDescription>
            <WorkspaceSetupInviteError />
          </WorkspaceSetupInvite>
          <WorkspaceSetupInviteList>
            No one invited yet. You can do this later.
          </WorkspaceSetupInviteList>
        </WorkspaceSetupSection>
        <WorkspaceSetupSection>
          <WorkspaceSetupSectionTitle>Who can join</WorkspaceSetupSectionTitle>
          <WorkspaceSetupChoice name="access" value="invite" defaultChecked>
            <WorkspaceSetupChoiceLabel>Invite only</WorkspaceSetupChoiceLabel>
            <WorkspaceSetupChoiceDescription>
              People join when an admin invites them.
            </WorkspaceSetupChoiceDescription>
          </WorkspaceSetupChoice>
          <WorkspaceSetupChoice name="access" value="domain">
            <WorkspaceSetupChoiceLabel>Anyone at larkspur.example</WorkspaceSetupChoiceLabel>
            <WorkspaceSetupChoiceDescription>
              Colleagues with a verified work email can join without an invite.
            </WorkspaceSetupChoiceDescription>
          </WorkspaceSetupChoice>
          <WorkspaceSetupChoice type="checkbox" name="sample" value="yes" defaultChecked>
            <WorkspaceSetupChoiceLabel>Add sample routes</WorkspaceSetupChoiceLabel>
            <WorkspaceSetupChoiceDescription>
              Three example routes you can delete at any time.
            </WorkspaceSetupChoiceDescription>
          </WorkspaceSetupChoice>
        </WorkspaceSetupSection>
        <WorkspaceSetupError>
          <StatusBannerTitle>Workspace not created</StatusBannerTitle>
        </WorkspaceSetupError>
        <WorkspaceSetupCreated>
          <StatusBannerTitle>Workspace created</StatusBannerTitle>
          <StatusBannerDescription>Invitations are on their way.</StatusBannerDescription>
        </WorkspaceSetupCreated>
        <WorkspaceSetupActions>
          <WorkspaceSetupSubmit>Create workspace</WorkspaceSetupSubmit>
        </WorkspaceSetupActions>
      </WorkspaceSetupMain>
      <WorkspaceSetupSummary>
        <WorkspaceSetupSummaryTitle>Summary</WorkspaceSetupSummaryTitle>
        <DescriptionList variant="stacked">
          <DescriptionListItem>
            <DescriptionListTerm>Name</DescriptionListTerm>
            <DescriptionListDetails>
              <WorkspaceSetupValue field="name">Not set</WorkspaceSetupValue>
            </DescriptionListDetails>
          </DescriptionListItem>
          <DescriptionListItem>
            <DescriptionListTerm>URL</DescriptionListTerm>
            <DescriptionListDetails>
              <WorkspaceSetupValue field="slug">Not set</WorkspaceSetupValue>
            </DescriptionListDetails>
          </DescriptionListItem>
          <DescriptionListItem style={{ borderBottom: 0 }}>
            <DescriptionListTerm>Invitations</DescriptionListTerm>
            <DescriptionListDetails>
              <WorkspaceSetupValue field="invites" />
            </DescriptionListDetails>
          </DescriptionListItem>
        </DescriptionList>
      </WorkspaceSetupSummary>
    </WorkspaceSetup>
  );
}
`,
    accessibility: [
      "The form is labelled by its heading and each group is a fieldset with a legend.",
      "Name, URL, and invitation fields are Form Fields, so labels, descriptions, and errors stay linked; submit focuses the first invalid field.",
      "Pending invitations are a labelled list, and each remove button names the address it removes.",
      "Settings are native radio buttons and checkboxes inside their labels, and creation failures render as an alert Status Banner.",
    ],
  },
];
