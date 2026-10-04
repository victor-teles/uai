import { Layers, MapIcon, MapPin, Route, Store, ZoomIn } from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type MapsItemId =
  | "map-frame"
  | "map-controls"
  | "map-marker"
  | "map-legend"
  | "place-card"
  | "route-summary";

export const mapsCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "map-frame",
    name: "Map Frame",
    category: "Maps",
    icon: MapIcon,
    description:
      "A labelled map region that hosts any map library, anchors overlays to its edges, and shows a placeholder basemap while tiles load.",
    usage: `"use client";

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
`,
    accessibility: [
      "The frame is a section landmark named by aria-label, and aria-busy marks it while tiles or data load.",
      "The placeholder basemap is decorative and hidden from assistive technology.",
      "Overlays keep pointer events only on their own controls, so the map stays draggable around them.",
      "Attribution stays visible as text, as most map providers require.",
    ],
  },
  {
    id: "map-controls",
    name: "Map Controls",
    category: "Maps",
    icon: ZoomIn,
    description:
      "Zoom, compass, locate, and custom camera buttons in stacked, bar, and compact variants.",
    usage: `"use client";

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
      <MapFramePlaceholder style={{ rotate: \`\${bearing}deg\`, scale: 1 + (zoom - 14) * 0.08 }} />
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
`,
    accessibility: [
      "Controls sit in a labelled group, and every icon button has an accessible name and a matching tooltip.",
      "Zoom limits use the native disabled state, so keyboard and pointer users meet the same bounds.",
      "Locate speaks its state in its name, exposes aria-pressed while following, and aria-busy while locating.",
      "The compass needle animates its bearing reset, and the animation stops under reduced motion.",
    ],
  },
  {
    id: "map-marker",
    name: "Map Marker",
    category: "Maps",
    icon: MapPin,
    description:
      "Selectable pins, dots, and price labels with tones, captions, and a cluster count.",
    usage: `"use client";

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
`,
    accessibility: [
      "Each marker is a native toggle button named after its place, with aria-pressed for the selected marker.",
      "Icons and captions are hidden from assistive technology, so the place name is spoken once.",
      "Clusters speak their count and what selecting them does.",
      "Tone reinforces the label and never carries meaning alone; selection also raises and fills the marker.",
    ],
  },
  {
    id: "map-legend",
    name: "Map Legend",
    category: "Maps",
    icon: Layers,
    description:
      "Layer symbols, counts, a color ramp, and visibility toggles in card, floating, and compact variants.",
    usage: `"use client";

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
`,
    accessibility: [
      "The legend is a section labelled by its title.",
      "Toggleable rows are native-labelled checkboxes, so the whole row is a click target and Space toggles it.",
      "Hidden layers fade their symbol and label but stay readable and focusable.",
      "The color ramp is an image with a text alternative that states its range.",
    ],
  },
  {
    id: "place-card",
    name: "Place Card",
    category: "Maps",
    icon: Store,
    description:
      "Place details with rating, opening status, contact facts, and actions as a card, map popup, or compact row.",
    usage: `"use client";

import { Clock, Croissant, Globe, MapPin, Navigation, Phone } from "lucide-react";
import { useState } from "react";
import { MapFrame, MapFramePlaceholder } from "@/components/ui/uai/map-frame";
import { MapMarker, MapMarkerIcon } from "@/components/ui/uai/map-marker";
import {
  PlaceCard,
  PlaceCardAction,
  PlaceCardActions,
  PlaceCardCategory,
  PlaceCardClose,
  PlaceCardDetail,
  PlaceCardDetails,
  PlaceCardHeader,
  PlaceCardMedia,
  PlaceCardMeta,
  PlaceCardRating,
  PlaceCardStatus,
  PlaceCardTitle,
  type PlaceCardVariant,
} from "@/components/ui/uai/place-card";

function LumeBakery({ variant, onClose }: { variant: PlaceCardVariant; onClose: () => void }) {
  return (
    <PlaceCard variant={variant}>
      {variant === "card" && (
        <PlaceCardMedia>
          <svg viewBox="0 0 320 180" role="img" aria-label="Lume Bakery storefront">
            <rect width="320" height="180" className="fill-warning/16" />
            <rect x="40" y="58" width="240" height="122" rx="8" className="fill-card" />
            <rect x="40" y="40" width="240" height="30" rx="8" className="fill-warning/60" />
            <rect x="64" y="96" width="76" height="84" rx="6" className="fill-muted" />
            <rect x="160" y="96" width="96" height="52" rx="6" className="fill-muted" />
          </svg>
        </PlaceCardMedia>
      )}
      <PlaceCardHeader>
        <PlaceCardTitle>Lume Bakery</PlaceCardTitle>
        <PlaceCardCategory>Bakery · $$ · 0.4 mi</PlaceCardCategory>
        <PlaceCardClose onClick={onClose} />
      </PlaceCardHeader>
      <PlaceCardMeta>
        <PlaceCardRating value={4.7} count={1284} />
        <PlaceCardStatus status="closing">Closes at 3 PM</PlaceCardStatus>
      </PlaceCardMeta>
      {variant !== "compact" && (
        <PlaceCardDetails>
          <PlaceCardDetail>
            <MapPin aria-hidden="true" />
            <span>218 Harbor Street, Bayview</span>
          </PlaceCardDetail>
          <PlaceCardDetail>
            <Clock aria-hidden="true" />
            <span>Opens 6:30 AM tomorrow</span>
          </PlaceCardDetail>
          {variant === "card" && (
            <>
              <PlaceCardDetail>
                <Phone aria-hidden="true" />
                <a href="tel:+15550102847">(555) 010-2847</a>
              </PlaceCardDetail>
              <PlaceCardDetail>
                <Globe aria-hidden="true" />
                <a href="https://lumebakery.example">lumebakery.example</a>
              </PlaceCardDetail>
            </>
          )}
        </PlaceCardDetails>
      )}
      <PlaceCardActions>
        <PlaceCardAction emphasis="primary">
          <Navigation aria-hidden="true" />
          Directions
        </PlaceCardAction>
        <PlaceCardAction>Save</PlaceCardAction>
        {variant === "card" && <PlaceCardAction>Share</PlaceCardAction>}
      </PlaceCardActions>
    </PlaceCard>
  );
}

export function PlaceCardPreview({ variant = "card" }: { variant?: PlaceCardVariant }) {
  const [open, setOpen] = useState(true);
  if (variant !== "popup") {
    return open ? (
      <LumeBakery variant={variant} onClose={() => setOpen(false)} />
    ) : (
      <button type="button" onClick={() => setOpen(true)}>
        Show Lume Bakery
      </button>
    );
  }
  return (
    <MapFrame aria-label="Lume Bakery on the map" style={{ height: 380, width: 520 }}>
      <MapFramePlaceholder />
      <div style={{ position: "absolute", left: "50%", top: "86%", translate: "-50% -100%" }}>
        <MapMarker
          label="Lume Bakery"
          tone="warning"
          selected={open}
          onClick={() => setOpen(!open)}
        >
          <MapMarkerIcon>
            <Croissant />
          </MapMarkerIcon>
        </MapMarker>
        {open && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 14px)",
              left: "50%",
              translate: "-50% 0",
            }}
          >
            <LumeBakery variant="popup" onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </MapFrame>
  );
}
`,
    accessibility: [
      "The card is an article labelled by the place name.",
      "The rating is spoken as a sentence with its review count instead of a bare number and star.",
      "Opening status is written in words; the tone dot only reinforces it.",
      "Close is a named icon button, and Directions is the single primary action.",
    ],
  },
  {
    id: "route-summary",
    name: "Route Summary",
    category: "Maps",
    icon: Route,
    description:
      "Travel modes, stops, totals, and turn-by-turn steps for a route in card, plain, and compact variants.",
    usage: `"use client";

import {
  ArrowUp,
  Bike,
  Car,
  CornerUpLeft,
  CornerUpRight,
  Footprints,
  MapPinCheck,
  Share2,
  TrainFront,
} from "lucide-react";
import { useState } from "react";
import {
  RouteSummary,
  RouteSummaryAction,
  RouteSummaryActions,
  RouteSummaryDetail,
  RouteSummaryDuration,
  RouteSummaryMode,
  RouteSummaryModes,
  RouteSummaryOverview,
  RouteSummaryStep,
  RouteSummarySteps,
  RouteSummaryStop,
  RouteSummaryStops,
  type RouteSummaryVariant,
} from "@/components/ui/uai/route-summary";

const modes = {
  drive: { name: "Drive", icon: Car, minutes: 18, distance: "6.2 mi", arrive: "9:42 AM" },
  transit: {
    name: "Transit",
    icon: TrainFront,
    minutes: 31,
    distance: "5.8 mi",
    arrive: "9:55 AM",
  },
  bike: { name: "Bike", icon: Bike, minutes: 27, distance: "5.1 mi", arrive: "9:51 AM" },
  walk: { name: "Walk", icon: Footprints, minutes: 96, distance: "4.9 mi", arrive: "11:00 AM" },
} as const;
type Mode = keyof typeof modes;

function formatMinutes(minutes: number) {
  return minutes < 60 ? \`\${minutes} min\` : \`\${Math.floor(minutes / 60)} h \${minutes % 60} min\`;
}

export function RouteSummaryPreview({ variant = "card" }: { variant?: RouteSummaryVariant }) {
  const [mode, setMode] = useState<Mode>("drive");
  const current = modes[mode];
  return (
    <RouteSummary variant={variant} aria-label="Route to Pier Park">
      <RouteSummaryModes value={mode} onValueChange={(next) => setMode(next as Mode)}>
        {(Object.keys(modes) as Mode[]).map((id) => {
          const { name, icon: Icon, minutes } = modes[id];
          return (
            <RouteSummaryMode key={id} value={id} label={\`\${name}, \${formatMinutes(minutes)}\`}>
              <Icon aria-hidden="true" />
              {variant !== "compact" && (
                <span>{minutes < 60 ? minutes : \`\${Math.floor(minutes / 60)}h\`}</span>
              )}
            </RouteSummaryMode>
          );
        })}
      </RouteSummaryModes>

      <RouteSummaryStops>
        <RouteSummaryStop kind="origin">Your location</RouteSummaryStop>
        {variant !== "compact" && <RouteSummaryStop>Lume Bakery</RouteSummaryStop>}
        <RouteSummaryStop kind="destination">Pier Park, Bayview</RouteSummaryStop>
      </RouteSummaryStops>

      <RouteSummaryOverview>
        <RouteSummaryDuration>{formatMinutes(current.minutes)}</RouteSummaryDuration>
        <RouteSummaryDetail>{current.distance}</RouteSummaryDetail>
        <RouteSummaryDetail>Arrive {current.arrive}</RouteSummaryDetail>
        {mode === "drive" && (
          <RouteSummaryDetail data-tone="warning">Light traffic on Bay Rd</RouteSummaryDetail>
        )}
      </RouteSummaryOverview>

      {variant !== "compact" && (
        <RouteSummarySteps>
          <RouteSummaryStep distance="0.3 mi">
            <ArrowUp aria-hidden="true" />
            Head north on Harbor Street
          </RouteSummaryStep>
          <RouteSummaryStep distance="2.1 mi">
            <CornerUpRight aria-hidden="true" />
            Turn right onto Bay Road
          </RouteSummaryStep>
          <RouteSummaryStep distance="3.8 mi">
            <CornerUpLeft aria-hidden="true" />
            Turn left onto Shoreline Avenue
          </RouteSummaryStep>
          <RouteSummaryStep>
            <MapPinCheck aria-hidden="true" />
            Arrive at Pier Park, on the right
          </RouteSummaryStep>
        </RouteSummarySteps>
      )}

      <RouteSummaryActions>
        <RouteSummaryAction emphasis="primary">Start</RouteSummaryAction>
        <RouteSummaryAction>
          <Share2 aria-hidden="true" />
          Send to phone
        </RouteSummaryAction>
      </RouteSummaryActions>
    </RouteSummary>
  );
}
`,
    accessibility: [
      "Travel modes are a single-select toggle group with arrow-key navigation; one mode is always selected.",
      "Each mode is named with its duration, even when only the icon is visible.",
      "Stops and steps are ordered lists with names, and each step's distance describes its maneuver.",
      "Start is the single primary action; the rail and stop dots are decorative.",
    ],
  },
];
