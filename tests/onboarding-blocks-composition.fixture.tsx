import { CodeVerificationPreview } from "@/components/registry/onboarding-blocks/code-verification-preview";
import { OnboardingWizardPreview } from "@/components/registry/onboarding-blocks/onboarding-wizard-preview";
import { WorkspaceSetupPreview } from "@/components/registry/onboarding-blocks/workspace-setup-preview";

export function OnboardingBlocksCompositionFixture() {
  return (
    <>
      <CodeVerificationPreview />
      <OnboardingWizardPreview />
      <WorkspaceSetupPreview />
    </>
  );
}
