import {
  INCIDENT_DASHBOARD_VARIANTS,
  type IncidentDashboardVariant,
} from "@/components/uai/incident-dashboard";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { IncidentDashboardPreview } from "./incident-dashboard-preview";

export const entry: PreviewEntry = {
  control: variantControl("incident dashboard layout", INCIDENT_DASHBOARD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Operations" maxWidth={960}>
      <IncidentDashboardPreview variant={selection as IncidentDashboardVariant} />
    </SpecimenStage>
  ),
};
