"use client";

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
