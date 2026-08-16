"use client";

import { Check, MessageSquare, Sparkles, Workflow } from "lucide-react";
import type { ComponentProps } from "react";

import { ApprovalCard, type ApprovalDecision } from "@/components/ui/uai/approval-card";
import { PromptComposer } from "@/components/ui/uai/prompt-composer";
import { type Task, TaskList } from "@/components/ui/uai/task-list";
import { Thinking, type ThinkingActivity, type ThinkingStatus } from "@/components/ui/uai/thinking";
import { cn } from "@/lib/uai-utils";

export type TaskFlowData = {
  thinking: {
    status?: ThinkingStatus;
    summary: string;
    duration?: string;
    activities?: readonly ThinkingActivity[];
    /** @deprecated Prefer `activities` for typed, user-visible evidence. */
    steps?: readonly string[];
  };
  approval: {
    title: string;
    description?: string;
  };
  tasks: readonly Task[];
  composer?: {
    placeholder?: string;
    modelLabel?: string;
  };
};

export type TaskFlowProps = ComponentProps<"section"> & {
  data: TaskFlowData;
  onDecision?: (decision: ApprovalDecision) => void;
  onPromptSubmit?: (prompt: string) => void | Promise<void>;
};

const stages = [
  { label: "Thinking", icon: Sparkles },
  { label: "Approval", icon: Check },
  { label: "Tasks", icon: Workflow },
  { label: "Prompt", icon: MessageSquare },
] as const;

export function TaskFlow({ data, onDecision, onPromptSubmit, className, ...props }: TaskFlowProps) {
  const content = [
    <Thinking
      key="thinking"
      status={data.thinking.status}
      summary={data.thinking.summary}
      duration={data.thinking.duration}
      activities={data.thinking.activities}
      steps={data.thinking.steps}
    />,
    <ApprovalCard
      key="approval"
      title={data.approval.title}
      description={data.approval.description}
      onApprove={onDecision ? () => onDecision("approved") : undefined}
      onReject={onDecision ? () => onDecision("rejected") : undefined}
    />,
    <TaskList key="tasks" tasks={data.tasks} />,
    <PromptComposer
      key="prompt"
      placeholder={data.composer?.placeholder}
      modelLabel={data.composer?.modelLabel}
      onSubmit={onPromptSubmit}
    />,
  ];

  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--uai-border)] bg-[var(--uai-canvas)] p-3 text-[var(--uai-text)] sm:p-4",
        className,
      )}
      aria-label="Task flow"
      {...props}
    >
      <ol className="relative space-y-3 before:absolute before:bottom-8 before:left-[17px] before:top-8 before:w-px before:bg-[var(--uai-accent)] before:opacity-60 sm:before:left-[120px]">
        {stages.map((stage, index) => {
          const Icon = stage.icon;

          return (
            <li
              key={stage.label}
              className="relative grid gap-2 sm:grid-cols-[104px_minmax(0,1fr)] sm:gap-5"
            >
              <div className="relative z-10 flex items-center gap-2 bg-[var(--uai-canvas)] py-1 text-[0.66rem] font-medium uppercase tracking-[0.08em] text-[var(--uai-muted)] sm:justify-end sm:text-right">
                <span
                  data-active={index === 0 ? "true" : undefined}
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--uai-border)] bg-[var(--uai-surface)] sm:order-2",
                    index === 0 && "border-[var(--uai-accent)] text-[var(--uai-accent)]",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <span>{stage.label}</span>
              </div>
              <div className="min-w-0">{content[index]}</div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
