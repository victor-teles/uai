import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AttachmentDetails,
  AttachmentError,
  AttachmentName,
  AttachmentProgress,
  AttachmentRetry,
} from "@/components/ui/uai/attachment";
import { CitationPopover, CitationTitle, CitationTrigger } from "@/components/ui/uai/citation";
import { ProgressSummaryBar, ProgressSummaryTitle } from "@/components/ui/uai/progress-summary";
import {
  FILE_ANALYSIS_VARIANTS,
  FileAnalysis,
  FileAnalysisCitation,
  FileAnalysisExtraction,
  FileAnalysisFile,
  FileAnalysisFileList,
  FileAnalysisFiles,
  FileAnalysisFinding,
  FileAnalysisFindingList,
  FileAnalysisFindings,
  FileAnalysisFindingTitle,
  FileAnalysisHeader,
  FileAnalysisPanelTitle,
  FileAnalysisTitle,
  type FileAnalysisVariant,
} from "@/registry/uai/blocks/file-analysis";

function Fixture({ variant, onRetry }: { variant?: FileAnalysisVariant; onRetry?: () => void }) {
  return (
    <FileAnalysis variant={variant}>
      <FileAnalysisHeader>
        <FileAnalysisTitle>Renewal review</FileAnalysisTitle>
      </FileAnalysisHeader>
      <FileAnalysisFiles>
        <FileAnalysisPanelTitle>Files</FileAnalysisPanelTitle>
        <FileAnalysisExtraction value={1} max={2} status="error">
          <ProgressSummaryTitle>Extraction</ProgressSummaryTitle>
          <ProgressSummaryBar />
        </FileAnalysisExtraction>
        <FileAnalysisFileList>
          <FileAnalysisFile mimeType="application/pdf" status="uploading" progress={50}>
            <AttachmentDetails>
              <AttachmentName>msa.pdf</AttachmentName>
              <AttachmentProgress />
            </AttachmentDetails>
          </FileAnalysisFile>
          <FileAnalysisFile mimeType="image/tiff" status="error">
            <AttachmentDetails>
              <AttachmentName>scan.tiff</AttachmentName>
              <AttachmentError>Text unreadable</AttachmentError>
            </AttachmentDetails>
            <AttachmentRetry aria-label="Retry extraction" onClick={onRetry} />
          </FileAnalysisFile>
        </FileAnalysisFileList>
      </FileAnalysisFiles>
      <FileAnalysisFindings>
        <FileAnalysisPanelTitle>Findings</FileAnalysisPanelTitle>
        <FileAnalysisFindingList>
          <FileAnalysisFinding tone="critical">
            <FileAnalysisFindingTitle>Auto-renews for 24 months</FileAnalysisFindingTitle>
            <FileAnalysisCitation index={1}>
              <CitationTrigger>p. 14</CitationTrigger>
              <CitationPopover>
                <CitationTitle>Section 11.2</CitationTitle>
              </CitationPopover>
            </FileAnalysisCitation>
          </FileAnalysisFinding>
        </FileAnalysisFindingList>
      </FileAnalysisFindings>
    </FileAnalysis>
  );
}

test("labels files, extraction, and findings", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Renewal review" })).toBeTruthy();
  expect(screen.getByRole("list", { name: "Files" })).toBeTruthy();
  expect(screen.getByRole("list", { name: "Findings" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "scan.tiff" })).toBeTruthy();
  expect(screen.getByRole("progressbar", { name: "msa.pdf" }).getAttribute("aria-valuenow")).toBe(
    "50",
  );
  expect(screen.getByRole("progressbar", { name: "Extraction" })).toBeTruthy();
  expect(screen.getByRole("alert").textContent).toBe("Text unreadable");
  expect(screen.getByText("Risk")).toBeTruthy();
});

test("retries a failed file with the keyboard and previews a citation", async () => {
  const user = userEvent.setup();
  const retry = mock(() => {});
  render(<Fixture onRetry={retry} />);
  screen.getByRole("button", { name: "Retry extraction" }).focus();
  await user.keyboard("{Enter}");
  expect(retry).toHaveBeenCalledTimes(1);
  const marker = screen.getByRole("button", { name: "p. 14" });
  await user.click(marker);
  expect(marker.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("group", { name: "Section 11.2" })).toBeTruthy();
});

test("maps each layout onto its parts and guards them", () => {
  const attachments = { split: "row", stacked: "card", compact: "chip" } as const;
  for (const variant of FILE_ANALYSIS_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(screen.getByRole("group", { name: "scan.tiff" }).getAttribute("data-variant")).toBe(
      attachments[variant],
    );
    view.unmount();
  }
  expect(() => render(<FileAnalysisFindings />)).toThrow(
    "FileAnalysisFindings must be used within FileAnalysis",
  );
  expect(() => render(<FileAnalysisPanelTitle>Files</FileAnalysisPanelTitle>)).toThrow(
    "FileAnalysisPanelTitle must be used within a FileAnalysis panel",
  );
});
