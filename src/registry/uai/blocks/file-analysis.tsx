"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext, useId } from "react";
import { Button } from "@/components/ui/button";
import {
  Attachment,
  type AttachmentProps,
  type AttachmentVariant,
} from "@/components/ui/uai/attachment";
import { Citation, type CitationProps, type CitationVariant } from "@/components/ui/uai/citation";
import {
  ProgressSummary,
  type ProgressSummaryProps,
  type ProgressSummaryVariant,
} from "@/components/ui/uai/progress-summary";
import { cn } from "@/lib/uai-utils";

export const FILE_ANALYSIS_VARIANTS = ["split", "stacked", "compact"] as const;
export type FileAnalysisVariant = (typeof FILE_ANALYSIS_VARIANTS)[number];
export type FileAnalysisProps = ComponentProps<"section"> & { variant?: FileAnalysisVariant };
export const FILE_ANALYSIS_FINDING_TONES = ["neutral", "warning", "critical"] as const;
export type FileAnalysisFindingTone = (typeof FILE_ANALYSIS_FINDING_TONES)[number];

type AnalysisContext = { id: string; variant: FileAnalysisVariant };
const Context = createContext<AnalysisContext | null>(null);
function useAnalysis(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within FileAnalysis`);
  return context;
}
const PanelContext = createContext<string | null>(null);
function usePanel(part: string) {
  const id = useContext(PanelContext);
  if (!id) throw new Error(`${part} must be used within a FileAnalysis panel`);
  return id;
}

const attachmentVariants: Record<FileAnalysisVariant, AttachmentVariant> = {
  split: "row",
  stacked: "card",
  compact: "chip",
};
const progressVariants: Record<FileAnalysisVariant, ProgressSummaryVariant> = {
  split: "inline",
  stacked: "card",
  compact: "compact",
};
const citationVariants: Record<FileAnalysisVariant, CitationVariant> = {
  split: "chip",
  stacked: "chip",
  compact: "number",
};

const tones: Record<FileAnalysisFindingTone, { label: string; className: string }> = {
  neutral: { label: "Note", className: "bg-muted-foreground/16 text-muted-foreground" },
  warning: { label: "Review", className: "bg-warning/14 text-warning" },
  critical: {
    label: "Risk",
    className:
      "bg-destructive/14 text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]",
  },
};

/** Files, extraction status, and cited findings. Split places the files beside the findings at 720px. */
export function FileAnalysis({
  variant = "split",
  className,
  children,
  ...props
}: FileAnalysisProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="file-analysis"
        data-variant={variant}
        className={cn("@container min-w-0 text-[13px]/[18px] text-foreground", className)}
        {...props}
      >
        <div
          className={cn(
            "grid min-w-0 items-start",
            variant === "compact" ? "gap-3" : "gap-4",
            variant === "split" &&
              "@min-[720px]:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.3fr)] @min-[720px]:gap-5",
          )}
        >
          {children}
        </div>
      </section>
    </Context.Provider>
  );
}

export function FileAnalysisHeader({ className, ...props }: ComponentProps<"header">) {
  useAnalysis("FileAnalysisHeader");
  return (
    <header
      data-slot="file-analysis-header"
      className={cn(
        "flex min-w-0 flex-wrap items-end justify-between gap-3 @min-[720px]:col-span-full",
        className,
      )}
      {...props}
    />
  );
}

export function FileAnalysisHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="file-analysis-heading"
      className={cn("grid min-w-0 flex-[1_1_240px] gap-1", className)}
      {...props}
    />
  );
}

export function FileAnalysisTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useAnalysis("FileAnalysisTitle");
  return (
    <h2
      data-slot="file-analysis-title"
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

export function FileAnalysisDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="file-analysis-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

const fileAnalysisActionVariants = cva(
  "cursor-pointer gap-1.5 rounded-full border-0 py-0 transition-[background-color,filter,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:not-disabled:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:not-disabled:scale-100",
  {
    variants: {
      emphasis: {
        primary: "bg-primary text-primary-foreground hover:bg-primary hover:brightness-[1.08]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
      },
      size: {
        default: "h-7.5 px-[13px] text-[12.5px] has-[>svg]:px-[13px]",
        compact: "h-6.5 px-2.5 text-[12px] has-[>svg]:px-2.5",
      },
    },
  },
);

export function FileAnalysisAction({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const { variant } = useAnalysis("FileAnalysisAction");
  return (
    <Button
      data-slot="file-analysis-action"
      variant={emphasis === "primary" ? "default" : "secondary"}
      data-emphasis={emphasis}
      className={cn(
        fileAnalysisActionVariants({
          emphasis,
          size: variant === "compact" ? "compact" : "default",
        }),
        className,
      )}
      {...props}
      type={type}
    />
  );
}

function Panel({
  part,
  slot,
  className,
  ...props
}: ComponentProps<"section"> & { part: string; slot: string }) {
  const { variant } = useAnalysis(part);
  const id = useId();
  return (
    <PanelContext.Provider value={id}>
      <section
        aria-labelledby={id}
        data-slot={slot}
        className={cn(
          "grid min-w-0 content-start border bg-card",
          variant === "compact" ? "gap-2 rounded-xl p-3" : "gap-3 rounded-[14px] p-4",
          className,
        )}
        {...props}
      />
    </PanelContext.Provider>
  );
}

/** The analysed files and their extraction status. */
export function FileAnalysisFiles(props: ComponentProps<"section">) {
  return <Panel {...props} part="FileAnalysisFiles" slot="file-analysis-files" />;
}

/** What the analysis found. Compose findings with citations inside it. */
export function FileAnalysisFindings(props: ComponentProps<"section">) {
  return <Panel {...props} part="FileAnalysisFindings" slot="file-analysis-findings" />;
}

export function FileAnalysisPanelTitle({ className, ...props }: ComponentProps<"h3">) {
  const id = usePanel("FileAnalysisPanelTitle");
  return (
    <h3
      data-slot="file-analysis-panel-title"
      className={cn("m-0 text-[13px]/[18px] font-medium", className)}
      {...props}
      id={id}
    />
  );
}

/** Overall extraction status. Compose Progress Summary parts inside it. */
export function FileAnalysisExtraction(props: Omit<ProgressSummaryProps, "variant">) {
  const { variant } = useAnalysis("FileAnalysisExtraction");
  return (
    <ProgressSummary
      data-slot="file-analysis-extraction"
      {...props}
      variant={progressVariants[variant]}
    />
  );
}

export function FileAnalysisFileList({ className, ...props }: ComponentProps<"ul">) {
  const id = usePanel("FileAnalysisFileList");
  const { variant } = useAnalysis("FileAnalysisFileList");
  return (
    <ul
      aria-labelledby={id}
      data-slot="file-analysis-file-list"
      className={cn(
        "m-0 min-w-0 list-none flex-wrap p-0",
        variant === "split" ? "grid" : "flex",
        variant === "compact" ? "gap-1.5" : "gap-2",
        className,
      )}
      {...props}
    />
  );
}

/** One file. Compose Attachment parts inside it. */
export function FileAnalysisFile(props: Omit<AttachmentProps, "variant">) {
  const { variant } = useAnalysis("FileAnalysisFile");
  return (
    <li data-slot="file-analysis-file" className="min-w-0 max-w-full">
      <Attachment {...props} variant={attachmentVariants[variant]} />
    </li>
  );
}

export function FileAnalysisFindingList({ className, ...props }: ComponentProps<"ol">) {
  const id = usePanel("FileAnalysisFindingList");
  const { variant } = useAnalysis("FileAnalysisFindingList");
  return (
    <ol
      aria-labelledby={id}
      data-slot="file-analysis-finding-list"
      className={cn(
        "m-0 grid min-w-0 list-none p-0",
        variant === "stacked"
          ? "grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))]"
          : "grid-cols-[minmax(0,1fr)]",
        variant === "compact" ? "gap-1.5" : "gap-2",
        className,
      )}
      {...props}
    />
  );
}

export type FileAnalysisFindingProps = ComponentProps<"li"> & {
  tone?: FileAnalysisFindingTone;
  /** Replaces the written tone label. */
  toneLabel?: string;
};

export function FileAnalysisFinding({
  tone = "neutral",
  toneLabel,
  children,
  className,
  ...props
}: FileAnalysisFindingProps) {
  const { variant } = useAnalysis("FileAnalysisFinding");
  const details = tones[tone];
  return (
    <li
      data-slot="file-analysis-finding"
      data-tone={tone}
      className={cn(
        "grid min-w-0 content-start justify-items-start bg-[color-mix(in_oklab,var(--muted)_70%,var(--card))]",
        "animate-in fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint fill-mode-both nth-2:[--tw-animation-delay:40ms] nth-3:[--tw-animation-delay:80ms] nth-[n+4]:[--tw-animation-delay:120ms] motion-reduce:animate-none",
        variant === "compact"
          ? "gap-1 rounded-lg px-2.5 py-2"
          : "gap-1.5 rounded-[10px] px-3.5 py-3",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.25 rounded-full px-2 text-[11.5px]/5 font-medium",
          details.className,
        )}
      >
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
        {toneLabel ?? details.label}
      </span>
      {children}
    </li>
  );
}

export function FileAnalysisFindingTitle({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="file-analysis-finding-title"
      className={cn("m-0 font-medium wrap-anywhere", className)}
      {...props}
    />
  );
}

export function FileAnalysisFindingDetail({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="file-analysis-finding-detail"
      className={cn("m-0 text-muted-foreground wrap-anywhere", className)}
      {...props}
    />
  );
}

/** A marker that points to the page or cell a finding came from. Compose Citation parts inside it. */
export function FileAnalysisCitation(props: Omit<CitationProps, "variant">) {
  const { variant } = useAnalysis("FileAnalysisCitation");
  return (
    <Citation data-slot="file-analysis-citation" {...props} variant={citationVariants[variant]} />
  );
}
