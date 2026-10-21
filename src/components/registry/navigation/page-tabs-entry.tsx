import { PAGE_TABS_VARIANTS, type PageTabsVariant } from "@/components/ui/uai/page-tabs";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { PageTabsPreview } from "./page-tabs-preview";

export const entry: PreviewEntry = {
  control: variantControl("page tabs variant", PAGE_TABS_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Navigation and layout" maxWidth={680}>
      <PageTabsPreview variant={selection as PageTabsVariant} />
    </SpecimenStage>
  ),
};
