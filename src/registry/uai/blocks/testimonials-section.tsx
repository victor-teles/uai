"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId } from "react";
import {
  TestimonialCard,
  type TestimonialCardProps,
  type TestimonialCardVariant,
} from "@/components/ui/uai/testimonial-card";
import { cn } from "@/lib/uai-utils";

export const TESTIMONIALS_SECTION_VARIANTS = ["grid", "featured", "wall"] as const;
export type TestimonialsSectionVariant = (typeof TESTIMONIALS_SECTION_VARIANTS)[number];
export type TestimonialsSectionProps = ComponentProps<"section"> & {
  variant?: TestimonialsSectionVariant;
};

type SectionContext = { id: string; variant: TestimonialsSectionVariant };
const Context = createContext<SectionContext | null>(null);
function useSection(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within TestimonialsSection`);
  return context;
}

const testimonialsSectionListVariants = cva("m-0 min-w-0 list-none p-0", {
  variants: {
    variant: {
      grid: "grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3",
      featured:
        "grid gap-3 @min-[720px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] @min-[720px]:items-start @min-[720px]:gap-x-8 @min-[720px]:gap-y-4",
      wall: "columns-[3_220px] gap-x-2.5",
    },
  },
});

/** Customer stories with people, roles, and organizations. Columns collapse to one on narrow widths. */
export function TestimonialsSection({
  variant = "grid",
  className,
  children,
  ...props
}: TestimonialsSectionProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        data-slot="testimonials-section"
        aria-labelledby={`${id}-title`}
        className={cn(
          "@container box-border grid min-w-0 gap-7 text-[13px]/[18px] text-foreground",
          className,
        )}
        {...props}
        data-variant={variant}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function TestimonialsSectionHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="testimonials-section-header"
      className={cn("mx-auto grid max-w-[600px] justify-items-center gap-2 text-center", className)}
      {...props}
    />
  );
}

export function TestimonialsSectionTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id } = useSection("TestimonialsSectionTitle");
  return (
    <h2
      data-slot="testimonials-section-title"
      className={cn(
        "m-0 text-[length:clamp(22px,2.5cqi_+_12px,30px)] leading-[1.15] font-medium tracking-[-0.025em] text-balance",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function TestimonialsSectionDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="testimonials-section-description"
      className={cn("m-0 text-[15px]/[23px] text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

export function TestimonialsSectionList({ className, ...props }: ComponentProps<"ul">) {
  const { variant } = useSection("TestimonialsSectionList");
  return (
    <ul
      data-slot="testimonials-section-list"
      className={cn(testimonialsSectionListVariants({ variant }), className)}
      {...props}
    />
  );
}

export type TestimonialsSectionItemProps = Omit<TestimonialCardProps, "variant"> & {
  /** In the Featured layout, gives this story the editorial treatment and the larger column. */
  featured?: boolean;
};

/** One story rendered as a Testimonial Card. Compose the quote and author parts inside. */
export function TestimonialsSectionItem({
  featured = false,
  ...props
}: TestimonialsSectionItemProps) {
  const { variant } = useSection("TestimonialsSectionItem");
  const cardVariant: TestimonialCardVariant =
    variant === "wall" ? "compact" : variant === "featured" && featured ? "editorial" : "card";
  return (
    <li
      data-slot="testimonials-section-item"
      data-featured={featured || undefined}
      className={cn(
        "min-w-0 animate-in fade-in-0 slide-in-from-bottom-[6px] duration-400 ease-out-quint fill-mode-both motion-reduce:animate-none nth-2:[animation-delay:40ms] nth-3:[animation-delay:80ms] nth-4:[animation-delay:120ms] nth-5:[animation-delay:160ms] nth-[n+6]:[animation-delay:200ms]",
        variant === "wall" && "mb-2.5 break-inside-avoid",
        variant === "featured" && featured && "@min-[720px]:row-span-3 @min-[720px]:self-center",
      )}
    >
      <TestimonialCard {...props} variant={cardVariant} />
    </li>
  );
}

export function TestimonialsSectionSummary({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="testimonials-section-summary"
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-subtle-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}
