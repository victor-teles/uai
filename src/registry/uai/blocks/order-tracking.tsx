"use client";

import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DescriptionList,
  type DescriptionListProps,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";
import {
  OrderStatus,
  type OrderStatusProps,
  type OrderStatusVariant,
} from "@/components/ui/uai/order-status";
import { cn } from "@/lib/uai-utils";

export const ORDER_TRACKING_VARIANTS = ["split", "stacked", "compact"] as const;
export type OrderTrackingVariant = (typeof ORDER_TRACKING_VARIANTS)[number];
export type OrderTrackingProps = ComponentProps<"section"> & { variant?: OrderTrackingVariant };

type TrackingContext = { id: string; variant: OrderTrackingVariant };
const Context = createContext<TrackingContext | null>(null);
function useTracking(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within OrderTracking`);
  return context;
}

const statusVariants: Record<OrderTrackingVariant, OrderStatusVariant> = {
  split: "card",
  stacked: "card",
  compact: "compact",
};
const detailsVariants: Record<OrderTrackingVariant, DescriptionListVariant> = {
  split: "stacked",
  stacked: "grid",
  compact: "inline",
};

const actionButton =
  "transition-[background-color,filter,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

const orderTrackingVariants = cva(
  "@container box-border min-w-0 text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        split: "",
        stacked: "mx-auto my-0 max-w-[640px]",
        compact: "mx-auto my-0 max-w-[480px]",
      },
    },
  },
);

/** Order status, shipment events, delivery estimates, and support for one order. */
export function OrderTracking({
  variant = "split",
  children,
  className,
  ...props
}: OrderTrackingProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="order-tracking"
        data-variant={variant}
        className={cn(orderTrackingVariants({ variant }), className)}
        {...props}
      >
        <div
          className={cn(
            "grid min-w-0 items-start",
            variant === "compact" ? "gap-3" : "gap-5",
            variant === "split" &&
              "@min-[720px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] @min-[720px]:gap-x-7",
          )}
        >
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function OrderTrackingHeader({ className, ...props }: ComponentProps<"header">) {
  const { variant } = useTracking("OrderTrackingHeader");
  return (
    <header
      data-slot="order-tracking-header"
      className={cn(
        "flex min-w-0 flex-wrap items-end justify-between gap-3",
        variant === "split" && "@min-[720px]:col-span-full",
        className,
      )}
      {...props}
    />
  );
}

export function OrderTrackingHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="order-tracking-heading"
      className={cn("grid min-w-0 gap-1", className)}
      {...props}
    />
  );
}

export function OrderTrackingTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useTracking("OrderTrackingTitle");
  return (
    <h2
      data-slot="order-tracking-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.015em]",
        variant === "compact" ? "text-[18px]/[1.2]" : "text-[22px]/[1.2]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function OrderTrackingDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="order-tracking-description"
      className={cn("m-0 text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export type OrderTrackingEstimateProps = ComponentProps<"div"> & {
  /** Label above the estimate, for example "Estimated delivery". */
  label?: ReactNode;
};

/** The delivery estimate, the most prominent fact on the page. */
export function OrderTrackingEstimate({
  label = "Estimated delivery",
  children,
  className,
  ...props
}: OrderTrackingEstimateProps) {
  const { variant } = useTracking("OrderTrackingEstimate");
  const compact = variant === "compact";
  return (
    <div
      data-slot="order-tracking-estimate"
      className={cn(
        "grid gap-0.5 bg-card",
        compact ? "rounded-xl px-3 py-2" : "rounded-[14px] px-3.5 py-2.5",
        className,
      )}
      {...props}
    >
      <span className="text-[11.5px]/4 font-medium text-subtle-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold tabular-nums",
          compact ? "text-[15px]/[1.2]" : "text-[18px]/[1.2]",
        )}
      >
        {children}
      </span>
    </div>
  );
}

/** A column in the split layout; stacks with the other column on narrow containers. */
export function OrderTrackingColumn({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useTracking("OrderTrackingColumn");
  return (
    <div
      data-slot="order-tracking-column"
      className={cn(
        "grid min-w-0 content-start",
        variant === "compact" ? "gap-3" : "gap-5",
        className,
      )}
      {...props}
    />
  );
}

/** Fulfillment progress. Compose OrderStatus parts inside; the block picks the status style. */
export function OrderTrackingStatus(props: Omit<OrderStatusProps, "variant">) {
  const { variant } = useTracking("OrderTrackingStatus");
  return (
    <OrderStatus data-slot="order-tracking-status" {...props} variant={statusVariants[variant]} />
  );
}

export type OrderTrackingPanelProps = ComponentProps<"section"> & { title: ReactNode };

/** A titled card, used for shipment events, items, details, and support. */
export function OrderTrackingPanel({
  title,
  children,
  className,
  ...props
}: OrderTrackingPanelProps) {
  const { variant } = useTracking("OrderTrackingPanel");
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      data-slot="order-tracking-panel"
      className={cn(
        "box-border grid min-w-0 bg-card",
        variant === "compact" ? "gap-2.5 rounded-xl p-3" : "gap-3.5 rounded-[14px] p-4",
        className,
      )}
      {...props}
    >
      <h3 id={id} className="m-0 text-[14px]/5 font-medium">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Shipment scan events, newest first. */
export function OrderTrackingEvents({ className, ...props }: ComponentProps<"ol">) {
  useTracking("OrderTrackingEvents");
  return (
    <ol
      data-slot="order-tracking-events"
      className={cn("m-0 grid list-none gap-0 p-0", className)}
      {...props}
    />
  );
}

export type OrderTrackingEventProps = ComponentProps<"li"> & {
  /** Machine-readable timestamp for the time element. */
  dateTime: string;
  /** Visible time text, for example "Today, 7:42 AM". */
  time: ReactNode;
  location?: ReactNode;
  /** Marks the most recent event. */
  latest?: boolean;
};

/** One scan event with its time and location. */
export function OrderTrackingEvent({
  dateTime,
  time,
  location,
  latest = false,
  children,
  className,
  ...props
}: OrderTrackingEventProps) {
  useTracking("OrderTrackingEvent");
  return (
    <li
      data-slot="order-tracking-event"
      className={cn(
        "relative grid grid-cols-[13px_minmax(0,1fr)] gap-x-2.5 pb-3.5",
        "not-last:before:absolute not-last:before:top-[17px] not-last:before:bottom-px not-last:before:left-1.5 not-last:before:w-px not-last:before:bg-border",
        className,
      )}
      {...props}
      data-latest={latest || undefined}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-1.5 ml-0.75 size-1.75 rounded-full",
          latest ? "bg-foreground ring-3 ring-foreground/14" : "bg-border-strong",
        )}
      />
      <div className="grid min-w-0 gap-0.5">
        <span
          className={latest ? "font-medium text-foreground" : "font-normal text-muted-foreground"}
        >
          {children}
        </span>
        <span className="text-xs/4 text-subtle-foreground tabular-nums">
          <time dateTime={dateTime}>{time}</time>
          {location ? <> · {location}</> : null}
        </span>
      </div>
    </li>
  );
}

export type OrderTrackingEarlierEventsProps = ComponentProps<"div"> & {
  /** Disclosure button text, for example "Show 4 earlier events". */
  label: ReactNode;
  /** Button text while expanded. */
  expandedLabel?: ReactNode;
  defaultOpen?: boolean;
};

/** Discloses older events. Compose OrderTrackingEvent items inside. */
export function OrderTrackingEarlierEvents({
  label,
  expandedLabel = "Hide earlier events",
  defaultOpen = false,
  children,
  className,
  ...props
}: OrderTrackingEarlierEventsProps) {
  useTracking("OrderTrackingEarlierEvents");
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <div
        data-slot="order-tracking-earlier-events"
        className={cn("grid gap-2", className)}
        {...props}
      >
        <CollapsibleContent id={id}>
          <ol
            className={cn(
              "m-0 grid list-none p-0",
              "[&>li]:animate-in [&>li]:fade-in-0 [&>li]:slide-in-from-bottom-1 [&>li]:duration-240 [&>li]:ease-out-quint [&>li]:fill-mode-both motion-reduce:[&>li]:animate-none",
              "[&>li:nth-child(2)]:[animation-delay:40ms] [&>li:nth-child(3)]:[animation-delay:80ms] [&>li:nth-child(4)]:[animation-delay:120ms] [&>li:nth-child(n+5)]:[animation-delay:160ms]",
            )}
          >
            {children}
          </ol>
        </CollapsibleContent>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-controls={id}
            className={cn(
              actionButton,
              "-mt-1 mr-0 mb-0 ml-[13px] h-7 cursor-pointer gap-1.5 justify-self-start rounded-lg border-0 bg-transparent px-2.5 py-0 text-[12.5px] text-muted-foreground hover:bg-accent hover:text-foreground has-[>svg]:px-2.5 dark:hover:bg-accent",
            )}
          >
            {open ? expandedLabel : label}
            <ChevronDown
              size={14}
              strokeWidth={1.75}
              aria-hidden="true"
              className={cn(
                "size-3.5 transition-transform duration-180 ease-out-quint motion-reduce:transition-none",
                open && "rotate-180",
              )}
            />
          </Button>
        </CollapsibleTrigger>
      </div>
    </Collapsible>
  );
}

/** Shipping facts such as carrier, tracking number, and address. Compose DescriptionList parts inside. */
export function OrderTrackingDetails(props: Omit<DescriptionListProps, "variant">) {
  const { variant } = useTracking("OrderTrackingDetails");
  return (
    <DescriptionList
      data-slot="order-tracking-details"
      {...props}
      variant={detailsVariants[variant]}
    />
  );
}

/** Support links and copy for problems with the order. */
export function OrderTrackingSupport({ children, className, ...props }: ComponentProps<"div">) {
  useTracking("OrderTrackingSupport");
  return (
    <div
      data-slot="order-tracking-support"
      className={cn("grid gap-2.5 text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function OrderTrackingSupportActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="order-tracking-support-actions"
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  );
}

export function OrderTrackingSupportAction({
  emphasis = "secondary",
  className,
  ...props
}: ComponentProps<"a"> & { emphasis?: "primary" | "secondary" }) {
  const { variant } = useTracking("OrderTrackingSupportAction");
  return (
    <Button
      asChild
      variant={emphasis === "primary" ? "default" : "secondary"}
      className={cn(
        actionButton,
        "rounded-full px-3.5 py-0 text-[12.5px] no-underline has-[>svg]:px-3.5",
        variant === "compact" ? "h-7" : "h-8",
        emphasis === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary hover:brightness-108"
          : "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
        className,
      )}
    >
      <a data-slot="order-tracking-support-action" {...props} data-kind={emphasis} />
    </Button>
  );
}
