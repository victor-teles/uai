"use client";

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
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
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
            <RouteSummaryMode key={id} value={id} label={`${name}, ${formatMinutes(minutes)}`}>
              <Icon aria-hidden="true" />
              {variant !== "compact" && (
                <span>{minutes < 60 ? minutes : `${Math.floor(minutes / 60)}h`}</span>
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
