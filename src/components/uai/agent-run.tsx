"use client";

import { type ComponentProps, createContext, useContext, useId } from "react";
import {
  ApprovalCard,
  type ApprovalCardProps,
  type ApprovalCardVariant,
} from "@/components/ui/uai/approval-card";
import {
  ResponseStatus,
  type ResponseStatusProps,
  type ResponseStatusVariant,
} from "@/components/ui/uai/response-status";
import {
  RunSummary,
  type RunSummaryProps,
  type RunSummaryVariant,
} from "@/components/ui/uai/run-summary";
import { TaskList, type TaskListProps, type TaskListVariant } from "@/components/ui/uai/task-list";
import { Thinking, type ThinkingProps } from "@/components/ui/uai/thinking";
import { ToolCall, type ToolCallProps, type ToolCallVariant } from "@/components/ui/uai/tool-call";

export const AGENT_RUN_VARIANTS = ["split", "stacked", "compact"] as const;
export type AgentRunVariant = (typeof AGENT_RUN_VARIANTS)[number];
export type AgentRunProps = ComponentProps<"section"> & { variant?: AgentRunVariant };

type RunContext = { id: string; variant: AgentRunVariant };
const Context = createContext<RunContext | null>(null);
function useRun(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within AgentRun`);
  return context;
}
const PanelContext = createContext<string | null>(null);

const statusVariants: Record<AgentRunVariant, ResponseStatusVariant> = {
  split: "bar",
  stacked: "bar",
  compact: "pill",
};
const toolVariants: Record<AgentRunVariant, ToolCallVariant> = {
  split: "card",
  stacked: "card",
  compact: "compact",
};
const taskVariants: Record<AgentRunVariant, TaskListVariant> = {
  split: "timeline",
  stacked: "card",
  compact: "compact",
};
const approvalVariants: Record<AgentRunVariant, ApprovalCardVariant> = {
  split: "detailed",
  stacked: "detailed",
  compact: "compact",
};
const summaryVariants: Record<AgentRunVariant, RunSummaryVariant> = {
  split: "card",
  stacked: "card",
  compact: "compact",
};

const layoutCss = `
[data-uai-run-layout]{display:grid;gap:16px;align-items:start;min-width:0}
[data-uai-run="compact"]>[data-uai-run-layout]{gap:12px}
@container (min-width: 760px){
  [data-uai-run="split"]>[data-uai-run-layout]{grid-template-columns:minmax(0,1.4fr) minmax(240px,0.9fr);gap:20px}
  [data-uai-run-layout]>[data-uai-run-region="header"]{grid-column:1/-1}
}`;

/** An agent run: activity, tasks, approvals, and the final summary. Split moves tasks and approvals beside the activity at 760px. */
export function AgentRun({ variant = "split", children, style, ...props }: AgentRunProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-run={variant}
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
        <div data-uai-run-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function AgentRunHeader({ style, ...props }: ComponentProps<"header">) {
  const { variant } = useRun("AgentRunHeader");
  return (
    <header
      {...props}
      data-uai-run-region="header"
      style={{ display: "grid", gap: variant === "compact" ? 8 : 12, minWidth: 0, ...style }}
    />
  );
}

export function AgentRunHeading({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "grid", gap: 4, minWidth: 0, ...style }} />;
}

export function AgentRunTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useRun("AgentRunTitle");
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

export function AgentRunDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

/** Where the run stands, with Stop and Retry. Compose Response Status parts inside it. */
export function AgentRunStatus(props: Omit<ResponseStatusProps, "variant">) {
  const { variant } = useRun("AgentRunStatus");
  return <ResponseStatus {...props} variant={statusVariants[variant]} />;
}

function Column({ part, style, ...props }: ComponentProps<"div"> & { part: string }) {
  const { variant } = useRun(part);
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

/** The primary column: activity and the final summary. */
export function AgentRunMain(props: ComponentProps<"div">) {
  return <Column {...props} part="AgentRunMain" />;
}

/** The secondary column: tasks and approvals. */
export function AgentRunAside(props: ComponentProps<"div">) {
  return <Column {...props} part="AgentRunAside" />;
}

function Panel({ part, style, ...props }: ComponentProps<"section"> & { part: string }) {
  const { variant } = useRun(part);
  const id = useId();
  const compact = variant === "compact";
  return (
    <PanelContext.Provider value={id}>
      <section
        aria-labelledby={id}
        {...props}
        style={{
          display: "grid",
          alignContent: "start",
          gap: compact ? 8 : 12,
          minWidth: 0,
          ...style,
        }}
      />
    </PanelContext.Provider>
  );
}

/** What the agent is doing. Compose AgentRunLog inside it. */
export function AgentRunActivity(props: ComponentProps<"section">) {
  return <Panel {...props} part="AgentRunActivity" />;
}

/** The task plan. Compose AgentRunTaskList inside it. */
export function AgentRunTasks(props: ComponentProps<"section">) {
  return <Panel {...props} part="AgentRunTasks" />;
}

/** Decisions the agent is waiting on. Compose AgentRunApproval inside it. */
export function AgentRunApprovals(props: ComponentProps<"section">) {
  return <Panel {...props} part="AgentRunApprovals" />;
}

export function AgentRunSectionTitle({ style, ...props }: ComponentProps<"h3">) {
  const id = useContext(PanelContext);
  if (!id) throw new Error("AgentRunSectionTitle must be used within an AgentRun section");
  return (
    <h3
      {...props}
      id={id}
      style={{
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        lineHeight: "16px",
        fontWeight: 500,
        ...style,
      }}
    />
  );
}

/** A `role="log"` list of thinking and tool steps. New steps are announced politely. */
export function AgentRunLog({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useRun("AgentRunLog");
  const id = useContext(PanelContext);
  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-labelledby={id ?? undefined}
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: variant === "compact" ? 6 : 8,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** Model reasoning and progress. Compose Thinking parts inside it. */
export function AgentRunThinking({ style, ...props }: ThinkingProps) {
  useRun("AgentRunThinking");
  return <Thinking {...props} style={{ minWidth: 0, ...style }} />;
}

/** One tool call. Compose Tool Call parts inside it. */
export function AgentRunToolCall(props: Omit<ToolCallProps, "variant">) {
  const { variant } = useRun("AgentRunToolCall");
  return <ToolCall {...props} variant={toolVariants[variant]} />;
}

/** Task progress. Compose Task List items inside it. */
export function AgentRunTaskList(props: Omit<TaskListProps, "variant">) {
  const { variant } = useRun("AgentRunTaskList");
  return <TaskList {...props} variant={taskVariants[variant]} />;
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type AgentRunApprovalProps = DistributiveOmit<ApprovalCardProps, "variant">;

/** A decision the run is blocked on. Compose Approval Card parts inside it. */
export function AgentRunApproval(props: AgentRunApprovalProps) {
  const { variant } = useRun("AgentRunApproval");
  return <ApprovalCard {...(props as ApprovalCardProps)} variant={approvalVariants[variant]} />;
}

/** The final report. Compose Run Summary parts inside it. */
export function AgentRunSummary(props: Omit<RunSummaryProps, "variant">) {
  const { variant } = useRun("AgentRunSummary");
  return <RunSummary {...props} variant={summaryVariants[variant]} />;
}
