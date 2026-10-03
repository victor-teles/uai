"use client";

import { type ComponentProps, createContext, useContext, useId } from "react";

export const ACTIVITY_TIMELINE_VARIANTS = ["rail", "card", "compact"] as const;
export type ActivityTimelineVariant = (typeof ACTIVITY_TIMELINE_VARIANTS)[number];
const VariantContext = createContext<ActivityTimelineVariant | null>(null);
const GroupContext = createContext<string | null>(null);
function useVariant(part: string) {
  const variant = useContext(VariantContext);
  if (!variant) throw new Error(`${part} must be used within ActivityTimeline`);
  return variant;
}

const railCss = `
.uai-activity-timeline__event:last-child .uai-activity-timeline__rail{display:none}
@keyframes uai-activity-timeline-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.uai-activity-timeline__event{animation:uai-activity-timeline-in 240ms cubic-bezier(0.23,1,0.32,1) both}
.uai-activity-timeline__event:nth-child(2){animation-delay:40ms}
.uai-activity-timeline__event:nth-child(3){animation-delay:80ms}
.uai-activity-timeline__event:nth-child(4){animation-delay:120ms}
.uai-activity-timeline__event:nth-child(5){animation-delay:160ms}
.uai-activity-timeline__event:nth-child(6){animation-delay:200ms}
.uai-activity-timeline a{color:var(--uai-text);text-decoration:underline;text-decoration-color:var(--uai-border-strong);text-underline-offset:3px;transition:text-decoration-color 120ms ease-out}
.uai-activity-timeline a:hover{text-decoration-color:currentColor}
@media (prefers-reduced-motion: reduce){.uai-activity-timeline__event{animation:none}.uai-activity-timeline a{transition:none}}
`;

export function ActivityTimeline({
  variant = "rail",
  children,
  className,
  style,
  ...props
}: ComponentProps<"div"> & { variant?: ActivityTimelineVariant }) {
  return (
    <VariantContext.Provider value={variant}>
      <div
        {...props}
        className={["uai-activity-timeline", className].filter(Boolean).join(" ")}
        data-variant={variant}
        style={{
          display: "grid",
          gap: variant === "compact" ? 14 : 20,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{railCss}</style>
        {children}
      </div>
    </VariantContext.Provider>
  );
}

export function ActivityTimelineGroup({ style, ...props }: ComponentProps<"section">) {
  const variant = useVariant("ActivityTimelineGroup");
  const id = useId();
  return (
    <GroupContext.Provider value={id}>
      <section
        aria-labelledby={id}
        {...props}
        style={{
          display: "grid",
          gap: variant === "compact" ? 6 : 12,
          minWidth: 0,
          padding: variant === "card" ? 16 : 0,
          border: variant === "card" ? "1px solid var(--uai-border)" : 0,
          borderRadius: 14,
          background: variant === "card" ? "var(--uai-surface)" : "transparent",
          ...style,
        }}
      />
    </GroupContext.Provider>
  );
}

export function ActivityTimelineDate({ style, ...props }: ComponentProps<"h3">) {
  const id = useContext(GroupContext);
  if (!id) throw new Error("ActivityTimelineDate must be used within ActivityTimelineGroup");
  return (
    <h3
      {...props}
      id={id}
      style={{
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        lineHeight: "16px",
        fontWeight: 500,
        ...style,
      }}
    />
  );
}

export function ActivityTimelineEvents({ style, ...props }: ComponentProps<"ol">) {
  return (
    <ol
      {...props}
      style={{ display: "grid", gap: 0, margin: 0, padding: 0, listStyle: "none", ...style }}
    />
  );
}

export function ActivityTimelineEvent({ className, style, ...props }: ComponentProps<"li">) {
  const variant = useVariant("ActivityTimelineEvent");
  return (
    <li
      {...props}
      className={["uai-activity-timeline__event", className].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: variant === "compact" ? "16px minmax(0, 1fr)" : "28px minmax(0, 1fr)",
        columnGap: variant === "compact" ? 8 : 12,
        paddingBottom: variant === "compact" ? 8 : 14,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function ActivityTimelineMarker({ children, style, ...props }: ComponentProps<"span">) {
  const variant = useVariant("ActivityTimelineMarker");
  const size = variant === "compact" ? 16 : 28;
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        position: "relative",
        display: "grid",
        justifyItems: "center",
        alignSelf: "stretch",
        ...style,
      }}
    >
      <span
        className="uai-activity-timeline__rail"
        style={{
          position: "absolute",
          top: size,
          bottom: variant === "compact" ? -8 : -14,
          left: "50%",
          width: 1,
          transform: "translateX(-0.5px)",
          background: "var(--uai-border)",
        }}
      />
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: size,
          height: size,
          borderRadius: 999,
          background: children ? "var(--uai-surface-raised)" : "transparent",
          boxShadow: children
            ? "0 0 0 1px color-mix(in oklab, var(--uai-text) 6%, transparent)"
            : undefined,
          color: "var(--uai-muted)",
        }}
      >
        {children ?? (
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: "var(--uai-border-strong)",
              boxShadow: "0 0 0 3px var(--uai-surface-raised)",
            }}
          />
        )}
      </span>
    </span>
  );
}

export function ActivityTimelineContent({ style, ...props }: ComponentProps<"div">) {
  const variant = useVariant("ActivityTimelineContent");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: variant === "compact" ? 2 : 3,
        minWidth: 0,
        paddingTop: variant === "compact" ? 0 : 5,
        ...style,
      }}
    />
  );
}

export function ActivityTimelineTitle({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        overflowWrap: "anywhere",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

export function ActivityTimelineActor({ style, ...props }: ComponentProps<"strong">) {
  return <strong {...props} style={{ color: "var(--uai-text)", fontWeight: 500, ...style }} />;
}

export function ActivityTimelineTime({ style, ...props }: ComponentProps<"time">) {
  return (
    <time
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        lineHeight: "16px",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function ActivityTimelineMeta({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        lineHeight: "16px",
        ...style,
      }}
    />
  );
}
