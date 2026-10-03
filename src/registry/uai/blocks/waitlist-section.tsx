"use client";

import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  NewsletterForm,
  type NewsletterFormProps,
  type NewsletterFormVariant,
} from "@/components/ui/uai/newsletter-form";

export const WAITLIST_SECTION_VARIANTS = ["split", "centered", "card"] as const;
export type WaitlistSectionVariant = (typeof WAITLIST_SECTION_VARIANTS)[number];
export type WaitlistSectionProps = ComponentProps<"section"> & {
  variant?: WaitlistSectionVariant;
};

type WaitlistContext = {
  id: string;
  variant: WaitlistSectionVariant;
  joinedEmail: string | null;
  setJoinedEmail: (email: string | null) => void;
};
const Context = createContext<WaitlistContext | null>(null);
function useWaitlist(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within WaitlistSection`);
  return context;
}

const layoutCss = `
[data-uai-waitlist-layout]{display:grid;gap:24px;align-items:start;min-width:0}
@container (min-width: 720px){
  [data-uai-waitlist="split"]>[data-uai-waitlist-layout]{grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:48px}
}
[data-uai-waitlist-confirmation]{animation:uai-waitlist-in 240ms cubic-bezier(0.16,1,0.3,1) both}
[data-uai-waitlist-confirmation]:focus-visible{outline:2px solid var(--uai-accent)}
[data-uai-waitlist-restart]{transition:text-decoration-color 120ms ease-out}
[data-uai-waitlist-restart]:hover{text-decoration-color:currentColor}
[data-uai-waitlist-restart]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px;border-radius:4px}
@keyframes uai-waitlist-in{from{opacity:0;transform:scale(0.98) translateY(4px)}}
@media (prefers-reduced-motion:reduce){[data-uai-waitlist-confirmation]{animation:none}[data-uai-waitlist-restart]{transition:none}}
`;

const shells: Record<WaitlistSectionVariant, CSSProperties> = {
  split: { padding: "8px 0" },
  centered: { maxWidth: 560, margin: "0 auto", padding: "8px 0" },
  card: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "clamp(24px, 5cqi, 36px)",
    border: "1px solid var(--uai-border)",
    borderRadius: 14,
    background: "var(--uai-surface)",
    boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)",
  },
};
const formVariants: Record<WaitlistSectionVariant, NewsletterFormVariant> = {
  split: "card",
  centered: "inline",
  card: "stacked",
};

/** Collects interest with qualification fields and consent, then replaces the form with a confirmation. */
export function WaitlistSection({
  variant = "split",
  children,
  style,
  ...props
}: WaitlistSectionProps) {
  const id = useId();
  const [joinedEmail, setJoinedEmail] = useState<string | null>(null);
  return (
    <Context.Provider value={{ id, variant, joinedEmail, setJoinedEmail }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-waitlist={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...shells[variant],
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-waitlist-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function WaitlistSectionContent({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useWaitlist("WaitlistSectionContent");
  const centered = variant !== "split";
  return (
    <div
      {...props}
      style={{
        display: "grid",
        justifyItems: centered ? "center" : "start",
        gap: 10,
        minWidth: 0,
        textAlign: centered ? "center" : "start",
        ...style,
      }}
    />
  );
}

export function WaitlistSectionTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id } = useWaitlist("WaitlistSectionTitle");
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

export function WaitlistSectionDescription({ style, ...props }: ComponentProps<"p">) {
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

export function WaitlistSectionHighlights({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gap: 8,
        margin: "6px 0 0",
        padding: 0,
        color: "var(--uai-muted)",
        listStyle: "none",
        textAlign: "start",
        ...style,
      }}
    />
  );
}

export function WaitlistSectionHighlight({ children, style, ...props }: ComponentProps<"li">) {
  return (
    <li {...props} style={{ display: "flex", gap: 8, ...style }}>
      <span
        aria-hidden="true"
        style={{
          flex: "none",
          width: 5,
          height: 5,
          marginTop: 7,
          borderRadius: 999,
          background: "var(--uai-subtle)",
        }}
      />
      <span>{children}</span>
    </li>
  );
}

/**
 * A Newsletter Form that also carries qualification fields. Resolving `onSubscribe` with success
 * (or nothing) swaps the form for WaitlistSectionConfirmation.
 */
export function WaitlistSectionForm({ variant, onSubscribe, ...props }: NewsletterFormProps) {
  const waitlist = useWaitlist("WaitlistSectionForm");
  if (waitlist.joinedEmail !== null) return null;
  return (
    <NewsletterForm
      {...props}
      variant={variant ?? formVariants[waitlist.variant]}
      onSubscribe={async (submission) => {
        const result = await onSubscribe(submission);
        if (result === undefined || result === "success") {
          waitlist.setJoinedEmail(submission.email);
        }
        return result;
      }}
    />
  );
}

export function WaitlistSectionQualification({ style, ...props }: ComponentProps<"fieldset">) {
  return (
    <fieldset
      {...props}
      style={{
        display: "grid",
        gap: 12,
        minWidth: 0,
        margin: 0,
        padding: 0,
        border: 0,
        textAlign: "start",
        ...style,
      }}
    />
  );
}

export function WaitlistSectionQualificationLegend({ style, ...props }: ComponentProps<"legend">) {
  return (
    <legend
      {...props}
      style={{
        marginBottom: 4,
        padding: 0,
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: "16px",
        ...style,
      }}
    />
  );
}

/** Rendered after a successful signup. Focus moves here so the confirmation is announced. */
export function WaitlistSectionConfirmation({ style, ...props }: ComponentProps<"div">) {
  const waitlist = useWaitlist("WaitlistSectionConfirmation");
  const ref = useRef<HTMLDivElement>(null);
  const joined = waitlist.joinedEmail !== null;
  useEffect(() => {
    if (joined) ref.current?.focus();
  }, [joined]);
  if (!joined) return null;
  return (
    <div
      role="status"
      tabIndex={-1}
      {...props}
      ref={ref}
      data-uai-waitlist-confirmation=""
      style={{
        display: "grid",
        gap: 8,
        minWidth: 0,
        padding: 20,
        borderRadius: 14,
        background: "color-mix(in oklab, var(--uai-success) 10%, var(--uai-surface))",
        textAlign: "start",
        outlineOffset: 2,
        ...style,
      }}
    />
  );
}

export function WaitlistSectionConfirmationTitle({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "color-mix(in oklab, var(--uai-success) 75%, var(--uai-text))",
        fontSize: 15,
        fontWeight: 500,
        lineHeight: "20px",
        ...style,
      }}
    />
  );
}

/** The address that joined, for use inside the confirmation copy. */
export function WaitlistSectionEmail({ style, ...props }: ComponentProps<"strong">) {
  const waitlist = useWaitlist("WaitlistSectionEmail");
  return (
    <strong
      {...props}
      style={{ color: "var(--uai-text)", fontWeight: 500, overflowWrap: "anywhere", ...style }}
    >
      {waitlist.joinedEmail}
    </strong>
  );
}

export function WaitlistSectionRestart({ onClick, style, ...props }: ComponentProps<"button">) {
  const waitlist = useWaitlist("WaitlistSectionRestart");
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) waitlist.setJoinedEmail(null);
      }}
      data-uai-waitlist-restart=""
      style={{
        justifySelf: "start",
        height: 28,
        padding: 0,
        border: 0,
        background: "transparent",
        color: "var(--uai-text)",
        fontSize: 12.5,
        fontWeight: 500,
        textDecoration: "underline",
        textDecorationColor: "var(--uai-border-strong)",
        textUnderlineOffset: 3,
        cursor: "pointer",
        ...style,
      }}
    />
  );
}
