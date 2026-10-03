"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId } from "react";
import {
  DescriptionList,
  type DescriptionListProps,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";
import { cn } from "@/lib/uai-utils";

export const FEATURE_SHOWCASE_VARIANTS = ["alternating", "stacked", "cards"] as const;
export type FeatureShowcaseVariant = (typeof FEATURE_SHOWCASE_VARIANTS)[number];
export type FeatureShowcaseProps = ComponentProps<"section"> & {
  variant?: FeatureShowcaseVariant;
};

type ShowcaseContext = { id: string; variant: FeatureShowcaseVariant };
const Context = createContext<ShowcaseContext | null>(null);
function useShowcase(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within FeatureShowcase`);
  return context;
}

const detailVariants: Record<FeatureShowcaseVariant, DescriptionListVariant> = {
  alternating: "inline",
  stacked: "inline",
  cards: "stacked",
};

const featureShowcaseListVariants = cva("m-0 grid min-w-0 list-none p-0", {
  variants: {
    variant: {
      alternating: "gap-10",
      stacked: "mx-auto max-w-160 gap-10",
      cards: "gap-3 @min-[720px]:grid-cols-2",
    },
  },
});

const featureShowcaseItemVariants = cva(
  "grid min-w-0 animate-[enter_400ms_var(--ease-out-quint)_both] fade-in-0 slide-in-from-bottom-[6px] nth-2:[animation-delay:40ms] nth-3:[animation-delay:80ms] nth-[n+4]:[animation-delay:120ms] motion-reduce:animate-none motion-reduce:transition-none",
  {
    variants: {
      variant: {
        alternating:
          "items-center gap-5 @min-[720px]:grid-cols-2 @min-[720px]:gap-12 @min-[720px]:even:*:data-[slot=feature-showcase-media]:-order-1",
        stacked: "items-center gap-5",
        cards:
          "content-start items-center gap-4 rounded-[14px] border bg-card px-2 pt-2 pb-4.5 shadow-[0_1px_2px_oklch(0_0_0/0.04)] [transition:border-color_120ms_ease-out,transform_240ms_cubic-bezier(0.23,1,0.32,1)] hover:border-border-strong [&>:not([data-slot=feature-showcase-media])]:px-2",
      },
    },
  },
);

const featureShowcaseMediaVariants = cva("relative m-0 box-border w-full min-w-0 overflow-hidden", {
  variants: {
    variant: {
      alternating: "aspect-[4/3] rounded-[14px] border bg-card",
      stacked: "-order-1 aspect-video rounded-[14px] border bg-card",
      cards: "-order-1 aspect-video rounded-lg border-0 bg-background",
    },
  },
});

/** Benefits as alternating copy and media. Rows stack below 720px with media first in Stacked and Cards. */
export function FeatureShowcase({
  variant = "alternating",
  children,
  className,
  ...props
}: FeatureShowcaseProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="feature-showcase"
        data-variant={variant}
        className={cn(
          "@container box-border grid min-w-0 gap-10 text-[13px]/[18px] text-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function FeatureShowcaseHeader({ className, ...props }: ComponentProps<"header">) {
  const { variant } = useShowcase("FeatureShowcaseHeader");
  const centered = variant !== "alternating";
  return (
    <header
      data-slot="feature-showcase-header"
      className={cn(
        "grid max-w-160 gap-2",
        centered ? "mx-auto justify-items-center text-center" : "justify-items-start text-start",
        className,
      )}
      {...props}
    />
  );
}

export function FeatureShowcaseTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id } = useShowcase("FeatureShowcaseTitle");
  return (
    <h2
      data-slot="feature-showcase-title"
      className={cn(
        "m-0 text-[length:clamp(22px,2.5cqi_+_12px,30px)] leading-[1.15] font-medium tracking-[-0.025em] text-balance",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function FeatureShowcaseDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="feature-showcase-description"
      className={cn("m-0 text-[15px]/[23px] text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

export function FeatureShowcaseList({ className, ...props }: ComponentProps<"ul">) {
  const { variant } = useShowcase("FeatureShowcaseList");
  return (
    <ul
      data-slot="feature-showcase-list"
      className={cn(featureShowcaseListVariants({ variant }), className)}
      {...props}
    />
  );
}

export function FeatureShowcaseItem({ className, ...props }: ComponentProps<"li">) {
  const { variant } = useShowcase("FeatureShowcaseItem");
  return (
    <li
      data-slot="feature-showcase-item"
      className={cn(featureShowcaseItemVariants({ variant }), className)}
      {...props}
    />
  );
}

export function FeatureShowcaseContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="feature-showcase-content"
      className={cn("grid min-w-0 gap-2.5", className)}
      {...props}
    />
  );
}

export function FeatureShowcaseLabel({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="feature-showcase-label"
      className={cn("m-0 text-xs/4 font-medium text-subtle-foreground", className)}
      {...props}
    />
  );
}

export function FeatureShowcaseItemTitle({ className, ...props }: ComponentProps<"h3">) {
  const { variant } = useShowcase("FeatureShowcaseItemTitle");
  return (
    <h3
      data-slot="feature-showcase-item-title"
      className={cn(
        "m-0 font-medium",
        variant === "cards" ? "text-[15px]/5 tracking-[-0.01em]" : "text-lg/6 tracking-[-0.015em]",
        className,
      )}
      {...props}
    />
  );
}

export function FeatureShowcaseItemDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="feature-showcase-item-description"
      className={cn(
        "m-0 max-w-[52ch] text-[13.5px]/5 text-pretty text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Supporting facts rendered as a Description List. Compose DescriptionListItem children inside. */
export function FeatureShowcaseDetails({ variant, className, ...props }: DescriptionListProps) {
  const showcase = useShowcase("FeatureShowcaseDetails");
  return (
    <DescriptionList
      variant={variant ?? detailVariants[showcase.variant]}
      className={cn("mt-1", className)}
      {...props}
    />
  );
}

export function FeatureShowcaseMedia({ className, ...props }: ComponentProps<"figure">) {
  const { variant } = useShowcase("FeatureShowcaseMedia");
  return (
    <figure
      data-slot="feature-showcase-media"
      className={cn(featureShowcaseMediaVariants({ variant }), className)}
      {...props}
    />
  );
}
