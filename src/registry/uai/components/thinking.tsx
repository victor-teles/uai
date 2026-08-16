"use client";

import {
  AlertTriangle,
  Check,
  ChevronDown,
  Circle,
  FileText,
  LoaderCircle,
  type LucideIcon,
  Search,
  Wrench,
} from "lucide-react";
import { type ComponentProps, useId, useState } from "react";

import { cn } from "@/lib/uai-utils";

export const THINKING_STATUSES = ["thinking", "complete", "error"] as const;

export type ThinkingStatus = (typeof THINKING_STATUSES)[number];

type ThinkingActivityBase = {
  id: string;
  label: string;
  elapsed?: string;
};

export type ThinkingActivity =
  | (ThinkingActivityBase & { type: "progress" })
  | (ThinkingActivityBase & { type: "tool"; tool: string })
  | (ThinkingActivityBase & { type: "file"; path: string })
  | (ThinkingActivityBase & { type: "search"; query: string });

export type ThinkingProps = Omit<ComponentProps<"section">, "title"> & {
  status?: ThinkingStatus;
  title?: string;
  summary?: string;
  duration?: string;
  activities?: readonly ThinkingActivity[];
  /** @deprecated Prefer `activities` for typed, user-visible evidence. */
  steps?: readonly string[];
  defaultOpen?: boolean;
  emptyLabel?: string;
};

const statusDetails: Record<
  ThinkingStatus,
  { title: string; summary: string; label: string; icon: LucideIcon }
> = {
  thinking: {
    title: "Thinking",
    summary: "Working through the request.",
    label: "Working",
    icon: LoaderCircle,
  },
  complete: {
    title: "Work complete",
    summary: "The response is ready.",
    label: "Complete",
    icon: Check,
  },
  error: {
    title: "Work stopped",
    summary: "Something interrupted this run.",
    label: "Error",
    icon: AlertTriangle,
  },
};

const activityDetails: Record<ThinkingActivity["type"], { label: string; icon: LucideIcon }> = {
  progress: { label: "Update", icon: Circle },
  tool: { label: "Tool", icon: Wrench },
  file: { label: "File", icon: FileText },
  search: { label: "Search", icon: Search },
};

function getEvidence(activity: ThinkingActivity) {
  if (activity.type === "tool") return activity.tool;
  if (activity.type === "file") return activity.path;
  if (activity.type === "search") return activity.query;
  return null;
}

function getEmptyLabel(status: ThinkingStatus) {
  if (status === "thinking") return "Waiting for the first activity…";
  if (status === "error") return "No activity details are available.";
  return "No activity was recorded.";
}

export function Thinking({
  status = "thinking",
  title,
  summary,
  duration,
  activities,
  steps = [],
  defaultOpen = true,
  emptyLabel,
  className,
  ...props
}: ThinkingProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  const statusCopy = statusDetails[status];
  const StatusIcon = statusCopy.icon;
  const resolvedActivities: readonly ThinkingActivity[] =
    activities ??
    steps.map<ThinkingActivity>((step, index) => ({
      id: `step-${index}`,
      type: "progress" as const,
      label: step,
    }));

  return (
    <section
      {...props}
      className={cn(
        "overflow-hidden rounded-[14px] border border-[var(--uai-border)] bg-[var(--uai-surface)] text-[var(--uai-text)] transition-colors duration-150",
        status === "error" && "border-[var(--uai-danger)]",
        className,
      )}
      data-status={status}
      aria-busy={status === "thinking"}
    >
      <button
        type="button"
        className="flex min-h-[66px] w-full items-center gap-3 px-3.5 text-left outline-none transition-colors duration-150 hover:bg-[var(--uai-surface-raised)] focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)] focus-visible:ring-inset"
        aria-controls={contentId}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--uai-border)] bg-[var(--uai-surface-raised)]">
          <StatusIcon
            className={cn(
              "size-3.5",
              status === "thinking" &&
                "text-[var(--uai-text)] motion-safe:animate-spin motion-reduce:animate-none",
              status === "complete" && "text-[var(--uai-success)]",
              status === "error" && "text-[var(--uai-danger)]",
            )}
            aria-hidden="true"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[13px] leading-[18px] font-medium">
              {title ?? statusCopy.title}
            </span>
            <span
              className={cn(
                "shrink-0 text-[0.66rem] leading-4 font-medium uppercase tracking-[0.055em] text-[var(--uai-muted)]",
                status === "complete" && "text-[var(--uai-success)]",
                status === "error" && "text-[var(--uai-danger)]",
              )}
            >
              {statusCopy.label}
            </span>
          </span>
          <span
            className="block truncate text-xs leading-[18px] text-[var(--uai-muted)]"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {summary ?? statusCopy.summary}
          </span>
        </span>
        {duration ? (
          <span className="shrink-0 font-mono text-[0.72rem] leading-4 tabular-nums text-[var(--uai-muted)]">
            {duration}
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[var(--uai-muted)] transition-transform duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div id={contentId} className="border-t border-[var(--uai-border)] px-3.5 py-1.5">
          {resolvedActivities.length > 0 ? (
            <div role="log" aria-live="polite" aria-relevant="additions text">
              <ol>
                {resolvedActivities.map((activity) => {
                  const activityCopy = activityDetails[activity.type];
                  const ActivityIcon = activityCopy.icon;
                  const evidence = getEvidence(activity);

                  return (
                    <li
                      key={activity.id}
                      className="group grid min-w-0 grid-cols-[24px_minmax(0,1fr)_auto] gap-x-2.5 py-2.5"
                    >
                      <span className="relative grid size-6 place-items-center text-[var(--uai-muted)] after:absolute after:top-6 after:bottom-[-10px] after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-[var(--uai-border)] group-last:after:hidden">
                        <ActivityIcon className="size-3.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-baseline gap-2">
                          <span className="shrink-0 text-[0.66rem] leading-4 font-medium uppercase tracking-[0.055em] text-[var(--uai-muted)]">
                            {activityCopy.label}
                          </span>
                          <span className="min-w-0 text-[13px] leading-[18px] text-[var(--uai-text)]">
                            {activity.label}
                          </span>
                        </span>
                        {evidence ? (
                          <span className="mt-0.5 block break-all font-mono text-[0.72rem] leading-4 text-[var(--uai-muted)]">
                            {evidence}
                          </span>
                        ) : null}
                      </span>
                      {activity.elapsed ? (
                        <span className="pl-2 font-mono text-[0.72rem] leading-4 tabular-nums text-[var(--uai-muted)]">
                          {activity.elapsed}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <p className="py-3 text-[13px] leading-[18px] text-[var(--uai-muted)]">
              {emptyLabel ?? getEmptyLabel(status)}
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
