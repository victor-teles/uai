"use client";

import { useEffect, useState } from "react";
import {
  ResearchSession,
  ResearchSessionActivity,
  ResearchSessionAside,
  ResearchSessionCitation,
  ResearchSessionDescription,
  ResearchSessionHeader,
  ResearchSessionMain,
  ResearchSessionPanelTitle,
  ResearchSessionPlan,
  ResearchSessionProgress,
  ResearchSessionSearches,
  ResearchSessionSource,
  ResearchSessionSourceLink,
  ResearchSessionSourceList,
  ResearchSessionSourceMeta,
  ResearchSessionSources,
  ResearchSessionStatus,
  ResearchSessionSynthesis,
  ResearchSessionTasks,
  ResearchSessionText,
  ResearchSessionTitle,
  type ResearchSessionVariant,
} from "@/components/uai/research-session";
import {
  CitationExcerpt,
  CitationPopover,
  CitationSource,
  CitationTitle,
  CitationTrigger,
} from "@/components/ui/uai/citation";
import {
  ProgressSummaryBar,
  ProgressSummaryHeader,
  ProgressSummaryStatusText,
  ProgressSummaryTitle,
  ProgressSummaryValue,
} from "@/components/ui/uai/progress-summary";
import {
  ResponseStatusActions,
  ResponseStatusIndicator,
  ResponseStatusLabel,
  ResponseStatusRetry,
  ResponseStatusStop,
} from "@/components/ui/uai/response-status";
import { TaskListDescription, TaskListItem, TaskListTitle } from "@/components/ui/uai/task-list";
import { ThinkingActivity, ThinkingContent, ThinkingTrigger } from "@/components/ui/uai/thinking";

const LAST_STEP = 7;

const tasks = [
  { title: "Frame the question", detail: "Grocers with 50–400 stores in the EU", start: 0, end: 1 },
  { title: "Search trade press and filings", detail: "2024 to 2026 coverage", start: 1, end: 3 },
  {
    title: "Read rollout case studies",
    detail: "Four retailers with public figures",
    start: 3,
    end: 5,
  },
  {
    title: "Compare cost per store",
    detail: "Hardware, install, and integration",
    start: 5,
    end: 6,
  },
  { title: "Write the synthesis", detail: "Cite every figure", start: 6, end: 7 },
];

const searches = [
  {
    at: 1,
    type: "search",
    query: "electronic shelf labels mid-size grocer Europe 2026",
    text: "Searched trade press",
  },
  {
    at: 2,
    type: "file",
    path: "retail-systems-review/esl-survey-2026.pdf",
    text: "Read the adoption survey",
  },
  {
    at: 3,
    type: "search",
    query: "ESL installation cost per store",
    text: "Searched cost reports",
  },
  {
    at: 4,
    type: "file",
    path: "case-studies/nordhavn-markets.html",
    text: "Read a rollout case study",
  },
] as const;

const sources = [
  {
    index: 1,
    at: 2,
    title: "ESL adoption survey 2026",
    meta: "Retail Systems Review · 212 respondents",
    excerpt: "38% of grocers with 50–400 stores run labels in at least one region.",
  },
  {
    index: 2,
    at: 3,
    title: "What a label rollout costs",
    meta: "Store Ops Quarterly · Mar 2026",
    excerpt: "Installed cost averaged €41,000 per store, half of it integration work.",
  },
  {
    index: 3,
    at: 4,
    title: "Nordhavn Markets rollout notes",
    meta: "Case study · 118 stores",
    excerpt: "Price-change labor fell by 70% within two quarters of the rollout.",
  },
];

function Cite({ index }: { index: number }) {
  const source = sources[index - 1];
  if (!source) return null;
  return (
    <ResearchSessionCitation index={index}>
      <CitationTrigger />
      <CitationPopover>
        <CitationSource>{source.meta}</CitationSource>
        <CitationTitle>{source.title}</CitationTitle>
        <CitationExcerpt>{source.excerpt}</CitationExcerpt>
      </CitationPopover>
    </ResearchSessionCitation>
  );
}

export function ResearchSessionPreview({
  variant = "split",
}: {
  variant?: ResearchSessionVariant;
}) {
  const [step, setStep] = useState(0);
  const [stopped, setStopped] = useState(false);

  // Advances a fixed script locally. Applications drive these regions from their own run events.
  useEffect(() => {
    if (stopped || step >= LAST_STEP) return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), 900);
    return () => window.clearTimeout(timer);
  }, [step, stopped]);

  const done = step >= LAST_STEP;
  const writing = step === LAST_STEP - 1;
  const status = stopped ? "stopped" : done ? "complete" : writing ? "streaming" : "queued";
  const restart = () => {
    setStopped(false);
    setStep(0);
  };

  return (
    <ResearchSession variant={variant}>
      <ResearchSessionHeader>
        <div style={{ display: "grid", gap: 4 }}>
          <ResearchSessionTitle>Electronic shelf labels in European grocery</ResearchSessionTitle>
          <ResearchSessionDescription>
            How far have mid-size grocers adopted them, and what does a rollout cost?
          </ResearchSessionDescription>
        </div>
        <ResearchSessionProgress
          value={step}
          max={LAST_STEP}
          status={stopped ? "cancelled" : done ? "complete" : "running"}
        >
          <ProgressSummaryHeader>
            <ProgressSummaryTitle>Research progress</ProgressSummaryTitle>
            <ProgressSummaryStatusText>
              {stopped
                ? "Stopped by you"
                : done
                  ? "Synthesis ready"
                  : `${tasks.filter((task) => task.end <= step).length} of ${tasks.length} steps done`}
            </ProgressSummaryStatusText>
          </ProgressSummaryHeader>
          <ProgressSummaryValue />
          <ProgressSummaryBar />
        </ResearchSessionProgress>
      </ResearchSessionHeader>
      <ResearchSessionAside>
        <ResearchSessionPlan>
          <ResearchSessionPanelTitle>Plan</ResearchSessionPanelTitle>
          <ResearchSessionTasks>
            {tasks.map((task) => (
              <TaskListItem
                key={task.title}
                status={
                  task.end <= step
                    ? "complete"
                    : task.start <= step && !stopped
                      ? "active"
                      : "pending"
                }
              >
                <TaskListTitle>{task.title}</TaskListTitle>
                <TaskListDescription>{task.detail}</TaskListDescription>
              </TaskListItem>
            ))}
          </ResearchSessionTasks>
        </ResearchSessionPlan>
        <ResearchSessionActivity>
          <ResearchSessionPanelTitle>Search activity</ResearchSessionPanelTitle>
          <ResearchSessionSearches status={done || stopped ? "complete" : "thinking"}>
            <ThinkingTrigger
              title={done || stopped ? "Searched 4 places" : "Searching"}
              summary={searches.filter((item) => item.at <= step).at(-1)?.text}
            />
            <ThinkingContent>
              {searches
                .filter((item) => item.at <= step)
                .map((item) =>
                  item.type === "search" ? (
                    <ThinkingActivity key={item.at} type="search" query={item.query}>
                      {item.text}
                    </ThinkingActivity>
                  ) : (
                    <ThinkingActivity key={item.at} type="file" path={item.path}>
                      {item.text}
                    </ThinkingActivity>
                  ),
                )}
            </ThinkingContent>
          </ResearchSessionSearches>
        </ResearchSessionActivity>
      </ResearchSessionAside>
      <ResearchSessionMain>
        <ResearchSessionSynthesis>
          <ResearchSessionPanelTitle>Synthesis</ResearchSessionPanelTitle>
          {done ? (
            <ResearchSessionText>
              <p style={{ margin: 0 }}>
                Adoption is past the pilot stage: 38% of grocers with 50 to 400 stores now run
                labels in at least one region
                <Cite index={1} />.
              </p>
              <p style={{ margin: 0 }}>
                Cost is the main brake. Installed cost averages €41,000 per store, and half of that
                is integration with pricing systems
                <Cite index={2} />. Retailers that finish a rollout report large labor savings on
                price changes
                <Cite index={3} />.
              </p>
            </ResearchSessionText>
          ) : (
            <ResearchSessionText>
              <p style={{ margin: 0, color: "var(--uai-muted)" }}>
                The synthesis appears once the sources are read.
              </p>
            </ResearchSessionText>
          )}
          <ResearchSessionStatus status={status}>
            <ResponseStatusIndicator />
            <ResponseStatusLabel>
              {status === "queued" ? "Reading sources…" : undefined}
            </ResponseStatusLabel>
            <ResponseStatusActions>
              <ResponseStatusStop onClick={() => setStopped(true)} />
              <ResponseStatusRetry onClick={restart}>Run again</ResponseStatusRetry>
            </ResponseStatusActions>
          </ResearchSessionStatus>
        </ResearchSessionSynthesis>
        <ResearchSessionSources>
          <ResearchSessionPanelTitle>Sources</ResearchSessionPanelTitle>
          {step < 2 ? (
            <ResearchSessionSourceMeta>
              Sources appear here as they are read.
            </ResearchSessionSourceMeta>
          ) : (
            <ResearchSessionSourceList>
              {sources
                .filter((source) => source.at <= step)
                .map((source) => (
                  <ResearchSessionSource key={source.index} index={source.index}>
                    <ResearchSessionSourceLink href="#sources">
                      {source.title}
                    </ResearchSessionSourceLink>
                    <ResearchSessionSourceMeta>{source.meta}</ResearchSessionSourceMeta>
                  </ResearchSessionSource>
                ))}
            </ResearchSessionSourceList>
          )}
        </ResearchSessionSources>
      </ResearchSessionMain>
    </ResearchSession>
  );
}
