import {
  WORKSPACE_SETUP_VARIANTS,
  type WorkspaceSetupVariant,
} from "@/components/uai/workspace-setup";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { WorkspaceSetupPreview } from "./workspace-setup-preview";

export const entry: PreviewEntry = {
  control: variantControl("workspace setup variant", WORKSPACE_SETUP_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Authentication and onboarding" maxWidth={920}>
      <WorkspaceSetupPreview key={selection} variant={selection as WorkspaceSetupVariant} />
    </SpecimenStage>
  ),
};
