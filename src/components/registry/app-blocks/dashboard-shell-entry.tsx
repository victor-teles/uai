import {
  DASHBOARD_SHELL_VARIANTS,
  type DashboardShellVariant,
} from "@/components/uai/dashboard-shell";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { DashboardShellPreview } from "./dashboard-shell-preview";

export const entry: PreviewEntry = {
  control: variantControl("dashboard shell layout", DASHBOARD_SHELL_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Application surfaces" maxWidth={960}>
      <DashboardShellPreview variant={selection as DashboardShellVariant} />
    </SpecimenStage>
  ),
};
