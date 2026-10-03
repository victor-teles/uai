"use client";

import { Mail, MailOpen } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useState } from "react";
import {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateVariant,
} from "@/components/ui/uai/empty-state";
import { PageTabs, type PageTabsProps, type PageTabsVariant } from "@/components/ui/uai/page-tabs";

export const NOTIFICATION_CENTER_VARIANTS = ["panel", "page", "compact"] as const;
export type NotificationCenterVariant = (typeof NOTIFICATION_CENTER_VARIANTS)[number];
export type NotificationCenterProps = ComponentProps<"section"> & {
  variant?: NotificationCenterVariant;
};

type CenterContext = { id: string; variant: NotificationCenterVariant };
const Context = createContext<CenterContext | null>(null);
function useCenter(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within NotificationCenter`);
  return context;
}
const GroupContext = createContext<string | null>(null);
type ItemContextValue = { id: string; read: boolean; setRead: (read: boolean) => void };
const ItemContext = createContext<ItemContextValue | null>(null);
function useItem(part: string) {
  const context = useContext(ItemContext);
  if (!context) throw new Error(`${part} must be used within NotificationCenterItem`);
  return context;
}

const tabVariants: Record<NotificationCenterVariant, PageTabsVariant> = {
  panel: "underline",
  page: "pill",
  compact: "segmented",
};
const emptyVariants: Record<NotificationCenterVariant, EmptyStateVariant> = {
  panel: "plain",
  page: "plain",
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
[data-uai-notification-action],[data-uai-notification-toggle],[data-uai-notification-item]{transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-notification-action],[data-uai-notification-toggle]{background:transparent;color:var(--uai-muted)}
[data-uai-notification-action]:disabled{color:var(--uai-subtle)}
[data-uai-notification-action]:hover:not(:disabled),[data-uai-notification-toggle]:hover{background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-notification-action]:active:not(:disabled),[data-uai-notification-toggle]:active{transform:scale(0.97)}
[data-uai-notification-action]:focus-visible,[data-uai-notification-toggle]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:1px}
[data-uai-notification-item]{background:transparent}
[data-uai-notification-item]:not([data-read]){background:color-mix(in oklab,var(--uai-surface-raised) 70%,transparent)}
[data-uai-notification-item]:hover{background:var(--uai-surface-raised)}
[data-uai-notification-item] [data-uai-notification-toggle]{opacity:0.7}
[data-uai-notification-item]:hover [data-uai-notification-toggle],[data-uai-notification-toggle]:focus-visible{opacity:1}
@keyframes uai-notification-enter{from{opacity:0;transform:translateY(4px)}}
[data-uai-notification-item]{animation:uai-notification-enter 240ms cubic-bezier(0.23,1,0.32,1) both}
[data-uai-notification-item]:nth-child(2){animation-delay:40ms}
[data-uai-notification-item]:nth-child(3){animation-delay:80ms}
[data-uai-notification-item]:nth-child(n+4){animation-delay:120ms}
@media (hover: none){[data-uai-notification-item] [data-uai-notification-toggle]{opacity:1}}
@media (prefers-reduced-motion: reduce){[data-uai-notification-action],[data-uai-notification-toggle],[data-uai-notification-item]{transition:none;animation:none}[data-uai-notification-action]:active:not(:disabled),[data-uai-notification-toggle]:active{transform:none}}`;

export function NotificationCenter({
  variant = "panel",
  children,
  style,
  ...props
}: NotificationCenterProps) {
  const id = useId();
  const chrome = variant !== "page";
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          alignContent: "start",
          gap: variant === "compact" ? 8 : 14,
          minWidth: 0,
          padding: variant === "compact" ? 10 : chrome ? "16px 12px 12px" : 0,
          border: chrome ? "1px solid var(--uai-border)" : 0,
          borderRadius: variant === "compact" ? 12 : 14,
          background: chrome ? "var(--uai-surface)" : "transparent",
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

export function NotificationCenterHeader({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useCenter("NotificationCenterHeader");
  return (
    <div
      {...props}
      style={{
        padding: variant === "panel" ? "0 4px" : undefined,
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

export function NotificationCenterTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useCenter("NotificationCenterTitle");
  const page = context.variant === "page";
  return (
    <h2
      {...props}
      id={`${context.id}-title`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: 0,
        fontSize: page ? 18 : 15,
        lineHeight: page ? "24px" : "20px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

/** Unread total beside the title. Write the full phrase, such as "4 unread". */
export function NotificationCenterCount({ style, ...props }: ComponentProps<"span">) {
  useCenter("NotificationCenterCount");
  return (
    <span
      {...props}
      style={{
        padding: "0 8px",
        borderRadius: 999,
        background: "color-mix(in oklab, var(--uai-accent) 14%, transparent)",
        color: "color-mix(in oklab, var(--uai-accent) 70%, var(--uai-text))",
        fontSize: 11.5,
        lineHeight: "20px",
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: 0,
        ...style,
      }}
    />
  );
}

export function NotificationCenterActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, ...style }}
    />
  );
}

/** A bulk action such as "Mark all as read". */
export function NotificationCenterAction({
  type = "button",
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useCenter("NotificationCenterAction");
  return (
    <button
      {...props}
      type={type}
      data-uai-notification-action=""
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: context.variant === "compact" ? 26 : 28,
        padding: "0 10px",
        border: 0,
        borderRadius: 999,
        font: "inherit",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.55 : 1,
        ...style,
      }}
    />
  );
}

/** Filters such as All, Unread, and Mentions. Compose Page Tabs parts inside it. */
export function NotificationCenterTabs(props: Omit<PageTabsProps, "variant">) {
  const context = useCenter("NotificationCenterTabs");
  return <PageTabs {...props} variant={tabVariants[context.variant]} />;
}

/** Notifications that share a date, such as Today or Yesterday. */
export function NotificationCenterGroup({ style, ...props }: ComponentProps<"section">) {
  const context = useCenter("NotificationCenterGroup");
  const id = useId();
  return (
    <GroupContext.Provider value={id}>
      <section
        aria-labelledby={id}
        {...props}
        style={{
          display: "grid",
          gap: context.variant === "compact" ? 4 : 6,
          minWidth: 0,
          ...style,
        }}
      />
    </GroupContext.Provider>
  );
}

export function NotificationCenterGroupDate({ style, ...props }: ComponentProps<"h3">) {
  const id = useContext(GroupContext);
  if (!id)
    throw new Error("NotificationCenterGroupDate must be used within NotificationCenterGroup");
  return (
    <h3
      {...props}
      id={id}
      style={{
        margin: 0,
        padding: "4px 4px 2px",
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        lineHeight: "16px",
        fontWeight: 500,
        ...style,
      }}
    />
  );
}

export function NotificationCenterList({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{ display: "grid", gap: 2, margin: 0, padding: 0, listStyle: "none", ...style }}
    />
  );
}

export type NotificationCenterItemProps = ComponentProps<"li"> & {
  read?: boolean;
  defaultRead?: boolean;
  onReadChange?: (read: boolean) => void;
};

export function NotificationCenterItem({
  read,
  defaultRead = false,
  onReadChange,
  children,
  style,
  ...props
}: NotificationCenterItemProps) {
  const { variant } = useCenter("NotificationCenterItem");
  const id = useId();
  const [internal, setInternal] = useState(defaultRead);
  const current = read ?? internal;
  const setRead = (next: boolean) => {
    if (next === current) return;
    if (read === undefined) setInternal(next);
    onReadChange?.(next);
  };
  const compact = variant === "compact";
  return (
    <ItemContext.Provider value={{ id, read: current, setRead }}>
      <li
        {...props}
        data-read={current || undefined}
        data-uai-notification-item=""
        style={{
          display: "grid",
          gridTemplateColumns: "8px minmax(0, 1fr) auto",
          alignItems: "start",
          columnGap: compact ? 8 : 10,
          minWidth: 0,
          padding: compact ? "6px 8px" : "10px 10px 10px 12px",
          borderRadius: compact ? 8 : 10,
          ...style,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            marginTop: 6,
            marginLeft: 1,
            borderRadius: 999,
            background: current ? "transparent" : "var(--uai-accent)",
            transition: "background-color 120ms ease-out",
          }}
        />
        {children}
      </li>
    </ItemContext.Provider>
  );
}

export function NotificationCenterItemContent({ style, ...props }: ComponentProps<"div">) {
  useItem("NotificationCenterItemContent");
  return <div {...props} style={{ display: "grid", gap: 2, minWidth: 0, ...style }} />;
}

/** The notification headline. Unread items announce "Unread" before it. */
export function NotificationCenterItemTitle({ children, style, ...props }: ComponentProps<"p">) {
  const item = useItem("NotificationCenterItemTitle");
  return (
    <p
      {...props}
      id={`${item.id}-title`}
      style={{
        margin: 0,
        color: item.read ? "var(--uai-muted)" : "var(--uai-text)",
        fontWeight: 500,
        overflowWrap: "anywhere",
        ...style,
      }}
    >
      {item.read ? null : <span style={srOnly}>Unread: </span>}
      {children}
    </p>
  );
}

export function NotificationCenterItemDescription({ style, ...props }: ComponentProps<"p">) {
  useItem("NotificationCenterItemDescription");
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 12.5,
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function NotificationCenterItemTime({ style, ...props }: ComponentProps<"time">) {
  useItem("NotificationCenterItemTime");
  return (
    <time
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        lineHeight: "18px",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

export function NotificationCenterItemActions({ style, ...props }: ComponentProps<"div">) {
  useItem("NotificationCenterItemActions");
  return <div {...props} style={{ display: "flex", alignItems: "center", gap: 2, ...style }} />;
}

/** Toggles the item between read and unread. */
export function NotificationCenterItemToggle({
  onClick,
  style,
  ...props
}: Omit<ComponentProps<"button">, "children">) {
  const { variant } = useCenter("NotificationCenterItemToggle");
  const item = useItem("NotificationCenterItemToggle");
  const Icon = item.read ? Mail : MailOpen;
  const size = variant === "compact" ? 24 : 28;
  return (
    <button
      type="button"
      aria-label={item.read ? "Mark as unread" : "Mark as read"}
      aria-describedby={`${item.id}-title`}
      title={item.read ? "Mark as unread" : "Mark as read"}
      {...props}
      data-uai-notification-toggle=""
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) item.setRead(!item.read);
      }}
      style={{
        display: "grid",
        placeItems: "center",
        width: size,
        height: size,
        padding: 0,
        border: 0,
        borderRadius: 8,
        cursor: "pointer",
        ...style,
      }}
    >
      <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

/** Shown when a filter has no notifications. Compose Empty State parts inside it. */
export function NotificationCenterEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = useCenter("NotificationCenterEmpty");
  return <EmptyState {...props} variant={emptyVariants[context.variant]} />;
}
