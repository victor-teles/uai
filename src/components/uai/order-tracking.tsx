"use client";

import { ChevronDown } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";
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

const layoutCss = `
[data-uai-tracking-layout]{display:grid;gap:20px;align-items:start;min-width:0}
[data-uai-tracking="compact"]>[data-uai-tracking-layout]{gap:12px}
[data-uai-tracking-column]{display:grid;gap:20px;align-content:start;min-width:0}
[data-uai-tracking="compact"] [data-uai-tracking-column]{gap:12px}
@container (min-width: 720px){
  [data-uai-tracking="split"]>[data-uai-tracking-layout]{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);column-gap:28px}
  [data-uai-tracking="split"] [data-uai-tracking-full]{grid-column:1 / -1}
}
.uai-tracking-disclosure-icon{transition:transform 180ms cubic-bezier(0.23,1,0.32,1)}
[aria-expanded=true]>.uai-tracking-disclosure-icon{transform:rotate(180deg)}
[data-uai-tracking-event]{position:relative}
[data-uai-tracking-event]:not(:last-child)::before{content:"";position:absolute;left:6px;top:17px;bottom:1px;width:1px;background:var(--uai-border)}
[data-uai-tracking-earlier]>li{animation:uai-tracking-fade-up 240ms cubic-bezier(0.23,1,0.32,1) both}
[data-uai-tracking-earlier]>li:nth-child(2){animation-delay:40ms}
[data-uai-tracking-earlier]>li:nth-child(3){animation-delay:80ms}
[data-uai-tracking-earlier]>li:nth-child(4){animation-delay:120ms}
[data-uai-tracking-earlier]>li:nth-child(n+5){animation-delay:160ms}
@keyframes uai-tracking-fade-up{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.uai-tracking-button{transition:background-color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-tracking-button:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-tracking-button:active{transform:scale(0.97)}
.uai-tracking-button[data-kind=primary]:hover{filter:brightness(1.08)}
.uai-tracking-button[data-kind=secondary]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-tracking-button[data-kind=ghost]:hover{background:var(--uai-surface-raised);color:var(--uai-text)}
@media (prefers-reduced-motion: reduce){.uai-tracking-disclosure-icon,.uai-tracking-button{transition:none}[data-uai-tracking-earlier]>li{animation:none}.uai-tracking-button:active{transform:none}}
`;

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

function card(variant: OrderTrackingVariant) {
  const compact = variant === "compact";
  return {
    boxSizing: "border-box",
    display: "grid",
    gap: compact ? 10 : 14,
    minWidth: 0,
    padding: compact ? 12 : 16,
    borderRadius: compact ? 12 : 14,
    background: "var(--uai-surface)",
  } as const;
}

/** Order status, shipment events, delivery estimates, and support for one order. */
export function OrderTracking({
  variant = "split",
  children,
  style,
  ...props
}: OrderTrackingProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-tracking={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...(variant === "stacked" ? { maxWidth: 640, margin: "0 auto" } : null),
          ...(variant === "compact" ? { maxWidth: 480, margin: "0 auto" } : null),
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-tracking-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function OrderTrackingHeader({ style, ...props }: ComponentProps<"header">) {
  useTracking("OrderTrackingHeader");
  return (
    <header
      {...props}
      data-uai-tracking-full=""
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function OrderTrackingHeading({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "grid", gap: 4, minWidth: 0, ...style }} />;
}

export function OrderTrackingTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useTracking("OrderTrackingTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 18 : 22,
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "-0.015em",
        ...style,
      }}
    />
  );
}

export function OrderTrackingDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-muted)", fontVariantNumeric: "tabular-nums", ...style }}
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
  style,
  ...props
}: OrderTrackingEstimateProps) {
  const { variant } = useTracking("OrderTrackingEstimate");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: 2,
        padding: variant === "compact" ? "8px 12px" : "10px 14px",
        borderRadius: variant === "compact" ? 12 : 14,
        background: "var(--uai-surface)",
        ...style,
      }}
    >
      <span
        style={{
          color: "var(--uai-subtle)",
          fontSize: 11.5,
          fontWeight: 500,
          lineHeight: "16px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: variant === "compact" ? 15 : 18,
          fontWeight: 600,
          lineHeight: 1.2,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {children}
      </span>
    </div>
  );
}

/** A column in the split layout; stacks with the other column on narrow containers. */
export function OrderTrackingColumn({ style, ...props }: ComponentProps<"div">) {
  useTracking("OrderTrackingColumn");
  return <div {...props} data-uai-tracking-column="" style={style} />;
}

/** Fulfillment progress. Compose OrderStatus parts inside; the block picks the status style. */
export function OrderTrackingStatus(props: Omit<OrderStatusProps, "variant">) {
  const { variant } = useTracking("OrderTrackingStatus");
  return <OrderStatus {...props} variant={statusVariants[variant]} />;
}

export type OrderTrackingPanelProps = ComponentProps<"section"> & { title: ReactNode };

/** A titled card, used for shipment events, items, details, and support. */
export function OrderTrackingPanel({ title, children, style, ...props }: OrderTrackingPanelProps) {
  const { variant } = useTracking("OrderTrackingPanel");
  const id = useId();
  return (
    <section aria-labelledby={id} {...props} style={{ ...card(variant), ...style }}>
      <h3 id={id} style={{ margin: 0, fontSize: 14, fontWeight: 500, lineHeight: "20px" }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Shipment scan events, newest first. */
export function OrderTrackingEvents({ style, ...props }: ComponentProps<"ol">) {
  useTracking("OrderTrackingEvents");
  return (
    <ol
      {...props}
      style={{ display: "grid", gap: 0, margin: 0, padding: 0, listStyle: "none", ...style }}
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

export function OrderTrackingEvent({
  dateTime,
  time,
  location,
  latest = false,
  children,
  style,
  ...props
}: OrderTrackingEventProps) {
  useTracking("OrderTrackingEvent");
  return (
    <li
      {...props}
      data-latest={latest || undefined}
      data-uai-tracking-event=""
      style={{
        display: "grid",
        gridTemplateColumns: "13px minmax(0, 1fr)",
        columnGap: 10,
        paddingBottom: 14,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          marginTop: 6,
          marginLeft: 3,
          borderRadius: 999,
          background: latest ? "var(--uai-text)" : "var(--uai-border-strong)",
          boxShadow: latest
            ? "0 0 0 3px color-mix(in oklab, var(--uai-text) 14%, transparent)"
            : "none",
        }}
      />
      <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <span
          style={{
            fontWeight: latest ? 500 : 400,
            color: latest ? "var(--uai-text)" : "var(--uai-muted)",
          }}
        >
          {children}
        </span>
        <span
          style={{
            color: "var(--uai-subtle)",
            fontSize: 12,
            lineHeight: "16px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
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
  style,
  ...props
}: OrderTrackingEarlierEventsProps) {
  useTracking("OrderTrackingEarlierEvents");
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div {...props} style={{ display: "grid", gap: 8, ...style }}>
      <ol
        id={id}
        hidden={!open}
        data-uai-tracking-earlier=""
        style={{ display: open ? "grid" : "none", margin: 0, padding: 0, listStyle: "none" }}
      >
        {children}
      </ol>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="uai-tracking-button"
        data-kind="ghost"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifySelf: "start",
          gap: 6,
          height: 28,
          margin: "-4px 0 0 13px",
          padding: "0 10px",
          border: 0,
          borderRadius: 8,
          background: "transparent",
          color: "var(--uai-muted)",
          fontSize: 12.5,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        {open ? expandedLabel : label}
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          aria-hidden="true"
          className="uai-tracking-disclosure-icon"
        />
      </button>
    </div>
  );
}

/** Shipping facts such as carrier, tracking number, and address. Compose DescriptionList parts inside. */
export function OrderTrackingDetails(props: Omit<DescriptionListProps, "variant">) {
  const { variant } = useTracking("OrderTrackingDetails");
  return <DescriptionList {...props} variant={detailsVariants[variant]} />;
}

/** Support links and copy for problems with the order. */
export function OrderTrackingSupport({ children, style, ...props }: ComponentProps<"div">) {
  useTracking("OrderTrackingSupport");
  return (
    <div {...props} style={{ display: "grid", gap: 10, color: "var(--uai-muted)", ...style }}>
      {children}
    </div>
  );
}

export function OrderTrackingSupportActions({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "flex", flexWrap: "wrap", gap: 8, ...style }} />;
}

export function OrderTrackingSupportAction({
  emphasis = "secondary",
  className,
  style,
  ...props
}: ComponentProps<"a"> & { emphasis?: "primary" | "secondary" }) {
  const { variant } = useTracking("OrderTrackingSupportAction");
  const primary = emphasis === "primary";
  return (
    <a
      {...props}
      className={className ? `uai-tracking-button ${className}` : "uai-tracking-button"}
      data-kind={emphasis}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: variant === "compact" ? 28 : 32,
        padding: "0 14px",
        borderRadius: 999,
        background: primary ? "var(--uai-accent)" : "var(--uai-surface-raised)",
        color: primary ? "var(--uai-accent-foreground)" : "var(--uai-text)",
        fontSize: 12.5,
        fontWeight: 500,
        textDecoration: "none",
        ...style,
      }}
    />
  );
}
