"use client";

import { useState } from "react";
import { MapFrame, MapFrameOverlay, MapFramePlaceholder } from "@/components/ui/uai/map-frame";
import {
  MapLegend,
  MapLegendDescription,
  MapLegendHeader,
  MapLegendItem,
  MapLegendItems,
  MapLegendLabel,
  MapLegendScale,
  MapLegendSwatch,
  MapLegendTitle,
  MapLegendValue,
  type MapLegendVariant,
} from "@/components/ui/uai/map-legend";

export function MapLegendPreview({ variant = "card" }: { variant?: MapLegendVariant }) {
  const [layers, setLayers] = useState<string[]>(["stations", "bike-lanes", "rent"]);
  const legend = (
    <MapLegend variant={variant} value={layers} onValueChange={setLayers}>
      <MapLegendHeader>
        <MapLegendTitle>Getting around</MapLegendTitle>
        <MapLegendDescription>Sept 2026</MapLegendDescription>
      </MapLegendHeader>
      <MapLegendItems>
        <MapLegendItem value="stations">
          <MapLegendSwatch shape="dot" color="var(--primary)" />
          <MapLegendLabel>Transit stations</MapLegendLabel>
          <MapLegendValue>14</MapLegendValue>
        </MapLegendItem>
        <MapLegendItem value="bike-lanes">
          <MapLegendSwatch shape="line" color="var(--success)" />
          <MapLegendLabel>Protected bike lanes</MapLegendLabel>
          <MapLegendValue>9.2 mi</MapLegendValue>
        </MapLegendItem>
        <MapLegendItem value="closures">
          <MapLegendSwatch shape="line" color="var(--destructive)" />
          <MapLegendLabel>Road closures</MapLegendLabel>
          <MapLegendValue>3</MapLegendValue>
        </MapLegendItem>
        <MapLegendItem value="rent">
          <MapLegendSwatch color="color-mix(in oklab, var(--warning) 60%, transparent)" />
          <MapLegendLabel>Median rent</MapLegendLabel>
        </MapLegendItem>
      </MapLegendItems>
      {layers.includes("rent") && (
        <MapLegendScale
          label="Median rent from $1,200 to $3,400 a month"
          colors={[
            "color-mix(in oklab, var(--warning) 12%, transparent)",
            "color-mix(in oklab, var(--warning) 90%, transparent)",
          ]}
        >
          <span>$1.2k</span>
          <span>$2.3k</span>
          <span>$3.4k</span>
        </MapLegendScale>
      )}
    </MapLegend>
  );

  if (variant === "card") return legend;
  return (
    <MapFrame aria-label="Harbor district transit map" style={{ height: 360 }}>
      <MapFramePlaceholder />
      <MapFrameOverlay position="bottom-left">{legend}</MapFrameOverlay>
    </MapFrame>
  );
}
