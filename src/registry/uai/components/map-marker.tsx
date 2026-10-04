"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext } from "react";
import { cn } from "@/lib/uai-utils";

export const MAP_MARKER_VARIANTS = ["pin", "dot", "label"] as const;
export type MapMarkerVariant = (typeof MAP_MARKER_VARIANTS)[number];
export const MAP_MARKER_TONES = [
  "default",
  "primary",
  "success",
  "warning",
  "destructive",
] as const;
export type MapMarkerTone = (typeof MAP_MARKER_TONES)[number];
export type MapMarkerProps = Omit<ComponentProps<"button">, "aria-label"> & {
  variant?: MapMarkerVariant;
  tone?: MapMarkerTone;
  /** Spoken name of the place, for example "Ferrow Coffee, open until 6 PM". */
  label: string;
  /** The marker whose details are showing. Raises it and fills it with ink. */
  selected?: boolean;
};

type MarkerContext = { variant: MapMarkerVariant };
const Context = createContext<MarkerContext | null>(null);
function useMarker(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within MapMarker`);
  return context;
}

const toneClasses =
  "data-[tone=default]:[--marker:var(--foreground)] data-[tone=primary]:[--marker:var(--primary)] data-[tone=success]:[--marker:var(--success)] data-[tone=warning]:[--marker:var(--warning)] data-[tone=destructive]:[--marker:var(--destructive)]";

const mapMarkerVariants = cva(
  `group/map-marker relative inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[12px]/4 font-medium text-foreground transition-[scale,translate] duration-180 ease-out-quint outline-none hover:z-10 focus-visible:z-10 aria-pressed:z-20 motion-reduce:transition-none ${toneClasses}`,
  {
    variants: {
      variant: {
        pin: "flex-col pb-0.5 hover:-translate-y-0.5 aria-pressed:-translate-y-1 motion-reduce:translate-y-0!",
        dot: "size-6",
        label: "hover:-translate-y-0.5 motion-reduce:translate-y-0!",
      },
    },
  },
);

/**
 * A selectable place on the map. Your map library positions it; anchor it at the bottom
 * center for the pin and label variants, and at the center for the dot variant.
 */
export function MapMarker({
  variant = "pin",
  tone = "default",
  label,
  selected = false,
  type = "button",
  className,
  children,
  ...props
}: MapMarkerProps) {
  return (
    <Context.Provider value={{ variant }}>
      <button
        data-slot="map-marker"
        type={type}
        aria-label={label}
        aria-pressed={selected}
        data-tone={tone}
        className={cn(mapMarkerVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {variant === "pin" && (
          <span className="relative grid size-8 place-items-center rounded-[50%_50%_50%_6px] bg-card text-(--marker) shadow-[0_0_0_1px_var(--border-strong),0_6px_14px_-6px_oklch(0_0_0/0.4)] [rotate:-45deg] transition-[background-color,color,box-shadow] duration-120 ease-out group-focus-visible/map-marker:shadow-[0_0_0_2px_var(--ring),0_6px_14px_-6px_oklch(0_0_0/0.4)] group-aria-pressed/map-marker:bg-(--marker) group-aria-pressed/map-marker:text-card group-aria-pressed/map-marker:shadow-[0_0_0_2px_var(--card),0_8px_18px_-6px_oklch(0_0_0/0.45)] group-data-[tone=default]/map-marker:group-aria-pressed/map-marker:text-background">
            <span className="grid [rotate:45deg] place-items-center">{children}</span>
          </span>
        )}
        {variant === "dot" && (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-(--marker)/24 opacity-0 transition-opacity duration-180 group-hover/map-marker:opacity-100 group-aria-pressed/map-marker:animate-ring-pulse group-aria-pressed/map-marker:opacity-100 motion-reduce:animate-none!"
            />
            <span className="relative size-3 rounded-full bg-(--marker) shadow-[0_0_0_2px_var(--card),0_2px_6px_oklch(0_0_0/0.3)] transition-[scale] duration-180 ease-out-quint group-focus-visible/map-marker:shadow-[0_0_0_2px_var(--card),0_0_0_4px_var(--ring)] group-aria-pressed/map-marker:scale-125 motion-reduce:transition-none" />
            {children}
          </>
        )}
        {variant === "label" && (
          <span className="relative inline-flex h-7 items-center gap-1.5 rounded-full bg-card px-2.5 text-(--marker) shadow-[0_0_0_1px_var(--border-strong),0_6px_14px_-6px_oklch(0_0_0/0.4)] transition-[background-color,color,box-shadow] duration-120 ease-out group-focus-visible/map-marker:shadow-[0_0_0_2px_var(--ring),0_6px_14px_-6px_oklch(0_0_0/0.4)] group-aria-pressed/map-marker:bg-(--marker) group-aria-pressed/map-marker:text-card group-data-[tone=default]/map-marker:group-aria-pressed/map-marker:text-background after:absolute after:top-full after:left-1/2 after:size-2 after:-translate-x-1/2 after:-translate-y-1 after:rotate-45 after:rounded-[2px] after:bg-inherit after:shadow-[1px_1px_0_0_var(--border-strong)] group-aria-pressed/map-marker:after:shadow-none">
            {children}
          </span>
        )}
      </button>
    </Context.Provider>
  );
}

/** A 16px glyph inside the pin or label. Decorative; the marker label names the place. */
export function MapMarkerIcon({ className, ...props }: ComponentProps<"span">) {
  const context = useMarker("MapMarkerIcon");
  return (
    <span
      data-slot="map-marker-icon"
      aria-hidden="true"
      className={cn(
        "grid place-items-center [&_svg]:size-4 [&_svg]:stroke-[1.9]",
        context.variant === "label" && "[&_svg]:size-3.5",
        context.variant === "dot" && "hidden",
        className,
      )}
      {...props}
    />
  );
}

/** Visible text: the price, name, or short status for label markers, or a caption below pins and dots. */
export function MapMarkerLabel({ className, ...props }: ComponentProps<"span">) {
  const context = useMarker("MapMarkerLabel");
  return (
    <span
      data-slot="map-marker-label"
      aria-hidden="true"
      className={cn(
        "whitespace-nowrap tabular-nums",
        context.variant !== "label" &&
          "absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-md bg-card/90 px-1.5 py-px text-[11.5px]/4 text-foreground shadow-[0_0_0_1px_var(--border)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

export type MapMarkerClusterProps = Omit<ComponentProps<"button">, "aria-label"> & {
  /** Number of places grouped under this marker. */
  count: number;
  /** Spoken name. Defaults to "{count} places, zoom in to expand". */
  label?: string;
};

/** Several nearby places shown as one count. Selecting it usually zooms in. */
export function MapMarkerCluster({
  count,
  label,
  type = "button",
  className,
  ...props
}: MapMarkerClusterProps) {
  const size =
    count >= 100
      ? "size-11 text-[12px]"
      : count >= 10
        ? "size-9 text-[12px]"
        : "size-8 text-[12.5px]";
  return (
    <button
      data-slot="map-marker-cluster"
      type={type}
      aria-label={label ?? `${count} places, zoom in to expand`}
      className={cn(
        "grid cursor-pointer place-items-center rounded-full border-0 bg-foreground p-0 font-medium text-background tabular-nums shadow-[0_0_0_4px_color-mix(in_oklab,var(--foreground)_18%,transparent),0_6px_14px_-6px_oklch(0_0_0/0.4)] transition-[scale,box-shadow] duration-180 ease-out-quint outline-none hover:scale-105 focus-visible:shadow-[0_0_0_4px_var(--ring)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
        size,
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">{count > 999 ? `${Math.floor(count / 1000)}k` : count}</span>
    </button>
  );
}
