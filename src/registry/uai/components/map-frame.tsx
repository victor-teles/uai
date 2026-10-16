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

export const MAP_FRAME_PLACEHOLDER_STATUSES = ["loading", "error"] as const;
export type MapFramePlaceholderStatus = (typeof MAP_FRAME_PLACEHOLDER_STATUSES)[number];
export type MapFramePlaceholderProps = ComponentProps<"svg"> & {
  /**
   * Replaces the basemap with a designed state. "loading" shows a shimmering grid while tiles
   * stream in; "error" explains that the map failed and offers a retry.
   */
  status?: MapFramePlaceholderStatus;
  /** Shows a "Try again" button in the error state. */
  onRetry?: () => void;
};

/**
 * A decorative street grid shown before tiles load or where no map provider is configured.
 * It is hidden from assistive technology; label the frame instead. Pass `status` for the
 * loading and error states; those sit above the map surface and below overlays.
 */
export function MapFramePlaceholder({
  status,
  onRetry,
  className,
  style,
  ...props
}: MapFramePlaceholderProps) {
  const context = useFrame("MapFramePlaceholder");
  if (status === "loading") {
    return (
      <div
        data-slot="map-frame-placeholder"
        data-status="loading"
        className={cn(
          "pointer-events-none absolute inset-0 z-0 grid place-items-center bg-muted",
          className,
        )}
        style={style}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-size-[32px_32px] opacity-60"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-[skeleton-shimmer_1.6s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent_25%,var(--muted)_50%,transparent_75%)] bg-size-[200%_100%] bg-no-repeat motion-reduce:animate-none"
        />
        <div className="relative grid justify-items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2.5 w-30 animate-[skeleton-shimmer_1.6s_ease-in-out_infinite] rounded-full bg-border bg-[linear-gradient(90deg,transparent_0%,color-mix(in_oklab,var(--foreground)_7%,transparent)_50%,transparent_100%)] bg-size-[200%_100%] bg-no-repeat motion-reduce:animate-none motion-reduce:bg-none"
          />
          <span className="text-[12px]/4 text-subtle-foreground">Loading map tiles…</span>
        </div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div
        data-slot="map-frame-placeholder"
        data-status="error"
        role="alert"
        className={cn(
          "absolute inset-0 z-0 grid place-items-center bg-muted text-center",
          context.variant === "compact" ? "p-4" : "p-6",
          className,
        )}
        style={style}
      >
        <div className="grid justify-items-center gap-1.5">
          <p className="m-0 text-[13px]/[18px] font-medium text-foreground">The map didn’t load</p>
          <p className="m-0 text-pretty text-[12.5px]/[18px] text-muted-foreground">
            Check your connection and try again.
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-0.5 inline-flex h-6.5 cursor-pointer items-center rounded-full border-0 bg-card px-3 text-[12px]/4 font-medium text-foreground shadow-[0_0_0_1px_var(--border-strong)] transition-[background-color,scale] duration-[120ms,140ms] ease-[ease-out,cubic-bezier(0.23,1,0.32,1)] outline-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <svg
      data-slot="map-frame-placeholder"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 640 400"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 -z-10 size-full", className)}
      style={style}
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

/**
 * Map controls placed in an overlay float above the tiles: a translucent popover surface with a
 * strong ring and a soft drop shadow, 28px buttons, and a hairline between grouped buttons.
 */
const floatingControls =
  "[&_[data-slot=map-controls]:not([data-variant=bar])>[data-slot=map-controls-group]]:gap-0.5 [&_[data-slot=map-controls]:not([data-variant=bar])>[data-slot=map-controls-group]]:overflow-visible [&_[data-slot=map-controls]:not([data-variant=bar])>[data-slot=map-controls-group]]:rounded-xl [&_[data-slot=map-controls]:not([data-variant=bar])>[data-slot=map-controls-group]]:bg-[color-mix(in_oklab,var(--popover)_92%,transparent)] [&_[data-slot=map-controls]:not([data-variant=bar])>[data-slot=map-controls-group]]:p-[3px] [&_[data-slot=map-controls]:not([data-variant=bar])>[data-slot=map-controls-group]]:shadow-[0_0_0_1px_var(--border-strong),0_10px_28px_oklch(0_0_0/0.12)] [&_[data-slot=map-controls]:not([data-variant=bar])>[data-slot=map-controls-group]]:backdrop-blur-[12px] dark:[&_[data-slot=map-controls]:not([data-variant=bar])>[data-slot=map-controls-group]]:shadow-[0_0_0_1px_var(--border-strong),0_10px_28px_oklch(0_0_0/0.42)] [&_[data-slot=map-controls][data-variant=stacked]_[data-slot=map-controls-button]]:size-7 [&_[data-slot=map-controls]:not([data-variant=bar])_[data-slot=map-controls-button]]:rounded-lg [&_[data-slot=map-controls]:not([data-variant=bar])_[data-slot=map-controls-button]:hover]:bg-accent [&_[data-slot=map-controls]:not([data-variant=bar])_[data-slot=map-controls-button]+[data-slot=map-controls-button]]:relative [&_[data-slot=map-controls]:not([data-variant=bar])_[data-slot=map-controls-button]+[data-slot=map-controls-button]]:before:pointer-events-none [&_[data-slot=map-controls]:not([data-variant=bar])_[data-slot=map-controls-button]+[data-slot=map-controls-button]]:before:absolute [&_[data-slot=map-controls]:not([data-variant=bar])_[data-slot=map-controls-button]+[data-slot=map-controls-button]]:before:inset-x-1 [&_[data-slot=map-controls]:not([data-variant=bar])_[data-slot=map-controls-button]+[data-slot=map-controls-button]]:before:-top-[1.5px] [&_[data-slot=map-controls]:not([data-variant=bar])_[data-slot=map-controls-button]+[data-slot=map-controls-button]]:before:h-px [&_[data-slot=map-controls]:not([data-variant=bar])_[data-slot=map-controls-button]+[data-slot=map-controls-button]]:before:bg-border";

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
        floatingControls,
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
  const context = useFrame("MapFrameAttribution");
  return (
    <p
      data-slot="map-frame-attribution"
      className={cn(
        "absolute z-10 m-0 h-5 max-w-[calc(100%-1rem)] truncate rounded-full bg-[color-mix(in_oklab,var(--popover)_94%,transparent)] px-2 text-[10.5px]/5 text-muted-foreground shadow-[0_0_0_1px_var(--border)] backdrop-blur-sm [&_a]:text-muted-foreground [&_a]:underline-offset-2 [&_a:hover]:text-foreground [&_a:hover]:underline",
        context.variant === "compact" ? "right-1.5 bottom-1.5" : "right-2 bottom-2",
        className,
      )}
      {...props}
    />
  );
}
