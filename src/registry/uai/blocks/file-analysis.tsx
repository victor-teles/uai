"use client";

import { type ComponentProps, createContext, useContext, useId } from "react";
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

const dangerText = "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))";
const tones: Record<FileAnalysisFindingTone, { label: string; color: string }> = {
  neutral: { label: "Note", color: "var(--uai-muted)" },
  warning: { label: "Review", color: "var(--uai-warning)" },
  critical: { label: "Risk", color: "var(--uai-danger)" },
};

const layoutCss = `
[data-uai-analysis-layout]{display:grid;gap:16px;align-items:start;min-width:0}
[data-uai-analysis="compact"]>[data-uai-analysis-layout]{gap:12px}
@container (min-width: 720px){
  [data-uai-analysis="split"]>[data-uai-analysis-layout]{grid-template-columns:minmax(240px,0.8fr) minmax(0,1.3fr);gap:20px}
  [data-uai-analysis-layout]>[data-uai-analysis-region="header"]{grid-column:1/-1}
}
[data-uai-analysis-action]{transition:background-color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-analysis-action="primary"]{background:var(--uai-accent);color:var(--uai-accent-foreground)}
[data-uai-analysis-action="secondary"]{background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-analysis-action="primary"]:hover:not(:disabled){filter:brightness(1.08)}
[data-uai-analysis-action="secondary"]:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
[data-uai-analysis-action]:active:not(:disabled){transform:scale(0.97)}
[data-uai-analysis-action]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@keyframes uai-analysis-enter{from{opacity:0;transform:translateY(4px)}}
[data-uai-analysis-finding]{animation:uai-analysis-enter 240ms cubic-bezier(0.23,1,0.32,1) both}
[data-uai-analysis-finding]:nth-child(2){animation-delay:40ms}
[data-uai-analysis-finding]:nth-child(3){animation-delay:80ms}
[data-uai-analysis-finding]:nth-child(n+4){animation-delay:120ms}
@media (prefers-reduced-motion: reduce){[data-uai-analysis-action],[data-uai-analysis-finding]{transition:none;animation:none}[data-uai-analysis-action]:active:not(:disabled){transform:none}}`;

/** Files, extraction status, and cited findings. Split places the files beside the findings at 720px. */
export function FileAnalysis({ variant = "split", children, style, ...props }: FileAnalysisProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-analysis={variant}
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
        <div data-uai-analysis-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function FileAnalysisHeader({ style, ...props }: ComponentProps<"header">) {
  useAnalysis("FileAnalysisHeader");
  return (
    <header
      {...props}
      data-uai-analysis-region="header"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function FileAnalysisHeading({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 4, flex: "1 1 240px", minWidth: 0, ...style }} />
  );
}

export function FileAnalysisTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useAnalysis("FileAnalysisTitle");
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

export function FileAnalysisDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

export function FileAnalysisAction({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const { variant } = useAnalysis("FileAnalysisAction");
  const compact = variant === "compact";
  return (
    <button
      {...props}
      type={type}
      data-uai-analysis-action={emphasis}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: compact ? 26 : 30,
        padding: compact ? "0 10px" : "0 13px",
        border: 0,
        borderRadius: 999,
        font: "inherit",
        fontSize: compact ? 12 : 12.5,
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
        ...style,
      }}
    />
  );
}

function Panel({ part, style, ...props }: ComponentProps<"section"> & { part: string }) {
  const { variant } = useAnalysis(part);
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
          padding: compact ? 12 : 16,
          border: "1px solid var(--uai-border)",
          borderRadius: compact ? 12 : 14,
          background: "var(--uai-surface)",
          ...style,
        }}
      />
    </PanelContext.Provider>
  );
}

/** The analysed files and their extraction status. */
export function FileAnalysisFiles(props: ComponentProps<"section">) {
  return <Panel {...props} part="FileAnalysisFiles" />;
}

/** What the analysis found. Compose findings with citations inside it. */
export function FileAnalysisFindings(props: ComponentProps<"section">) {
  return <Panel {...props} part="FileAnalysisFindings" />;
}

export function FileAnalysisPanelTitle({ style, ...props }: ComponentProps<"h3">) {
  const id = usePanel("FileAnalysisPanelTitle");
  return (
    <h3
      {...props}
      id={id}
      style={{ margin: 0, fontSize: 13, lineHeight: "18px", fontWeight: 500, ...style }}
    />
  );
}

/** Overall extraction status. Compose Progress Summary parts inside it. */
export function FileAnalysisExtraction(props: Omit<ProgressSummaryProps, "variant">) {
  const { variant } = useAnalysis("FileAnalysisExtraction");
  return <ProgressSummary {...props} variant={progressVariants[variant]} />;
}

export function FileAnalysisFileList({ style, ...props }: ComponentProps<"ul">) {
  const id = usePanel("FileAnalysisFileList");
  const { variant } = useAnalysis("FileAnalysisFileList");
  return (
    <ul
      aria-labelledby={id}
      {...props}
      style={{
        display: variant === "split" ? "grid" : "flex",
        flexWrap: "wrap",
        gap: variant === "compact" ? 6 : 8,
        margin: 0,
        padding: 0,
        listStyle: "none",
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** One file. Compose Attachment parts inside it. */
export function FileAnalysisFile(props: Omit<AttachmentProps, "variant">) {
  const { variant } = useAnalysis("FileAnalysisFile");
  return (
    <li style={{ minWidth: 0, maxWidth: "100%" }}>
      <Attachment {...props} variant={attachmentVariants[variant]} />
    </li>
  );
}

export function FileAnalysisFindingList({ style, ...props }: ComponentProps<"ol">) {
  const id = usePanel("FileAnalysisFindingList");
  const { variant } = useAnalysis("FileAnalysisFindingList");
  return (
    <ol
      aria-labelledby={id}
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns:
          variant === "stacked"
            ? "repeat(auto-fit, minmax(min(100%, 260px), 1fr))"
            : "minmax(0, 1fr)",
        gap: variant === "compact" ? 6 : 8,
        margin: 0,
        padding: 0,
        listStyle: "none",
        minWidth: 0,
        ...style,
      }}
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
  style,
  ...props
}: FileAnalysisFindingProps) {
  const { variant } = useAnalysis("FileAnalysisFinding");
  const compact = variant === "compact";
  const details = tones[tone];
  return (
    <li
      {...props}
      data-tone={tone}
      data-uai-analysis-finding=""
      style={{
        display: "grid",
        alignContent: "start",
        justifyItems: "start",
        gap: compact ? 4 : 6,
        minWidth: 0,
        padding: compact ? "8px 10px" : "12px 14px",
        borderRadius: compact ? 8 : 10,
        background: "color-mix(in oklab, var(--uai-surface-raised) 70%, var(--uai-surface))",
        ...style,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "0 8px",
          borderRadius: 999,
          background: `color-mix(in oklab, ${details.color} ${tone === "neutral" ? 16 : 14}%, transparent)`,
          color: tone === "critical" ? dangerText : details.color,
          fontSize: 11.5,
          lineHeight: "20px",
          fontWeight: 500,
        }}
      >
        <span
          aria-hidden="true"
          style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }}
        />
        {toneLabel ?? details.label}
      </span>
      {children}
    </li>
  );
}

export function FileAnalysisFindingTitle({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, fontWeight: 500, overflowWrap: "anywhere", ...style }} />
  );
}

export function FileAnalysisFindingDetail({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-muted)", overflowWrap: "anywhere", ...style }}
    />
  );
}

/** A marker that points to the page or cell a finding came from. Compose Citation parts inside it. */
export function FileAnalysisCitation(props: Omit<CitationProps, "variant">) {
  const { variant } = useAnalysis("FileAnalysisCitation");
  return <Citation {...props} variant={citationVariants[variant]} />;
}
