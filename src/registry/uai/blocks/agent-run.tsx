"use client";

import { cva } from "class-variance-authority";
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
import { cn } from "@/lib/uai-utils";

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

const agentRunLayoutVariants = cva("grid min-w-0 items-start", {
  variants: {
    variant: {
      split:
        "gap-4 @min-[760px]:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.9fr)] @min-[760px]:gap-5",
      stacked: "gap-4",
      compact: "gap-3",
    },
  },
});

/** An agent run: activity, tasks, approvals, and the final summary. Split moves tasks and approvals beside the activity at 760px. */
export function AgentRun({ variant = "split", className, children, ...props }: AgentRunProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        data-slot="agent-run"
        aria-labelledby={`${id}-title`}
        className={cn(
          "@container box-border min-w-0 text-[13px]/[18px] text-foreground",
          className,
        )}
        {...props}
        data-variant={variant}
      >
        <div className={agentRunLayoutVariants({ variant })}>{children}</div>
      </section>
    </Context.Provider>
  );
}

export function AgentRunHeader({ className, ...props }: ComponentProps<"header">) {
  const { variant } = useRun("AgentRunHeader");
  return (
    <header
      data-slot="agent-run-header"
      className={cn(
        "grid min-w-0 @min-[760px]:col-span-full",
        variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function AgentRunHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="agent-run-heading" className={cn("grid min-w-0 gap-1", className)} {...props} />
  );
}

export function AgentRunTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useRun("AgentRunTitle");
  return (
    <h2
      data-slot="agent-run-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em] wrap-anywhere",
        variant === "compact" ? "text-[15px]/5" : "text-[18px]/6",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function AgentRunDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="agent-run-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Where the run stands, with Stop and Retry. Compose Response Status parts inside it. */
export function AgentRunStatus(props: Omit<ResponseStatusProps, "variant">) {
  const { variant } = useRun("AgentRunStatus");
  return <ResponseStatus {...props} variant={statusVariants[variant]} />;
}

function Column({
  part,
  slot,
  className,
  ...props
}: ComponentProps<"div"> & { part: string; slot: string }) {
  const { variant } = useRun(part);
  return (
    <div
      data-slot={slot}
      className={cn(
        "grid min-w-0 content-start",
        variant === "compact" ? "gap-3" : "gap-4",
        className,
      )}
      {...props}
    />
  );
}

/** The primary column: activity and the final summary. */
export function AgentRunMain(props: ComponentProps<"div">) {
  return <Column {...props} part="AgentRunMain" slot="agent-run-main" />;
}

/** The secondary column: tasks and approvals. */
export function AgentRunAside(props: ComponentProps<"div">) {
  return <Column {...props} part="AgentRunAside" slot="agent-run-aside" />;
}

function Panel({
  part,
  slot,
  className,
  ...props
}: ComponentProps<"section"> & { part: string; slot: string }) {
  const { variant } = useRun(part);
  const id = useId();
  return (
    <PanelContext.Provider value={id}>
      <section
        data-slot={slot}
        aria-labelledby={id}
        className={cn(
          "grid min-w-0 content-start",
          variant === "compact" ? "gap-2" : "gap-3",
          className,
        )}
        {...props}
      />
    </PanelContext.Provider>
  );
}

/** What the agent is doing. Compose AgentRunLog inside it. */
export function AgentRunActivity(props: ComponentProps<"section">) {
  return <Panel {...props} part="AgentRunActivity" slot="agent-run-activity" />;
}

/** The task plan. Compose AgentRunTaskList inside it. */
export function AgentRunTasks(props: ComponentProps<"section">) {
  return <Panel {...props} part="AgentRunTasks" slot="agent-run-tasks" />;
}

/** Decisions the agent is waiting on. Compose AgentRunApproval inside it. */
export function AgentRunApprovals(props: ComponentProps<"section">) {
  return <Panel {...props} part="AgentRunApprovals" slot="agent-run-approvals" />;
}

export function AgentRunSectionTitle({ className, ...props }: ComponentProps<"h3">) {
  const id = useContext(PanelContext);
  if (!id) throw new Error("AgentRunSectionTitle must be used within an AgentRun section");
  return (
    <h3
      data-slot="agent-run-section-title"
      className={cn("m-0 text-[12px]/4 font-medium text-subtle-foreground", className)}
      {...props}
      id={id}
    />
  );
}

/** A `role="log"` list of thinking and tool steps. New steps are announced politely. */
export function AgentRunLog({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useRun("AgentRunLog");
  const id = useContext(PanelContext);
  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-labelledby={id ?? undefined}
      data-slot="agent-run-log"
      className={cn(
        "grid min-w-0 content-start",
        variant === "compact" ? "gap-1.5" : "gap-2",
        className,
      )}
      {...props}
    />
  );
}

/** Model reasoning and progress. Compose Thinking parts inside it. */
export function AgentRunThinking({ className, ...props }: ThinkingProps) {
  useRun("AgentRunThinking");
  return <Thinking {...props} className={cn("min-w-0", className)} />;
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
