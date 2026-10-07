"use client";

import { cva } from "class-variance-authority";
import { Compass, LocateFixed, LocateOff, Minus, Plus } from "lucide-react";
import { type ComponentProps, createContext, type ReactNode, useContext } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/uai-utils";

export const MAP_CONTROLS_VARIANTS = ["stacked", "bar", "compact"] as const;
export type MapControlsVariant = (typeof MAP_CONTROLS_VARIANTS)[number];
export const MAP_CONTROLS_LOCATE_STATUSES = ["idle", "locating", "active", "error"] as const;
export type MapControlsLocateStatus = (typeof MAP_CONTROLS_LOCATE_STATUSES)[number];
export type MapControlsProps = ComponentProps<"div"> & { variant?: MapControlsVariant };

type ControlsContext = { variant: MapControlsVariant };
const Context = createContext<ControlsContext | null>(null);
function useControls(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within MapControls`);
  return context;
}

const mapControlsVariants = cva("flex w-max text-foreground", {
  variants: {
    variant: {
      stacked: "flex-col gap-2",
      bar: "flex-row items-center gap-1 rounded-full bg-card p-1 shadow-[0_0_0_1px_var(--border),0_6px_16px_-8px_oklch(0_0_0/0.24)]",
      compact: "flex-col gap-1.5",
    },
  },
});

/** Groups map camera controls. Each control is a named native button. */
export function MapControls({
  variant = "stacked",
  "aria-label": label = "Map controls",
  className,
  ...props
}: MapControlsProps) {
  return (
    <Context.Provider value={{ variant }}>
      {/* biome-ignore lint/a11y/useSemanticElements: a labelled group of buttons, not a form fieldset. */}
      <div
        data-slot="map-controls"
        role="group"
        aria-label={label}
        className={cn(mapControlsVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      />
    </Context.Provider>
  );
}

const groupVariants = cva("flex", {
  variants: {
    variant: {
      stacked:
        "flex-col overflow-hidden rounded-[14px] bg-card shadow-[0_0_0_1px_var(--border),0_6px_16px_-8px_oklch(0_0_0/0.24)]",
      bar: "flex-row items-center gap-0.5 not-first:border-l not-first:pl-1",
      compact:
        "flex-col overflow-hidden rounded-xl bg-card shadow-[0_0_0_1px_var(--border),0_4px_12px_-6px_oklch(0_0_0/0.24)]",
    },
  },
});

/** Visually joins related controls, such as zoom in and zoom out. */
export function MapControlsGroup({ className, ...props }: ComponentProps<"div">) {
  const context = useControls("MapControlsGroup");
  return (
    <div
      data-slot="map-controls-group"
      className={cn(groupVariants({ variant: context.variant }), className)}
      {...props}
    />
  );
}

const buttonVariants = cva(
  "rounded-none border-0 bg-transparent p-0 text-muted-foreground shadow-none transition-[background-color,color,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] hover:bg-secondary hover:text-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.94] disabled:opacity-40 aria-pressed:text-primary motion-reduce:transition-none motion-reduce:active:scale-100 dark:hover:bg-secondary",
  {
    variants: {
      variant: {
        stacked: "size-8 [&_svg:not([class*='size-'])]:size-4",
        bar: "size-7 rounded-full [&_svg:not([class*='size-'])]:size-[15px]",
        compact: "size-6 [&_svg:not([class*='size-'])]:size-[13px]",
      },
    },
  },
);

export type MapControlsButtonProps = Omit<ComponentProps<"button">, "aria-label"> & {
  /** Spoken and tooltip name, for example "Zoom in". */
  label: string;
};

/** A camera control. Pass an icon as children. */
export function MapControlsButton({
  label,
  type = "button",
  className,
  children,
  ...props
}: MapControlsButtonProps) {
  const context = useControls("MapControlsButton");
  return (
    <Button
      data-slot="map-controls-button"
      type={type}
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      className={cn(buttonVariants({ variant: context.variant }), className)}
      {...props}
    >
      {children}
    </Button>
  );
}

type PresetProps = Omit<MapControlsButtonProps, "label" | "children"> & {
  label?: string;
  children?: ReactNode;
};

export function MapControlsZoomIn({ label = "Zoom in", children, ...props }: PresetProps) {
  return (
    <MapControlsButton label={label} {...props}>
      {children ?? <Plus strokeWidth={1.75} aria-hidden="true" />}
    </MapControlsButton>
  );
}

export function MapControlsZoomOut({ label = "Zoom out", children, ...props }: PresetProps) {
  return (
    <MapControlsButton label={label} {...props}>
      {children ?? <Minus strokeWidth={1.75} aria-hidden="true" />}
    </MapControlsButton>
  );
}

export type MapControlsCompassProps = PresetProps & {
  /** Current map bearing in degrees. The needle counter-rotates to keep pointing north. */
  bearing?: number;
};

export function MapControlsCompass({
  bearing = 0,
  label = "Reset bearing to north",
  children,
  ...props
}: MapControlsCompassProps) {
  return (
    <MapControlsButton label={label} data-bearing={Math.round(bearing)} {...props}>
      {children ?? (
        <Compass
          strokeWidth={1.75}
          aria-hidden="true"
          className="transition-[rotate] duration-300 ease-out-quint motion-reduce:transition-none"
          style={{ rotate: `${-45 - bearing}deg` }}
        />
      )}
    </MapControlsButton>
  );
}

const locateLabels: Record<MapControlsLocateStatus, string> = {
  idle: "Show my location",
  locating: "Finding your location",
  active: "Following your location",
  error: "Location unavailable, try again",
};

export type MapControlsLocateProps = PresetProps & { status?: MapControlsLocateStatus };

/** Requests or follows the device location. The status is spoken in the button name. */
export function MapControlsLocate({
  status = "idle",
  label,
  className,
  children,
  ...props
}: MapControlsLocateProps) {
  const Icon = status === "error" ? LocateOff : LocateFixed;
  return (
    <MapControlsButton
      label={label ?? locateLabels[status]}
      aria-pressed={status === "active"}
      aria-busy={status === "locating" || undefined}
      data-status={status}
      className={cn(
        // The radar ping sits around the icon so grouped controls never clip it.
        "relative after:pointer-events-none after:absolute after:top-1/2 after:left-1/2 after:size-2 after:-translate-1/2 after:rounded-full data-[status=error]:text-destructive motion-safe:data-[status=locating]:after:animate-ring-pulse",
        className,
      )}
      {...props}
    >
      {children ?? <Icon strokeWidth={1.75} aria-hidden="true" />}
    </MapControlsButton>
  );
}
