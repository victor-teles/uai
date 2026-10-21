import {
  TEAM_MANAGEMENT_VARIANTS,
  type TeamManagementVariant,
} from "@/components/uai/team-management";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { TeamManagementPreview } from "./team-management-preview";

export const entry: PreviewEntry = {
  control: variantControl("team management layout", TEAM_MANAGEMENT_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Application surfaces" maxWidth={800}>
      <TeamManagementPreview variant={selection as TeamManagementVariant} />
    </SpecimenStage>
  ),
};
