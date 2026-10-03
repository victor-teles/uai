import { Bot, FileSearch, MessagesSquare, Microscope } from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type AiBlocksItemId =
  | "conversation-thread"
  | "research-session"
  | "file-analysis"
  | "agent-run";

export const aiBlocksCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "conversation-thread",
    name: "Conversation Thread",
    category: "AI",
    icon: MessagesSquare,
    description: "Messages, cited sources, response states, and a prompt composer in one thread.",
    usage: `"use client";

import { useEffect, useRef, useState } from "react";
import {
  ConversationThread,
  ConversationThreadCitation,
  ConversationThreadComposer,
  ConversationThreadDescription,
  ConversationThreadHeader,
  ConversationThreadLog,
  ConversationThreadMain,
  ConversationThreadMessage,
  ConversationThreadSource,
  ConversationThreadSourceLink,
  ConversationThreadSourceList,
  ConversationThreadSourceMeta,
  ConversationThreadSources,
  ConversationThreadSourcesTitle,
  ConversationThreadStatus,
  ConversationThreadTitle,
  type ConversationThreadVariant,
} from "@/components/uai/conversation-thread";
import {
  CitationExcerpt,
  CitationLink,
  CitationPopover,
  CitationSource,
  CitationTitle,
  CitationTrigger,
} from "@/components/ui/uai/citation";
import {
  MessageActions,
  MessageAuthor,
  MessageAvatar,
  MessageBody,
  MessageContent,
  MessageCopy,
  MessageHeader,
  MessageTime,
} from "@/components/ui/uai/message";
import {
  PromptComposerActions,
  PromptComposerInput,
  PromptComposerSubmit,
} from "@/components/ui/uai/prompt-composer";
import {
  ResponseStatusActions,
  ResponseStatusDetail,
  ResponseStatusIndicator,
  ResponseStatusLabel,
  ResponseStatusRetry,
  ResponseStatusStop,
  type ResponseStatusValue,
} from "@/components/ui/uai/response-status";

type Turn = { id: number; from: "user" | "assistant"; text: string; time: string };

const sources = [
  {
    index: 1,
    title: "Release 4.2 support review",
    meta: "Support Ops · Sep 18",
    excerpt: "Ticket volume rose 31% in the two weeks after 4.2, led by invoice export questions.",
  },
  {
    index: 2,
    title: "Invoice export changelog",
    meta: "Product docs · Sep 4",
    excerpt: "Exports now default to the workspace currency instead of the customer currency.",
  },
];

const reply =
  "Most of the follow-up tickets came from teams in the EU and UK. Exports now default to the workspace currency, so customers billing in euros saw totals in dollars. A banner on the export screen and a currency setting in the export dialog would cover the largest group.";

function CitedReply() {
  return (
    <>
      Most of the follow-up tickets came from teams in the EU and UK
      <SourceCitation index={1} />. Exports now default to the workspace currency, so customers
      billing in euros saw totals in dollars
      <SourceCitation index={2} />. A banner on the export screen and a currency setting in the
      export dialog would cover the largest group.
    </>
  );
}

function SourceCitation({ index }: { index: number }) {
  const source = sources[index - 1];
  if (!source) return null;
  return (
    <ConversationThreadCitation index={index}>
      <CitationTrigger />
      <CitationPopover>
        <CitationSource>{source.meta}</CitationSource>
        <CitationTitle>{source.title}</CitationTitle>
        <CitationExcerpt>{source.excerpt}</CitationExcerpt>
        <CitationLink href="#sources">Open document</CitationLink>
      </CitationPopover>
    </ConversationThreadCitation>
  );
}

export function ConversationThreadPreview({
  variant = "chat",
}: {
  variant?: ConversationThreadVariant;
}) {
  const [turns, setTurns] = useState<Turn[]>([
    {
      id: 1,
      from: "user",
      text: "Why did support tickets jump after the 4.2 release?",
      time: "09:41",
    },
    { id: 2, from: "assistant", text: reply, time: "09:41" },
  ]);
  const [streamed, setStreamed] = useState(reply.length);
  const [status, setStatus] = useState<ResponseStatusValue>("complete");
  const timers = useRef<number[]>([]);
  const nextId = useRef(3);

  const clearTimers = () => {
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
  };
  useEffect(
    () => () => {
      for (const timer of timers.current) window.clearTimeout(timer);
    },
    [],
  );

  // Simulates a streamed reply locally. Applications connect their own transport.
  const respond = () => {
    clearTimers();
    setStatus("queued");
    setStreamed(0);
    const words = reply.split(" ");
    timers.current.push(
      window.setTimeout(() => {
        setStatus("streaming");
        words.forEach((_, index) => {
          timers.current.push(
            window.setTimeout(() => {
              setStreamed(words.slice(0, index + 1).join(" ").length);
              if (index === words.length - 1) setStatus("complete");
            }, index * 45),
          );
        });
      }, 500),
    );
  };

  const streaming = status === "queued" || status === "streaming";
  const latest = turns[turns.length - 1]?.id;

  return (
    <ConversationThread variant={variant}>
      <ConversationThreadHeader>
        <ConversationThreadTitle>Support volume after 4.2</ConversationThreadTitle>
        <ConversationThreadDescription>
          Answers cite the support review and the product changelog.
        </ConversationThreadDescription>
      </ConversationThreadHeader>
      <ConversationThreadMain>
        <ConversationThreadLog>
          {turns.map((turn) => {
            const live = turn.id === latest && turn.from === "assistant";
            return (
              <ConversationThreadMessage
                key={turn.id}
                from={turn.from}
                streaming={live && streaming}
              >
                <MessageAvatar />
                <MessageBody>
                  <MessageHeader>
                    <MessageAuthor>
                      {turn.from === "assistant" ? "Ledger assistant" : "You"}
                    </MessageAuthor>
                    <MessageTime dateTime={\`2026-09-30T\${turn.time}\`}>{turn.time}</MessageTime>
                  </MessageHeader>
                  <MessageContent>
                    {turn.from === "user" ? (
                      turn.text
                    ) : live && status !== "complete" ? (
                      reply.slice(0, streamed)
                    ) : (
                      <CitedReply />
                    )}
                  </MessageContent>
                  {turn.from === "assistant" ? (
                    <MessageActions>
                      <MessageCopy text={reply} />
                    </MessageActions>
                  ) : null}
                </MessageBody>
              </ConversationThreadMessage>
            );
          })}
        </ConversationThreadLog>
        <ConversationThreadStatus status={status}>
          <ResponseStatusIndicator />
          <ResponseStatusLabel />
          {status === "complete" ? <ResponseStatusDetail>2 sources</ResponseStatusDetail> : null}
          <ResponseStatusActions>
            <ResponseStatusStop
              onClick={() => {
                clearTimers();
                setStatus("stopped");
              }}
            />
            <ResponseStatusRetry onClick={respond} />
          </ResponseStatusActions>
        </ConversationThreadStatus>
        <ConversationThreadComposer
          busy={streaming}
          onSubmit={(prompt) => {
            setTurns((current) => [
              ...current.slice(-4),
              { id: nextId.current++, from: "user", text: prompt, time: "09:44" },
              { id: nextId.current++, from: "assistant", text: reply, time: "09:44" },
            ]);
            respond();
          }}
        >
          <PromptComposerInput placeholder="Ask a follow-up…" />
          <PromptComposerActions>
            <PromptComposerSubmit />
          </PromptComposerActions>
        </ConversationThreadComposer>
      </ConversationThreadMain>
      <ConversationThreadSources id="sources">
        <ConversationThreadSourcesTitle>Sources</ConversationThreadSourcesTitle>
        <ConversationThreadSourceList>
          {sources.map((source) => (
            <ConversationThreadSource key={source.index} index={source.index}>
              <ConversationThreadSourceLink href="#sources">
                {source.title}
              </ConversationThreadSourceLink>
              <ConversationThreadSourceMeta>{source.meta}</ConversationThreadSourceMeta>
            </ConversationThreadSource>
          ))}
        </ConversationThreadSourceList>
      </ConversationThreadSources>
    </ConversationThread>
  );
}
`,
    accessibility: [
      'Messages sit in a scrollable role="log" region with polite announcements, labelled by the thread title and reachable with Tab so keyboard users can scroll it.',
      "The log stays pinned to the newest message only while the reader is at the bottom, so scrolling back is never interrupted.",
      "Each message is an article named by its role; streaming messages set aria-busy until the text settles.",
      "Citation markers are buttons with aria-expanded and aria-controls; the source preview opens on focus and closes with Escape, returning focus to the marker.",
      "Response status speaks through a polite status region, and focus moves to Retry when Stop disappears.",
    ],
  },
  {
    id: "research-session",
    name: "Research Session",
    category: "AI",
    icon: Microscope,
    description: "A research plan, live search activity, sources, and a cited synthesis.",
    usage: `"use client";

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
                  : \`\${tasks.filter((task) => task.end <= step).length} of \${tasks.length} steps done\`}
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
`,
    accessibility: [
      "The session, plan, activity, synthesis, and sources are sections labelled by their headings.",
      'Plan steps are an ordered list; the active step carries aria-current="step" and every step states its status in text.',
      "Search activity is a disclosure with a polite status summary and a log of searches and reads.",
      "Overall progress is a labelled progressbar with a status message, and the source list is labelled by its heading.",
    ],
  },
  {
    id: "file-analysis",
    name: "File Analysis",
    category: "AI",
    icon: FileSearch,
    description:
      "Attached files, extraction status, and findings that cite the page or cell they came from.",
    usage: `"use client";

import { useEffect, useState } from "react";
import {
  FileAnalysis,
  FileAnalysisAction,
  FileAnalysisCitation,
  FileAnalysisDescription,
  FileAnalysisExtraction,
  FileAnalysisFile,
  FileAnalysisFileList,
  FileAnalysisFiles,
  FileAnalysisFinding,
  FileAnalysisFindingDetail,
  FileAnalysisFindingList,
  FileAnalysisFindings,
  FileAnalysisFindingTitle,
  FileAnalysisHeader,
  FileAnalysisHeading,
  FileAnalysisPanelTitle,
  FileAnalysisTitle,
  type FileAnalysisVariant,
} from "@/components/uai/file-analysis";
import {
  AttachmentDetails,
  AttachmentError,
  AttachmentMeta,
  AttachmentName,
  AttachmentProgress,
  AttachmentRetry,
  AttachmentThumbnail,
} from "@/components/ui/uai/attachment";
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

type FileState = { status: "uploading" | "ready" | "error"; progress: number; retried: boolean };

const files = [
  { name: "northwind-msa-2026.pdf", type: "application/pdf", meta: "2.4 MB · 38 pages" },
  { name: "order-form-q3.pdf", type: "application/pdf", meta: "412 KB · 3 pages" },
  {
    name: "pricing-schedule.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    meta: "88 KB · 2 sheets",
  },
  { name: "signed-addendum-scan.tiff", type: "image/tiff", meta: "6.1 MB · 1 page" },
];
const SCAN = 3;

const initialState = (): FileState[] =>
  files.map(() => ({ status: "uploading", progress: 0, retried: false }));

function Source({
  index,
  file,
  location,
  excerpt,
}: {
  index: number;
  file: string;
  location: string;
  excerpt: string;
}) {
  return (
    <FileAnalysisCitation index={index}>
      <CitationTrigger>{location}</CitationTrigger>
      <CitationPopover>
        <CitationSource>{file}</CitationSource>
        <CitationTitle>{location}</CitationTitle>
        <CitationExcerpt>{excerpt}</CitationExcerpt>
      </CitationPopover>
    </FileAnalysisCitation>
  );
}

export function FileAnalysisPreview({ variant = "split" }: { variant?: FileAnalysisVariant }) {
  const [states, setStates] = useState(initialState);
  const working = states.findIndex((state) => state.status === "uploading");
  const workingProgress = states[working]?.progress;

  // Advances extraction locally, one file at a time. The scan fails until it is retried.
  useEffect(() => {
    if (workingProgress === undefined) return;
    const progress = Math.min(100, workingProgress + 25);
    const timer = window.setTimeout(() => {
      setStates((current) =>
        current.map((state, index) => {
          if (index !== working) return state;
          if (progress < 100) return { ...state, progress };
          return {
            ...state,
            progress,
            status: index === SCAN && !state.retried ? "error" : "ready",
          };
        }),
      );
    }, 220);
    return () => window.clearTimeout(timer);
  }, [working, workingProgress]);

  const settled = states.filter((state) => state.status !== "uploading").length;
  const failed = states.filter((state) => state.status === "error").length;
  const finished = working === -1;
  const scanRead = states[SCAN]?.status === "ready";

  return (
    <FileAnalysis variant={variant}>
      <FileAnalysisHeader>
        <FileAnalysisHeading>
          <FileAnalysisTitle>Northwind renewal review</FileAnalysisTitle>
          <FileAnalysisDescription>
            Terms that need a decision before the October 31 renewal.
          </FileAnalysisDescription>
        </FileAnalysisHeading>
        <FileAnalysisAction disabled={!finished} onClick={() => setStates(initialState())}>
          Analyze again
        </FileAnalysisAction>
      </FileAnalysisHeader>
      <FileAnalysisFiles>
        <FileAnalysisPanelTitle>Files</FileAnalysisPanelTitle>
        <FileAnalysisExtraction
          value={settled}
          max={files.length}
          status={!finished ? "running" : failed ? "error" : "complete"}
        >
          <ProgressSummaryHeader>
            <ProgressSummaryTitle>Extraction</ProgressSummaryTitle>
            <ProgressSummaryStatusText>
              {!finished
                ? \`Reading \${files[working]?.name}\`
                : failed
                  ? "1 file could not be read"
                  : "All files read"}
            </ProgressSummaryStatusText>
          </ProgressSummaryHeader>
          <ProgressSummaryValue>
            {settled}/{files.length}
          </ProgressSummaryValue>
          <ProgressSummaryBar />
        </FileAnalysisExtraction>
        <FileAnalysisFileList>
          {files.map((file, index) => {
            const state = states[index] ?? { status: "uploading", progress: 0, retried: false };
            return (
              <FileAnalysisFile
                key={file.name}
                mimeType={file.type}
                status={state.status}
                progress={
                  state.status === "uploading" && index === working ? state.progress : undefined
                }
              >
                <AttachmentThumbnail />
                <AttachmentDetails>
                  <AttachmentName>{file.name}</AttachmentName>
                  <AttachmentMeta>
                    {state.status === "ready"
                      ? file.meta
                      : index === working
                        ? "Extracting text…"
                        : "Queued"}
                  </AttachmentMeta>
                  <AttachmentProgress />
                  <AttachmentError>Text unreadable. Rescan at 300 dpi.</AttachmentError>
                </AttachmentDetails>
                <AttachmentRetry
                  aria-label="Retry extraction"
                  title="Retry extraction"
                  onClick={() =>
                    setStates((current) =>
                      current.map((item, position) =>
                        position === index
                          ? { status: "uploading", progress: 0, retried: true }
                          : item,
                      ),
                    )
                  }
                />
              </FileAnalysisFile>
            );
          })}
        </FileAnalysisFileList>
      </FileAnalysisFiles>
      <FileAnalysisFindings>
        <FileAnalysisPanelTitle>Findings</FileAnalysisPanelTitle>
        {settled < 3 ? (
          <FileAnalysisDescription>
            Findings appear once the contract is read.
          </FileAnalysisDescription>
        ) : (
          <FileAnalysisFindingList>
            <FileAnalysisFinding tone="critical">
              <FileAnalysisFindingTitle>
                Renews for 24 months on 90 days’ notice
              </FileAnalysisFindingTitle>
              <FileAnalysisFindingDetail>
                Cancellation must reach Northwind by August 2 to avoid the renewal
                <Source
                  index={1}
                  file="northwind-msa-2026.pdf"
                  location="p. 14"
                  excerpt="11.2 This Agreement renews for successive 24-month terms unless either party gives 90 days’ written notice."
                />
                .
              </FileAnalysisFindingDetail>
            </FileAnalysisFinding>
            <FileAnalysisFinding tone="warning">
              <FileAnalysisFindingTitle>Order form omits the 5% price cap</FileAnalysisFindingTitle>
              <FileAnalysisFindingDetail>
                The agreement caps yearly increases
                <Source
                  index={2}
                  file="northwind-msa-2026.pdf"
                  location="p. 9"
                  excerpt="7.4 Fees may increase once per year by no more than 5%."
                />
                , but the Q3 order form prices seats 8% higher
                <Source
                  index={3}
                  file="order-form-q3.pdf"
                  location="p. 2"
                  excerpt="Platform seats, 240 × $46.00 per month."
                />
                .
              </FileAnalysisFindingDetail>
            </FileAnalysisFinding>
            <FileAnalysisFinding tone="neutral">
              <FileAnalysisFindingTitle>Volume tiers match the schedule</FileAnalysisFindingTitle>
              <FileAnalysisFindingDetail>
                All four seat tiers agree with the pricing schedule
                <Source
                  index={4}
                  file="pricing-schedule.xlsx"
                  location="Tiers!B4:E9"
                  excerpt="1–99 $49 · 100–249 $46 · 250–499 $42 · 500+ $38"
                />
                .
              </FileAnalysisFindingDetail>
            </FileAnalysisFinding>
            {scanRead ? (
              <FileAnalysisFinding tone="neutral">
                <FileAnalysisFindingTitle>Addendum extends support hours</FileAnalysisFindingTitle>
                <FileAnalysisFindingDetail>
                  Support moves to 24/7 for priority incidents
                  <Source
                    index={5}
                    file="signed-addendum-scan.tiff"
                    location="p. 1"
                    excerpt="Priority 1 incidents receive a response within 1 hour, at any time."
                  />
                  .
                </FileAnalysisFindingDetail>
              </FileAnalysisFinding>
            ) : null}
          </FileAnalysisFindingList>
        )}
      </FileAnalysisFindings>
    </FileAnalysis>
  );
}
`,
    accessibility: [
      "Files and findings are labelled sections; the file list and finding list are labelled by their headings.",
      "Each file is a group named by its file name, with a labelled progressbar while it is read and an alert when it fails.",
      "Retry extraction is a named button described by the file name.",
      "Finding severity is written as text beside the color dot, so it never relies on color alone.",
      "Citation markers show their location as text and open a source preview on focus, hover, or press.",
    ],
  },
  {
    id: "agent-run",
    name: "Agent Run",
    category: "AI",
    icon: Bot,
    description:
      "Agent thinking and tool calls, task progress, approvals, and a final run summary.",
    usage: `"use client";

import { useEffect, useState } from "react";
import {
  AgentRun,
  AgentRunActivity,
  AgentRunApproval,
  AgentRunApprovals,
  AgentRunAside,
  AgentRunDescription,
  AgentRunHeader,
  AgentRunHeading,
  AgentRunLog,
  AgentRunMain,
  AgentRunSectionTitle,
  AgentRunStatus,
  AgentRunSummary,
  AgentRunTaskList,
  AgentRunTasks,
  AgentRunThinking,
  AgentRunTitle,
  AgentRunToolCall,
  type AgentRunVariant,
} from "@/components/uai/agent-run";
import {
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardDetail,
  ApprovalCardDetails,
  ApprovalCardHeader,
  ApprovalCardReject,
} from "@/components/ui/uai/approval-card";
import {
  ResponseStatusActions,
  ResponseStatusDetail,
  ResponseStatusIndicator,
  ResponseStatusLabel,
  ResponseStatusRetry,
  ResponseStatusStop,
} from "@/components/ui/uai/response-status";
import {
  RunSummaryAction,
  RunSummaryActions,
  RunSummaryArtifact,
  RunSummaryArtifactMeta,
  RunSummaryArtifactName,
  RunSummaryArtifacts,
  RunSummaryDescription,
  RunSummaryHeader,
  RunSummaryNextStep,
  RunSummaryNextSteps,
  RunSummaryStat,
  RunSummaryStats,
  RunSummaryTitle,
  RunSummaryWarning,
  RunSummaryWarnings,
} from "@/components/ui/uai/run-summary";
import { TaskListItem, TaskListTitle } from "@/components/ui/uai/task-list";
import { ThinkingActivity, ThinkingContent, ThinkingTrigger } from "@/components/ui/uai/thinking";
import {
  ToolCallContent,
  ToolCallHeader,
  ToolCallInput,
  ToolCallName,
  ToolCallOutput,
  ToolCallStatus,
  ToolCallSummary,
  ToolCallTrigger,
} from "@/components/ui/uai/tool-call";

const APPROVAL_STEP = 4;
const LAST_STEP = 7;
type Decision = "pending" | "submitting" | "approved" | "rejected";

const tools = [
  {
    at: 1,
    name: "read_file",
    summary: "services/billing/package.json",
    input: '{ "path": "services/billing/package.json" }',
    output: '"engines": { "node": "20.x" }',
  },
  {
    at: 2,
    name: "apply_patch",
    summary: "3 files",
    input: "package.json, Dockerfile, .nvmrc",
    output: "Runtime pinned to Node 22.11 in all three files.",
  },
  {
    at: 3,
    name: "run_tests",
    summary: "pnpm test --filter billing",
    input: '{ "command": "pnpm test --filter billing" }',
    output: "312 passed, 0 failed in 48s",
  },
  {
    at: 5,
    name: "deploy",
    summary: "billing-service → staging",
    input: '{ "service": "billing-service", "env": "staging" }',
    output: "Healthy on 3 of 3 instances.",
  },
];

const tasks = [
  { title: "Read the service and its CI config", start: 0, end: 1 },
  { title: "Move the runtime to Node 22", start: 1, end: 3 },
  { title: "Run the billing test suite", start: 3, end: 4 },
  { title: "Deploy to staging", start: 4, end: 6 },
];

export function AgentRunPreview({ variant = "split" }: { variant?: AgentRunVariant }) {
  const [step, setStep] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [decision, setDecision] = useState<Decision>("pending");

  // Advances a fixed script locally and pauses for the approval. Applications stream real run events.
  useEffect(() => {
    if (stopped || step >= LAST_STEP) return;
    if (step === APPROVAL_STEP && decision !== "approved") return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), 900);
    return () => window.clearTimeout(timer);
  }, [step, stopped, decision]);

  useEffect(() => {
    if (decision !== "submitting") return;
    const timer = window.setTimeout(() => setDecision("approved"), 600);
    return () => window.clearTimeout(timer);
  }, [decision]);

  const rejected = decision === "rejected";
  const done = step >= LAST_STEP || rejected;
  const waiting = step === APPROVAL_STEP && !done && decision !== "approved";
  const status = stopped ? "stopped" : done ? "complete" : waiting ? "queued" : "streaming";
  const restart = () => {
    setStopped(false);
    setDecision("pending");
    setStep(0);
  };

  return (
    <AgentRun variant={variant}>
      <AgentRunHeader>
        <AgentRunHeading>
          <AgentRunTitle>Upgrade billing-service to Node 22</AgentRunTitle>
          <AgentRunDescription>Requested by Dana Okafor · branch chore/node-22</AgentRunDescription>
        </AgentRunHeading>
        <AgentRunStatus status={status}>
          <ResponseStatusIndicator />
          <ResponseStatusLabel>
            {status === "queued"
              ? "Waiting for your approval"
              : status === "streaming"
                ? "Working…"
                : status === "complete"
                  ? "Run finished"
                  : "Run stopped"}
          </ResponseStatusLabel>
          <ResponseStatusDetail>
            Step {Math.min(step + 1, LAST_STEP)} of {LAST_STEP}
          </ResponseStatusDetail>
          <ResponseStatusActions>
            <ResponseStatusStop onClick={() => setStopped(true)} />
            <ResponseStatusRetry onClick={restart}>Start over</ResponseStatusRetry>
          </ResponseStatusActions>
        </AgentRunStatus>
      </AgentRunHeader>
      <AgentRunMain>
        <AgentRunActivity>
          <AgentRunSectionTitle>Activity</AgentRunSectionTitle>
          <AgentRunLog>
            <AgentRunThinking
              status={done || stopped ? "complete" : "thinking"}
              defaultOpen={false}
            >
              <ThinkingTrigger
                title={done ? "Planned the upgrade" : "Planning the upgrade"}
                summary="Node 20 reaches end of life in April 2026."
                duration="14s"
              />
              <ThinkingContent>
                <ThinkingActivity type="progress">
                  Checked the runtime pinned in CI
                </ThinkingActivity>
                <ThinkingActivity type="file" path="services/billing/Dockerfile">
                  Found the base image to update
                </ThinkingActivity>
              </ThinkingContent>
            </AgentRunThinking>
            {tools
              .filter((tool) => tool.at <= step && !(rejected && tool.at > APPROVAL_STEP))
              .map((tool) => (
                <AgentRunToolCall
                  key={tool.name}
                  status={step > tool.at ? "success" : stopped ? "error" : "running"}
                >
                  <ToolCallHeader>
                    <ToolCallTrigger>
                      <ToolCallName>{tool.name}</ToolCallName>
                      <ToolCallSummary>{tool.summary}</ToolCallSummary>
                    </ToolCallTrigger>
                    <ToolCallStatus />
                  </ToolCallHeader>
                  <ToolCallContent>
                    <ToolCallInput>{tool.input}</ToolCallInput>
                    <ToolCallOutput>{tool.output}</ToolCallOutput>
                  </ToolCallContent>
                </AgentRunToolCall>
              ))}
          </AgentRunLog>
        </AgentRunActivity>
        {done && !stopped ? (
          <AgentRunSummary outcome={rejected ? "partial" : "success"}>
            <RunSummaryHeader>
              <RunSummaryTitle>
                {rejected ? "Upgraded, not deployed" : "Upgraded and deployed"}
              </RunSummaryTitle>
              <RunSummaryDescription>
                {rejected
                  ? "The change is ready on chore/node-22. Staging still runs Node 20."
                  : "Staging runs Node 22 and the billing suite passes."}
              </RunSummaryDescription>
            </RunSummaryHeader>
            <RunSummaryStats>
              <RunSummaryStat label="Duration">3m 12s</RunSummaryStat>
              <RunSummaryStat label="Tool calls">{rejected ? 3 : 4}</RunSummaryStat>
              <RunSummaryStat label="Tests">312 passed</RunSummaryStat>
            </RunSummaryStats>
            <RunSummaryArtifacts>
              <RunSummaryArtifact change="modified">
                <RunSummaryArtifactName>services/billing/package.json</RunSummaryArtifactName>
                <RunSummaryArtifactMeta>+1 −1</RunSummaryArtifactMeta>
              </RunSummaryArtifact>
              <RunSummaryArtifact change="modified">
                <RunSummaryArtifactName>services/billing/Dockerfile</RunSummaryArtifactName>
                <RunSummaryArtifactMeta>+1 −1</RunSummaryArtifactMeta>
              </RunSummaryArtifact>
              <RunSummaryArtifact change="added">
                <RunSummaryArtifactName>services/billing/.nvmrc</RunSummaryArtifactName>
                <RunSummaryArtifactMeta>+1</RunSummaryArtifactMeta>
              </RunSummaryArtifact>
            </RunSummaryArtifacts>
            {rejected ? (
              <RunSummaryWarnings>
                <RunSummaryWarning>You declined the staging deploy.</RunSummaryWarning>
              </RunSummaryWarnings>
            ) : null}
            <RunSummaryNextSteps>
              <RunSummaryNextStep>Open a pull request for review.</RunSummaryNextStep>
              <RunSummaryNextStep>Schedule the production deploy.</RunSummaryNextStep>
            </RunSummaryNextSteps>
            <RunSummaryActions>
              <RunSummaryAction onClick={restart}>Run again</RunSummaryAction>
              <RunSummaryAction primary>Open pull request</RunSummaryAction>
            </RunSummaryActions>
          </AgentRunSummary>
        ) : null}
      </AgentRunMain>
      <AgentRunAside>
        <AgentRunTasks>
          <AgentRunSectionTitle>Tasks</AgentRunSectionTitle>
          <AgentRunTaskList>
            {tasks.map((task) => {
              const complete = task.end <= step || (task.end <= APPROVAL_STEP && done);
              const skipped = rejected && task.start >= APPROVAL_STEP;
              return (
                <TaskListItem
                  key={task.title}
                  status={
                    complete
                      ? "complete"
                      : task.start <= step && !stopped && !skipped
                        ? "active"
                        : "pending"
                  }
                  statusLabel={skipped ? "Skipped" : undefined}
                >
                  <TaskListTitle>{task.title}</TaskListTitle>
                </TaskListItem>
              );
            })}
          </AgentRunTaskList>
        </AgentRunTasks>
        {step >= APPROVAL_STEP ? (
          <AgentRunApprovals>
            <AgentRunSectionTitle>Approvals</AgentRunSectionTitle>
            {decision === "submitting" ? (
              <AgentRunApproval risk="medium" status="submitting" pendingDecision="approved">
                <ApprovalHeader />
              </AgentRunApproval>
            ) : (
              <AgentRunApproval risk="medium" status={decision === "pending" ? "ready" : decision}>
                <ApprovalHeader />
                <ApprovalCardDetails>
                  <ApprovalCardDetail label="Service">billing-service</ApprovalCardDetail>
                  <ApprovalCardDetail label="Environment">staging</ApprovalCardDetail>
                </ApprovalCardDetails>
                <ApprovalCardActions>
                  <ApprovalCardReject onClick={() => setDecision("rejected")} />
                  <ApprovalCardApprove onClick={() => setDecision("submitting")}>
                    Deploy
                  </ApprovalCardApprove>
                </ApprovalCardActions>
              </AgentRunApproval>
            )}
          </AgentRunApprovals>
        ) : null}
      </AgentRunAside>
    </AgentRun>
  );
}

function ApprovalHeader() {
  return (
    <ApprovalCardHeader
      title="Deploy billing-service to staging"
      description="Restarts 3 staging instances. Invoices are paused for about 2 minutes."
    />
  );
}
`,
    accessibility: [
      'Activity is a role="log" region labelled by its heading, so new thinking and tool steps are announced politely.',
      "Tool calls are disclosures with aria-expanded and aria-controls; their status is spoken through a status region.",
      'Tasks are an ordered list; the active task carries aria-current="step".',
      "Approval cards are sections labelled by their titles, announce decision changes politely, and use native buttons.",
      "The run summary is a section labelled by its title, with stats as a description list and changed files that state their change in text.",
    ],
  },
];
