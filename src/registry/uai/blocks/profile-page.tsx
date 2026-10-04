"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId } from "react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/uai-utils";

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

const profilePageVariants = cva(
  "flex min-w-0 flex-wrap items-start text-[13px]/[18px] text-foreground",
  { variants: { variant: { sidebar: "gap-5", stacked: "gap-5", compact: "gap-3" } } },
);

/** Identity beside activity and details. The aside wraps above the main column on narrow widths. */
export function ProfilePage({
  variant = "sidebar",
  className,
  children,
  ...props
}: ProfilePageProps) {
  return (
    <Context.Provider value={variant}>
      <div
        data-slot="profile-page"
        className={cn(profilePageVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

const asideClasses: Record<ProfilePageVariant, string> = {
  sidebar: "flex-[1_1_260px] max-w-[300px] gap-3",
  stacked: "flex-[1_1_100%] gap-3",
  compact: "flex-[1_1_220px] max-w-[260px] gap-2",
};

export function ProfilePageAside({ className, ...props }: ComponentProps<"div">) {
  const variant = useVariant("ProfilePageAside");
  return (
    <div
      data-slot="profile-page-aside"
      className={cn("grid min-w-0", asideClasses[variant], className)}
      {...props}
    />
  );
}

/** Identity card. Compose Author Card parts inside it. */
export function ProfilePageIdentity(props: Omit<AuthorCardProps, "variant">) {
  const variant = useVariant("ProfilePageIdentity");
  return (
    <AuthorCard data-slot="profile-page-identity" {...props} variant={cardVariants[variant]} />
  );
}

/** Account actions such as editing the profile or sending a message. */
export function ProfilePageActions({
  "aria-label": label = "Account actions",
  className,
  ...props
}: ComponentProps<"div">) {
  useVariant("ProfilePageActions");
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset is for form controls; this labels a set of buttons.
    <div
      role="group"
      aria-label={label}
      data-slot="profile-page-actions"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    />
  );
}

const profilePageActionVariants = cva(
  [
    "cursor-pointer gap-1.5 rounded-full border-0 py-0",
    "transition-[background-color,filter,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)]",
    "enabled:active:scale-97 focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
  ],
  {
    variants: {
      intent: {
        primary: "bg-primary text-primary-foreground hover:bg-primary enabled:hover:brightness-108",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
        danger: "bg-destructive/12 text-destructive hover:bg-destructive/20",
      },
      compact: {
        true: "h-[26px] px-2.5 text-[12px] has-[>svg]:px-2.5",
        false: "h-[30px] px-[13px] text-[12.5px] has-[>svg]:px-[13px]",
      },
    },
  },
);

export function ProfilePageAction({
  emphasis = "secondary",
  tone = "default",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & {
  emphasis?: "primary" | "secondary";
  tone?: "default" | "danger";
}) {
  const variant = useVariant("ProfilePageAction");
  const intent = emphasis === "primary" ? "primary" : tone === "danger" ? "danger" : "secondary";
  return (
    <Button
      data-slot="profile-page-action"
      variant={intent === "primary" ? "default" : "secondary"}
      className={cn(
        profilePageActionVariants({ intent, compact: variant === "compact" }),
        className,
      )}
      {...props}
      type={type}
      data-intent={intent}
    />
  );
}

export function ProfilePageMain({ className, ...props }: ComponentProps<"div">) {
  const variant = useVariant("ProfilePageMain");
  return (
    <div
      data-slot="profile-page-main"
      className={cn(
        "grid min-w-0 flex-[999_1_360px] content-start",
        variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function ProfilePageSection({ className, ...props }: ComponentProps<"section">) {
  const variant = useVariant("ProfilePageSection");
  const id = useId();
  const compact = variant === "compact";
  return (
    <SectionContext.Provider value={id}>
      <section
        aria-labelledby={id}
        data-slot="profile-page-section"
        className={cn(
          "grid min-w-0 border bg-card",
          compact ? "gap-2 rounded-xl p-3" : "gap-3 rounded-[14px] px-[18px] py-4",
          className,
        )}
        {...props}
      />
    </SectionContext.Provider>
  );
}

export function ProfilePageSectionHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="profile-page-section-header"
      className={cn("flex min-w-0 flex-wrap items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

export function ProfilePageSectionTitle({ className, ...props }: ComponentProps<"h3">) {
  const id = useContext(SectionContext);
  if (!id) throw new Error("ProfilePageSectionTitle must be used within ProfilePageSection");
  return (
    <h3
      data-slot="profile-page-section-title"
      className={cn("m-0 text-[13px]/[18px] font-medium", className)}
      {...props}
      id={id}
    />
  );
}

/** Contact details. Compose Description List parts inside it. */
export function ProfilePageDetails(props: Omit<DescriptionListProps, "variant">) {
  const variant = useVariant("ProfilePageDetails");
  return (
    <DescriptionList
      data-slot="profile-page-details"
      {...props}
      variant={detailVariants[variant]}
    />
  );
}

/** Recent activity. Compose Activity Timeline parts inside it. */
export function ProfilePageActivity(
  props: Omit<ComponentProps<typeof ActivityTimeline>, "variant">,
) {
  const variant = useVariant("ProfilePageActivity");
  return (
    <ActivityTimeline
      data-slot="profile-page-activity"
      {...props}
      variant={timelineVariants[variant]}
    />
  );
}
