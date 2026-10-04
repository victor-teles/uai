"use client";

import { MAP_CONTROLS_VARIANTS, type MapControlsVariant } from "@/components/ui/uai/map-controls";
import { MAP_FRAME_VARIANTS, type MapFrameVariant } from "@/components/ui/uai/map-frame";
import { MAP_LEGEND_VARIANTS, type MapLegendVariant } from "@/components/ui/uai/map-legend";
import { MAP_MARKER_VARIANTS, type MapMarkerVariant } from "@/components/ui/uai/map-marker";
import { PLACE_CARD_VARIANTS, type PlaceCardVariant } from "@/components/ui/uai/place-card";
import {
  ROUTE_SUMMARY_VARIANTS,
  type RouteSummaryVariant,
} from "@/components/ui/uai/route-summary";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import type { MapsItemId } from "./catalog";
import { MapControlsPreview } from "./map-controls-preview";
import { MapFramePreview } from "./map-frame-preview";
import { MapLegendPreview } from "./map-legend-preview";
import { MapMarkerPreview } from "./map-marker-preview";
import { PlaceCardPreview } from "./place-card-preview";
import { RouteSummaryPreview } from "./route-summary-preview";

const controls: Record<MapsItemId, { variants: readonly string[]; label: string }> = {
  "map-frame": { variants: MAP_FRAME_VARIANTS, label: "map frame" },
  "map-controls": { variants: MAP_CONTROLS_VARIANTS, label: "map controls" },
  "map-marker": { variants: MAP_MARKER_VARIANTS, label: "map marker" },
  "map-legend": { variants: MAP_LEGEND_VARIANTS, label: "map legend" },
  "place-card": { variants: PLACE_CARD_VARIANTS, label: "place card" },
  "route-summary": { variants: ROUTE_SUMMARY_VARIANTS, label: "route summary" },
};

const narrow = new Set<string>(["route-summary"]);

export function getMapsPreviewControl(itemId: string): PreviewControl | undefined {
  const control = controls[itemId as MapsItemId];
  if (!control) return undefined;
  return {
    ariaLabel: `${control.label} variant`,
    defaultValue: control.variants[0] ?? "",
    options: control.variants.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  };
}

export function MapsPreview({ itemId, selection }: { itemId: string; selection: string }) {
  return (
    <PreviewStage label="Maps">
      <div
        style={{
          display: "grid",
          justifyItems: "center",
          width: "100%",
          maxWidth: narrow.has(itemId) ? 400 : 640,
          minWidth: 0,
          padding: "24px 0",
        }}
      >
        {itemId === "map-frame" && <MapFramePreview variant={selection as MapFrameVariant} />}
        {itemId === "map-controls" && (
          <MapControlsPreview variant={selection as MapControlsVariant} />
        )}
        {itemId === "map-marker" && <MapMarkerPreview variant={selection as MapMarkerVariant} />}
        {itemId === "map-legend" && <MapLegendPreview variant={selection as MapLegendVariant} />}
        {itemId === "place-card" && <PlaceCardPreview variant={selection as PlaceCardVariant} />}
        {itemId === "route-summary" && (
          <RouteSummaryPreview variant={selection as RouteSummaryVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
