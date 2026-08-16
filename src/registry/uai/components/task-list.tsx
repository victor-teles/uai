import { Check, ChevronRight, Circle, LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/uai-utils";

export type TaskStatus = "complete" | "active" | "pending";

export type Task = {
  id: string;
  label: string;
  status: TaskStatus;
  detail?: string;
};

export type TaskListProps = ComponentProps<"ol"> & {
  tasks: readonly Task[];
};

const statusCopy: Record<TaskStatus, string> = {
  complete: "Complete",
  active: "In progress",
  pending: "Pending",
};

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === "complete") {
    return <Check className="size-4 text-[var(--uai-success)]" aria-hidden="true" />;
  }

  if (status === "active") {
    return (
      <LoaderCircle
        className="size-4 text-[var(--uai-accent)] motion-safe:animate-spin"
        aria-hidden="true"
      />
    );
  }

  return <Circle className="size-4 text-[var(--uai-muted)]" aria-hidden="true" />;
}

export function TaskList({ tasks, className, ...props }: TaskListProps) {
  return (
    <ol
      className={cn(
        "divide-y divide-[var(--uai-border)] overflow-hidden rounded-xl border border-[var(--uai-border)] bg-[var(--uai-surface)] text-[var(--uai-text)]",
        className,
      )}
      {...props}
    >
      {tasks.map((task) => (
        <li key={task.id} className="flex min-h-14 items-center gap-3 px-4">
          <StatusIcon status={task.status} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{task.label}</span>
            {task.detail ? (
              <span className="block truncate text-xs text-[var(--uai-muted)]">{task.detail}</span>
            ) : null}
          </span>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px]",
              task.status === "complete" &&
                "border-[color-mix(in_oklab,var(--uai-success)_35%,transparent)] text-[var(--uai-success)]",
              task.status === "active" &&
                "border-[color-mix(in_oklab,var(--uai-accent)_35%,transparent)] text-[var(--uai-accent)]",
              task.status === "pending" && "border-[var(--uai-border)] text-[var(--uai-muted)]",
            )}
          >
            {statusCopy[task.status]}
          </span>
          <ChevronRight className="size-4 text-[var(--uai-muted)]" aria-hidden="true" />
        </li>
      ))}
    </ol>
  );
}
