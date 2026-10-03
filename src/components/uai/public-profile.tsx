"use client";

import { type ComponentProps, createContext, useContext, useId } from "react";
import {
  ActivityTimeline,
  type ActivityTimelineVariant,
} from "@/components/ui/uai/activity-timeline";
import {
  AuthorCard,
  type AuthorCardProps,
  type AuthorCardVariant,
} from "@/components/ui/uai/author-card";

export const PUBLIC_PROFILE_VARIANTS = ["sidebar", "banner", "compact"] as const;
export type PublicProfileVariant = (typeof PUBLIC_PROFILE_VARIANTS)[number];
export type PublicProfileProps = ComponentProps<"div"> & { variant?: PublicProfileVariant };

const Context = createContext<PublicProfileVariant | null>(null);
function useVariant(part: string) {
  const variant = useContext(Context);
  if (!variant) throw new Error(`${part} must be used within PublicProfile`);
  return variant;
}
const SectionContext = createContext<string | null>(null);

const layoutCss = `
[data-uai-profile-layout]{display:grid;gap:20px;min-width:0;align-items:start}
[data-uai-public-profile="compact"]>[data-uai-profile-layout]{gap:12px}
@container (min-width: 720px){
  [data-uai-public-profile="sidebar"]>[data-uai-profile-layout]{grid-template-columns:280px minmax(0,1fr);column-gap:28px}
  [data-uai-public-profile="sidebar"] [data-uai-profile-region="aside"]{position:sticky;top:16px}
  [data-uai-public-profile="banner"] [data-uai-profile-region="aside"]{grid-template-columns:minmax(0,1fr) auto;align-items:end}
}
@container (min-width: 560px){
  [data-uai-public-profile="compact"]>[data-uai-profile-layout]{grid-template-columns:220px minmax(0,1fr)}
}
.uai-profile-work{transition:background-color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-profile-work:hover{background:color-mix(in oklab,var(--uai-surface-raised) 88%,var(--uai-text))}
.uai-profile-work:active{transform:scale(0.98)}
.uai-profile-work:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@media (prefers-reduced-motion: reduce){.uai-profile-work{transition:none}.uai-profile-work:active{transform:none}}
`;

const cardVariants: Record<PublicProfileVariant, AuthorCardVariant> = {
  sidebar: "card",
  banner: "inline",
  compact: "compact",
};
const timelineVariants: Record<PublicProfileVariant, ActivityTimelineVariant> = {
  sidebar: "rail",
  banner: "rail",
  compact: "compact",
};

/** A public profile: identity, links, follower counts, work, and recent activity. */
export function PublicProfile({
  variant = "sidebar",
  children,
  style,
  ...props
}: PublicProfileProps) {
  return (
    <Context.Provider value={variant}>
      <div
        {...props}
        data-variant={variant}
        data-uai-public-profile={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-profile-layout="">{children}</div>
      </div>
    </Context.Provider>
  );
}

/** Identity and counts. A column beside the main content, or a banner above it. */
export function PublicProfileAside({ style, ...props }: ComponentProps<"div">) {
  const variant = useVariant("PublicProfileAside");
  const banner = variant === "banner";
  return (
    <div
      {...props}
      data-uai-profile-region="aside"
      style={{
        display: "grid",
        gap: variant === "compact" ? 8 : 12,
        minWidth: 0,
        padding: banner ? "clamp(16px, 4cqi, 28px)" : 0,
        border: 0,
        borderRadius: 14,
        background: banner
          ? "linear-gradient(180deg, color-mix(in oklab, var(--uai-accent) 14%, var(--uai-surface-raised)) 0 56px, var(--uai-surface) 56px)"
          : undefined,
        ...style,
      }}
    />
  );
}

/** Identity card. Compose Author Card parts, links, and the follow button inside it. */
export function PublicProfileIdentity(props: Omit<AuthorCardProps, "variant">) {
  const variant = useVariant("PublicProfileIdentity");
  return <AuthorCard {...props} variant={cardVariants[variant]} />;
}

/** Follower, following, and post counts as a description list. */
export function PublicProfileStats({ style, ...props }: ComponentProps<"dl">) {
  const variant = useVariant("PublicProfileStats");
  return (
    <dl
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: variant === "compact" ? 12 : 20,
        margin: 0,
        padding: variant === "banner" ? 0 : "0 4px",
        ...style,
      }}
    />
  );
}

/** One count. The label comes first in the source so it is read before the value. */
export function PublicProfileStat({
  label,
  style,
  children,
  ...props
}: ComponentProps<"div"> & { label: string }) {
  const variant = useVariant("PublicProfileStat");
  return (
    <div
      {...props}
      style={{ display: "flex", flexDirection: "column-reverse", minWidth: 0, ...style }}
    >
      <dt style={{ color: "var(--uai-subtle)", fontSize: 12 }}>{label}</dt>
      <dd
        style={{
          margin: 0,
          fontSize: variant === "compact" ? 14 : 16,
          lineHeight: variant === "compact" ? "20px" : "22px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {children}
      </dd>
    </div>
  );
}

export function PublicProfileMain({ style, ...props }: ComponentProps<"div">) {
  const variant = useVariant("PublicProfileMain");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: variant === "compact" ? 8 : 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function PublicProfileSection({ style, ...props }: ComponentProps<"section">) {
  const variant = useVariant("PublicProfileSection");
  const id = useId();
  const compact = variant === "compact";
  return (
    <SectionContext.Provider value={id}>
      <section
        aria-labelledby={id}
        {...props}
        style={{
          display: "grid",
          gap: compact ? 8 : 12,
          minWidth: 0,
          padding: compact ? 12 : 16,
          borderRadius: compact ? 12 : 14,
          background: "var(--uai-surface)",
          ...style,
        }}
      />
    </SectionContext.Provider>
  );
}

export function PublicProfileSectionTitle({ style, ...props }: ComponentProps<"h2">) {
  const id = useContext(SectionContext);
  if (!id) throw new Error("PublicProfileSectionTitle must be used within PublicProfileSection");
  return (
    <h2
      {...props}
      id={id}
      style={{ margin: 0, fontSize: 13, lineHeight: "18px", fontWeight: 500, ...style }}
    />
  );
}

/** Pinned work as a grid of linked tiles. */
export function PublicProfileWork({ style, ...props }: ComponentProps<"ul">) {
  const variant = useVariant("PublicProfileWork");
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${variant === "compact" ? 200 : 220}px), 1fr))`,
        gap: 8,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
    />
  );
}

export function PublicProfileWorkItem({ style, children, ...props }: ComponentProps<"a">) {
  const variant = useVariant("PublicProfileWorkItem");
  return (
    <li style={{ display: "grid", minWidth: 0 }}>
      <a
        {...props}
        className={props.className ? `uai-profile-work ${props.className}` : "uai-profile-work"}
        style={{
          display: "grid",
          alignContent: "start",
          gap: 4,
          minWidth: 0,
          padding: variant === "compact" ? 10 : 12,
          borderRadius: 10,
          background: "var(--uai-surface-raised)",
          color: "var(--uai-text)",
          textDecoration: "none",
          ...style,
        }}
      >
        {children}
      </a>
    </li>
  );
}

export function PublicProfileWorkTitle({ style, ...props }: ComponentProps<"span">) {
  return <span {...props} style={{ fontWeight: 500, overflowWrap: "anywhere", ...style }} />;
}

export function PublicProfileWorkDescription({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{ color: "var(--uai-muted)", fontSize: 12.5, textWrap: "pretty", ...style }}
    />
  );
}

export function PublicProfileWorkMeta({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0 10px",
        paddingTop: 4,
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

/** Recent activity. Compose Activity Timeline parts inside it. */
export function PublicProfileActivity(
  props: Omit<ComponentProps<typeof ActivityTimeline>, "variant">,
) {
  const variant = useVariant("PublicProfileActivity");
  return <ActivityTimeline {...props} variant={timelineVariants[variant]} />;
}
