import { MAP_CONTROLS_VARIANTS, type MapControlsVariant } from "@/components/ui/uai/map-controls";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { MapControlsPreview } from "./map-controls-preview";

export const entry: PreviewEntry = {
  control: variantControl("map controls variant", MAP_CONTROLS_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Maps" center maxWidth={640}>
      <MapControlsPreview variant={selection as MapControlsVariant} />
    </SpecimenStage>
  ),
};
