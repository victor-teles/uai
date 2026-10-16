"use client";

import { cva } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
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

// Media enters after the text has started: 12px up, from 98.5%, at 200ms.
const mediaIn =
  "animate-in fade-in-0 slide-in-from-bottom-3 zoom-in-[0.985] duration-300 ease-out-quint fill-mode-both [animation-delay:200ms] motion-reduce:animate-none";

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
              "@min-[720px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @min-[720px]:gap-12",
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
        "grid min-w-0",
        "*:animate-in *:fade-in-0 *:slide-in-from-bottom-[6px] *:duration-300 *:ease-out-quint *:fill-mode-both *:nth-2:[animation-delay:40ms] *:nth-3:[animation-delay:80ms] *:nth-4:[animation-delay:120ms] *:nth-[n+5]:[animation-delay:160ms] motion-reduce:*:animate-none",
        centered ? "mx-auto max-w-[640px] justify-items-center" : "justify-items-start",
        className,
      )}
      {...props}
    />
  );
}

export type HeroSectionEyebrowProps = ComponentProps<"p"> & {
  /** Turns the eyebrow into a link pill with a trailing arrow. */
  href?: string;
};

/**
 * A short announcement above the title. Put a tag in `<span data-tag>` ("New"). With `href`,
 * the whole pill is one link, so give it a descriptive text ("New: Shared inbox for field teams").
 */
export function HeroSectionEyebrow({
  href,
  className,
  children,
  ...props
}: HeroSectionEyebrowProps) {
  const pill = cn(
    "inline-flex min-h-7 items-center gap-2 rounded-full bg-muted py-1 pr-2.5 pl-1 text-xs/4 font-medium text-muted-foreground",
    "[&_[data-tag]]:inline-flex [&_[data-tag]]:h-5 [&_[data-tag]]:items-center [&_[data-tag]]:rounded-full [&_[data-tag]]:bg-card [&_[data-tag]]:px-2 [&_[data-tag]]:text-foreground [&_[data-tag]]:shadow-[0_0_0_1px_var(--border)]",
  );
  return (
    <p data-slot="hero-section-eyebrow" className={cn("m-0", !href && pill, className)} {...props}>
      {href ? (
        <a
          href={href}
          className={cn(
            pill,
            "group/eyebrow no-underline transition-[background-color,scale] duration-[120ms,140ms] ease-[ease-out,cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--muted)_85%,var(--foreground))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
          )}
        >
          {children}
          <ArrowRight
            aria-hidden="true"
            strokeWidth={2}
            className="size-3.5 text-foreground transition-[translate] duration-160 ease-out-quint group-hover/eyebrow:translate-x-0.5 motion-reduce:transition-none"
          />
        </a>
      ) : (
        children
      )}
    </p>
  );
}

export function HeroSectionTitle({ className, ...props }: ComponentProps<"h1">) {
  const { id } = useHero("HeroSectionTitle");
  return (
    <h1
      data-slot="hero-section-title"
      className={cn(
        "m-0 mt-4 text-[length:clamp(30px,4cqi_+_10px,42px)] leading-[1.06] font-medium tracking-[-0.035em] text-balance first:mt-0",
        // An <em> sets the second clause in muted ink, not italic.
        "[&_em]:text-muted-foreground [&_em]:not-italic",
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
        "m-0 mt-4 max-w-[46ch] text-[15px]/[23px] text-pretty text-muted-foreground first:mt-0",
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
        "mt-6 flex flex-wrap gap-2 first:mt-0",
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

/**
 * Supporting proof as one row, rendered as a Trust Panel. Compose an optional decorative
 * avatar stack (`<span data-avatars aria-hidden>` with 24px circles), a TrustPanelTitle with
 * the count in `<b>`, and a TrustPanelRating; a hairline divides the title from the rating.
 */
export function HeroSectionProof({ variant, className, ...props }: TrustPanelProps) {
  const hero = useHero("HeroSectionProof");
  const panelVariant: TrustPanelVariant =
    variant ?? (hero.variant === "framed" ? "compact" : "plain");
  return (
    <TrustPanel
      {...props}
      variant={panelVariant}
      className={cn(
        "mt-7 flex w-full flex-wrap items-center gap-x-3.5 gap-y-2 text-[12.5px]/[18px] text-muted-foreground first:mt-0",
        hero.variant === "centered" ? "justify-center" : "justify-start",
        "[&_[data-avatars]]:flex [&_[data-avatars]]:items-center [&_[data-avatars]>*]:-ml-1.5 [&_[data-avatars]>*:first-child]:ml-0 [&_[data-avatars]>*]:grid [&_[data-avatars]>*]:size-6 [&_[data-avatars]>*]:place-items-center [&_[data-avatars]>*]:rounded-full [&_[data-avatars]>*]:text-[10.5px] [&_[data-avatars]>*]:font-semibold [&_[data-avatars]>*]:shadow-[0_0_0_2px_var(--background)]",
        "[&_[data-slot=trust-panel-title]]:text-[12.5px]/[18px] [&_[data-slot=trust-panel-title]]:font-normal [&_[data-slot=trust-panel-title]]:tracking-normal [&_[data-slot=trust-panel-title]]:text-muted-foreground [&_[data-slot=trust-panel-title]_b]:font-medium [&_[data-slot=trust-panel-title]_b]:text-foreground",
        "[&_[data-slot=trust-panel-rating]]:before:h-4 [&_[data-slot=trust-panel-rating]]:before:w-px [&_[data-slot=trust-panel-rating]]:before:bg-border [&_[data-slot=trust-panel-rating]]:before:content-['']",
        // Proof stars are ink, never a status colour.
        "[&_[data-slot=trust-panel-rating]_.text-warning]:text-foreground",
        className,
      )}
    />
  );
}

/**
 * The product picture. It is a positioning stage without chrome, so composed media brings its
 * own surfaces; give a plain screenshot `rounded-[14px] border` yourself. Decorative
 * compositions should be `aria-hidden`.
 */
export function HeroSectionMedia({ className, ...props }: ComponentProps<"figure">) {
  const { variant } = useHero("HeroSectionMedia");
  return (
    <figure
      data-slot="hero-section-media"
      className={cn(
        "relative m-0 box-border w-full min-w-0",
        mediaIn,
        variant === "centered"
          ? "mx-auto aspect-[16/9] max-w-[880px]"
          : "h-[min(430px,110cqi)] @min-[720px]:h-[430px]",
        variant === "framed" && "rounded-xl",
        className,
      )}
      {...props}
    />
  );
}
