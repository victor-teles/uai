import {
  ONBOARDING_WIZARD_VARIANTS,
  type OnboardingWizardVariant,
} from "@/components/uai/onboarding-wizard";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { OnboardingWizardPreview } from "./onboarding-wizard-preview";

export const entry: PreviewEntry = {
  control: variantControl("onboarding wizard variant", ONBOARDING_WIZARD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Authentication and onboarding" maxWidth={880}>
      <OnboardingWizardPreview key={selection} variant={selection as OnboardingWizardVariant} />
    </SpecimenStage>
  ),
};
