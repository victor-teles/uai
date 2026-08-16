import { Check, ChevronRight, Circle, LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/uai-utils";

export type TaskStatus = "complete" | "active" | "pending";

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

export type TaskListProps = ComponentProps<"ol">;

export function TaskList({ className, children, ...props }: TaskListProps) {
  return (
    <ol
      className={cn(
        "divide-y divide-[var(--uai-border)] overflow-hidden rounded-xl border border-[var(--uai-border)] bg-[var(--uai-surface)] text-[var(--uai-text)]",
        className,
      )}
      {...props}
    >
      {children}
    </ol>
  );
}

export type TaskListItemProps = ComponentProps<"li"> & { status: TaskStatus };

export function TaskListItem({ status, className, children, ...props }: TaskListItemProps) {
  return (
    <li className={cn("flex min-h-14 items-center gap-3 px-4", className)} {...props}>
      <StatusIcon status={status} />
      <span className="min-w-0 flex-1">{children}</span>
      <span
        className={cn(
          "rounded-full border px-2 py-0.5 text-[11px]",
          status === "complete" &&
            "border-[color-mix(in_oklab,var(--uai-success)_35%,transparent)] text-[var(--uai-success)]",
          status === "active" &&
            "border-[color-mix(in_oklab,var(--uai-accent)_35%,transparent)] text-[var(--uai-accent)]",
          status === "pending" && "border-[var(--uai-border)] text-[var(--uai-muted)]",
        )}
      >
        {statusCopy[status]}
      </span>
      <ChevronRight className="size-4 text-[var(--uai-muted)]" aria-hidden="true" />
    </li>
  );
}

export type TaskListTitleProps = ComponentProps<"span"> & { children: ReactNode };

export function TaskListTitle({ className, children, ...props }: TaskListTitleProps) {
  return (
    <span className={cn("block truncate text-sm font-medium", className)} {...props}>
      {children}
    </span>
  );
}

export type TaskListDescriptionProps = ComponentProps<"span"> & { children: ReactNode };

export function TaskListDescription({ className, children, ...props }: TaskListDescriptionProps) {
  return (
    <span className={cn("block truncate text-xs text-[var(--uai-muted)]", className)} {...props}>
      {children}
    </span>
  );
}
