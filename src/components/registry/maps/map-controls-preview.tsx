"use client";

import { Layers, Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  MapControls,
  MapControlsButton,
  MapControlsCompass,
  MapControlsGroup,
  MapControlsLocate,
  type MapControlsLocateStatus,
  type MapControlsVariant,
  MapControlsZoomIn,
  MapControlsZoomOut,
} from "@/components/ui/uai/map-controls";
import { MapFrame, MapFrameOverlay, MapFramePlaceholder } from "@/components/ui/uai/map-frame";

export function MapControlsPreview({ variant = "stacked" }: { variant?: MapControlsVariant }) {
  const [zoom, setZoom] = useState(14);
  const [bearing, setBearing] = useState(-32);
  const [locate, setLocate] = useState<MapControlsLocateStatus>("idle");

  useEffect(() => {
    if (locate !== "locating") return;
    const timer = window.setTimeout(() => setLocate("active"), 1200);
    return () => window.clearTimeout(timer);
  }, [locate]);

  return (
    <MapFrame aria-label="Delivery zone map" style={{ height: 320 }}>
      <MapFramePlaceholder style={{ rotate: `${bearing}deg`, scale: 1 + (zoom - 14) * 0.08 }} />
      <MapFrameOverlay position={variant === "bar" ? "bottom" : "top-right"}>
        <MapControls variant={variant}>
          <MapControlsGroup>
            <MapControlsZoomIn disabled={zoom >= 18} onClick={() => setZoom((z) => z + 1)} />
            <MapControlsZoomOut disabled={zoom <= 10} onClick={() => setZoom((z) => z - 1)} />
          </MapControlsGroup>
          <MapControlsGroup>
            <MapControlsCompass bearing={bearing} onClick={() => setBearing(0)} />
            <MapControlsLocate
              status={locate}
              onClick={() => setLocate(locate === "active" ? "idle" : "locating")}
            />
          </MapControlsGroup>
          <MapControlsGroup>
            <MapControlsButton label="Map layers">
              <Layers strokeWidth={1.75} aria-hidden="true" />
            </MapControlsButton>
            <MapControlsButton label="Full screen">
              <Maximize2 strokeWidth={1.75} aria-hidden="true" />
            </MapControlsButton>
          </MapControlsGroup>
        </MapControls>
      </MapFrameOverlay>
    </MapFrame>
  );
}
