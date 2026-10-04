import { MapControlsPreview } from "@/components/registry/maps/map-controls-preview";
import { MapFramePreview } from "@/components/registry/maps/map-frame-preview";
import { MapLegendPreview } from "@/components/registry/maps/map-legend-preview";
import { MapMarkerPreview } from "@/components/registry/maps/map-marker-preview";
import { PlaceCardPreview } from "@/components/registry/maps/place-card-preview";
import { RouteSummaryPreview } from "@/components/registry/maps/route-summary-preview";

export function MapsCompositionFixture() {
  return (
    <>
      <MapFramePreview />
      <MapControlsPreview />
      <MapMarkerPreview />
      <MapLegendPreview />
      <PlaceCardPreview />
      <RouteSummaryPreview />
    </>
  );
}
