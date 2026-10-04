"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext } from "react";
import { cn } from "@/lib/uai-utils";

export const MAP_FRAME_VARIANTS = ["card", "inset", "compact"] as const;
export type MapFrameVariant = (typeof MAP_FRAME_VARIANTS)[number];
export const MAP_FRAME_POSITIONS = [
  "top-left",
  "top",
  "top-right",
  "bottom-left",
  "bottom",
  "bottom-right",
] as const;
export type MapFramePosition = (typeof MAP_FRAME_POSITIONS)[number];
export type MapFrameProps = ComponentProps<"section"> & {
  variant?: MapFrameVariant;
  /** Marks the map as loading while tiles or data arrive. */
  busy?: boolean;
};

type FrameContext = { variant: MapFrameVariant };
const Context = createContext<FrameContext | null>(null);
function useFrame(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within MapFrame`);
  return context;
}

const mapFrameVariants = cva(
  "relative isolate min-h-60 w-full min-w-0 overflow-hidden bg-muted text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        card: "rounded-[14px] shadow-[0_0_0_1px_var(--border)]",
        inset: "rounded-none",
        compact: "min-h-44 rounded-xl shadow-[0_0_0_1px_var(--border)]",
      },
    },
  },
);

/** A labelled map region that hosts any map library and anchors overlays to its edges. */
export function MapFrame({
  variant = "card",
  busy = false,
  "aria-label": label = "Map",
  className,
  children,
  ...props
}: MapFrameProps) {
  return (
    <Context.Provider value={{ variant }}>
      <section
        data-slot="map-frame"
        aria-label={label}
        aria-busy={busy || undefined}
        className={cn(mapFrameVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

/** Fills the frame. Mount the map library's canvas or container here. */
export function MapFrameSurface({ className, ...props }: ComponentProps<"div">) {
  useFrame("MapFrameSurface");
  return (
    <div
      data-slot="map-frame-surface"
      className={cn("absolute inset-0 -z-10 [&>*]:size-full", className)}
      {...props}
    />
  );
}

/**
 * A decorative street grid shown before tiles load or where no map provider is configured.
 * It is hidden from assistive technology; label the frame instead.
 */
export function MapFramePlaceholder({ className, ...props }: ComponentProps<"svg">) {
  useFrame("MapFramePlaceholder");
  return (
    <svg
      data-slot="map-frame-placeholder"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 640 400"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 -z-10 size-full", className)}
      {...props}
    >
      <rect width="640" height="400" className="fill-muted" />
      <path
        d="M-20 300 C 90 270, 150 340, 250 318 S 420 250, 520 286 S 640 330, 680 300 L 680 420 L -20 420 Z"
        className="fill-primary/12"
      />
      <path
        d="M392 36 h132 a14 14 0 0 1 14 14 v76 a14 14 0 0 1 -14 14 h-132 a14 14 0 0 1 -14 -14 v-76 a14 14 0 0 1 14 -14 Z"
        className="fill-success/14"
      />
      <path
        d="M70 92 h86 a10 10 0 0 1 10 10 v52 a10 10 0 0 1 -10 10 h-86 a10 10 0 0 1 -10 -10 v-52 a10 10 0 0 1 10 -10 Z"
        className="fill-success/10"
      />
      <g className="fill-none stroke-card" strokeLinecap="round">
        <path
          d="M-10 60 H650 M-10 182 H650 M-10 248 H650 M40 -10 V410 M210 -10 V410 M350 -10 V410 M560 -10 V410"
          strokeWidth="5"
        />
        <path
          d="M-10 120 H650 M120 -10 V410 M280 -10 V410 M460 -10 V410 M-10 360 H650"
          strokeWidth="2.5"
        />
        <path d="M-20 400 L 300 140 L 660 -20" strokeWidth="9" />
      </g>
      <path
        d="M-20 400 L 300 140 L 660 -20"
        className="fill-none stroke-border-strong"
        strokeWidth="1"
        strokeDasharray="2 6"
      />
    </svg>
  );
}

const overlayPositions: Record<MapFramePosition, string> = {
  "top-left": "top-0 left-0 items-start",
  top: "top-0 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-0 right-0 items-end",
  "bottom-left": "bottom-0 left-0 items-start",
  bottom: "bottom-0 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "right-0 bottom-0 items-end",
};

export type MapFrameOverlayProps = ComponentProps<"div"> & { position?: MapFramePosition };

/** Pins controls, legends, or cards to one edge of the frame. */
export function MapFrameOverlay({
  position = "top-right",
  className,
  ...props
}: MapFrameOverlayProps) {
  const context = useFrame("MapFrameOverlay");
  return (
    <div
      data-slot="map-frame-overlay"
      data-position={position}
      className={cn(
        "pointer-events-none absolute z-10 flex max-w-full flex-col gap-2 [&>*]:pointer-events-auto",
        context.variant === "compact" ? "p-2" : "p-3",
        overlayPositions[position],
        className,
      )}
      {...props}
    />
  );
}

/** Data and tile credits. Required by most map providers. */
export function MapFrameAttribution({ className, ...props }: ComponentProps<"p">) {
  useFrame("MapFrameAttribution");
  return (
    <p
      data-slot="map-frame-attribution"
      className={cn(
        "absolute right-0 bottom-0 z-10 m-0 rounded-tl-md bg-card/80 px-1.5 py-0.5 text-[10.5px]/[14px] text-subtle-foreground backdrop-blur-sm [&_a]:text-muted-foreground [&_a]:underline-offset-2 [&_a:hover]:underline",
        className,
      )}
      {...props}
    />
  );
}
