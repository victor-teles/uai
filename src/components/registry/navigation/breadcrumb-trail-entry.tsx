import {
  BREADCRUMB_TRAIL_VARIANTS,
  type BreadcrumbTrailVariant,
} from "@/components/ui/uai/breadcrumb-trail";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { BreadcrumbTrailPreview } from "./breadcrumb-trail-preview";

export const entry: PreviewEntry = {
  control: variantControl("breadcrumb trail variant", BREADCRUMB_TRAIL_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Navigation and layout" maxWidth={560}>
      <BreadcrumbTrailPreview variant={selection as BreadcrumbTrailVariant} />
    </SpecimenStage>
  ),
};
