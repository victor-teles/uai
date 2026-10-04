"use client";

import { Coffee, Croissant } from "lucide-react";
import { useState } from "react";
import {
  MapControls,
  MapControlsGroup,
  MapControlsZoomIn,
  MapControlsZoomOut,
} from "@/components/ui/uai/map-controls";
import {
  MapFrame,
  MapFrameAttribution,
  MapFrameOverlay,
  MapFramePlaceholder,
  MapFrameSurface,
  type MapFrameVariant,
} from "@/components/ui/uai/map-frame";
import { MapMarker, MapMarkerIcon } from "@/components/ui/uai/map-marker";

export function MapFramePreview({ variant = "card" }: { variant?: MapFrameVariant }) {
  const [zoom, setZoom] = useState(14);
  return (
    <MapFrame variant={variant} aria-label="Cafés near Harbor Street" style={{ height: 340 }}>
      <MapFramePlaceholder />
      <MapFrameSurface>
        {/* Mount your map library here, for example a MapLibre or Leaflet container. */}
        <div />
      </MapFrameSurface>

      <div style={{ position: "absolute", left: "36%", top: "46%", translate: "-50% -100%" }}>
        <MapMarker label="Tidewater Coffee">
          <MapMarkerIcon>
            <Coffee />
          </MapMarkerIcon>
        </MapMarker>
      </div>
      <div style={{ position: "absolute", left: "62%", top: "64%", translate: "-50% -100%" }}>
        <MapMarker label="Lume Bakery" tone="warning">
          <MapMarkerIcon>
            <Croissant />
          </MapMarkerIcon>
        </MapMarker>
      </div>

      <MapFrameOverlay position="top-left">
        <p className="m-0 rounded-full bg-card px-3 py-1 text-[12px] font-medium shadow-[0_0_0_1px_var(--border)]">
          Zoom {zoom}
        </p>
      </MapFrameOverlay>
      <MapFrameOverlay position="top-right">
        <MapControls variant={variant === "compact" ? "compact" : "stacked"}>
          <MapControlsGroup>
            <MapControlsZoomIn disabled={zoom >= 18} onClick={() => setZoom((z) => z + 1)} />
            <MapControlsZoomOut disabled={zoom <= 10} onClick={() => setZoom((z) => z - 1)} />
          </MapControlsGroup>
        </MapControls>
      </MapFrameOverlay>
      <MapFrameAttribution>© Uai sample basemap</MapFrameAttribution>
    </MapFrame>
  );
}
