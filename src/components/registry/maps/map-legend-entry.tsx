import { MAP_LEGEND_VARIANTS, type MapLegendVariant } from "@/components/ui/uai/map-legend";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { MapLegendPreview } from "./map-legend-preview";

export const entry: PreviewEntry = {
  control: variantControl("map legend variant", MAP_LEGEND_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Maps" center maxWidth={640}>
      <MapLegendPreview variant={selection as MapLegendVariant} />
    </SpecimenStage>
  ),
};
