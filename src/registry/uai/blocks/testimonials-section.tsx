"use client";

import { type ComponentProps, createContext, useContext, useId } from "react";
import {
  TestimonialCard,
  type TestimonialCardProps,
  type TestimonialCardVariant,
} from "@/components/ui/uai/testimonial-card";

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

const layoutCss = `
[data-uai-testimonials="grid"] [data-uai-testimonials-list]{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));gap:12px}
[data-uai-testimonials="featured"] [data-uai-testimonials-list]{display:grid;gap:12px}
[data-uai-testimonials="wall"] [data-uai-testimonials-list]{columns:3 220px;column-gap:10px}
[data-uai-testimonials="wall"] [data-uai-testimonials-item]{break-inside:avoid;margin-bottom:10px}
@container (min-width: 720px){
  [data-uai-testimonials="featured"] [data-uai-testimonials-list]{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:16px 32px;align-items:start}
  [data-uai-testimonials="featured"] [data-uai-testimonials-item][data-featured]{grid-row:span 3;align-self:center}
}
[data-uai-testimonials-item]{animation:uai-testimonials-in 400ms cubic-bezier(0.23,1,0.32,1) both}
[data-uai-testimonials-item]:nth-child(2){animation-delay:40ms}
[data-uai-testimonials-item]:nth-child(3){animation-delay:80ms}
[data-uai-testimonials-item]:nth-child(4){animation-delay:120ms}
[data-uai-testimonials-item]:nth-child(5){animation-delay:160ms}
[data-uai-testimonials-item]:nth-child(n+6){animation-delay:200ms}
@keyframes uai-testimonials-in{from{opacity:0;transform:translateY(6px)}}
@media (prefers-reduced-motion:reduce){[data-uai-testimonials-item]{animation:none}}
`;

/** Customer stories with people, roles, and organizations. Columns collapse to one on narrow widths. */
export function TestimonialsSection({
  variant = "grid",
  children,
  style,
  ...props
}: TestimonialsSectionProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-testimonials={variant}
        style={{
          boxSizing: "border-box",
          display: "grid",
          gap: 28,
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function TestimonialsSectionHeader({ style, ...props }: ComponentProps<"header">) {
  return (
    <header
      {...props}
      style={{
        display: "grid",
        justifyItems: "center",
        gap: 8,
        maxWidth: 600,
        margin: "0 auto",
        textAlign: "center",
        ...style,
      }}
    />
  );
}

export function TestimonialsSectionTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id } = useSection("TestimonialsSectionTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: "clamp(22px, 2.5cqi + 12px, 30px)",
        fontWeight: 500,
        lineHeight: 1.15,
        letterSpacing: "-0.025em",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function TestimonialsSectionDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 15,
        lineHeight: "23px",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

export function TestimonialsSectionList({ style, ...props }: ComponentProps<"ul">) {
  useSection("TestimonialsSectionList");
  return (
    <ul
      {...props}
      data-uai-testimonials-list=""
      style={{ minWidth: 0, margin: 0, padding: 0, listStyle: "none", ...style }}
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
    <li data-uai-testimonials-item="" data-featured={featured || undefined} style={{ minWidth: 0 }}>
      <TestimonialCard {...props} variant={cardVariant} />
    </li>
  );
}

export function TestimonialsSectionSummary({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px 16px",
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}
