"use client";

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
type EventContext = { id: string; open: boolean; setOpen: (open: boolean) => void };
const EventCtx = createContext<EventContext | null>(null);
function useEvent(part: string) {
  const context = useContext(EventCtx);
  if (!context) throw new Error(`${part} must be used within AuditLogEvent`);
  return context;
}

export function AuditLog({ variant = "card", style, children, ...props }: AuditLogProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          gap: variant === "compact" ? 8 : 12,
          minWidth: 0,
          padding: variant === "card" ? "14px 12px 8px" : 0,
          border: variant === "card" ? "1px solid var(--uai-border)" : 0,
          borderRadius: 14,
          background: variant === "card" ? "var(--uai-surface)" : "transparent",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function AuditLogHeader({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        paddingInline: 4,
        ...style,
      }}
    />
  );
}

export function AuditLogTitle({ style, ...props }: ComponentProps<"h3">) {
  const context = useLog("AuditLogTitle");
  return (
    <h3
      {...props}
      id={`${context.id}-title`}
      style={{
        margin: 0,
        fontSize: 14,
        lineHeight: "20px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

export function AuditLogFilters({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, ...style }}
    />
  );
}

export function AuditLogList({ style, ...props }: ComponentProps<"ol">) {
  const context = useLog("AuditLogList");
  return (
    <ol
      {...props}
      style={{
        display: "grid",
        gap: context.variant === "card" ? 0 : context.variant === "compact" ? 2 : 0,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
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
  style,
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
        {...props}
        data-state={current ? "open" : "closed"}
        className={[
          log.variant === "card"
            ? "border-b border-[var(--uai-border)] last:border-b-0"
            : timeline
              ? "border-l-[var(--uai-border)] last:border-l-transparent"
              : undefined,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          position: "relative",
          display: "grid",
          gap: log.variant === "compact" ? 4 : 6,
          minWidth: 0,
          padding: timeline ? "0 0 10px 16px" : log.variant === "compact" ? 0 : "4px 0",
          borderLeftWidth: timeline ? 1 : undefined,
          borderLeftStyle: timeline ? "solid" : undefined,
          marginLeft: timeline ? 4 : 0,
          ...style,
        }}
      >
        {timeline ? (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -4,
              top: 11,
              width: 7,
              height: 7,
              borderRadius: 999,
              background: current ? "var(--uai-text)" : "var(--uai-border-strong)",
              boxShadow: "0 0 0 3px var(--uai-canvas)",
              transition: "background-color 120ms ease-out",
            }}
          />
        ) : null}
        {children}
      </li>
    </EventCtx.Provider>
  );
}

export function AuditLogEventSummary({
  style,
  className,
  children,
  onClick,
  ...props
}: ComponentProps<"button">) {
  const log = useLog("AuditLogEventSummary");
  const event = useEvent("AuditLogEventSummary");
  return (
    <button
      {...props}
      type="button"
      aria-expanded={event.open}
      aria-controls={`${event.id}-details`}
      onClick={(clickEvent) => {
        onClick?.(clickEvent);
        if (!clickEvent.defaultPrevented) event.setOpen(!event.open);
      }}
      className={[
        event.open ? undefined : "bg-transparent",
        "[transition:background-color_120ms_ease-out] hover:bg-[color-mix(in_oklab,var(--uai-surface-raised)_70%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--uai-accent)] motion-reduce:transition-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        display: "flex",
        alignItems: "baseline",
        flexWrap: "wrap",
        columnGap: 6,
        rowGap: 2,
        width: "100%",
        minHeight: log.variant === "compact" ? 26 : 32,
        padding: log.variant === "compact" ? "4px 6px" : "7px 8px",
        border: 0,
        borderRadius: log.variant === "compact" ? 7 : 8,
        background: event.open ? "var(--uai-surface-raised)" : undefined,
        color: "inherit",
        font: "inherit",
        fontSize: log.variant === "compact" ? 12.5 : 13,
        textAlign: "left",
        cursor: "pointer",
        ...style,
      }}
    >
      <ChevronRight
        size={14}
        strokeWidth={1.75}
        aria-hidden="true"
        style={{
          flexShrink: 0,
          alignSelf: "center",
          color: "var(--uai-subtle)",
          transform: event.open ? "rotate(90deg)" : "none",
          transition: `transform 180ms ${easeOut}`,
        }}
      />
      {children}
    </button>
  );
}

export function AuditLogActor({ style, ...props }: ComponentProps<"span">) {
  return <span {...props} style={{ fontWeight: 500, ...style }} />;
}

export function AuditLogAction({ style, ...props }: ComponentProps<"span">) {
  return <span {...props} style={{ color: "var(--uai-muted)", ...style }} />;
}

export function AuditLogResource({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        padding: "1px 6px",
        borderRadius: 6,
        background: "color-mix(in oklab, var(--uai-text) 7%, transparent)",
        color: "var(--uai-text)",
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        fontSize: 11.5,
        lineHeight: "16px",
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function AuditLogTimestamp({ style, ...props }: ComponentProps<"time">) {
  return (
    <time
      {...props}
      style={{
        marginLeft: "auto",
        paddingLeft: 8,
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

export function AuditLogEventDetails({ style, ...props }: ComponentProps<"dl">) {
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
  return (
    <dl
      {...props}
      ref={ref}
      id={`${event.id}-details`}
      hidden={!event.open}
      style={{
        display: event.open ? "grid" : "none",
        gridTemplateColumns: "minmax(88px, max-content) minmax(0, 1fr)",
        columnGap: 16,
        rowGap: 6,
        margin: log.variant === "compact" ? "0 0 4px 26px" : "0 0 8px 28px",
        padding: log.variant === "compact" ? "8px 10px" : "10px 12px",
        borderRadius: log.variant === "compact" ? 8 : 10,
        background: "var(--uai-canvas)",
        boxShadow: "inset 0 0 0 1px var(--uai-border)",
        fontSize: 12,
        lineHeight: "16px",
        ...style,
      }}
    />
  );
}

export function AuditLogDetailLabel({ style, ...props }: ComponentProps<"dt">) {
  return <dt {...props} style={{ color: "var(--uai-subtle)", ...style }} />;
}

export function AuditLogDetailValue({ style, ...props }: ComponentProps<"dd">) {
  return (
    <dd
      {...props}
      style={{
        margin: 0,
        minWidth: 0,
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function AuditLogEmpty({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      role="status"
      {...props}
      style={{
        margin: 0,
        padding: "24px 12px",
        border: "1px dashed var(--uai-border)",
        borderRadius: 10,
        color: "var(--uai-subtle)",
        fontSize: 12.5,
        textAlign: "center",
        ...style,
      }}
    />
  );
}
