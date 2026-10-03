"use client";

import { ArrowUpRight } from "lucide-react";
import { type ComponentProps, type CSSProperties, createContext, useContext } from "react";

export const TESTIMONIAL_CARD_VARIANTS = ["card", "editorial", "compact"] as const;
export type TestimonialCardVariant = (typeof TESTIMONIAL_CARD_VARIANTS)[number];
export type TestimonialCardProps = ComponentProps<"figure"> & {
  variant?: TestimonialCardVariant;
};
const Context = createContext<TestimonialCardVariant | null>(null);
function useVariant(part: string) {
  const variant = useContext(Context);
  if (!variant) throw new Error(`${part} must be used within TestimonialCard`);
  return variant;
}
const shells: Record<TestimonialCardVariant, CSSProperties> = {
  card: {
    gap: 16,
    padding: 20,
    border: "1px solid var(--uai-border)",
    borderRadius: 14,
    background: "var(--uai-surface)",
  },
  editorial: {
    gap: 20,
    padding: "2px 0 2px 20px",
    boxShadow: "inset 2px 0 0 var(--uai-border-strong)",
  },
  compact: {
    gap: 12,
    padding: 14,
    border: "1px solid var(--uai-border)",
    borderRadius: 12,
    background: "var(--uai-surface)",
  },
};
const quoteType: Record<TestimonialCardVariant, CSSProperties> = {
  card: { fontSize: 15, lineHeight: "22px", fontWeight: 400 },
  editorial: { fontSize: 20, lineHeight: "28px", fontWeight: 500, letterSpacing: "-0.012em" },
  compact: { fontSize: 13, lineHeight: "19px", fontWeight: 400 },
};
const testimonialCss = `
.uai-testimonial-proof{color:var(--uai-muted);transition:color 120ms ease-out}
.uai-testimonial-proof:hover{color:var(--uai-text)}
.uai-testimonial-proof svg{transition:transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-testimonial-proof:hover svg{transform:translate(1px,-1px)}
.uai-testimonial-proof:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px;border-radius:4px}
@media (prefers-reduced-motion: reduce){.uai-testimonial-proof,.uai-testimonial-proof svg{transition:none}}
`;

export function TestimonialCard({
  variant = "card",
  style,
  children,
  ...props
}: TestimonialCardProps) {
  return (
    <Context.Provider value={variant}>
      <figure
        {...props}
        data-variant={variant}
        style={{
          boxSizing: "border-box",
          display: "grid",
          minWidth: 0,
          margin: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...shells[variant],
          ...style,
        }}
      >
        <style>{testimonialCss}</style>
        {children}
      </figure>
    </Context.Provider>
  );
}

export function TestimonialCardQuote({ style, ...props }: ComponentProps<"blockquote">) {
  const variant = useVariant("TestimonialCardQuote");
  return (
    <blockquote
      {...props}
      style={{
        display: "grid",
        gap: 8,
        margin: 0,
        color: "var(--uai-text)",
        textWrap: "pretty",
        ...quoteType[variant],
        ...style,
      }}
    />
  );
}

export function TestimonialCardAuthor({ style, ...props }: ComponentProps<"figcaption">) {
  return (
    <figcaption
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        alignItems: "center",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function TestimonialCardAvatar({
  src,
  children,
  style,
  ...props
}: ComponentProps<"span"> & { src?: string }) {
  const variant = useVariant("TestimonialCardAvatar");
  const size = variant === "compact" ? 24 : variant === "editorial" ? 36 : 32;
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        gridRow: "1 / span 3",
        display: "grid",
        placeItems: "center",
        width: size,
        height: size,
        marginRight: variant === "compact" ? 8 : 10,
        overflow: "hidden",
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        boxShadow: "0 0 0 1px oklch(1 0 0 / 0.08)",
        color: "var(--uai-muted)",
        fontSize: variant === "compact" ? 10.5 : 11.5,
        fontWeight: 500,
        ...style,
      }}
    >
      {src ? (
        // biome-ignore lint/performance/noImgElement: registry source is framework-agnostic.
        <img src={src} alt="" width={size} height={size} style={{ objectFit: "cover" }} />
      ) : (
        children
      )}
    </span>
  );
}

const line: CSSProperties = { gridColumn: 2, minWidth: 0, display: "block" };

export function TestimonialCardName({ style, ...props }: ComponentProps<"span">) {
  return <span {...props} style={{ ...line, fontWeight: 500, ...style }} />;
}

export function TestimonialCardRole({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{ ...line, color: "var(--uai-muted)", fontSize: 12, lineHeight: "16px", ...style }}
    />
  );
}

export function TestimonialCardOrganization({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{ ...line, color: "var(--uai-subtle)", fontSize: 12, lineHeight: "16px", ...style }}
    />
  );
}

export function TestimonialCardProof({
  children,
  className,
  style,
  ...props
}: ComponentProps<"a">) {
  return (
    <a
      {...props}
      className={["uai-testimonial-proof", className].filter(Boolean).join(" ")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifySelf: "start",
        gap: 4,
        fontSize: 12.5,
        fontWeight: 500,
        textDecoration: "none",
        ...style,
      }}
    >
      {children}
      <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
    </a>
  );
}
