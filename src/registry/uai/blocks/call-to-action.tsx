"use client";

import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId } from "react";
import { TrustPanelBadge, TrustPanelBadges } from "@/components/ui/uai/trust-panel";
import { cn } from "@/lib/uai-utils";

export const CALL_TO_ACTION_VARIANTS = ["banner", "centered", "split"] as const;
export type CallToActionVariant = (typeof CALL_TO_ACTION_VARIANTS)[number];
export type CallToActionProps = ComponentProps<"section"> & { variant?: CallToActionVariant };

type CtaContext = { id: string; variant: CallToActionVariant };
const Context = createContext<CtaContext | null>(null);
function useCta(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within CallToAction`);
  return context;
}

const callToActionVariants = cva("@container min-w-0 text-[13px]/[18px] text-foreground", {
  variants: {
    variant: {
      banner:
        "rounded-[14px] bg-[color-mix(in_oklab,var(--muted)_75%,var(--card))] p-[clamp(24px,5cqi,44px)]",
      centered: "px-0 py-6 text-center",
      split:
        "rounded-[14px] border bg-card p-[clamp(20px,4cqi,32px)] shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
    },
  },
});

/** A closing section with one goal, supporting copy, and reassurance. Split stacks below 640px. */
export function CallToAction({
  variant = "banner",
  className,
  children,
  ...props
}: CallToActionProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="call-to-action"
        data-variant={variant}
        className={cn(callToActionVariants({ variant }), className)}
        {...props}
      >
        <div
          className={cn(
            "grid min-w-0 gap-5",
            variant === "split" &&
              "@min-[640px]:grid-cols-[minmax(0,1fr)_auto] @min-[640px]:items-center @min-[640px]:gap-x-8",
          )}
        >
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function CallToActionContent({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useCta("CallToActionContent");
  return (
    <div
      data-slot="call-to-action-content"
      className={cn(
        "grid min-w-0 gap-2.5",
        variant === "centered"
          ? "mx-auto max-w-[560px] justify-items-center"
          : "max-w-[640px] justify-items-start",
        className,
      )}
      {...props}
    />
  );
}

export function CallToActionTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useCta("CallToActionTitle");
  return (
    <h2
      data-slot="call-to-action-title"
      className={cn(
        "m-0 font-medium text-balance",
        variant === "split"
          ? "text-[22px]/[1.15] tracking-[-0.02em]"
          : "text-[length:clamp(22px,2.5cqi_+_12px,30px)]/[1.15] tracking-[-0.025em]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function CallToActionDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="call-to-action-description"
      className={cn("m-0 text-[15px]/[23px] text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CallToActionActions({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useCta("CallToActionActions");
  return (
    <div
      data-slot="call-to-action-actions"
      className={cn(
        "flex flex-wrap items-center gap-2",
        variant === "centered" ? "justify-center" : "justify-start",
        className,
      )}
      {...props}
    />
  );
}

export type CallToActionActionProps = ComponentProps<"a"> & {
  priority?: "primary" | "secondary";
};

const callToActionActionVariants = cva(
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full text-[13px]/[18px] font-medium whitespace-nowrap decoration-border-strong underline-offset-3 [transition:filter_120ms_ease-out,text-decoration-color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      priority: {
        primary: "bg-primary px-4 text-primary-foreground no-underline hover:brightness-[1.08]",
        secondary: "bg-transparent px-3 text-foreground underline hover:decoration-current",
      },
    },
  },
);

export function CallToActionAction({
  priority = "primary",
  className,
  ...props
}: CallToActionActionProps) {
  return (
    <a
      data-slot="call-to-action-action"
      data-priority={priority}
      className={cn(callToActionActionVariants({ priority }), className)}
      {...props}
    />
  );
}

/** Reassurance points rendered as Trust Panel badges. Pass an aria-label that names the list. */
export function CallToActionReassurance({ className, ...props }: ComponentProps<"ul">) {
  const { variant } = useCta("CallToActionReassurance");
  return (
    <TrustPanelBadges
      data-slot="call-to-action-reassurance"
      className={cn(
        variant === "centered" ? "justify-center" : "justify-start",
        variant === "split" && "@min-[640px]:col-span-full",
        className,
      )}
      {...props}
    />
  );
}

export function CallToActionReassuranceItem({
  icon = <Check size={14} strokeWidth={2} aria-hidden="true" />,
  ...props
}: ComponentProps<typeof TrustPanelBadge>) {
  useCta("CallToActionReassuranceItem");
  return <TrustPanelBadge data-slot="call-to-action-reassurance-item" {...props} icon={icon} />;
}
