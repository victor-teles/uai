import { APP_SIDEBAR_VARIANTS, type AppSidebarVariant } from "@/components/ui/uai/app-sidebar";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { AppSidebarPreview } from "./app-sidebar-preview";

export const entry: PreviewEntry = {
  control: variantControl("app sidebar variant", APP_SIDEBAR_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Navigation and layout" maxWidth={680}>
      <AppSidebarPreview variant={selection as AppSidebarVariant} />
    </SpecimenStage>
  ),
};
