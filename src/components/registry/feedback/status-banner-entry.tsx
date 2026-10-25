import {
  STATUS_BANNER_VARIANTS,
  type StatusBannerVariant,
} from "@/components/ui/uai/status-banner";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { StatusBannerPreview } from "./status-banner-preview";

export const entry: PreviewEntry = {
  control: variantControl("status banner variant", STATUS_BANNER_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Feedback and state" maxWidth={560}>
      <StatusBannerPreview variant={selection as StatusBannerVariant} />
    </SpecimenStage>
  ),
};
