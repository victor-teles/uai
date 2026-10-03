import { ArrowUpRight } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId } from "react";

export const CHANGELOG_ENTRY_VARIANTS = ["timeline", "card", "compact"] as const;
export type ChangelogEntryVariant = (typeof CHANGELOG_ENTRY_VARIANTS)[number];
export type ChangelogEntryCategoryTone = "added" | "improved" | "fixed" | "removed" | "security";
export type ChangelogEntryProps = ComponentProps<"article"> & { variant?: ChangelogEntryVariant };
type EntryContext = { id: string; variant: ChangelogEntryVariant };
const Context = createContext<EntryContext | null>(null);
function useEntry(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ChangelogEntry`);
  return context;
}
const muted = "var(--uai-muted)";
const tones: Record<ChangelogEntryCategoryTone, string> = {
  added: "var(--uai-success)",
  improved: "color-mix(in oklab, var(--uai-accent) 62%, var(--uai-text))",
  fixed: "var(--uai-warning)",
  removed: "var(--uai-muted)",
  security: "var(--uai-danger)",
};
const changelogCss = `
.uai-changelog li::marker{color:var(--uai-subtle)}
.uai-changelog-link{color:var(--uai-text);text-decoration:underline;text-decoration-color:var(--uai-border-strong);text-underline-offset:3px;transition:text-decoration-color 120ms ease-out}
.uai-changelog-link:hover{text-decoration-color:currentColor}
.uai-changelog-link svg{color:var(--uai-subtle);transition:transform 140ms cubic-bezier(0.23,1,0.32,1),color 120ms ease-out}
.uai-changelog-link:hover svg{color:var(--uai-text);transform:translate(1px,-1px)}
.uai-changelog-link:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px;border-radius:4px}
@media (prefers-reduced-motion: reduce){.uai-changelog-link,.uai-changelog-link svg{transition:none}}
`;

export function ChangelogEntry({
  variant = "timeline",
  className,
  style,
  children,
  ...props
}: ChangelogEntryProps) {
  const id = useId();
  const timeline = variant === "timeline";
  return (
    <Context.Provider value={{ id, variant }}>
      <article
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        className={["uai-changelog", className].filter(Boolean).join(" ")}
        style={{
          display: "flex",
          flexDirection: timeline ? "row" : "column",
          flexWrap: "wrap",
          gap: timeline ? "8px 24px" : variant === "compact" ? 8 : 12,
          minWidth: 0,
          padding: timeline ? 0 : variant === "compact" ? 12 : 18,
          border: timeline ? 0 : "1px solid var(--uai-border)",
          borderRadius: variant === "compact" ? 12 : 14,
          background: timeline ? "transparent" : "var(--uai-surface)",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{changelogCss}</style>
        {children}
      </article>
    </Context.Provider>
  );
}

export function ChangelogEntryHeader({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useEntry("ChangelogEntryHeader");
  const timeline = variant === "timeline";
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexDirection: timeline ? "column" : "row",
        flexWrap: "wrap",
        alignItems: timeline ? "flex-start" : "center",
        gap: timeline ? 4 : 8,
        flex: timeline ? "0 0 128px" : undefined,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function ChangelogEntryVersion({ style, ...props }: ComponentProps<"span">) {
  const { variant } = useEntry("ChangelogEntryVersion");
  return (
    <span
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: variant === "compact" ? 20 : 22,
        padding: "0 7px",
        borderRadius: 6,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-text)",
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        fontSize: 11.5,
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function ChangelogEntryDate({
  style,
  ...props
}: ComponentProps<"time"> & { dateTime: string }) {
  useEntry("ChangelogEntryDate");
  return (
    <time
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function ChangelogEntryContent({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useEntry("ChangelogEntryContent");
  const timeline = variant === "timeline";
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: variant === "compact" ? 8 : 12,
        flex: timeline ? "1 1 320px" : undefined,
        minWidth: 0,
        paddingInlineStart: timeline ? 24 : 0,
        borderInlineStart: timeline ? "1px solid var(--uai-border)" : 0,
        ...style,
      }}
    />
  );
}

export function ChangelogEntryTitle({
  level = 3,
  style,
  ...props
}: ComponentProps<"h3"> & { level?: 2 | 3 | 4 }) {
  const { id, variant } = useEntry("ChangelogEntryTitle");
  const Heading = `h${level}` as "h3";
  return (
    <Heading
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 14 : 15,
        lineHeight: variant === "compact" ? "20px" : "22px",
        fontWeight: variant === "compact" ? 500 : 600,
        letterSpacing: "-0.01em",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function ChangelogEntryCategories({
  "aria-label": label = "Categories",
  style,
  ...props
}: ComponentProps<"ul">) {
  useEntry("ChangelogEntryCategories");
  return (
    <ul
      aria-label={label}
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
    />
  );
}

export function ChangelogEntryCategory({
  tone = "improved",
  style,
  children,
  ...props
}: ComponentProps<"li"> & { tone?: ChangelogEntryCategoryTone }) {
  useEntry("ChangelogEntryCategory");
  return (
    <li
      {...props}
      data-tone={tone}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 8px",
        borderRadius: 999,
        background: `color-mix(in oklab, ${tones[tone]} 14%, transparent)`,
        color: tones[tone],
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: "16px",
        ...style,
      }}
    >
      {children}
    </li>
  );
}

export function ChangelogEntryBody({ style, ...props }: ComponentProps<"div">) {
  useEntry("ChangelogEntryBody");
  return (
    <div {...props} style={{ color: muted, lineHeight: "19px", textWrap: "pretty", ...style }} />
  );
}

export function ChangelogEntryChanges({ style, ...props }: ComponentProps<"ul">) {
  const { variant } = useEntry("ChangelogEntryChanges");
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gap: variant === "compact" ? 4 : 6,
        margin: 0,
        paddingInlineStart: 18,
        listStyle: "disc",
        ...style,
      }}
    />
  );
}

export function ChangelogEntryChange({
  href,
  style,
  children,
  ...props
}: ComponentProps<"li"> & { href?: string }) {
  useEntry("ChangelogEntryChange");
  return (
    <li {...props} style={{ paddingInlineStart: 2, textWrap: "pretty", ...style }}>
      {href ? (
        <a href={href} className="uai-changelog-link">
          {children}
          <ArrowUpRight
            size={12}
            strokeWidth={2}
            aria-hidden="true"
            style={{ display: "inline-block", marginInlineStart: 2, verticalAlign: "-1px" }}
          />
        </a>
      ) : (
        children
      )}
    </li>
  );
}
