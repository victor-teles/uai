"use client";

import { cva } from "class-variance-authority";
import { Star, X } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/uai-utils";

export const PLACE_CARD_VARIANTS = ["card", "popup", "compact"] as const;
export type PlaceCardVariant = (typeof PLACE_CARD_VARIANTS)[number];
export const PLACE_CARD_STATUSES = ["open", "closing", "closed"] as const;
export type PlaceCardOpenState = (typeof PLACE_CARD_STATUSES)[number];
export const PLACE_CARD_ACTION_EMPHASES = ["primary", "secondary"] as const;
export type PlaceCardActionEmphasis = (typeof PLACE_CARD_ACTION_EMPHASES)[number];
export type PlaceCardProps = ComponentProps<"article"> & { variant?: PlaceCardVariant };

type CardContext = { variant: PlaceCardVariant; titleId: string };
const Context = createContext<CardContext | null>(null);
function usePlace(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within PlaceCard`);
  return context;
}

const placeCardVariants = cva(
  "relative grid min-w-0 content-start bg-card text-[13px]/[18px] text-card-foreground",
  {
    variants: {
      variant: {
        card: "w-80 gap-3 rounded-[14px] p-4 shadow-[0_0_0_1px_var(--border)]",
        popup:
          "w-72 origin-bottom gap-2.5 rounded-[14px] p-3 shadow-[0_0_0_1px_var(--border-strong),0_12px_28px_-10px_oklch(0_0_0/0.32),0_2px_6px_-2px_oklch(0_0_0/0.12)] duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] animate-in fade-in-0 zoom-in-96 after:absolute after:top-full after:left-1/2 after:size-3 after:-translate-x-1/2 after:-translate-y-1.5 after:rotate-45 after:rounded-[3px] after:bg-card after:shadow-[1px_1px_0_0_var(--border-strong)] motion-reduce:animate-none",
        compact: "w-64 gap-2 rounded-xl p-3 text-[12.5px]/[18px] shadow-[0_0_0_1px_var(--border)]",
      },
    },
  },
);

/** Details for one place, beside the map or anchored to its marker. */
export function PlaceCard({ variant = "card", className, children, ...props }: PlaceCardProps) {
  const titleId = useId();
  return (
    <Context.Provider value={{ variant, titleId }}>
      <article
        data-slot="place-card"
        aria-labelledby={titleId}
        className={cn(placeCardVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </article>
    </Context.Provider>
  );
}

/** A photo or illustration. Pass an image with meaningful alt text, or alt="" when decorative. */
export function PlaceCardMedia({ className, ...props }: ComponentProps<"div">) {
  const context = usePlace("PlaceCardMedia");
  return (
    <div
      data-slot="place-card-media"
      className={cn(
        "overflow-hidden bg-muted [&>img]:size-full [&>img]:object-cover [&>svg]:size-full",
        context.variant === "compact" ? "aspect-[2/1] rounded-lg" : "aspect-[16/9] rounded-[10px]",
        className,
      )}
      {...props}
    />
  );
}

export function PlaceCardHeader({ className, ...props }: ComponentProps<"header">) {
  usePlace("PlaceCardHeader");
  return (
    <header
      data-slot="place-card-header"
      className={cn(
        "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 gap-y-0.5",
        className,
      )}
      {...props}
    />
  );
}

export function PlaceCardTitle({ className, ...props }: ComponentProps<"h3">) {
  const context = usePlace("PlaceCardTitle");
  return (
    <h3
      data-slot="place-card-title"
      className={cn(
        "col-start-1 m-0 font-semibold text-foreground text-pretty",
        context.variant === "compact" ? "text-[13px]/[18px] font-medium" : "text-[15px]/5",
        className,
      )}
      {...props}
      id={context.titleId}
    />
  );
}

/** The kind of place and its price level or distance, for example "Coffee · $$ · 0.4 mi". */
export function PlaceCardCategory({ className, ...props }: ComponentProps<"p">) {
  usePlace("PlaceCardCategory");
  return (
    <p
      data-slot="place-card-category"
      className={cn("col-start-1 m-0 text-[12px]/4 text-muted-foreground", className)}
      {...props}
    />
  );
}

export type PlaceCardCloseProps = Omit<ComponentProps<"button">, "aria-label"> & { label?: string };

export function PlaceCardClose({
  label = "Close place details",
  type = "button",
  className,
  ...props
}: PlaceCardCloseProps) {
  const context = usePlace("PlaceCardClose");
  return (
    <Button
      data-slot="place-card-close"
      type={type}
      variant="ghost"
      size="icon"
      aria-label={label}
      className={cn(
        "col-start-2 row-start-1 -mt-1 -mr-1 rounded-full border-0 p-0 text-muted-foreground transition-[background-color,color,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] hover:bg-secondary hover:text-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.94] motion-reduce:transition-none motion-reduce:active:scale-100 dark:hover:bg-secondary",
        context.variant === "compact" ? "size-6 [&_svg]:size-3.5" : "size-7 [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <X strokeWidth={1.75} aria-hidden="true" />
    </Button>
  );
}

/** A row of rating, status, and other short facts. */
export function PlaceCardMeta({ className, ...props }: ComponentProps<"div">) {
  usePlace("PlaceCardMeta");
  return (
    <div
      data-slot="place-card-meta"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[12px]/4 text-muted-foreground [&>*+*]:before:mr-2 [&>*+*]:before:text-subtle-foreground [&>*+*]:before:content-['·']",
        className,
      )}
      {...props}
    />
  );
}

export type PlaceCardRatingProps = ComponentProps<"span"> & {
  /** Average rating out of five. */
  value: number;
  /** Number of reviews. */
  count?: number;
};

export function PlaceCardRating({ value, count, className, ...props }: PlaceCardRatingProps) {
  usePlace("PlaceCardRating");
  const rating = value.toFixed(1);
  const reviews = count === undefined ? "" : `, ${count.toLocaleString("en-US")} reviews`;
  return (
    <span
      data-slot="place-card-rating"
      role="img"
      aria-label={`Rated ${rating} out of 5${reviews}`}
      className={cn("inline-flex items-center gap-1 tabular-nums", className)}
      {...props}
    >
      <Star aria-hidden="true" className="size-3 fill-warning stroke-warning" />
      <span aria-hidden="true" className="font-medium text-foreground">
        {rating}
      </span>
      {count !== undefined && <span aria-hidden="true">({count.toLocaleString("en-US")})</span>}
    </span>
  );
}

export type PlaceCardStatusProps = ComponentProps<"span"> & { status: PlaceCardOpenState };

/** Opening state in words, such as "Open until 6 PM". The tone dot only reinforces the text. */
export function PlaceCardStatus({ status, className, children, ...props }: PlaceCardStatusProps) {
  usePlace("PlaceCardStatus");
  return (
    <span
      data-slot="place-card-status"
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium data-[status=closed]:text-destructive data-[status=closing]:text-warning data-[status=open]:text-success",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function PlaceCardDetails({ className, ...props }: ComponentProps<"ul">) {
  const context = usePlace("PlaceCardDetails");
  return (
    <ul
      data-slot="place-card-details"
      className={cn(
        "m-0 grid list-none p-0",
        context.variant === "compact" ? "gap-1" : "gap-1.5",
        className,
      )}
      {...props}
    />
  );
}

/** One fact with a leading icon, such as the address, hours, or phone number. */
export function PlaceCardDetail({ className, ...props }: ComponentProps<"li">) {
  usePlace("PlaceCardDetail");
  return (
    <li
      data-slot="place-card-detail"
      className={cn(
        "flex min-w-0 items-start gap-2 text-muted-foreground [&_a]:text-foreground [&_a]:underline-offset-2 [&_a:hover]:underline [&>svg]:mt-px [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:stroke-[1.75] [&>svg]:text-subtle-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function PlaceCardActions({ className, ...props }: ComponentProps<"div">) {
  usePlace("PlaceCardActions");
  return (
    <div
      data-slot="place-card-actions"
      className={cn("flex min-w-0 flex-wrap items-center gap-2 pt-0.5", className)}
      {...props}
    />
  );
}

const placeCardActionVariants = cva(
  "h-auto gap-1.5 rounded-full border-0 py-0 shadow-none transition-[scale,background-color,filter] duration-140 ease-out-quint focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        card: "min-h-8 px-3.5 text-[13px]/4 has-[>svg]:px-3",
        popup: "min-h-7 px-3 text-[12.5px]/4 has-[>svg]:px-2.5",
        compact: "min-h-6 px-2.5 text-[12px]/4 has-[>svg]:px-2",
      },
      emphasis: {
        primary: "bg-primary text-primary-foreground hover:bg-primary hover:brightness-[1.08]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
      },
    },
  },
);

export type PlaceCardActionProps = ComponentProps<"button"> & {
  emphasis?: PlaceCardActionEmphasis;
};

/** Use the primary emphasis once, usually for Directions. */
export function PlaceCardAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: PlaceCardActionProps) {
  const context = usePlace("PlaceCardAction");
  return (
    <Button
      data-slot="place-card-action"
      type={type}
      variant={emphasis === "primary" ? "default" : "secondary"}
      className={cn(placeCardActionVariants({ variant: context.variant, emphasis }), className)}
      {...props}
    />
  );
}
