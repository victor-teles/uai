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
import {
  DescriptionList,
  type DescriptionListProps,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";

export const PROFILE_PAGE_VARIANTS = ["sidebar", "stacked", "compact"] as const;
export type ProfilePageVariant = (typeof PROFILE_PAGE_VARIANTS)[number];
export type ProfilePageProps = ComponentProps<"div"> & { variant?: ProfilePageVariant };

const Context = createContext<ProfilePageVariant | null>(null);
function useVariant(part: string) {
  const variant = useContext(Context);
  if (!variant) throw new Error(`${part} must be used within ProfilePage`);
  return variant;
}
const SectionContext = createContext<string | null>(null);

const cardVariants: Record<ProfilePageVariant, AuthorCardVariant> = {
  sidebar: "card",
  stacked: "card",
  compact: "compact",
};
const detailVariants: Record<ProfilePageVariant, DescriptionListVariant> = {
  sidebar: "inline",
  stacked: "grid",
  compact: "stacked",
};
const timelineVariants: Record<ProfilePageVariant, ActivityTimelineVariant> = {
  sidebar: "rail",
  stacked: "rail",
  compact: "compact",
};

const interactionCss = `
[data-uai-profile-action]{transition:background-color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-profile-action="primary"]{background:var(--uai-accent);color:var(--uai-accent-foreground)}
[data-uai-profile-action="secondary"]{background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-profile-action="danger"]{background:color-mix(in oklab,var(--uai-danger) 12%,transparent);color:var(--uai-danger)}
[data-uai-profile-action="primary"]:hover:not(:disabled){filter:brightness(1.08)}
[data-uai-profile-action="secondary"]:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
[data-uai-profile-action="danger"]:hover:not(:disabled){background:color-mix(in oklab,var(--uai-danger) 20%,transparent)}
[data-uai-profile-action]:active:not(:disabled){transform:scale(0.97)}
[data-uai-profile-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@media (prefers-reduced-motion: reduce){[data-uai-profile-action]{transition:none}[data-uai-profile-action]:active:not(:disabled){transform:none}}`;

/** Identity beside activity and details. The aside wraps above the main column on narrow widths. */
export function ProfilePage({ variant = "sidebar", children, style, ...props }: ProfilePageProps) {
  return (
    <Context.Provider value={variant}>
      <div
        {...props}
        data-variant={variant}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: variant === "compact" ? 12 : 20,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{interactionCss}</style>
        {children}
      </div>
    </Context.Provider>
  );
}

export function ProfilePageAside({ style, ...props }: ComponentProps<"div">) {
  const variant = useVariant("ProfilePageAside");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: variant === "compact" ? 8 : 12,
        flex:
          variant === "stacked" ? "1 1 100%" : variant === "compact" ? "1 1 220px" : "1 1 260px",
        maxWidth: variant === "stacked" ? undefined : variant === "compact" ? 260 : 300,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** Identity card. Compose Author Card parts inside it. */
export function ProfilePageIdentity(props: Omit<AuthorCardProps, "variant">) {
  const variant = useVariant("ProfilePageIdentity");
  return <AuthorCard {...props} variant={cardVariants[variant]} />;
}

/** Account actions such as editing the profile or sending a message. */
export function ProfilePageActions({
  "aria-label": label = "Account actions",
  style,
  ...props
}: ComponentProps<"div">) {
  useVariant("ProfilePageActions");
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset is for form controls; this labels a set of buttons.
    <div
      role="group"
      aria-label={label}
      {...props}
      style={{ display: "flex", flexWrap: "wrap", gap: 6, ...style }}
    />
  );
}

export function ProfilePageAction({
  emphasis = "secondary",
  tone = "default",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & {
  emphasis?: "primary" | "secondary";
  tone?: "default" | "danger";
}) {
  const variant = useVariant("ProfilePageAction");
  const compact = variant === "compact";
  return (
    <button
      {...props}
      type={type}
      data-uai-profile-action={
        emphasis === "primary" ? "primary" : tone === "danger" ? "danger" : "secondary"
      }
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: compact ? 26 : 30,
        padding: compact ? "0 10px" : "0 13px",
        border: 0,
        borderRadius: 999,
        font: "inherit",
        fontSize: compact ? 12 : 12.5,
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: "pointer",
        ...style,
      }}
    />
  );
}

export function ProfilePageMain({ style, ...props }: ComponentProps<"div">) {
  const variant = useVariant("ProfilePageMain");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: variant === "compact" ? 8 : 12,
        flex: "999 1 360px",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function ProfilePageSection({ style, ...props }: ComponentProps<"section">) {
  const variant = useVariant("ProfilePageSection");
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
          padding: compact ? 12 : "16px 18px",
          border: "1px solid var(--uai-border)",
          borderRadius: compact ? 12 : 14,
          background: "var(--uai-surface)",
          ...style,
        }}
      />
    </SectionContext.Provider>
  );
}

export function ProfilePageSectionHeader({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function ProfilePageSectionTitle({ style, ...props }: ComponentProps<"h3">) {
  const id = useContext(SectionContext);
  if (!id) throw new Error("ProfilePageSectionTitle must be used within ProfilePageSection");
  return (
    <h3
      {...props}
      id={id}
      style={{ margin: 0, fontSize: 13, lineHeight: "18px", fontWeight: 500, ...style }}
    />
  );
}

/** Contact details. Compose Description List parts inside it. */
export function ProfilePageDetails(props: Omit<DescriptionListProps, "variant">) {
  const variant = useVariant("ProfilePageDetails");
  return <DescriptionList {...props} variant={detailVariants[variant]} />;
}

/** Recent activity. Compose Activity Timeline parts inside it. */
export function ProfilePageActivity(
  props: Omit<ComponentProps<typeof ActivityTimeline>, "variant">,
) {
  const variant = useVariant("ProfilePageActivity");
  return <ActivityTimeline {...props} variant={timelineVariants[variant]} />;
}
