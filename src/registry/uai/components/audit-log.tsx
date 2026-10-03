"use client";

import { cva } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/uai-utils";

export const AUDIT_LOG_VARIANTS = ["card", "timeline", "compact"] as const;
export type AuditLogVariant = (typeof AUDIT_LOG_VARIANTS)[number];
export type AuditLogProps = ComponentProps<"section"> & { variant?: AuditLogVariant };

type LogContext = { id: string; variant: AuditLogVariant };
const Context = createContext<LogContext | null>(null);
function useLog(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within AuditLog`);
  return context;
}
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";
const auditLogVariants = cva("grid min-w-0 rounded-[14px] text-[13px]/[18px] text-foreground", {
  variants: {
    variant: {
      card: "gap-3 border bg-card px-3 pt-3.5 pb-2 text-card-foreground",
      timeline: "gap-3 border-0 bg-transparent p-0",
      compact: "gap-2 border-0 bg-transparent p-0",
    },
  },
});
type EventContext = { id: string; open: boolean; setOpen: (open: boolean) => void };
const EventCtx = createContext<EventContext | null>(null);
function useEvent(part: string) {
  const context = useContext(EventCtx);
  if (!context) throw new Error(`${part} must be used within AuditLogEvent`);
  return context;
}

export function AuditLog({ variant = "card", className, children, ...props }: AuditLogProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="audit-log"
        className={cn(auditLogVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function AuditLogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="audit-log-header"
      className={cn("flex flex-wrap items-center justify-between gap-3 px-1", className)}
      {...props}
    />
  );
}

export function AuditLogTitle({ className, ...props }: ComponentProps<"h3">) {
  const context = useLog("AuditLogTitle");
  return (
    <h3
      data-slot="audit-log-title"
      className={cn("m-0 text-sm/5 font-semibold tracking-[-0.01em]", className)}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function AuditLogFilters({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="audit-log-filters"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

export function AuditLogList({ className, ...props }: ComponentProps<"ol">) {
  const context = useLog("AuditLogList");
  return (
    <ol
      data-slot="audit-log-list"
      className={cn(
        "m-0 grid list-none p-0",
        context.variant === "compact" ? "gap-0.5" : "gap-0",
        className,
      )}
      {...props}
    />
  );
}

export type AuditLogEventProps = ComponentProps<"li"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AuditLogEvent({
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}: AuditLogEventProps) {
  const log = useLog("AuditLogEvent");
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const current = open ?? internal;
  const setOpen = (next: boolean) => {
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };
  const timeline = log.variant === "timeline";
  return (
    <EventCtx.Provider value={{ id, open: current, setOpen }}>
      <li
        data-slot="audit-log-event"
        className={cn(
          "relative grid min-w-0",
          log.variant === "compact" ? "gap-1" : "gap-1.5",
          log.variant === "card" && "ml-0 border-b py-1 last:border-b-0",
          timeline && "ml-1 border-l pt-0 pr-0 pb-2.5 pl-4 last:border-l-transparent",
          log.variant === "compact" && "ml-0 p-0",
          className,
        )}
        {...props}
        data-state={current ? "open" : "closed"}
      >
        {timeline ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-2.75 -left-1 size-1.75 rounded-full shadow-[0_0_0_3px_var(--background)] transition-colors duration-120 ease-[ease-out]",
              current ? "bg-foreground" : "bg-border-strong",
            )}
          />
        ) : null}
        {children}
      </li>
    </EventCtx.Provider>
  );
}

export function AuditLogEventSummary({
  className,
  children,
  onClick,
  ...props
}: ComponentProps<"button">) {
  const log = useLog("AuditLogEventSummary");
  const event = useEvent("AuditLogEventSummary");
  const compact = log.variant === "compact";
  return (
    <button
      data-slot="audit-log-event-summary"
      className={cn(
        "flex w-full cursor-pointer flex-wrap items-baseline gap-x-1.5 gap-y-0.5 border-0 text-left text-inherit [transition:background-color_120ms_ease-out] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
        event.open ? "bg-accent" : "bg-transparent hover:bg-accent/70",
        compact
          ? "min-h-6.5 rounded-[7px] px-1.5 py-1 text-[12.5px]"
          : "min-h-8 rounded-lg px-2 py-1.75 text-[13px]",
        className,
      )}
      {...props}
      type="button"
      aria-expanded={event.open}
      aria-controls={`${event.id}-details`}
      onClick={(clickEvent) => {
        onClick?.(clickEvent);
        if (!clickEvent.defaultPrevented) event.setOpen(!event.open);
      }}
    >
      <ChevronRight
        size={14}
        strokeWidth={1.75}
        aria-hidden="true"
        className={cn(
          "shrink-0 self-center text-subtle-foreground transition-[rotate] duration-180 ease-out-quint",
          event.open && "rotate-90",
        )}
      />
      {children}
    </button>
  );
}

export function AuditLogActor({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="audit-log-actor" className={cn("font-medium", className)} {...props} />;
}

export function AuditLogAction({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="audit-log-action"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export function AuditLogResource({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="audit-log-resource"
      className={cn(
        "rounded-md bg-foreground/7 px-1.5 py-px font-mono text-[11.5px]/4 text-foreground wrap-anywhere",
        className,
      )}
      {...props}
    />
  );
}

export function AuditLogTimestamp({ className, ...props }: ComponentProps<"time">) {
  return (
    <time
      data-slot="audit-log-timestamp"
      className={cn(
        "ml-auto pl-2 text-[12px] whitespace-nowrap text-subtle-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export function AuditLogEventDetails({ className, ...props }: ComponentProps<"dl">) {
  const log = useLog("AuditLogEventDetails");
  const event = useEvent("AuditLogEventDetails");
  const ref = useRef<HTMLDListElement>(null);
  const wasOpen = useRef(event.open);
  // Fade the details in under the summary when the event expands.
  useIsomorphicLayoutEffect(() => {
    const opened = event.open && !wasOpen.current;
    wasOpen.current = event.open;
    const details = ref.current;
    if (!opened || !details || typeof details.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    details.animate(
      [
        { opacity: 0, transform: "translateY(-4px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 220, easing: easeOut },
    );
  }, [event.open]);
  const compact = log.variant === "compact";
  return (
    <dl
      data-slot="audit-log-event-details"
      className={cn(
        "grid-cols-[minmax(88px,max-content)_minmax(0,1fr)] gap-x-4 gap-y-1.5 bg-background text-xs/4 shadow-[inset_0_0_0_1px_var(--border)]",
        event.open ? "grid" : "hidden",
        compact
          ? "mt-0 mr-0 mb-1 ml-6.5 rounded-lg px-2.5 py-2"
          : "mt-0 mr-0 mb-2 ml-7 rounded-[10px] px-3 py-2.5",
        className,
      )}
      {...props}
      ref={ref}
      id={`${event.id}-details`}
      hidden={!event.open}
    />
  );
}

export function AuditLogDetailLabel({ className, ...props }: ComponentProps<"dt">) {
  return (
    <dt
      data-slot="audit-log-detail-label"
      className={cn("text-subtle-foreground", className)}
      {...props}
    />
  );
}

export function AuditLogDetailValue({ className, ...props }: ComponentProps<"dd">) {
  return (
    <dd
      data-slot="audit-log-detail-value"
      className={cn("m-0 min-w-0 font-medium tabular-nums wrap-anywhere", className)}
      {...props}
    />
  );
}

export function AuditLogEmpty({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      role="status"
      data-slot="audit-log-empty"
      className={cn(
        "m-0 rounded-[10px] border border-dashed px-3 py-6 text-center text-[12.5px] text-subtle-foreground",
        className,
      )}
      {...props}
    />
  );
}
