"use client";

import { cva } from "class-variance-authority";
import { Mail, MailOpen } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateVariant,
} from "@/components/ui/uai/empty-state";
import { PageTabs, type PageTabsProps, type PageTabsVariant } from "@/components/ui/uai/page-tabs";
import { cn } from "@/lib/uai-utils";

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
const buttonInteraction =
  "transition-[background-color,color,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] bg-transparent text-muted-foreground focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none";

const notificationCenterVariants = cva(
  "grid min-w-0 content-start text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        panel: "gap-3.5 rounded-[14px] border bg-card px-3 pt-4 pb-3",
        page: "gap-3.5 rounded-[14px] border-0 bg-transparent p-0",
        compact: "gap-2 rounded-xl border bg-card p-2.5",
      },
    },
  },
);

export function NotificationCenter({
  variant = "panel",
  className,
  children,
  ...props
}: NotificationCenterProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="notification-center"
        data-variant={variant}
        className={cn(notificationCenterVariants({ variant }), className)}
        {...props}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function NotificationCenterHeader({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useCenter("NotificationCenterHeader");
  return (
    <div
      data-slot="notification-center-header"
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-between gap-2",
        variant === "panel" && "px-1",
        className,
      )}
      {...props}
    />
  );
}

export function NotificationCenterTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useCenter("NotificationCenterTitle");
  return (
    <h2
      data-slot="notification-center-title"
      className={cn(
        "m-0 flex items-center gap-2 font-semibold tracking-[-0.01em]",
        context.variant === "page" ? "text-lg/6" : "text-[15px]/5",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

/** Unread total beside the title. Write the full phrase, such as "4 unread". */
export function NotificationCenterCount({ className, ...props }: ComponentProps<"span">) {
  useCenter("NotificationCenterCount");
  return (
    <span
      data-slot="notification-center-count"
      className={cn(
        "rounded-full bg-primary/14 px-2 text-[11.5px]/5 font-medium tracking-normal text-[color-mix(in_oklab,var(--primary)_70%,var(--foreground))] tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export function NotificationCenterActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="notification-center-actions"
      className={cn("flex flex-wrap items-center gap-1", className)}
      {...props}
    />
  );
}

/** A bulk action such as "Mark all as read". */
export function NotificationCenterAction({
  type = "button",
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useCenter("NotificationCenterAction");
  return (
    <Button
      data-slot="notification-center-action"
      variant="ghost"
      className={cn(
        "cursor-pointer justify-start gap-1.5 rounded-full border-0 px-2.5 py-0 text-[12.5px] has-[>svg]:px-2.5",
        buttonInteraction,
        "hover:bg-accent hover:text-foreground active:enabled:scale-[0.97] motion-reduce:active:enabled:scale-100 dark:hover:bg-accent",
        "disabled:cursor-not-allowed disabled:text-subtle-foreground disabled:opacity-55",
        context.variant === "compact" ? "h-6.5" : "h-7",
        className,
      )}
      {...props}
      type={type}
    />
  );
}

/** Filters such as All, Unread, and Mentions. Compose Page Tabs parts inside it. */
export function NotificationCenterTabs(props: Omit<PageTabsProps, "variant">) {
  const context = useCenter("NotificationCenterTabs");
  return <PageTabs {...props} variant={tabVariants[context.variant]} />;
}

/** Notifications that share a date, such as Today or Yesterday. */
export function NotificationCenterGroup({ className, ...props }: ComponentProps<"section">) {
  const context = useCenter("NotificationCenterGroup");
  const id = useId();
  return (
    <GroupContext.Provider value={id}>
      <section
        aria-labelledby={id}
        data-slot="notification-center-group"
        className={cn(
          "grid min-w-0",
          context.variant === "compact" ? "gap-1" : "gap-1.5",
          className,
        )}
        {...props}
      />
    </GroupContext.Provider>
  );
}

export function NotificationCenterGroupDate({ className, ...props }: ComponentProps<"h3">) {
  const id = useContext(GroupContext);
  if (!id)
    throw new Error("NotificationCenterGroupDate must be used within NotificationCenterGroup");
  return (
    <h3
      data-slot="notification-center-group-date"
      className={cn(
        "m-0 px-1 pt-1 pb-0.5 text-[11.5px]/4 font-medium text-subtle-foreground",
        className,
      )}
      {...props}
      id={id}
    />
  );
}

export function NotificationCenterList({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="notification-center-list"
      className={cn("m-0 grid list-none gap-0.5 p-0", className)}
      {...props}
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
  className,
  children,
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
        data-slot="notification-center-item"
        className={cn(
          "group/notification-item grid min-w-0 grid-cols-[8px_minmax(0,1fr)_auto] items-start",
          "transition-[background-color,color] duration-120 ease-[ease-out] hover:bg-accent",
          "animate-[enter_240ms_cubic-bezier(0.23,1,0.32,1)_both] fade-in-0 slide-in-from-bottom-1 nth-2:[animation-delay:40ms] nth-3:[animation-delay:80ms] nth-[n+4]:[animation-delay:120ms]",
          "motion-reduce:animate-none motion-reduce:transition-none",
          current ? "bg-transparent" : "bg-accent/70",
          compact
            ? "gap-x-2 rounded-lg px-2 py-1.5"
            : "gap-x-2.5 rounded-[10px] py-2.5 pr-2.5 pl-3",
          className,
        )}
        {...props}
        data-read={current || undefined}
      >
        <span
          aria-hidden="true"
          className={cn(
            "mt-1.5 ml-px size-1.5 rounded-full transition-[background-color] duration-120 ease-[ease-out]",
            current ? "bg-transparent" : "bg-primary",
          )}
        />
        {children}
      </li>
    </ItemContext.Provider>
  );
}

export function NotificationCenterItemContent({ className, ...props }: ComponentProps<"div">) {
  useItem("NotificationCenterItemContent");
  return (
    <div
      data-slot="notification-center-item-content"
      className={cn("grid min-w-0 gap-0.5", className)}
      {...props}
    />
  );
}

/** The notification headline. Unread items announce "Unread" before it. */
export function NotificationCenterItemTitle({
  children,
  className,
  ...props
}: ComponentProps<"p">) {
  const item = useItem("NotificationCenterItemTitle");
  return (
    <p
      data-slot="notification-center-item-title"
      className={cn(
        "m-0 font-medium wrap-anywhere",
        item.read ? "text-muted-foreground" : "text-foreground",
        className,
      )}
      {...props}
      id={`${item.id}-title`}
    >
      {item.read ? null : <span className="sr-only">Unread: </span>}
      {children}
    </p>
  );
}

export function NotificationCenterItemDescription({ className, ...props }: ComponentProps<"p">) {
  useItem("NotificationCenterItemDescription");
  return (
    <p
      data-slot="notification-center-item-description"
      className={cn("m-0 text-[12.5px] text-muted-foreground wrap-anywhere", className)}
      {...props}
    />
  );
}

export function NotificationCenterItemTime({ className, ...props }: ComponentProps<"time">) {
  useItem("NotificationCenterItemTime");
  return (
    <time
      data-slot="notification-center-item-time"
      className={cn(
        "text-[11.5px]/[18px] whitespace-nowrap text-subtle-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export function NotificationCenterItemActions({ className, ...props }: ComponentProps<"div">) {
  useItem("NotificationCenterItemActions");
  return (
    <div
      data-slot="notification-center-item-actions"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

/** Toggles the item between read and unread. */
export function NotificationCenterItemToggle({
  onClick,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children">) {
  const { variant } = useCenter("NotificationCenterItemToggle");
  const item = useItem("NotificationCenterItemToggle");
  const Icon = item.read ? Mail : MailOpen;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={item.read ? "Mark as unread" : "Mark as read"}
      aria-describedby={`${item.id}-title`}
      title={item.read ? "Mark as unread" : "Mark as read"}
      data-slot="notification-center-item-toggle"
      className={cn(
        "grid cursor-pointer place-items-center rounded-lg border-0 p-0",
        buttonInteraction,
        "hover:bg-accent hover:text-foreground active:scale-[0.97] motion-reduce:active:scale-100 dark:hover:bg-accent",
        "opacity-70 group-hover/notification-item:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100",
        variant === "compact" ? "size-6" : "size-7",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) item.setRead(!item.read);
      }}
    >
      <Icon size={15} strokeWidth={1.75} aria-hidden="true" className="size-[15px]" />
    </Button>
  );
}

/** Shown when a filter has no notifications. Compose Empty State parts inside it. */
export function NotificationCenterEmpty(props: Omit<EmptyStateProps, "variant">) {
  const context = useCenter("NotificationCenterEmpty");
  return <EmptyState {...props} variant={emptyVariants[context.variant]} />;
}
