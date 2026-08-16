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
import {
  Children,
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";

import { cn } from "@/lib/uai-utils";

export const THINKING_STATUSES = ["thinking", "complete", "error"] as const;

export type ThinkingStatus = (typeof THINKING_STATUSES)[number];

export type ThinkingProps = ComponentProps<"section"> & {
  status?: ThinkingStatus;
  defaultOpen?: boolean;
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

type ThinkingContextValue = {
  status: ThinkingStatus;
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
};

const ThinkingContext = createContext<ThinkingContextValue | null>(null);

function useThinking(name: string) {
  const context = useContext(ThinkingContext);
  if (!context) throw new Error(`${name} must be used within Thinking`);
  return context;
}

export function Thinking({
  status = "thinking",
  defaultOpen = true,
  className,
  children,
  ...props
}: ThinkingProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <ThinkingContext.Provider value={{ status, open, setOpen, contentId }}>
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
        {children}
      </section>
    </ThinkingContext.Provider>
  );
}

export type ThinkingTriggerProps = Omit<ComponentProps<"button">, "title"> & {
  title?: ReactNode;
  summary?: ReactNode;
  duration?: ReactNode;
};

export function ThinkingTrigger({
  title,
  summary,
  duration,
  className,
  onClick,
  ...props
}: ThinkingTriggerProps) {
  const context = useThinking("ThinkingTrigger");
  const copy = statusDetails[context.status];
  const StatusIcon = copy.icon;

  return (
    <button
      {...props}
      type="button"
      className={cn(
        "flex min-h-[66px] w-full items-center gap-3 px-3.5 text-left outline-none transition-colors duration-150 hover:bg-[var(--uai-surface-raised)] focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)] focus-visible:ring-inset",
        className,
      )}
      aria-controls={context.contentId}
      aria-expanded={context.open}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(!context.open);
      }}
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--uai-border)] bg-[var(--uai-surface-raised)]">
        <StatusIcon
          className={cn(
            "size-3.5",
            context.status === "thinking" &&
              "text-[var(--uai-text)] motion-safe:animate-spin motion-reduce:animate-none",
            context.status === "complete" && "text-[var(--uai-success)]",
            context.status === "error" && "text-[var(--uai-danger)]",
          )}
          aria-hidden="true"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[13px] leading-[18px] font-medium">
            {title ?? copy.title}
          </span>
          <span
            className={cn(
              "shrink-0 text-[0.66rem] leading-4 font-medium uppercase tracking-[0.055em] text-[var(--uai-muted)]",
              context.status === "complete" && "text-[var(--uai-success)]",
              context.status === "error" && "text-[var(--uai-danger)]",
            )}
          >
            {copy.label}
          </span>
        </span>
        <span
          className="block truncate text-xs leading-[18px] text-[var(--uai-muted)]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {summary ?? copy.summary}
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
          context.open && "rotate-180",
        )}
        aria-hidden="true"
      />
    </button>
  );
}

function getEmptyLabel(status: ThinkingStatus) {
  if (status === "thinking") return "Waiting for the first activity…";
  if (status === "error") return "No activity details are available.";
  return "No activity was recorded.";
}

export type ThinkingContentProps = ComponentProps<"div"> & {
  emptyLabel?: ReactNode;
};

export function ThinkingContent({
  emptyLabel,
  children,
  className,
  ...props
}: ThinkingContentProps) {
  const context = useThinking("ThinkingContent");
  if (!context.open) return null;

  const hasActivity = Children.count(children) > 0;

  return (
    <div
      {...props}
      id={context.contentId}
      className={cn("border-t border-[var(--uai-border)] px-3.5 py-1.5", className)}
    >
      {hasActivity ? (
        <div role="log" aria-live="polite" aria-relevant="additions text">
          <ol>{children}</ol>
        </div>
      ) : (
        <p className="py-3 text-[13px] leading-[18px] text-[var(--uai-muted)]">
          {emptyLabel ?? getEmptyLabel(context.status)}
        </p>
      )}
    </div>
  );
}

type ThinkingActivityBaseProps = Omit<ComponentProps<"li">, "children"> & {
  children: ReactNode;
  elapsed?: ReactNode;
};

export type ThinkingActivityProps = ThinkingActivityBaseProps &
  (
    | { type: "progress"; tool?: never; path?: never; query?: never }
    | { type: "tool"; tool: ReactNode; path?: never; query?: never }
    | { type: "file"; path: ReactNode; tool?: never; query?: never }
    | { type: "search"; query: ReactNode; tool?: never; path?: never }
  );

const activityDetails: Record<ThinkingActivityProps["type"], { label: string; icon: LucideIcon }> =
  {
    progress: { label: "Update", icon: Circle },
    tool: { label: "Tool", icon: Wrench },
    file: { label: "File", icon: FileText },
    search: { label: "Search", icon: Search },
  };

export function ThinkingActivity(props: ThinkingActivityProps) {
  const { type, children, elapsed, className, ...itemProps } = props;
  const details = activityDetails[type];
  const ActivityIcon = details.icon;
  const evidence =
    type === "tool"
      ? props.tool
      : type === "file"
        ? props.path
        : type === "search"
          ? props.query
          : null;
  const { tool: _tool, path: _path, query: _query, ...domProps } = itemProps;

  return (
    <li
      className={cn(
        "group grid min-w-0 grid-cols-[24px_minmax(0,1fr)_auto] gap-x-2.5 py-2.5",
        className,
      )}
      {...domProps}
    >
      <span className="relative grid size-6 place-items-center text-[var(--uai-muted)] after:absolute after:top-6 after:bottom-[-10px] after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-[var(--uai-border)] group-last:after:hidden">
        <ActivityIcon className="size-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 text-[0.66rem] leading-4 font-medium uppercase tracking-[0.055em] text-[var(--uai-muted)]">
            {details.label}
          </span>
          <span className="min-w-0 text-[13px] leading-[18px] text-[var(--uai-text)]">
            {children}
          </span>
        </span>
        {evidence ? (
          <span className="mt-0.5 block break-all font-mono text-[0.72rem] leading-4 text-[var(--uai-muted)]">
            {evidence}
          </span>
        ) : null}
      </span>
      {elapsed ? (
        <span className="pl-2 font-mono text-[0.72rem] leading-4 tabular-nums text-[var(--uai-muted)]">
          {elapsed}
        </span>
      ) : null}
    </li>
  );
}
