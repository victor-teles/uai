"use client";

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
const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

const interactionCss = `
[data-uai-team-button],[data-uai-team-select],[data-uai-team-member]{transition:background-color 120ms ease-out,box-shadow 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-team-button="primary"]{background:var(--uai-accent);color:var(--uai-accent-foreground)}
[data-uai-team-button="secondary"]{background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-team-button="danger"]{background:color-mix(in oklab,var(--uai-danger) 12%,transparent);color:var(--uai-danger)}
[data-uai-team-button="primary"]:hover:not(:disabled){filter:brightness(1.08)}
[data-uai-team-button="secondary"]:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
[data-uai-team-button="danger"]:hover:not(:disabled){background:color-mix(in oklab,var(--uai-danger) 20%,transparent)}
[data-uai-team-button]:active:not(:disabled){transform:scale(0.97)}
[data-uai-team-select]{background:var(--uai-surface-raised)}
[data-uai-team-select]:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
[data-uai-team-select]:disabled{background:transparent;color:var(--uai-subtle)}
[data-uai-team-button]:focus-visible,[data-uai-team-select]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
[data-uai-team-members]>[data-uai-team-member]+[data-uai-team-member]{box-shadow:inset 0 1px 0 var(--uai-border)}
[data-uai-team-members]>[data-uai-team-member]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 45%,var(--uai-surface))}
[data-uai-team-member="card"]{background:var(--uai-surface);box-shadow:0 0 0 1px var(--uai-border)}
[data-uai-team-member="card"]:hover{box-shadow:0 0 0 1px var(--uai-border-strong)}
@keyframes uai-team-enter{from{opacity:0;transform:translateY(4px)}}
[data-uai-team-member]{animation:uai-team-enter 240ms cubic-bezier(0.23,1,0.32,1) both}
[data-uai-team-member]:nth-child(2){animation-delay:40ms}
[data-uai-team-member]:nth-child(3){animation-delay:80ms}
[data-uai-team-member]:nth-child(4){animation-delay:120ms}
[data-uai-team-member]:nth-child(5){animation-delay:160ms}
[data-uai-team-member]:nth-child(n+6){animation-delay:200ms}
@media (prefers-reduced-motion: reduce){[data-uai-team-button],[data-uai-team-select],[data-uai-team-member]{transition:none;animation:none}[data-uai-team-button]:active:not(:disabled){transform:none}}`;

export function TeamManagement({
  variant = "table",
  children,
  style,
  ...props
}: TeamManagementProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          alignContent: "start",
          gap: variant === "compact" ? 10 : 16,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{interactionCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function TeamManagementHeader({ style, ...props }: ComponentProps<"div">) {
  useTeam("TeamManagementHeader");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function TeamManagementHeading({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 4, flex: "1 1 240px", minWidth: 0, ...style }} />
  );
}

export function TeamManagementTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useTeam("TeamManagementTitle");
  const compact = context.variant === "compact";
  return (
    <h2
      {...props}
      id={`${context.id}-title`}
      style={{
        margin: 0,
        fontSize: compact ? 15 : 18,
        lineHeight: compact ? "20px" : "24px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

export function TeamManagementDescription({ style, ...props }: ComponentProps<"p">) {
  return <p {...props} style={{ margin: 0, color: "var(--uai-muted)", ...style }} />;
}

export function TeamManagementActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, ...style }}
    />
  );
}

export function TeamManagementButton({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" | "danger" }) {
  const context = useTeam("TeamManagementButton");
  const compact = context.variant === "compact";
  return (
    <button
      {...props}
      type={type}
      data-uai-team-button={emphasis}
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

/** Search and bulk actions for the member list. Compose Data Table Toolbar parts inside it. */
export function TeamManagementToolbar({
  "aria-label": label = "Member controls",
  ...props
}: Omit<DataTableToolbarProps, "variant">) {
  const context = useTeam("TeamManagementToolbar");
  return (
    <DataTableToolbar {...props} aria-label={label} variant={toolbarVariants[context.variant]} />
  );
}

/** An invitation form. The consumer owns submission and validation. */
export function TeamManagementInvite({
  "aria-label": label = "Invite members",
  style,
  ...props
}: ComponentProps<"form">) {
  const context = useTeam("TeamManagementInvite");
  const compact = context.variant === "compact";
  return (
    <form
      aria-label={label}
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        gap: 8,
        minWidth: 0,
        padding: compact ? 10 : "14px 16px",
        border: 0,
        borderRadius: compact ? 12 : 14,
        background: "var(--uai-surface)",
        boxShadow: "0 0 0 1px var(--uai-border)",
        ...style,
      }}
    />
  );
}

/** A native role select. Inside a member row it is named "Role for" plus the member name. */
export function TeamManagementRoleSelect({
  style,
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
        <span id={labelId} style={srOnly}>
          Role for
        </span>
      ) : null}
      <select
        aria-labelledby={labelledBy ?? (memberId ? `${labelId} ${memberId}-name` : undefined)}
        {...props}
        data-uai-team-select=""
        style={{
          height: compact ? 26 : 30,
          padding: "0 6px 0 10px",
          border: 0,
          borderRadius: 8,
          color: "var(--uai-text)",
          font: "inherit",
          fontSize: compact ? 12 : 12.5,
          fontWeight: 500,
          cursor: props.disabled ? "not-allowed" : "pointer",
          ...style,
        }}
      />
    </>
  );
}

export function TeamManagementMembers({
  "aria-label": label = "Members",
  style,
  ...props
}: ComponentProps<"ul">) {
  const { variant } = useTeam("TeamManagementMembers");
  return (
    <ul
      aria-label={label}
      {...props}
      data-uai-team-members={variant === "cards" ? undefined : ""}
      style={
        variant === "cards"
          ? {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
              gap: 8,
              margin: 0,
              padding: 0,
              listStyle: "none",
              ...style,
            }
          : {
              display: "grid",
              margin: 0,
              padding: 0,
              listStyle: "none",
              overflow: "hidden",
              border: "1px solid var(--uai-border)",
              borderRadius: variant === "compact" ? 12 : 14,
              background: "var(--uai-surface)",
              ...style,
            }
      }
    />
  );
}

export function TeamManagementMember({ style, ...props }: ComponentProps<"li">) {
  const { variant } = useTeam("TeamManagementMember");
  const id = useId();
  return (
    <MemberContext.Provider value={id}>
      <li
        {...props}
        data-uai-team-member={variant === "cards" ? "card" : "row"}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: variant === "compact" ? 8 : 12,
          minWidth: 0,
          padding: variant === "cards" ? 14 : variant === "compact" ? "8px 10px" : "10px 14px",
          border: 0,
          borderRadius: variant === "cards" ? 14 : 0,

          ...style,
        }}
      />
    </MemberContext.Provider>
  );
}

export function TeamManagementMemberIdentity({ style, ...props }: ComponentProps<"div">) {
  useMember("TeamManagementMemberIdentity");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        alignItems: "center",
        columnGap: 10,
        flex: "1 1 220px",
        minWidth: 0,
        ...style,
      }}
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
  style,
  ...props
}: Omit<ComponentProps<"span">, "children"> & { name: string; src?: string }) {
  const { variant } = useTeam("TeamManagementMemberAvatar");
  useMember("TeamManagementMemberAvatar");
  const [failed, setFailed] = useState(false);
  const size = variant === "compact" ? 24 : 32;
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        display: "grid",
        placeItems: "center",
        gridRow: "span 2",
        width: size,
        height: size,
        overflow: "hidden",
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        boxShadow: "0 0 0 1px oklch(1 0 0 / 0.08)",
        color: "var(--uai-muted)",
        fontSize: variant === "compact" ? 10 : 11.5,
        fontWeight: 500,
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

export function TeamManagementMemberName({ style, ...props }: ComponentProps<"p">) {
  const id = useMember("TeamManagementMemberName");
  return (
    <p
      {...props}
      id={`${id}-name`}
      style={{
        margin: 0,
        fontWeight: 500,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

export function TeamManagementMemberEmail({ style, ...props }: ComponentProps<"p">) {
  useMember("TeamManagementMemberEmail");
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 12,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

const statusTones = {
  neutral: "var(--uai-muted)",
  accent: "var(--uai-accent)",
  success: "var(--uai-success)",
  warning: "var(--uai-warning)",
} as const;

/** Access or invitation status, such as "Pending invite" or "Owner". `tone` tints the badge. */
export function TeamManagementMemberStatus({
  tone = "neutral",
  style,
  ...props
}: ComponentProps<"span"> & { tone?: keyof typeof statusTones }) {
  useMember("TeamManagementMemberStatus");
  const color = statusTones[tone];
  return (
    <span
      {...props}
      data-tone={tone}
      style={{
        padding: "0 8px",
        borderRadius: 999,
        background: `color-mix(in oklab, ${color} ${tone === "neutral" ? 16 : 14}%, transparent)`,
        color:
          tone === "accent" ? "color-mix(in oklab, var(--uai-accent) 70%, var(--uai-text))" : color,
        fontSize: 11.5,
        lineHeight: "20px",
        fontWeight: 500,
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

export function TeamManagementMemberActions({ style, ...props }: ComponentProps<"div">) {
  useMember("TeamManagementMemberActions");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
        marginLeft: "auto",
        ...style,
      }}
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
  return <EmptyState {...props} variant={emptyVariants[context.variant]} />;
}
