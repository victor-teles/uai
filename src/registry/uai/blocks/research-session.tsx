"use client";

import { type ComponentProps, type CSSProperties, createContext, useContext, useId } from "react";
import { Citation, type CitationProps, type CitationVariant } from "@/components/ui/uai/citation";
import {
  ProgressSummary,
  type ProgressSummaryProps,
  type ProgressSummaryVariant,
} from "@/components/ui/uai/progress-summary";
import {
  ResponseStatus,
  type ResponseStatusProps,
  type ResponseStatusVariant,
} from "@/components/ui/uai/response-status";
import { TaskList, type TaskListProps, type TaskListVariant } from "@/components/ui/uai/task-list";
import { Thinking, type ThinkingProps } from "@/components/ui/uai/thinking";

export const RESEARCH_SESSION_VARIANTS = ["split", "stacked", "compact"] as const;
export type ResearchSessionVariant = (typeof RESEARCH_SESSION_VARIANTS)[number];
export type ResearchSessionProps = ComponentProps<"section"> & {
  variant?: ResearchSessionVariant;
};

type SessionContext = { id: string; variant: ResearchSessionVariant };
const Context = createContext<SessionContext | null>(null);
function useSession(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ResearchSession`);
  return context;
}
const PanelContext = createContext<string | null>(null);

const progressVariants: Record<ResearchSessionVariant, ProgressSummaryVariant> = {
  split: "card",
  stacked: "card",
  compact: "compact",
};
const taskVariants: Record<ResearchSessionVariant, TaskListVariant> = {
  split: "timeline",
  stacked: "card",
  compact: "compact",
};
const citationVariants: Record<ResearchSessionVariant, CitationVariant> = {
  split: "number",
  stacked: "chip",
  compact: "number",
};
const statusVariants: Record<ResearchSessionVariant, ResponseStatusVariant> = {
  split: "inline",
  stacked: "bar",
  compact: "inline",
};

const layoutCss = `
[data-uai-research-layout]{display:grid;gap:16px;align-items:start;min-width:0}
[data-uai-research="compact"]>[data-uai-research-layout]{gap:12px}
@container (min-width: 760px){
  [data-uai-research="split"]>[data-uai-research-layout]{grid-template-columns:minmax(240px,0.8fr) minmax(0,1.4fr);gap:20px}
  [data-uai-research-layout]>[data-uai-research-region="header"]{grid-column:1/-1}
}
[data-uai-research-source]{transition:background-color 120ms ease-out}
[data-uai-research-source="tile"]{background:color-mix(in oklab,var(--uai-surface-raised) 70%,var(--uai-surface))}
[data-uai-research-source]:hover{background:var(--uai-surface-raised)}
[data-uai-research-link]{text-decoration-line:none;text-decoration-color:var(--uai-border-strong);text-underline-offset:3px}
[data-uai-research-link]:hover{text-decoration-line:underline}
[data-uai-research-link]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px;border-radius:4px}
@media (prefers-reduced-motion: reduce){[data-uai-research-source]{transition:none}}`;

/** A research run: the plan, search activity, sources, and the synthesis. Split places the plan and activity beside the synthesis at 760px. */
export function ResearchSession({
  variant = "split",
  children,
  style,
  ...props
}: ResearchSessionProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-research={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-research-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function ResearchSessionHeader({ style, ...props }: ComponentProps<"header">) {
  const { variant } = useSession("ResearchSessionHeader");
  return (
    <header
      {...props}
      data-uai-research-region="header"
      style={{ display: "grid", gap: variant === "compact" ? 8 : 12, minWidth: 0, ...style }}
    />
  );
}

export function ResearchSessionTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useSession("ResearchSessionTitle");
  const compact = variant === "compact";
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: compact ? 15 : 18,
        lineHeight: compact ? "20px" : "24px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function ResearchSessionDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

/** Overall progress. Compose Progress Summary parts inside it. */
export function ResearchSessionProgress(props: Omit<ProgressSummaryProps, "variant">) {
  const { variant } = useSession("ResearchSessionProgress");
  return <ProgressSummary {...props} variant={progressVariants[variant]} />;
}

function Column({ part, style, ...props }: ComponentProps<"div"> & { part: string }) {
  const { variant } = useSession(part);
  return (
    <div
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: variant === "compact" ? 12 : 16,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** The working column: plan and search activity. */
export function ResearchSessionAside(props: ComponentProps<"div">) {
  return <Column {...props} part="ResearchSessionAside" />;
}

/** The reading column: synthesis and sources. */
export function ResearchSessionMain(props: ComponentProps<"div">) {
  return <Column {...props} part="ResearchSessionMain" />;
}

function panelStyle(variant: ResearchSessionVariant): CSSProperties {
  const compact = variant === "compact";
  return {
    display: "grid",
    alignContent: "start",
    gap: compact ? 8 : 12,
    minWidth: 0,
    padding: compact ? 12 : 16,
    border: "1px solid var(--uai-border)",
    borderRadius: compact ? 12 : 14,
    background: "var(--uai-surface)",
  };
}

function Panel({ part, style, ...props }: ComponentProps<"section"> & { part: string }) {
  const { variant } = useSession(part);
  const id = useId();
  return (
    <PanelContext.Provider value={id}>
      <section aria-labelledby={id} {...props} style={{ ...panelStyle(variant), ...style }} />
    </PanelContext.Provider>
  );
}

/** The research plan. Compose ResearchSessionTasks inside it. */
export function ResearchSessionPlan(props: ComponentProps<"section">) {
  return <Panel {...props} part="ResearchSessionPlan" />;
}

/** Search activity. Compose ResearchSessionSearches inside it. */
export function ResearchSessionActivity(props: ComponentProps<"section">) {
  return <Panel {...props} part="ResearchSessionActivity" />;
}

/** The written answer. Compose citations and ResearchSessionStatus inside it. */
export function ResearchSessionSynthesis(props: ComponentProps<"section">) {
  return <Panel {...props} part="ResearchSessionSynthesis" />;
}

/** Sources the synthesis draws from. */
export function ResearchSessionSources(props: ComponentProps<"section">) {
  return <Panel {...props} part="ResearchSessionSources" />;
}

function usePanel(part: string) {
  const id = useContext(PanelContext);
  if (!id) throw new Error(`${part} must be used within a ResearchSession panel`);
  return id;
}

export function ResearchSessionPanelTitle({ style, ...props }: ComponentProps<"h3">) {
  const id = usePanel("ResearchSessionPanelTitle");
  return (
    <h3
      {...props}
      id={id}
      style={{ margin: 0, fontSize: 13, lineHeight: "18px", fontWeight: 500, ...style }}
    />
  );
}

/** Plan steps. Compose Task List items inside it. */
export function ResearchSessionTasks(props: Omit<TaskListProps, "variant">) {
  const { variant } = useSession("ResearchSessionTasks");
  return <TaskList {...props} variant={taskVariants[variant]} />;
}

/** Searches and reads as they happen. Compose Thinking parts inside it. */
export function ResearchSessionSearches({ style, ...props }: ThinkingProps) {
  useSession("ResearchSessionSearches");
  return <Thinking {...props} style={{ minWidth: 0, ...style }} />;
}

/** Where the synthesis stands. Compose Response Status parts inside it. */
export function ResearchSessionStatus(props: Omit<ResponseStatusProps, "variant">) {
  const { variant } = useSession("ResearchSessionStatus");
  return <ResponseStatus {...props} variant={statusVariants[variant]} />;
}

export function ResearchSessionText({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useSession("ResearchSessionText");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: variant === "compact" ? 8 : 10,
        maxWidth: "68ch",
        minWidth: 0,
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

/** An inline source marker in the synthesis. Compose Citation parts inside it. */
export function ResearchSessionCitation(props: Omit<CitationProps, "variant">) {
  const { variant } = useSession("ResearchSessionCitation");
  return <Citation {...props} variant={citationVariants[variant]} />;
}

export function ResearchSessionSourceList({ style, ...props }: ComponentProps<"ol">) {
  const id = usePanel("ResearchSessionSourceList");
  const { variant } = useSession("ResearchSessionSourceList");
  return (
    <ol
      aria-labelledby={id}
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns:
          variant === "stacked"
            ? "repeat(auto-fit, minmax(min(100%, 220px), 1fr))"
            : "minmax(0, 1fr)",
        gap: variant === "compact" ? 4 : 8,
        margin: 0,
        padding: 0,
        listStyle: "none",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export type ResearchSessionSourceProps = ComponentProps<"li"> & {
  /** Source number, matching the citation markers in the synthesis. */
  index: number;
};

export function ResearchSessionSource({
  index,
  children,
  style,
  ...props
}: ResearchSessionSourceProps) {
  const { variant } = useSession("ResearchSessionSource");
  const compact = variant === "compact";
  return (
    <li
      {...props}
      data-uai-research-source={compact ? "plain" : "tile"}
      style={{
        display: "grid",
        gridTemplateColumns: "20px minmax(0, 1fr)",
        alignItems: "start",
        gap: 8,
        minWidth: 0,
        padding: compact ? "4px 2px" : "8px 10px",
        borderRadius: compact ? 8 : 10,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          placeItems: "center",
          height: 18,
          marginTop: 1,
          borderRadius: 999,
          background: compact ? "var(--uai-surface-raised)" : "var(--uai-surface)",
          color: "var(--uai-muted)",
          fontSize: 11,
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {index}
      </span>
      <span style={{ display: "grid", gap: 2, minWidth: 0 }}>{children}</span>
    </li>
  );
}

export function ResearchSessionSourceLink({ style, ...props }: ComponentProps<"a">) {
  return (
    <a
      {...props}
      data-uai-research-link=""
      style={{
        color: "var(--uai-text)",
        fontWeight: 500,

        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function ResearchSessionSourceMeta({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{ color: "var(--uai-subtle)", fontSize: 12, overflowWrap: "anywhere", ...style }}
    />
  );
}
