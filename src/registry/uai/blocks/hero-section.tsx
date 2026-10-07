"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId } from "react";
import { Button } from "@/components/ui/button";
import {
  TrustPanel,
  type TrustPanelProps,
  type TrustPanelVariant,
} from "@/components/ui/uai/trust-panel";
import { cn } from "@/lib/uai-utils";

export const HERO_SECTION_VARIANTS = ["split", "centered", "framed"] as const;
export type HeroSectionVariant = (typeof HERO_SECTION_VARIANTS)[number];
export type HeroSectionProps = ComponentProps<"section"> & { variant?: HeroSectionVariant };

type HeroContext = { id: string; variant: HeroSectionVariant };
const Context = createContext<HeroContext | null>(null);
function useHero(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within HeroSection`);
  return context;
}

const heroSectionVariants = cva(
  "box-border @container min-w-0 text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        split: "py-2",
        centered: "py-2 text-center",
        framed:
          "rounded-[14px] border bg-card p-[clamp(24px,5cqi,48px)] shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
      },
    },
  },
);

const heroIn =
  "animate-in fade-in-0 slide-in-from-bottom-[6px] duration-400 ease-out-quint fill-mode-both motion-reduce:animate-none";

/** Opening section with positioning copy, actions, proof, and media. Split and Framed stack below 720px. */
export function HeroSection({
  variant = "split",
  children,
  className,
  ...props
}: HeroSectionProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="hero-section"
        data-variant={variant}
        className={cn(heroSectionVariants({ variant }), className)}
        {...props}
      >
        <div
          className={cn(
            "grid min-w-0 items-center gap-8",
            variant !== "centered" &&
              "@min-[720px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] @min-[720px]:gap-12",
          )}
        >
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function HeroSectionContent({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useHero("HeroSectionContent");
  const centered = variant === "centered";
  return (
    <div
      data-slot="hero-section-content"
      className={cn(
        "grid min-w-0 gap-[18px]",
        "*:animate-in *:fade-in-0 *:slide-in-from-bottom-[6px] *:duration-400 *:ease-out-quint *:fill-mode-both *:nth-2:[animation-delay:40ms] *:nth-3:[animation-delay:80ms] *:nth-4:[animation-delay:120ms] *:nth-[n+5]:[animation-delay:160ms] motion-reduce:*:animate-none",
        centered ? "mx-auto max-w-[640px] justify-items-center" : "justify-items-start",
        className,
      )}
      {...props}
    />
  );
}

export function HeroSectionEyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="hero-section-eyebrow"
      className={cn(
        "m-0 inline-flex min-h-6 items-center gap-1.5 rounded-full bg-muted px-2.5 text-xs/4 font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function HeroSectionTitle({ className, ...props }: ComponentProps<"h1">) {
  const { id } = useHero("HeroSectionTitle");
  return (
    <h1
      data-slot="hero-section-title"
      className={cn(
        "m-0 text-[length:clamp(28px,4.5cqi_+_8px,44px)] leading-[1.08] font-medium tracking-[-0.03em] text-balance",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function HeroSectionDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="hero-section-description"
      className={cn(
        "m-0 max-w-[56ch] text-[15px]/[23px] text-pretty text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function HeroSectionActions({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useHero("HeroSectionActions");
  return (
    <div
      data-slot="hero-section-actions"
      className={cn(
        "flex flex-wrap gap-2 pt-1",
        variant === "centered" ? "justify-center" : "justify-start",
        className,
      )}
      {...props}
    />
  );
}

export type HeroSectionActionProps = ComponentProps<"a"> & { priority?: "primary" | "secondary" };

export function HeroSectionAction({
  priority = "primary",
  className,
  ...props
}: HeroSectionActionProps) {
  const primary = priority === "primary";
  return (
    <Button
      asChild
      variant={primary ? "default" : "secondary"}
      className={cn(
        "h-9 gap-1.5 rounded-full px-4 py-0 text-[13px]/[18px] no-underline has-[>svg]:px-4 transition-[filter,box-shadow,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary hover:brightness-108"
          : "bg-secondary text-secondary-foreground hover:bg-secondary hover:shadow-[inset_0_0_0_999px_color-mix(in_oklab,var(--foreground)_9%,transparent)]",
        className,
      )}
    >
      <a data-slot="hero-section-action" data-priority={priority} {...props} />
    </Button>
  );
}

/** Supporting proof rendered as a Trust Panel. Compose TrustPanelTitle, logos, rating, and badges inside. */
export function HeroSectionProof({ variant, className, ...props }: TrustPanelProps) {
  const hero = useHero("HeroSectionProof");
  const panelVariant: TrustPanelVariant =
    variant ?? (hero.variant === "framed" ? "compact" : "plain");
  return (
    <TrustPanel
      {...props}
      variant={panelVariant}
      className={cn(
        "mt-2 w-full gap-3",
        hero.variant === "centered" ? "justify-items-center" : "justify-items-start",
        className,
      )}
    />
  );
}

export function HeroSectionMedia({ className, ...props }: ComponentProps<"figure">) {
  const { variant } = useHero("HeroSectionMedia");
  return (
    <figure
      data-slot="hero-section-media"
      className={cn(
        "relative m-0 box-border w-full min-w-0 overflow-hidden [animation-delay:120ms]",
        heroIn,
        variant === "centered" ? "aspect-video" : "aspect-[4/3]",
        variant === "framed"
          ? "rounded-xl border-0 bg-background"
          : "rounded-[14px] border bg-card",
        className,
      )}
      {...props}
    />
  );
}
