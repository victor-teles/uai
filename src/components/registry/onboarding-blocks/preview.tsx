"use client";

import {
  CODE_VERIFICATION_VARIANTS,
  type CodeVerificationVariant,
} from "@/components/uai/code-verification";
import {
  ONBOARDING_WIZARD_VARIANTS,
  type OnboardingWizardVariant,
} from "@/components/uai/onboarding-wizard";
import {
  WORKSPACE_SETUP_VARIANTS,
  type WorkspaceSetupVariant,
} from "@/components/uai/workspace-setup";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { CodeVerificationPreview } from "./code-verification-preview";
import { OnboardingWizardPreview } from "./onboarding-wizard-preview";
import { WorkspaceSetupPreview } from "./workspace-setup-preview";

const controls: Record<string, { label: string; variants: readonly string[] }> = {
  "code-verification": { label: "code verification variant", variants: CODE_VERIFICATION_VARIANTS },
  "onboarding-wizard": { label: "onboarding wizard variant", variants: ONBOARDING_WIZARD_VARIANTS },
  "workspace-setup": { label: "workspace setup variant", variants: WORKSPACE_SETUP_VARIANTS },
};

const widths: Record<string, number> = {
  "code-verification": 760,
  "onboarding-wizard": 880,
  "workspace-setup": 920,
};

export function getOnboardingBlocksPreviewControl(itemId: string): PreviewControl | undefined {
  const control = controls[itemId];
  if (!control) return undefined;
  return {
    ariaLabel: control.label,
    defaultValue: control.variants[0] ?? "",
    options: control.variants.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  };
}

export function OnboardingBlocksPreview({
  itemId,
  selection,
}: {
  itemId: string;
  selection: string;
}) {
  return (
    <PreviewStage label="Authentication and onboarding">
      <div
        style={{
          width: "100%",
          maxWidth: widths[itemId] ?? 960,
          minWidth: 0,
          padding: "24px 0",
        }}
      >
        {itemId === "code-verification" && (
          <CodeVerificationPreview key={selection} variant={selection as CodeVerificationVariant} />
        )}
        {itemId === "onboarding-wizard" && (
          <OnboardingWizardPreview key={selection} variant={selection as OnboardingWizardVariant} />
        )}
        {itemId === "workspace-setup" && (
          <WorkspaceSetupPreview key={selection} variant={selection as WorkspaceSetupVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
