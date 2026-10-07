"use client";

import { cva } from "class-variance-authority";
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
import { cn } from "@/lib/uai-utils";

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

const layoutVariants = cva("grid min-w-0 items-start", {
  variants: {
    variant: {
      sidebar: "gap-5 @min-[720px]:grid-cols-[280px_minmax(0,1fr)] @min-[720px]:gap-x-7",
      banner: "gap-5",
      compact: "gap-3 @min-[560px]:grid-cols-[220px_minmax(0,1fr)]",
    },
  },
});

/** A public profile: identity, links, follower counts, work, and recent activity. */
export function PublicProfile({
  variant = "sidebar",
  children,
  className,
  ...props
}: PublicProfileProps) {
  return (
    <Context.Provider value={variant}>
      <div
        data-slot="public-profile"
        data-variant={variant}
        className={cn(
          "@container box-border min-w-0 text-[13px]/[18px] text-foreground",
          className,
        )}
        {...props}
      >
        <div className={layoutVariants({ variant })}>{children}</div>
      </div>
    </Context.Provider>
  );
}

/** Identity and counts. A column beside the main content, or a banner above it. */
export function PublicProfileAside({ className, ...props }: ComponentProps<"div">) {
  const variant = useVariant("PublicProfileAside");
  return (
    <div
      data-slot="public-profile-aside"
      className={cn(
        "grid min-w-0 rounded-[14px] border-0",
        variant === "compact" ? "gap-2 p-0" : "gap-3",
        variant === "sidebar" && "p-0 @min-[720px]:sticky @min-[720px]:top-4",
        variant === "banner" &&
          "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_14%,var(--muted))_0_56px,var(--card)_56px)] p-[clamp(16px,4cqi,28px)] @min-[720px]:grid-cols-[minmax(0,1fr)_auto] @min-[720px]:items-end",
        className,
      )}
      {...props}
    />
  );
}

/** Identity card. Compose Author Card parts, links, and the follow button inside it. */
export function PublicProfileIdentity(props: Omit<AuthorCardProps, "variant">) {
  const variant = useVariant("PublicProfileIdentity");
  return (
    <AuthorCard data-slot="public-profile-identity" {...props} variant={cardVariants[variant]} />
  );
}

/** Follower, following, and post counts as a description list. */
export function PublicProfileStats({ className, ...props }: ComponentProps<"dl">) {
  const variant = useVariant("PublicProfileStats");
  return (
    <dl
      data-slot="public-profile-stats"
      className={cn(
        "m-0 flex flex-wrap",
        variant === "compact" ? "gap-3" : "gap-5",
        variant === "banner" ? "p-0" : "px-1 py-0",
        className,
      )}
      {...props}
    />
  );
}

/** One count. The label comes first in the source so it is read before the value. */
export function PublicProfileStat({
  label,
  className,
  children,
  ...props
}: ComponentProps<"div"> & { label: string }) {
  const variant = useVariant("PublicProfileStat");
  return (
    <div
      data-slot="public-profile-stat"
      className={cn("flex min-w-0 flex-col-reverse", className)}
      {...props}
    >
      <dt className="text-[12px] text-subtle-foreground">{label}</dt>
      <dd
        className={cn(
          "m-0 font-semibold tracking-[-0.01em] tabular-nums",
          variant === "compact" ? "text-[14px]/5" : "text-[16px]/[22px]",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

export function PublicProfileMain({ className, ...props }: ComponentProps<"div">) {
  const variant = useVariant("PublicProfileMain");
  return (
    <div
      data-slot="public-profile-main"
      className={cn(
        "grid min-w-0 content-start",
        variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function PublicProfileSection({ className, ...props }: ComponentProps<"section">) {
  const variant = useVariant("PublicProfileSection");
  const id = useId();
  const compact = variant === "compact";
  return (
    <SectionContext.Provider value={id}>
      <section
        aria-labelledby={id}
        data-slot="public-profile-section"
        className={cn(
          "grid min-w-0 bg-card",
          compact ? "gap-2 rounded-xl p-3" : "gap-3 rounded-[14px] p-4",
          className,
        )}
        {...props}
      />
    </SectionContext.Provider>
  );
}

export function PublicProfileSectionTitle({ className, ...props }: ComponentProps<"h2">) {
  const id = useContext(SectionContext);
  if (!id) throw new Error("PublicProfileSectionTitle must be used within PublicProfileSection");
  return (
    <h2
      data-slot="public-profile-section-title"
      className={cn("m-0 text-[13px]/[18px] font-medium", className)}
      {...props}
      id={id}
    />
  );
}

/** Pinned work as a grid of linked tiles. */
export function PublicProfileWork({ className, ...props }: ComponentProps<"ul">) {
  const variant = useVariant("PublicProfileWork");
  return (
    <ul
      data-slot="public-profile-work"
      className={cn(
        "m-0 grid list-none gap-2 p-0",
        variant === "compact"
          ? "grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))]"
          : "grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))]",
        className,
      )}
      {...props}
    />
  );
}

export function PublicProfileWorkItem({ className, children, ...props }: ComponentProps<"a">) {
  const variant = useVariant("PublicProfileWorkItem");
  return (
    <li className="grid min-w-0">
      <a
        data-slot="public-profile-work-item"
        className={cn(
          "grid min-w-0 content-start gap-1 rounded-[10px] bg-secondary text-foreground no-underline",
          "transition-[background-color,scale] duration-[120ms,140ms] ease-[ease-out,cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--secondary)_88%,var(--foreground))] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
          variant === "compact" ? "p-2.5" : "p-3",
          className,
        )}
        {...props}
      >
        {children}
      </a>
    </li>
  );
}

export function PublicProfileWorkTitle({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="public-profile-work-title"
      className={cn("font-medium wrap-anywhere", className)}
      {...props}
    />
  );
}

export function PublicProfileWorkDescription({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="public-profile-work-description"
      className={cn("text-[12.5px] text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

export function PublicProfileWorkMeta({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="public-profile-work-meta"
      className={cn(
        "flex flex-wrap gap-x-2.5 gap-y-0 pt-1 text-[12px] text-subtle-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

/** Recent activity. Compose Activity Timeline parts inside it. */
export function PublicProfileActivity(
  props: Omit<ComponentProps<typeof ActivityTimeline>, "variant">,
) {
  const variant = useVariant("PublicProfileActivity");
  return (
    <ActivityTimeline
      data-slot="public-profile-activity"
      {...props}
      variant={timelineVariants[variant]}
    />
  );
}
