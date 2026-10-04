"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useId,
  useState,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/uai-utils";

export const MAP_LEGEND_VARIANTS = ["card", "floating", "compact"] as const;
export type MapLegendVariant = (typeof MAP_LEGEND_VARIANTS)[number];
export const MAP_LEGEND_SWATCH_SHAPES = ["fill", "line", "dot"] as const;
export type MapLegendSwatchShape = (typeof MAP_LEGEND_SWATCH_SHAPES)[number];
export type MapLegendProps = Omit<ComponentProps<"section">, "defaultValue"> & {
  variant?: MapLegendVariant;
  /** Visible layers. Items without a value are not toggleable. */
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
};

type LegendContext = {
  variant: MapLegendVariant;
  titleId: string;
  visible: readonly string[];
  toggle: (value: string, visible: boolean) => void;
};
const Context = createContext<LegendContext | null>(null);
function useLegend(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within MapLegend`);
  return context;
}

const mapLegendVariants = cva("grid min-w-0 text-[13px]/[18px] text-card-foreground", {
  variants: {
    variant: {
      card: "w-64 gap-3 rounded-[14px] bg-card p-4 shadow-[0_0_0_1px_var(--border)]",
      floating:
        "w-64 gap-2.5 rounded-[14px] bg-card/88 p-3 shadow-[0_0_0_1px_var(--border-strong),0_12px_28px_-10px_oklch(0_0_0/0.32),0_2px_6px_-2px_oklch(0_0_0/0.12)] backdrop-blur-md",
      compact: "w-56 gap-2 rounded-xl bg-card p-2.5 text-[12px]/4 shadow-[0_0_0_1px_var(--border)]",
    },
  },
});

/** Explains map symbols and, optionally, toggles the layers they belong to. */
export function MapLegend({
  variant = "card",
  value,
  defaultValue = [],
  onValueChange,
  className,
  children,
  ...props
}: MapLegendProps) {
  const titleId = useId();
  const [internal, setInternal] = useState<readonly string[]>(defaultValue);
  const visible = value ?? internal;
  const toggle = (layer: string, show: boolean) => {
    const next = show
      ? [...visible.filter((item) => item !== layer), layer]
      : visible.filter((item) => item !== layer);
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <Context.Provider value={{ variant, titleId, visible, toggle }}>
      <section
        data-slot="map-legend"
        aria-labelledby={titleId}
        className={cn(mapLegendVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function MapLegendHeader({ className, ...props }: ComponentProps<"div">) {
  useLegend("MapLegendHeader");
  return (
    <div
      data-slot="map-legend-header"
      className={cn("flex min-w-0 items-baseline justify-between gap-2", className)}
      {...props}
    />
  );
}

export function MapLegendTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useLegend("MapLegendTitle");
  return (
    <h2
      data-slot="map-legend-title"
      className={cn(
        "m-0 font-medium text-foreground",
        context.variant === "compact" ? "text-[12px]/4" : "text-[13px]/[18px]",
        className,
      )}
      {...props}
      id={context.titleId}
    />
  );
}

/** Tertiary context, such as the data date or source. */
export function MapLegendDescription({ className, ...props }: ComponentProps<"p">) {
  useLegend("MapLegendDescription");
  return (
    <p
      data-slot="map-legend-description"
      className={cn("m-0 text-[11.5px]/4 text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export function MapLegendItems({ className, ...props }: ComponentProps<"ul">) {
  const context = useLegend("MapLegendItems");
  return (
    <ul
      data-slot="map-legend-items"
      className={cn(
        "m-0 grid list-none p-0",
        context.variant === "compact" ? "gap-0" : "gap-0.5",
        className,
      )}
      {...props}
    />
  );
}

export type MapLegendItemProps = ComponentProps<"li"> & {
  /** Layer id. When set, the row becomes a visibility checkbox. */
  value?: string;
  disabled?: boolean;
};

export function MapLegendItem({
  value,
  disabled,
  className,
  children,
  ...props
}: MapLegendItemProps) {
  const context = useLegend("MapLegendItem");
  const id = useId();
  const compact = context.variant === "compact";
  const visible = value === undefined || context.visible.includes(value);
  const row = cn(
    "flex min-w-0 items-center gap-2.5 rounded-lg",
    compact ? "min-h-7 gap-2 px-1.5" : "min-h-8 px-2",
  );
  return (
    <li
      data-slot="map-legend-item"
      data-hidden={!visible || undefined}
      className={cn("min-w-0", className)}
      {...props}
    >
      {value === undefined ? (
        <span className={row}>{children}</span>
      ) : (
        <label
          htmlFor={id}
          className={cn(
            row,
            "cursor-pointer transition-[background-color,opacity] duration-120 ease-out hover:bg-secondary has-disabled:cursor-not-allowed has-disabled:opacity-50 has-disabled:hover:bg-transparent motion-reduce:transition-none",
          )}
        >
          {children}
          <Checkbox
            id={id}
            checked={visible}
            disabled={disabled}
            onCheckedChange={(checked) => context.toggle(value, checked === true)}
            className={cn(
              "ml-auto rounded-[5px] border-border-strong bg-transparent shadow-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid dark:bg-transparent",
              compact && "size-3.5 [&_svg]:size-3",
            )}
          />
        </label>
      )}
    </li>
  );
}

export type MapLegendSwatchProps = ComponentProps<"span"> & {
  /** Any CSS color, usually the same value your map layer paints with. */
  color: string;
  shape?: MapLegendSwatchShape;
};

/** The symbol a layer uses on the map. Fades when its layer is hidden. */
export function MapLegendSwatch({
  color,
  shape = "fill",
  className,
  style,
  ...props
}: MapLegendSwatchProps) {
  useLegend("MapLegendSwatch");
  return (
    <span
      data-slot="map-legend-swatch"
      data-shape={shape}
      aria-hidden="true"
      className={cn(
        "shrink-0 bg-(--swatch) transition-opacity duration-180 ease-out in-data-hidden:opacity-35 motion-reduce:transition-none",
        shape === "fill" && "size-3 rounded-[4px] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.12)]",
        shape === "line" && "h-[3px] w-3.5 rounded-full",
        shape === "dot" && "size-2.5 rounded-full shadow-[0_0_0_2px_var(--card)]",
        className,
      )}
      style={{ "--swatch": color, ...style } as CSSProperties}
      {...props}
    />
  );
}

export function MapLegendLabel({ className, ...props }: ComponentProps<"span">) {
  useLegend("MapLegendLabel");
  return (
    <span
      data-slot="map-legend-label"
      className={cn(
        "min-w-0 flex-1 truncate text-foreground transition-colors duration-180 in-data-hidden:text-subtle-foreground motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

/** A count or measurement beside a label. */
export function MapLegendValue({ className, ...props }: ComponentProps<"span">) {
  useLegend("MapLegendValue");
  return (
    <span
      data-slot="map-legend-value"
      className={cn("shrink-0 text-[11.5px]/4 text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export type MapLegendScaleProps = ComponentProps<"figure"> & {
  /** Colors from the lowest to the highest value, painted as one gradient. */
  colors: readonly string[];
  /** Describes the ramp for assistive technology, for example "Rent from $1,200 to $3,400". */
  label: string;
};

/** A continuous color ramp. Pass the stop labels as children, lowest first. */
export function MapLegendScale({
  colors,
  label,
  className,
  children,
  ...props
}: MapLegendScaleProps) {
  useLegend("MapLegendScale");
  return (
    <figure data-slot="map-legend-scale" className={cn("m-0 grid gap-1.5", className)} {...props}>
      <span
        role="img"
        aria-label={label}
        className="block h-2 rounded-full shadow-[inset_0_0_0_1px_oklch(0_0_0/0.08)]"
        style={{ backgroundImage: `linear-gradient(to right, ${colors.join(", ")})` }}
      />
      <figcaption
        aria-hidden="true"
        className="flex justify-between gap-2 text-[11.5px]/4 text-subtle-foreground tabular-nums"
      >
        {children}
      </figcaption>
    </figure>
  );
}
