"use client";

import { type ComponentProps, createContext, useContext, useId } from "react";
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
import { cn } from "@/lib/uai-utils";

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

/** A research run: the plan, search activity, sources, and the synthesis. Split places the plan and activity beside the synthesis at 760px. */
export function ResearchSession({
  variant = "split",
  children,
  className,
  ...props
}: ResearchSessionProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="research-session"
        className={cn(
          "@container box-border min-w-0 text-[13px]/[18px] text-foreground",
          className,
        )}
        {...props}
        data-variant={variant}
      >
        <div
          className={cn(
            "grid min-w-0 items-start",
            variant === "compact" ? "gap-3" : "gap-4",
            variant === "split" &&
              "@min-[760px]:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.4fr)] @min-[760px]:gap-5",
          )}
        >
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function ResearchSessionHeader({ className, ...props }: ComponentProps<"header">) {
  const { variant } = useSession("ResearchSessionHeader");
  return (
    <header
      data-slot="research-session-header"
      className={cn(
        "grid min-w-0 @min-[760px]:col-span-full",
        variant === "compact" ? "gap-2" : "gap-3",
        className,
      )}
      {...props}
    />
  );
}

export function ResearchSessionTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useSession("ResearchSessionTitle");
  return (
    <h2
      data-slot="research-session-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em] wrap-anywhere",
        variant === "compact" ? "text-[15px]/5" : "text-lg/6",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function ResearchSessionDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="research-session-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Overall progress. Compose Progress Summary parts inside it. */
export function ResearchSessionProgress(props: Omit<ProgressSummaryProps, "variant">) {
  const { variant } = useSession("ResearchSessionProgress");
  return <ProgressSummary {...props} variant={progressVariants[variant]} />;
}

function Column({
  part,
  slot,
  className,
  ...props
}: ComponentProps<"div"> & { part: string; slot: string }) {
  const { variant } = useSession(part);
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

/** The working column: plan and search activity. */
export function ResearchSessionAside(props: ComponentProps<"div">) {
  return <Column {...props} part="ResearchSessionAside" slot="research-session-aside" />;
}

/** The reading column: synthesis and sources. */
export function ResearchSessionMain(props: ComponentProps<"div">) {
  return <Column {...props} part="ResearchSessionMain" slot="research-session-main" />;
}

function Panel({
  part,
  slot,
  className,
  ...props
}: ComponentProps<"section"> & { part: string; slot: string }) {
  const { variant } = useSession(part);
  const id = useId();
  const compact = variant === "compact";
  return (
    <PanelContext.Provider value={id}>
      <section
        aria-labelledby={id}
        data-slot={slot}
        className={cn(
          "grid min-w-0 content-start border bg-card",
          compact ? "gap-2 rounded-xl p-3" : "gap-3 rounded-[14px] p-4",
          className,
        )}
        {...props}
      />
    </PanelContext.Provider>
  );
}

/** The research plan. Compose ResearchSessionTasks inside it. */
export function ResearchSessionPlan(props: ComponentProps<"section">) {
  return <Panel {...props} part="ResearchSessionPlan" slot="research-session-plan" />;
}

/** Search activity. Compose ResearchSessionSearches inside it. */
export function ResearchSessionActivity(props: ComponentProps<"section">) {
  return <Panel {...props} part="ResearchSessionActivity" slot="research-session-activity" />;
}

/** The written answer. Compose citations and ResearchSessionStatus inside it. */
export function ResearchSessionSynthesis(props: ComponentProps<"section">) {
  return <Panel {...props} part="ResearchSessionSynthesis" slot="research-session-synthesis" />;
}

/** Sources the synthesis draws from. */
export function ResearchSessionSources(props: ComponentProps<"section">) {
  return <Panel {...props} part="ResearchSessionSources" slot="research-session-sources" />;
}

function usePanel(part: string) {
  const id = useContext(PanelContext);
  if (!id) throw new Error(`${part} must be used within a ResearchSession panel`);
  return id;
}

export function ResearchSessionPanelTitle({ className, ...props }: ComponentProps<"h3">) {
  const id = usePanel("ResearchSessionPanelTitle");
  return (
    <h3
      data-slot="research-session-panel-title"
      className={cn("m-0 text-[13px]/[18px] font-medium", className)}
      {...props}
      id={id}
    />
  );
}

/** Plan steps. Compose Task List items inside it. */
export function ResearchSessionTasks(props: Omit<TaskListProps, "variant">) {
  const { variant } = useSession("ResearchSessionTasks");
  return <TaskList {...props} variant={taskVariants[variant]} />;
}

/** Searches and reads as they happen. Compose Thinking parts inside it. */
export function ResearchSessionSearches({ className, ...props }: ThinkingProps) {
  useSession("ResearchSessionSearches");
  return <Thinking className={cn("min-w-0", className)} {...props} />;
}

/** Where the synthesis stands. Compose Response Status parts inside it. */
export function ResearchSessionStatus(props: Omit<ResponseStatusProps, "variant">) {
  const { variant } = useSession("ResearchSessionStatus");
  return <ResponseStatus {...props} variant={statusVariants[variant]} />;
}

export function ResearchSessionText({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useSession("ResearchSessionText");
  return (
    <div
      data-slot="research-session-text"
      className={cn(
        "grid max-w-[68ch] min-w-0 wrap-anywhere",
        variant === "compact" ? "gap-2" : "gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

/** An inline source marker in the synthesis. Compose Citation parts inside it. */
export function ResearchSessionCitation(props: Omit<CitationProps, "variant">) {
  const { variant } = useSession("ResearchSessionCitation");
  return <Citation {...props} variant={citationVariants[variant]} />;
}

export function ResearchSessionSourceList({ className, ...props }: ComponentProps<"ol">) {
  const id = usePanel("ResearchSessionSourceList");
  const { variant } = useSession("ResearchSessionSourceList");
  return (
    <ol
      aria-labelledby={id}
      data-slot="research-session-source-list"
      className={cn(
        "m-0 grid min-w-0 list-none p-0",
        variant === "stacked"
          ? "grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))]"
          : "grid-cols-[minmax(0,1fr)]",
        variant === "compact" ? "gap-1" : "gap-2",
        className,
      )}
      {...props}
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
  className,
  ...props
}: ResearchSessionSourceProps) {
  const { variant } = useSession("ResearchSessionSource");
  const compact = variant === "compact";
  return (
    <li
      data-slot="research-session-source"
      className={cn(
        "grid min-w-0 grid-cols-[20px_minmax(0,1fr)] items-start gap-2 [transition:background-color_120ms_ease-out] hover:bg-muted motion-reduce:transition-none",
        compact
          ? "rounded-lg px-0.5 py-1"
          : "rounded-[10px] bg-[color-mix(in_oklab,var(--muted)_70%,var(--card))] px-2.5 py-2",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-px grid h-4.5 place-items-center rounded-full text-[11px] font-medium text-muted-foreground tabular-nums",
          compact ? "bg-muted" : "bg-card",
        )}
      >
        {index}
      </span>
      <span className="grid min-w-0 gap-0.5">{children}</span>
    </li>
  );
}

export function ResearchSessionSourceLink({ className, ...props }: ComponentProps<"a">) {
  return (
    <a
      data-slot="research-session-source-link"
      className={cn(
        "font-medium text-foreground no-underline decoration-border-strong underline-offset-3 wrap-anywhere hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      {...props}
    />
  );
}

export function ResearchSessionSourceMeta({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="research-session-source-meta"
      className={cn("text-[12px] text-subtle-foreground wrap-anywhere", className)}
      {...props}
    />
  );
}
