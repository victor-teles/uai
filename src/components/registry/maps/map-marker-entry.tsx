import { MAP_MARKER_VARIANTS, type MapMarkerVariant } from "@/components/ui/uai/map-marker";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { MapMarkerPreview } from "./map-marker-preview";

export const entry: PreviewEntry = {
  control: variantControl("map marker variant", MAP_MARKER_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Maps" center maxWidth={640}>
      <MapMarkerPreview variant={selection as MapMarkerVariant} />
    </SpecimenStage>
  ),
};
