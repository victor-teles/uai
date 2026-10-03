"use client";

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
                ? `Reading ${files[working]?.name}`
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
