"use client";

import { Check, Plus } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useState } from "react";

export const AUTHOR_CARD_VARIANTS = ["card", "inline", "compact"] as const;
export type AuthorCardVariant = (typeof AUTHOR_CARD_VARIANTS)[number];
export type AuthorCardProps = ComponentProps<"article"> & { variant?: AuthorCardVariant };
type AuthorContext = { id: string; variant: AuthorCardVariant };
const Context = createContext<AuthorContext | null>(null);
function useAuthor(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within AuthorCard`);
  return context;
}
const authorCss = `
.uai-author-link{background:var(--uai-surface-raised);color:var(--uai-muted);transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-author-link:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text));color:var(--uai-text)}
.uai-author-follow{background:var(--uai-accent);color:var(--uai-accent-foreground);transition:background-color 120ms ease-out,color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-author-follow:hover{filter:brightness(1.08)}
.uai-author-follow[aria-pressed=true]{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-author-follow[aria-pressed=true]:hover{filter:none;background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-author-follow svg{transition:transform 180ms cubic-bezier(0.23,1,0.32,1)}
.uai-author-follow[aria-pressed=true] svg{animation:uai-author-check 220ms cubic-bezier(0.16,1,0.3,1)}
:is(.uai-author-link,.uai-author-follow):active{transform:scale(0.97)}
:is(.uai-author-link,.uai-author-follow):focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@keyframes uai-author-check{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){
.uai-author-link,.uai-author-follow,.uai-author-follow svg{transition:none;animation:none}
:is(.uai-author-link,.uai-author-follow):active{transform:none}
}
`;
function cx(...names: (string | undefined)[]) {
  return names.filter(Boolean).join(" ");
}
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function AuthorCard({ variant = "card", style, children, ...props }: AuthorCardProps) {
  const id = useId();
  const inline = variant === "inline";
  return (
    <Context.Provider value={{ id, variant }}>
      <article
        aria-labelledby={`${id}-name`}
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          gridTemplateColumns: inline ? "auto minmax(0, 1fr)" : "minmax(0, 1fr)",
          columnGap: 12,
          rowGap: variant === "compact" ? 8 : inline ? 8 : 12,
          alignItems: "start",
          minWidth: 0,
          padding: inline ? 0 : variant === "compact" ? 12 : 18,
          border: inline ? 0 : "1px solid var(--uai-border)",
          borderRadius: variant === "compact" ? 12 : 14,
          background: inline ? "transparent" : "var(--uai-surface)",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{authorCss}</style>
        {children}
      </article>
    </Context.Provider>
  );
}

export function AuthorCardAvatar({
  name,
  src,
  style,
  ...props
}: Omit<ComponentProps<"span">, "children"> & { name: string; src?: string }) {
  const { variant } = useAuthor("AuthorCardAvatar");
  const [failed, setFailed] = useState(false);
  const size = variant === "compact" ? 28 : variant === "inline" ? 36 : 40;
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        display: "grid",
        placeItems: "center",
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        boxShadow: "0 0 0 1px oklch(1 0 0 / 0.08)",
        color: "var(--uai-muted)",
        fontSize: size >= 40 ? 13 : size >= 36 ? 12 : 11,
        fontWeight: 500,
        gridRow: variant === "inline" ? "span 3" : undefined,
        ...style,
      }}
    >
      {src && !failed ? (
        // biome-ignore lint/performance/noImgElement: distributed source cannot depend on next/image.
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function AuthorCardHeader({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useAuthor("AuthorCardHeader");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        gridColumn: variant === "inline" ? 2 : undefined,
        ...style,
      }}
    />
  );
}

export function AuthorCardName({ style, ...props }: ComponentProps<"p">) {
  const { id, variant } = useAuthor("AuthorCardName");
  const compact = variant === "compact";
  return (
    <p
      {...props}
      id={`${id}-name`}
      style={{
        margin: 0,
        fontSize: compact ? 13 : 14,
        lineHeight: compact ? "18px" : "20px",
        fontWeight: 500,
        ...style,
      }}
    />
  );
}

export function AuthorCardRole({ style, ...props }: ComponentProps<"p">) {
  useAuthor("AuthorCardRole");
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-subtle)", fontSize: 12, lineHeight: "16px", ...style }}
    />
  );
}

export function AuthorCardBio({ style, ...props }: ComponentProps<"p">) {
  const { variant } = useAuthor("AuthorCardBio");
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: variant === "compact" ? 12.5 : 13,
        lineHeight: variant === "compact" ? "18px" : "19px",
        textWrap: "pretty",
        gridColumn: variant === "inline" ? 2 : undefined,
        ...style,
      }}
    />
  );
}

export function AuthorCardLinks({
  "aria-label": label = "Profiles",
  style,
  ...props
}: ComponentProps<"ul">) {
  const { variant } = useAuthor("AuthorCardLinks");
  return (
    <ul
      aria-label={label}
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        margin: 0,
        padding: 0,
        listStyle: "none",
        gridColumn: variant === "inline" ? 2 : undefined,
        ...style,
      }}
    />
  );
}

export function AuthorCardLink({ className, style, children, ...props }: ComponentProps<"a">) {
  const { variant } = useAuthor("AuthorCardLink");
  return (
    <li style={{ display: "flex" }}>
      <a
        {...props}
        className={cx("uai-author-link", className)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: variant === "compact" ? 24 : 26,
          padding: "0 10px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
          textDecoration: "none",
          whiteSpace: "nowrap",
          ...style,
        }}
      >
        {children}
      </a>
    </li>
  );
}

export type AuthorCardFollowProps = Omit<ComponentProps<"button">, "type"> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
};
export function AuthorCardFollow({
  pressed,
  defaultPressed = false,
  onPressedChange,
  onClick,
  children = "Follow",
  className,
  style,
  ...props
}: AuthorCardFollowProps) {
  const { id, variant } = useAuthor("AuthorCardFollow");
  const [internal, setInternal] = useState(defaultPressed);
  const current = pressed ?? internal;
  const Icon = current ? Check : Plus;
  return (
    <button
      aria-describedby={`${id}-name`}
      {...props}
      type="button"
      aria-pressed={current}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (pressed === undefined) setInternal(!current);
        onPressedChange?.(!current);
      }}
      className={cx("uai-author-follow", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: variant === "compact" ? 26 : 28,
        padding: variant === "compact" ? "0 10px 0 8px" : "0 12px 0 10px",
        border: 0,
        borderRadius: 999,
        fontSize: variant === "compact" ? 12 : 12.5,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    >
      <Icon key={current ? "on" : "off"} size={14} strokeWidth={2} aria-hidden="true" />
      {children}
    </button>
  );
}
