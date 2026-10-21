import {
  CODE_VERIFICATION_VARIANTS,
  type CodeVerificationVariant,
} from "@/components/uai/code-verification";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { CodeVerificationPreview } from "./code-verification-preview";

export const entry: PreviewEntry = {
  control: variantControl("code verification variant", CODE_VERIFICATION_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Authentication and onboarding" maxWidth={760}>
      <CodeVerificationPreview key={selection} variant={selection as CodeVerificationVariant} />
    </SpecimenStage>
  ),
};
