import { TRUST_PANEL_VARIANTS, type TrustPanelVariant } from "@/components/ui/uai/trust-panel";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { TrustPanelPreview } from "./trust-panel-preview";

export const entry: PreviewEntry = {
  control: variantControl("trust panel variant", TRUST_PANEL_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing and conversion" maxWidth={600}>
      <TrustPanelPreview variant={selection as TrustPanelVariant} />
    </SpecimenStage>
  ),
};
