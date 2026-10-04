"use client";

import { BookOpen, Coffee, Croissant, Dumbbell, Trees } from "lucide-react";
import { type ReactNode, useState } from "react";
import { MapFrame, MapFramePlaceholder } from "@/components/ui/uai/map-frame";
import {
  MapMarker,
  MapMarkerCluster,
  MapMarkerIcon,
  MapMarkerLabel,
  type MapMarkerTone,
  type MapMarkerVariant,
} from "@/components/ui/uai/map-marker";

const places: {
  id: string;
  name: string;
  caption: string;
  tone: MapMarkerTone;
  icon: ReactNode;
  x: string;
  y: string;
}[] = [
  {
    id: "tidewater",
    name: "Tidewater Coffee",
    caption: "$4",
    tone: "default",
    icon: <Coffee />,
    x: "24%",
    y: "34%",
  },
  {
    id: "lume",
    name: "Lume Bakery",
    caption: "$6",
    tone: "warning",
    icon: <Croissant />,
    x: "52%",
    y: "48%",
  },
  {
    id: "pier",
    name: "Pier Park",
    caption: "Free",
    tone: "success",
    icon: <Trees />,
    x: "72%",
    y: "24%",
  },
  {
    id: "folio",
    name: "Folio Books",
    caption: "$12",
    tone: "primary",
    icon: <BookOpen />,
    x: "38%",
    y: "72%",
  },
  {
    id: "forge",
    name: "Forge Gym, closed",
    caption: "Closed",
    tone: "destructive",
    icon: <Dumbbell />,
    x: "80%",
    y: "70%",
  },
];

export function MapMarkerPreview({ variant = "pin" }: { variant?: MapMarkerVariant }) {
  const [selected, setSelected] = useState("lume");
  return (
    <MapFrame aria-label="Places on Harbor Street" style={{ height: 340 }}>
      <MapFramePlaceholder />
      {places.map((place) => (
        <div
          key={place.id}
          style={{
            position: "absolute",
            left: place.x,
            top: place.y,
            translate: variant === "dot" ? "-50% -50%" : "-50% -100%",
          }}
        >
          <MapMarker
            variant={variant}
            tone={place.tone}
            label={place.name}
            selected={selected === place.id}
            onClick={() => setSelected(place.id)}
          >
            <MapMarkerIcon>{place.icon}</MapMarkerIcon>
            {variant === "label" ? (
              <MapMarkerLabel>{place.caption}</MapMarkerLabel>
            ) : (
              selected === place.id && <MapMarkerLabel>{place.name}</MapMarkerLabel>
            )}
          </MapMarker>
        </div>
      ))}
      <div style={{ position: "absolute", left: "12%", top: "78%", translate: "-50% -50%" }}>
        <MapMarkerCluster count={24} />
      </div>
    </MapFrame>
  );
}
