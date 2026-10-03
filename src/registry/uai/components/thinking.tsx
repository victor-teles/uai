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

const thinkingCss = `
@keyframes uai-thinking-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
@keyframes uai-thinking-reveal{from{opacity:0;transform:translateY(-4px)}}
@keyframes uai-thinking-enter{from{opacity:0;transform:translateY(4px)}}
[data-uai-thinking] [data-shimmer]{background-image:linear-gradient(90deg,var(--uai-subtle) 0%,var(--uai-subtle) 35%,var(--uai-text) 50%,var(--uai-subtle) 65%,var(--uai-subtle) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:uai-thinking-shimmer 2s linear infinite}
[data-uai-thinking] [data-reveal]{animation:uai-thinking-reveal 240ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-thinking] [role="log"] li{animation:uai-thinking-enter 240ms cubic-bezier(0.23,1,0.32,1) backwards}
[data-uai-thinking] [role="log"] li:nth-child(2){animation-delay:40ms}
[data-uai-thinking] [role="log"] li:nth-child(3){animation-delay:80ms}
[data-uai-thinking] [role="log"] li:nth-child(4){animation-delay:120ms}
[data-uai-thinking] [role="log"] li:nth-child(5){animation-delay:160ms}
[data-uai-thinking] [role="log"] li:nth-child(6){animation-delay:200ms}
@media (prefers-reduced-motion:reduce){[data-uai-thinking] [data-shimmer]{animation:none;background:none;color:var(--uai-text)}[data-uai-thinking] [data-reveal],[data-uai-thinking] [role="log"] li{animation:none}}
`;

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
          "overflow-hidden rounded-[14px] border border-[var(--uai-border)] bg-[var(--uai-surface)] text-[var(--uai-text)] transition-colors duration-150 motion-reduce:transition-none",
          status === "error" &&
            "border-[color-mix(in_oklab,var(--uai-danger)_40%,var(--uai-border))]",
          className,
        )}
        data-status={status}
        data-uai-thinking=""
        aria-busy={status === "thinking"}
      >
        <style>{thinkingCss}</style>
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
        "group/trigger flex w-full items-center gap-3 px-3.5 py-3 text-left outline-none transition-colors duration-[120ms] ease-out hover:bg-[color-mix(in_oklab,var(--uai-surface-raised)_60%,transparent)] focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)] focus-visible:ring-inset motion-reduce:transition-none",
        className,
      )}
      aria-controls={context.contentId}
      aria-expanded={context.open}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(!context.open);
      }}
    >
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--uai-surface-raised)]",
          context.status === "complete" &&
            "bg-[color-mix(in_oklab,var(--uai-success)_14%,transparent)]",
          context.status === "error" &&
            "bg-[color-mix(in_oklab,var(--uai-danger)_14%,transparent)]",
        )}
      >
        <StatusIcon
          strokeWidth={2}
          className={cn(
            "size-3.5",
            context.status === "thinking" &&
              "text-[var(--uai-muted)] motion-safe:animate-spin motion-reduce:animate-none",
            context.status === "complete" && "text-[var(--uai-success)]",
            context.status === "error" && "text-[var(--uai-danger)]",
          )}
          aria-hidden="true"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className="truncate text-[13px] leading-[18px] font-medium"
            data-shimmer={context.status === "thinking" ? "" : undefined}
          >
            {title ?? copy.title}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-px text-[11.5px] leading-4 font-medium",
              context.status === "thinking" &&
                "bg-[var(--uai-surface-raised)] text-[var(--uai-muted)]",
              context.status === "complete" &&
                "bg-[color-mix(in_oklab,var(--uai-success)_14%,transparent)] text-[var(--uai-success)]",
              context.status === "error" &&
                "bg-[color-mix(in_oklab,var(--uai-danger)_14%,transparent)] text-[var(--uai-danger)]",
            )}
          >
            {copy.label}
          </span>
        </span>
        <span
          className="mt-0.5 block truncate text-[12.5px] leading-[18px] text-[var(--uai-muted)]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {summary ?? copy.summary}
        </span>
      </span>
      {duration ? (
        <span className="shrink-0 font-mono text-[11.5px] leading-4 tabular-nums text-[var(--uai-subtle)]">
          {duration}
        </span>
      ) : null}
      <ChevronDown
        className={cn(
          "size-4 shrink-0 text-[var(--uai-subtle)] transition-[transform,color] duration-180 group-hover/trigger:text-[var(--uai-muted)] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
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
      data-reveal=""
      className={cn("border-t border-[var(--uai-border)] px-3.5 pt-1 pb-1.5", className)}
    >
      {hasActivity ? (
        <div role="log" aria-live="polite" aria-relevant="additions text">
          <ol>{children}</ol>
        </div>
      ) : (
        <p className="py-3 text-[13px] leading-[18px] text-[var(--uai-subtle)]">
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
      <span className="relative grid size-6 place-items-center text-[var(--uai-subtle)] after:absolute after:top-6 after:bottom-[-10px] after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-[var(--uai-border)] group-last:after:hidden">
        <ActivityIcon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="flex min-w-0 items-baseline gap-2 pt-[3px]">
          <span className="min-w-0 text-[13px] leading-[18px] font-medium text-[var(--uai-text)]">
            {children}
          </span>
          <span className="shrink-0 text-[11.5px] leading-4 text-[var(--uai-subtle)]">
            {details.label}
          </span>
        </span>
        {evidence ? (
          <span className="mt-1.5 inline-block max-w-full rounded-md bg-[var(--uai-surface-raised)] px-1.5 py-0.5 font-mono text-[11.5px] leading-4 break-all text-[var(--uai-muted)]">
            {evidence}
          </span>
        ) : null}
      </span>
      {elapsed ? (
        <span className="pt-[4px] pl-2 font-mono text-[11.5px] leading-4 tabular-nums text-[var(--uai-subtle)]">
          {elapsed}
        </span>
      ) : null}
    </li>
  );
}
