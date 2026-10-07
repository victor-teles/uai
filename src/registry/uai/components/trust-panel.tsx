"use client";

import { cva } from "class-variance-authority";
import { ShieldCheck, Star } from "lucide-react";
import { type ComponentProps, createContext, type ReactNode, useContext, useId } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/uai-utils";

export const TRUST_PANEL_VARIANTS = ["card", "plain", "compact"] as const;
export type TrustPanelVariant = (typeof TRUST_PANEL_VARIANTS)[number];
export type TrustPanelProps = ComponentProps<"section"> & { variant?: TrustPanelVariant };
type TrustContext = { id: string; variant: TrustPanelVariant };
const Context = createContext<TrustContext | null>(null);
function useTrust(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within TrustPanel`);
  return context;
}

const trustPanelVariants = cva("box-border grid min-w-0 text-[13px]/[18px] text-card-foreground", {
  variants: {
    variant: {
      card: "gap-5 rounded-[14px] border bg-card p-5",
      plain: "gap-4",
      compact: "gap-3 rounded-xl border bg-card p-3",
    },
  },
});

export function TrustPanel({ variant = "card", className, children, ...props }: TrustPanelProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="trust-panel"
        className={cn(trustPanelVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function TrustPanelTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useTrust("TrustPanelTitle");
  return (
    <h2
      data-slot="trust-panel-title"
      className={cn(
        "m-0 font-medium text-balance text-muted-foreground",
        context.variant === "compact" ? "text-xs/[18px]" : "text-[13px]/[18px]",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function TrustPanelLogos({ className, ...props }: ComponentProps<"ul">) {
  const context = useTrust("TrustPanelLogos");
  return (
    <ul
      data-slot="trust-panel-logos"
      className={cn(
        "m-0 grid-cols-[repeat(auto-fill,minmax(120px,1fr))] flex-wrap list-none p-0",
        context.variant === "compact" ? "flex gap-1.5" : "grid",
        context.variant === "plain" ? "gap-1" : "gap-1.5",
        className,
      )}
      {...props}
    />
  );
}

const trustPanelLogoVariants = cva(
  "relative flex items-center gap-1.5 font-medium tracking-[-0.01em] whitespace-nowrap",
  {
    variants: {
      variant: {
        card: "h-11 justify-center rounded-[10px] bg-muted px-3 text-[13px] text-muted-foreground",
        plain:
          "h-8 justify-start rounded-[10px] bg-transparent p-0 text-[13px] text-subtle-foreground",
        compact: "h-7 justify-center rounded-full bg-muted px-2.5 text-xs text-muted-foreground",
      },
    },
  },
);

export function TrustPanelLogo({
  name,
  children,
  className,
  ...props
}: ComponentProps<"li"> & { name: string; children?: ReactNode }) {
  const context = useTrust("TrustPanelLogo");
  return (
    <li
      data-slot="trust-panel-logo"
      className={cn(trustPanelLogoVariants({ variant: context.variant }), className)}
      {...props}
    >
      <span aria-hidden="true" className="contents">
        {children}
      </span>
      <span className="sr-only">{name}</span>
    </li>
  );
}

export function TrustPanelRating({
  value,
  max = 5,
  children,
  className,
  ...props
}: ComponentProps<"p"> & { value: number; max?: number }) {
  const filled = Math.round(Math.min(Math.max(value, 0), max));
  return (
    <p
      data-slot="trust-panel-rating"
      className={cn("m-0 flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      <span aria-hidden="true" className="inline-flex gap-0.5">
        {Array.from({ length: max }, (_, index) => (
          <Star
            // biome-ignore lint/suspicious/noArrayIndexKey: stars are positional and static.
            key={index}
            size={14}
            strokeWidth={1.75}
            fill={index < filled ? "currentColor" : "none"}
            className={index < filled ? "text-warning" : "text-border-strong"}
          />
        ))}
      </span>
      <span className="tabular-nums">
        <strong className="font-medium">{value.toFixed(1)}</strong>
        <span className="text-muted-foreground"> out of {max}</span>
      </span>
      {children ? <span className="text-[12px] text-subtle-foreground">{children}</span> : null}
    </p>
  );
}

export function TrustPanelBadges({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="trust-panel-badges"
      className={cn("m-0 flex list-none flex-wrap gap-1.5 p-0", className)}
      {...props}
    />
  );
}

export function TrustPanelBadge({
  icon = <ShieldCheck size={14} className="size-3.5" strokeWidth={1.75} aria-hidden="true" />,
  children,
  className,
  ...props
}: ComponentProps<"li"> & { icon?: ReactNode }) {
  return (
    <Badge
      asChild
      variant="secondary"
      className={cn(
        "min-h-[26px] justify-start gap-1.5 rounded-full border-0 bg-muted py-0 pr-2.5 pl-2 text-xs/4 font-normal whitespace-normal text-muted-foreground",
        className,
      )}
    >
      <li data-slot="trust-panel-badge" {...props}>
        <span aria-hidden="true" className="inline-flex flex-none text-success">
          {icon}
        </span>
        {children}
      </li>
    </Badge>
  );
}
