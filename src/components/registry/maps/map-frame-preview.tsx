"use client";

import { Coffee, Croissant, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MapControls,
  MapControlsGroup,
  MapControlsLocate,
  type MapControlsLocateStatus,
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

export type MapFramePreviewState = "ready" | "loading" | "error" | "empty";

type Place = {
  id: string;
  name: string;
  kind: "coffee" | "bakery";
  status: { label: string; open: boolean };
  meta: string[];
  left: string;
  top: string;
  /** Which side of the marker the popover grows toward, so it stays inside the frame. */
  align: "start" | "end";
};

const places: Place[] = [
  {
    id: "bene",
    name: "Café Bené",
    kind: "coffee",
    status: { label: "Open", open: true },
    meta: ["Coffee · $$", "4 min walk", "★ 4.7"],
    left: "40%",
    top: "62%",
    align: "start",
  },
  {
    id: "lume",
    name: "Padaria Lume",
    kind: "bakery",
    status: { label: "Open", open: true },
    meta: ["Bakery · $", "7 min walk", "★ 4.5"],
    left: "68%",
    top: "72%",
    align: "end",
  },
  {
    id: "grao",
    name: "Grão Torrado",
    kind: "coffee",
    status: { label: "Closed", open: false },
    meta: ["Coffee · $$", "11 min walk", "★ 4.8"],
    left: "18%",
    top: "44%",
    align: "start",
  },
];

const pop = "cubic-bezier(0.16, 1, 0.3, 1)";
const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const canAnimate = (el: HTMLElement | null): el is HTMLElement => typeof el?.animate === "function";

/** The overlay surface: a translucent popover layer with a strong ring and a soft shadow. */
const floating =
  "bg-[color-mix(in_oklab,var(--popover)_92%,transparent)] shadow-[0_0_0_1px_var(--border-strong),0_10px_28px_oklch(0_0_0/0.12)] backdrop-blur-[12px] dark:shadow-[0_0_0_1px_var(--border-strong),0_10px_28px_oklch(0_0_0/0.42)]";

function PlacePopover({
  place,
  closing,
  onClosed,
}: {
  place: Place;
  closing: boolean;
  onClosed: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onClosedRef = useRef(onClosed);
  onClosedRef.current = onClosed;

  useEffect(() => {
    if (!canAnimate(ref.current)) return;
    ref.current.animate(
      reduced() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["scale(0.96)", "scale(1)"] },
      { duration: 180, easing: pop },
    );
  }, []);

  useEffect(() => {
    if (!closing) return;
    if (!canAnimate(ref.current)) {
      onClosedRef.current();
      return;
    }
    const exit = ref.current.animate(
      reduced() ? { opacity: [1, 0] } : { opacity: [1, 0], transform: ["scale(1)", "scale(0.98)"] },
      { duration: 120, easing: "ease-out", fill: "forwards" },
    );
    exit.onfinish = () => onClosedRef.current();
    return () => exit.cancel();
  }, [closing]);

  const titleId = `place-${place.id}-title`;
  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled popover card, not a form fieldset.
    <div
      ref={ref}
      id={`place-${place.id}`}
      role="group"
      aria-labelledby={titleId}
      className={`absolute bottom-[calc(100%+10px)] z-30 grid w-59 gap-1.5 rounded-xl p-3 text-left ${floating} after:absolute after:-bottom-1.5 after:size-3 after:rotate-45 after:rounded-br-[2px] after:bg-popover after:shadow-[1px_1px_0_0_var(--border-strong)] ${
        place.align === "start"
          ? "-left-[14px] origin-[30px_calc(100%+6px)] after:left-6"
          : "-right-[14px] origin-[calc(100%-30px)_calc(100%+6px)] after:right-6"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p id={titleId} className="m-0 truncate text-[13.5px]/5 font-medium">
          {place.name}
        </p>
        <span
          className={`shrink-0 rounded-full px-2 text-[11.5px]/5 font-medium ${
            place.status.open ? "bg-success/14 text-success" : "bg-accent text-muted-foreground"
          }`}
        >
          {place.status.label}
        </span>
      </div>
      <p className="m-0 flex flex-wrap gap-x-1.5 text-[12px]/4 text-muted-foreground tabular-nums">
        {place.meta.map((part, index) => (
          <span key={part}>
            {index > 0 && (
              <span aria-hidden="true" className="me-1.5">
                ·
              </span>
            )}
            {part}
          </span>
        ))}
      </p>
    </div>
  );
}

export function MapFramePreview({
  variant = "card",
  state = "ready",
}: {
  variant?: MapFrameVariant;
  state?: MapFramePreviewState;
}) {
  const [zoom, setZoom] = useState(14);
  const [locate, setLocate] = useState<MapControlsLocateStatus>("idle");
  const [selected, setSelected] = useState<string | null>("bene");
  // The popover on screen. It trails `selected` so one popover fades out before the next pops in.
  const [shown, setShown] = useState<string | null>("bene");
  const [failed, setFailed] = useState(state === "error");
  const searchRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setFailed(state === "error"), [state]);
  useEffect(() => {
    if (shown === null && selected !== null) setShown(selected);
  }, [selected, shown]);
  useEffect(() => {
    if (state !== "empty" || !canAnimate(searchRef.current) || reduced()) return;
    searchRef.current.animate(
      { opacity: [0, 1], transform: ["translateY(4px)", "translateY(0)"] },
      { duration: 200, easing: pop },
    );
  }, [state]);

  // After "Try again" the error clears and the map shows the same places the chip counts.
  const visible = state === "loading" || state === "empty" || failed ? [] : places;
  const compact = variant === "compact";

  return (
    <MapFrame
      variant={variant}
      aria-label="Cafés in Savassi, Belo Horizonte"
      busy={state === "loading"}
      style={{ height: 340 }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && selected) setSelected(null);
      }}
    >
      {state === "loading" || failed ? (
        <MapFramePlaceholder
          status={failed ? "error" : "loading"}
          onRetry={() => setFailed(false)}
        />
      ) : (
        <MapFramePlaceholder />
      )}
      <MapFrameSurface onClick={() => setSelected(null)}>
        {/* Mount your map library here, for example a MapLibre or Leaflet container. */}
        <div />
      </MapFrameSurface>

      {!failed &&
        visible.map((place) => {
          const isSelected = selected === place.id;
          return (
            <div
              key={place.id}
              className={isSelected || shown === place.id ? "z-20" : undefined}
              style={{
                position: "absolute",
                left: place.left,
                top: place.top,
                translate: "-50% -100%",
              }}
            >
              {isSelected && (
                <span
                  key={place.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-1/2 size-14 -translate-1/2 animate-ring-pulse rounded-full border-[1.5px] border-primary/45 text-primary [animation-iteration-count:2] motion-reduce:animate-none"
                />
              )}
              <MapMarker
                label={place.name}
                tone={isSelected ? "primary" : "default"}
                selected={isSelected}
                aria-describedby={isSelected ? `place-${place.id}` : undefined}
                onClick={() => setSelected(isSelected ? null : place.id)}
              >
                <MapMarkerIcon>
                  {place.kind === "coffee" ? <Coffee /> : <Croissant />}
                </MapMarkerIcon>
              </MapMarker>
              {shown === place.id && (
                <PlacePopover
                  place={place}
                  closing={selected !== place.id}
                  onClosed={() => setShown(selected)}
                />
              )}
            </div>
          );
        })}

      {!failed && (
        <MapFrameOverlay position="top-left">
          <p
            className={`m-0 inline-flex h-8 items-center gap-2 rounded-full pr-3 pl-2.5 text-[13px]/[18px] font-medium ${floating}`}
          >
            <MapPin aria-hidden="true" className="size-3.5 text-muted-foreground" />
            {state === "empty" ? (
              "No cafés in this area"
            ) : (
              <span>
                {compact ? "Savassi" : "Savassi, Belo Horizonte"}
                <span className="font-normal text-subtle-foreground tabular-nums">
                  {" "}
                  · {state === "loading" ? "Finding cafés…" : `${places.length} cafés`}
                </span>
              </span>
            )}
          </p>
          {state === "empty" && (
            <button
              ref={searchRef}
              type="button"
              className="h-6.5 w-max cursor-pointer rounded-full border-0 bg-transparent px-3 text-[12px]/4 font-medium text-foreground shadow-[0_0_0_1px_var(--border-strong)] transition-[background-color,scale] duration-[120ms,140ms] ease-[ease-out,cubic-bezier(0.23,1,0.32,1)] outline-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              Search this area
            </button>
          )}
        </MapFrameOverlay>
      )}
      <MapFrameOverlay position="top-right">
        <MapControls variant={compact ? "compact" : "stacked"}>
          <MapControlsGroup>
            <MapControlsZoomIn disabled={zoom >= 18} onClick={() => setZoom((z) => z + 1)} />
            <MapControlsZoomOut disabled={zoom <= 10} onClick={() => setZoom((z) => z - 1)} />
          </MapControlsGroup>
          <MapControlsGroup>
            <MapControlsLocate
              status={locate}
              onClick={() => setLocate((s) => (s === "active" ? "idle" : "active"))}
            />
          </MapControlsGroup>
        </MapControls>
      </MapFrameOverlay>
      <MapFrameAttribution>© Uai sample basemap · OpenStreetMap</MapFrameAttribution>
    </MapFrame>
  );
}
