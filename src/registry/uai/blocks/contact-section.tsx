"use client";

import { Check } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type FormEvent,
  useContext,
  useId,
  useState,
} from "react";
import {
  StatusBanner,
  StatusBannerContent,
  StatusBannerIcon,
  type StatusBannerProps,
} from "@/components/ui/uai/status-banner";

export const CONTACT_SECTION_VARIANTS = ["split", "stacked", "card"] as const;
export type ContactSectionVariant = (typeof CONTACT_SECTION_VARIANTS)[number];
export type ContactSectionProps = ComponentProps<"section"> & { variant?: ContactSectionVariant };
export type ContactSectionStatus = "idle" | "submitting" | "success" | "error";

type SectionContext = {
  id: string;
  variant: ContactSectionVariant;
  status: ContactSectionStatus;
  setStatus: (status: ContactSectionStatus) => void;
};
const Context = createContext<SectionContext | null>(null);
function useSection(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ContactSection`);
  return context;
}

const layoutCss = `
[data-uai-contact-layout]{display:grid;gap:24px;align-items:start;min-width:0}
@container (min-width: 720px){
  [data-uai-contact="split"]>[data-uai-contact-layout],
  [data-uai-contact="card"]>[data-uai-contact-layout]{grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);column-gap:40px}
}
[data-uai-contact-action]{transition:filter 120ms ease-out,box-shadow 120ms ease-out,background-color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-contact-action="primary"]:hover:not([aria-disabled]){filter:brightness(1.08)}
[data-uai-contact-action="secondary"]:hover{box-shadow:inset 0 0 0 999px color-mix(in oklab,var(--uai-text) 9%,transparent)}
[data-uai-contact-action]:active:not([aria-disabled]){transform:scale(0.97)}
[data-uai-contact-action]:focus-visible,[data-uai-contact-link]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
[data-uai-contact-link]{transition:text-decoration-color 120ms ease-out}
[data-uai-contact-link]:hover{text-decoration-color:currentColor}
[data-uai-contact-shimmer]{background:linear-gradient(90deg,var(--uai-subtle) 0%,var(--uai-subtle) 35%,var(--uai-text) 50%,var(--uai-subtle) 65%,var(--uai-subtle) 100%) 0 0/250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:uai-contact-shimmer 2s linear infinite}
[data-uai-contact-pulse]{animation:uai-contact-pulse 2s cubic-bezier(0.23,1,0.32,1) infinite}
@keyframes uai-contact-shimmer{from{background-position:100% 0}to{background-position:0 0}}
@keyframes uai-contact-pulse{0%{box-shadow:0 0 0 0 color-mix(in oklab,var(--uai-success) 45%,transparent)}70%,100%{box-shadow:0 0 0 5px transparent}}
@media (prefers-reduced-motion:reduce){[data-uai-contact-action],[data-uai-contact-link]{transition:none}[data-uai-contact-action]:active{transform:none}[data-uai-contact-shimmer]{animation:none;color:var(--uai-muted);background:none}[data-uai-contact-pulse]{animation:none}}
`;

const shells: Record<ContactSectionVariant, CSSProperties> = {
  split: { padding: "8px 0" },
  stacked: { maxWidth: 640, margin: "0 auto", padding: "8px 0" },
  card: {
    padding: "clamp(16px, 4cqi, 28px)",
    border: "1px solid var(--uai-border)",
    borderRadius: 14,
    background: "var(--uai-surface)",
    boxShadow: "0 1px 2px oklch(0 0 0 / 0.04)",
  },
};

/** Contact options, availability, a message form with its states, and response expectations. */
export function ContactSection({
  variant = "split",
  children,
  style,
  ...props
}: ContactSectionProps) {
  const id = useId();
  const [status, setStatus] = useState<ContactSectionStatus>("idle");
  return (
    <Context.Provider value={{ id, variant, status, setStatus }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-contact={variant}
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
        <div data-uai-contact-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function ContactSectionDetails({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "grid", gap: 20, minWidth: 0, ...style }} />;
}

export function ContactSectionHeader({ style, ...props }: ComponentProps<"header">) {
  return <header {...props} style={{ display: "grid", gap: 8, ...style }} />;
}

export function ContactSectionTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id } = useSection("ContactSectionTitle");
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

export function ContactSectionDescription({ style, ...props }: ComponentProps<"p">) {
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

export function ContactSectionOptions({ style, ...props }: ComponentProps<"ul">) {
  const { variant } = useSection("ContactSectionOptions");
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns:
          variant === "stacked" ? "repeat(auto-fit, minmax(min(100%, 170px), 1fr))" : "1fr",
        gap: 8,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
    />
  );
}

export function ContactSectionOption({ style, ...props }: ComponentProps<"li">) {
  const { variant } = useSection("ContactSectionOption");
  return (
    <li
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        alignItems: "start",
        columnGap: 12,
        rowGap: 2,
        minWidth: 0,
        padding: 12,
        borderRadius: 12,
        background:
          variant === "card"
            ? "color-mix(in oklab, var(--uai-surface-raised) 70%, var(--uai-surface))"
            : "var(--uai-surface)",
        boxShadow: variant === "card" ? "none" : "inset 0 0 0 1px var(--uai-border)",
        ...style,
      }}
    />
  );
}

export function ContactSectionOptionIcon({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        gridRow: "1 / span 3",
        display: "grid",
        placeItems: "center",
        width: 28,
        height: 28,
        borderRadius: 8,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-muted)",
        ...style,
      }}
    />
  );
}

export function ContactSectionOptionTitle({ style, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      {...props}
      style={{
        gridColumn: 2,
        margin: 0,
        fontSize: 13,
        fontWeight: 500,
        lineHeight: "18px",
        ...style,
      }}
    />
  );
}

export function ContactSectionOptionDetail({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        gridColumn: 2,
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        lineHeight: "17px",
        ...style,
      }}
    />
  );
}

export function ContactSectionOptionLink({ style, ...props }: ComponentProps<"a">) {
  return (
    <a
      {...props}
      data-uai-contact-link=""
      style={{
        gridColumn: 2,
        justifySelf: "start",
        marginTop: 2,
        color: "var(--uai-text)",
        fontSize: 12.5,
        fontWeight: 500,
        overflowWrap: "anywhere",
        textDecoration: "underline",
        textDecorationColor: "var(--uai-border-strong)",
        textUnderlineOffset: 3,
        ...style,
      }}
    />
  );
}

export type ContactSectionAvailabilityProps = ComponentProps<"p"> & {
  /** Whether the team is available now. The text must say so too; the dot is decorative. */
  available?: boolean;
};

export function ContactSectionAvailability({
  available = false,
  children,
  style,
  ...props
}: ContactSectionAvailabilityProps) {
  return (
    <p
      {...props}
      data-available={available}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 12,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        data-uai-contact-pulse={available ? "" : undefined}
        style={{
          flex: "none",
          width: 7,
          height: 7,
          borderRadius: 999,
          background: available ? "var(--uai-success)" : "var(--uai-border-strong)",
        }}
      />
      <span>{children}</span>
    </p>
  );
}

export function ContactSectionExpectations({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gap: 7,
        margin: 0,
        padding: 0,
        color: "var(--uai-muted)",
        fontSize: 12.5,
        lineHeight: "18px",
        listStyle: "none",
        ...style,
      }}
    />
  );
}

export function ContactSectionExpectation({ children, style, ...props }: ComponentProps<"li">) {
  return (
    <li {...props} style={{ display: "flex", alignItems: "flex-start", gap: 8, ...style }}>
      <Check
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        style={{ flex: "none", marginTop: 2, color: "var(--uai-subtle)" }}
      />
      <span>{children}</span>
    </li>
  );
}

export type ContactSectionResult = "success" | "error";
export type ContactSectionFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  /** Receives the form data. Resolve "error" or throw to show the error state. */
  onSend: (
    data: FormData,
    // biome-ignore lint/suspicious/noConfusingVoidType: async handlers without a result mean success.
  ) => Promise<ContactSectionResult | void> | ContactSectionResult | void;
};

export function ContactSectionForm({ onSend, style, ...props }: ContactSectionFormProps) {
  const section = useSection("ContactSectionForm");
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (section.status === "submitting") return;
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    section.setStatus("submitting");
    try {
      const result = await onSend(new FormData(form));
      section.setStatus(result === "error" ? "error" : "success");
    } catch {
      section.setStatus("error");
    }
  };
  return (
    <form
      noValidate
      aria-busy={section.status === "submitting"}
      {...props}
      onSubmit={handleSubmit}
      style={{
        boxSizing: "border-box",
        display: "grid",
        gap: 12,
        minWidth: 0,
        padding: section.variant === "card" ? 16 : 0,
        borderRadius: section.variant === "card" ? 12 : 0,
        background:
          section.variant === "card"
            ? "color-mix(in oklab, var(--uai-surface-raised) 70%, var(--uai-surface))"
            : "transparent",
        ...style,
      }}
    />
  );
}

/** Form fields and the submit control. Hidden after a successful send. */
export function ContactSectionFields({ style, ...props }: ComponentProps<"div">) {
  const section = useSection("ContactSectionFields");
  if (section.status === "success") return null;
  return <div {...props} style={{ display: "grid", gap: 12, minWidth: 0, ...style }} />;
}

export function ContactSectionSubmit({
  children = "Send message",
  pendingLabel = "Sending…",
  onClick,
  style,
  ...props
}: Omit<ComponentProps<"button">, "type"> & { pendingLabel?: string }) {
  const section = useSection("ContactSectionSubmit");
  const pending = section.status === "submitting";
  return (
    <button
      {...props}
      type="submit"
      aria-disabled={pending || undefined}
      onClick={(event) => {
        if (pending) event.preventDefault();
        onClick?.(event);
      }}
      data-uai-contact-action="primary"
      style={{
        justifySelf: "start",
        height: 34,
        padding: "0 16px",
        border: 0,
        borderRadius: 999,
        background: pending ? "var(--uai-surface-raised)" : "var(--uai-accent)",
        color: pending ? "var(--uai-muted)" : "var(--uai-accent-foreground)",
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: pending ? "progress" : "pointer",
        ...style,
      }}
    >
      {pending ? <span data-uai-contact-shimmer="">{pendingLabel}</span> : children}
    </button>
  );
}

type ContactSectionResultProps = Omit<StatusBannerProps, "tone" | "open" | "defaultOpen">;

function ResultBanner({
  tone,
  children,
  ...props
}: ContactSectionResultProps & { tone: "success" | "error" }) {
  return (
    <StatusBanner variant="tinted" {...props} tone={tone}>
      <StatusBannerIcon />
      <StatusBannerContent>{children}</StatusBannerContent>
    </StatusBanner>
  );
}

/** A success Status Banner shown after the message is sent. Compose StatusBannerTitle and description inside. */
export function ContactSectionSuccess(props: ContactSectionResultProps) {
  const section = useSection("ContactSectionSuccess");
  if (section.status !== "success") return null;
  return <ResultBanner {...props} tone="success" />;
}

/** An error Status Banner shown when sending fails. The fields stay filled so people can retry. */
export function ContactSectionError(props: ContactSectionResultProps) {
  const section = useSection("ContactSectionError");
  if (section.status !== "error") return null;
  return <ResultBanner {...props} tone="error" />;
}

export function ContactSectionReset({ onClick, style, ...props }: ComponentProps<"button">) {
  const section = useSection("ContactSectionReset");
  if (section.status !== "success") return null;
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) section.setStatus("idle");
      }}
      data-uai-contact-action="secondary"
      style={{
        justifySelf: "start",
        height: 30,
        padding: "0 13px",
        border: 0,
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-text)",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    />
  );
}
