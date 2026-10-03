"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId, useState } from "react";
import {
  ConfirmationDialog,
  type ConfirmationDialogProps,
  type ConfirmationDialogVariant,
} from "@/components/ui/uai/confirmation-dialog";
import {
  DataTableToolbar,
  type DataTableToolbarProps,
  type DataTableToolbarVariant,
} from "@/components/ui/uai/data-table-toolbar";
import {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateVariant,
} from "@/components/ui/uai/empty-state";
import { cn } from "@/lib/uai-utils";

export const TEAM_MANAGEMENT_VARIANTS = ["table", "cards", "compact"] as const;
export type TeamManagementVariant = (typeof TEAM_MANAGEMENT_VARIANTS)[number];
export type TeamManagementProps = ComponentProps<"section"> & { variant?: TeamManagementVariant };

type TeamContext = { id: string; variant: TeamManagementVariant };
const Context = createContext<TeamContext | null>(null);
function useTeam(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within TeamManagement`);
  return context;
}
const MemberContext = createContext<string | null>(null);
function useMember(part: string) {
  const id = useContext(MemberContext);
  if (!id) throw new Error(`${part} must be used within TeamManagementMember`);
  return id;
}

const toolbarVariants: Record<TeamManagementVariant, DataTableToolbarVariant> = {
  table: "toolbar",
  cards: "stacked",
  compact: "compact",
};
const dialogVariants: Record<TeamManagementVariant, ConfirmationDialogVariant> = {
  table: "centered",
  cards: "centered",
  compact: "compact",
};
const emptyVariants: Record<TeamManagementVariant, EmptyStateVariant> = {
  table: "card",
  cards: "card",
  compact: "compact",
};
const transitionClass =
  "transition-[background-color,box-shadow,filter,transform] duration-[120ms,120ms,120ms,140ms] ease-[ease-out,ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none";
const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const secondaryHover =
  "enabled:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]";

const teamManagementVariants = cva(
  "grid min-w-0 content-start text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        table: "gap-4",
        cards: "gap-4",
        compact: "gap-2.5",
      },
    },
  },
);

export function TeamManagement({
  variant = "table",
  children,
  className,
  ...props
}: TeamManagementProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="team-management"
        data-variant={variant}
        className={cn(teamManagementVariants({ variant }), className)}
        {...props}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function TeamManagementHeader({ className, ...props }: ComponentProps<"div">) {
  useTeam("TeamManagementHeader");
  return (
    <div
      data-slot="team-management-header"
      className={cn("flex min-w-0 flex-wrap items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export function TeamManagementHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="team-management-heading"
      className={cn("grid min-w-0 flex-[1_1_240px] gap-1", className)}
      {...props}
    />
  );
}

export function TeamManagementTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useTeam("TeamManagementTitle");
  return (
    <h2
      data-slot="team-management-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em]",
        context.variant === "compact" ? "text-[15px]/5" : "text-[18px]/6",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function TeamManagementDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="team-management-description"
      className={cn("m-0 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function TeamManagementActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="team-management-actions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

const teamButtonEmphasis = {
  primary: "bg-primary text-primary-foreground enabled:hover:brightness-108",
  secondary: cn("bg-secondary text-secondary-foreground", secondaryHover),
  danger: "bg-destructive/12 text-destructive enabled:hover:bg-destructive/20",
};

export function TeamManagementButton({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" | "danger" }) {
  const context = useTeam("TeamManagementButton");
  const compact = context.variant === "compact";
  return (
    <button
      data-slot="team-management-button"
      className={cn(
        transitionClass,
        focusClass,
        "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-0 font-medium enabled:active:scale-[0.97] motion-reduce:enabled:active:scale-100",
        compact ? "h-6.5 px-2.5 text-[12px]" : "h-7.5 px-[13px] text-[12.5px]",
        teamButtonEmphasis[emphasis],
        className,
      )}
      {...props}
      type={type}
      data-emphasis={emphasis}
    />
  );
}

/** Search and bulk actions for the member list. Compose Data Table Toolbar parts inside it. */
export function TeamManagementToolbar({
  "aria-label": label = "Member controls",
  ...props
}: Omit<DataTableToolbarProps, "variant">) {
  const context = useTeam("TeamManagementToolbar");
  return (
    <DataTableToolbar
      data-slot="team-management-toolbar"
      {...props}
      aria-label={label}
      variant={toolbarVariants[context.variant]}
    />
  );
}

/** An invitation form. The consumer owns submission and validation. */
export function TeamManagementInvite({
  "aria-label": label = "Invite members",
  className,
  ...props
}: ComponentProps<"form">) {
  const context = useTeam("TeamManagementInvite");
  return (
    <form
      aria-label={label}
      data-slot="team-management-invite"
      className={cn(
        "flex min-w-0 flex-wrap items-end gap-2 border-0 bg-card shadow-[0_0_0_1px_var(--border)]",
        context.variant === "compact" ? "rounded-xl p-2.5" : "rounded-[14px] px-4 py-3.5",
        className,
      )}
      {...props}
    />
  );
}

/** A native role select. Inside a member row it is named "Role for" plus the member name. */
export function TeamManagementRoleSelect({
  className,
  "aria-labelledby": labelledBy,
  ...props
}: ComponentProps<"select">) {
  const context = useTeam("TeamManagementRoleSelect");
  const memberId = useContext(MemberContext);
  const labelId = useId();
  const compact = context.variant === "compact";
  return (
    <>
      {memberId && !labelledBy && !props["aria-label"] ? (
        <span id={labelId} className="sr-only">
          Role for
        </span>
      ) : null}
      <select
        aria-labelledby={labelledBy ?? (memberId ? `${labelId} ${memberId}-name` : undefined)}
        data-slot="team-management-role-select"
        className={cn(
          transitionClass,
          focusClass,
          "cursor-pointer rounded-lg border-0 bg-secondary py-0 pr-1.5 pl-2.5 font-medium text-foreground disabled:cursor-not-allowed disabled:bg-transparent disabled:text-subtle-foreground",
          secondaryHover,
          compact ? "h-6.5 text-[12px]" : "h-7.5 text-[12.5px]",
          className,
        )}
        {...props}
      />
    </>
  );
}

export function TeamManagementMembers({
  "aria-label": label = "Members",
  className,
  ...props
}: ComponentProps<"ul">) {
  const { variant } = useTeam("TeamManagementMembers");
  return (
    <ul
      aria-label={label}
      data-slot="team-management-members"
      className={cn(
        "m-0 grid list-none p-0",
        variant === "cards"
          ? "grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-2"
          : "overflow-hidden border bg-card",
        variant === "table" && "rounded-[14px]",
        variant === "compact" && "rounded-xl",
        className,
      )}
      {...props}
    />
  );
}

const memberVariants = cva(
  cn(
    transitionClass,
    "flex min-w-0 flex-wrap items-center border-0 animate-[enter_240ms_cubic-bezier(0.23,1,0.32,1)_both] fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none",
    "nth-2:[animation-delay:40ms] nth-3:[animation-delay:80ms] nth-4:[animation-delay:120ms] nth-5:[animation-delay:160ms] nth-[n+6]:[animation-delay:200ms]",
  ),
  {
    variants: {
      variant: {
        table:
          "gap-3 rounded-none px-3.5 py-2.5 hover:bg-[color-mix(in_oklab,var(--muted)_45%,var(--card))] [[data-slot=team-management-member]+&]:shadow-[inset_0_1px_0_var(--border)]",
        cards:
          "gap-3 rounded-[14px] bg-card p-3.5 shadow-[0_0_0_1px_var(--border)] hover:shadow-[0_0_0_1px_var(--border-strong)]",
        compact:
          "gap-2 rounded-none px-2.5 py-2 hover:bg-[color-mix(in_oklab,var(--muted)_45%,var(--card))] [[data-slot=team-management-member]+&]:shadow-[inset_0_1px_0_var(--border)]",
      },
    },
  },
);

export function TeamManagementMember({ className, ...props }: ComponentProps<"li">) {
  const { variant } = useTeam("TeamManagementMember");
  const id = useId();
  return (
    <MemberContext.Provider value={id}>
      <li
        data-slot="team-management-member"
        className={cn(memberVariants({ variant }), className)}
        {...props}
      />
    </MemberContext.Provider>
  );
}

export function TeamManagementMemberIdentity({ className, ...props }: ComponentProps<"div">) {
  useMember("TeamManagementMemberIdentity");
  return (
    <div
      data-slot="team-management-member-identity"
      className={cn(
        "grid min-w-0 flex-[1_1_220px] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5",
        className,
      )}
      {...props}
    />
  );
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

export function TeamManagementMemberAvatar({
  name,
  src,
  className,
  ...props
}: Omit<ComponentProps<"span">, "children"> & { name: string; src?: string }) {
  const { variant } = useTeam("TeamManagementMemberAvatar");
  useMember("TeamManagementMemberAvatar");
  const [failed, setFailed] = useState(false);
  return (
    <span
      aria-hidden="true"
      data-slot="team-management-member-avatar"
      className={cn(
        "row-span-2 grid place-items-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground shadow-[0_0_0_1px_oklch(1_0_0/0.08)]",
        variant === "compact" ? "size-6 text-[10px]" : "size-8 text-[11.5px]",
        className,
      )}
      {...props}
    >
      {src && !failed ? (
        // biome-ignore lint/performance/noImgElement: distributed source cannot depend on next/image.
        <img src={src} alt="" onError={() => setFailed(true)} className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function TeamManagementMemberName({ className, ...props }: ComponentProps<"p">) {
  const id = useMember("TeamManagementMemberName");
  return (
    <p
      data-slot="team-management-member-name"
      className={cn("m-0 truncate font-medium", className)}
      {...props}
      id={`${id}-name`}
    />
  );
}

export function TeamManagementMemberEmail({ className, ...props }: ComponentProps<"p">) {
  useMember("TeamManagementMemberEmail");
  return (
    <p
      data-slot="team-management-member-email"
      className={cn("m-0 truncate text-[12px] text-muted-foreground", className)}
      {...props}
    />
  );
}

const statusTones = {
  neutral: "bg-muted-foreground/16 text-muted-foreground",
  accent: "bg-primary/14 text-[color-mix(in_oklab,var(--primary)_70%,var(--foreground))]",
  success: "bg-success/14 text-success",
  warning: "bg-warning/14 text-warning",
} as const;

/** Access or invitation status, such as "Pending invite" or "Owner". `tone` tints the badge. */
export function TeamManagementMemberStatus({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: keyof typeof statusTones }) {
  useMember("TeamManagementMemberStatus");
  return (
    <span
      data-slot="team-management-member-status"
      className={cn(
        "whitespace-nowrap rounded-full px-2 text-[11.5px]/5 font-medium",
        statusTones[tone],
        className,
      )}
      {...props}
      data-tone={tone}
    />
  );
}

export function TeamManagementMemberActions({ className, ...props }: ComponentProps<"div">) {
  useMember("TeamManagementMemberActions");
  return (
    <div
      data-slot="team-management-member-actions"
      className={cn("ml-auto flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

/** Removal confirmation. Compose Confirmation Dialog parts inside it. */
export function TeamManagementRemove(props: Omit<ConfirmationDialogProps, "variant">) {
  const context = useTeam("TeamManagementRemove");
  return <ConfirmationDialog {...props} variant={dialogVariants[context.variant]} />;
}

/** Shown when no member matches. Compose Empty State parts inside it. */
export function TeamManagementEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = useTeam("TeamManagementEmpty");
  return (
    <EmptyState
      data-slot="team-management-empty"
      {...props}
      variant={emptyVariants[context.variant]}
    />
  );
}
