"use client";

import { useEffect, useState } from "react";
import {
  ImportWorkflow,
  ImportWorkflowAction,
  ImportWorkflowBody,
  ImportWorkflowCell,
  ImportWorkflowDescription,
  ImportWorkflowFooter,
  ImportWorkflowHeader,
  ImportWorkflowHeaderCell,
  ImportWorkflowHeading,
  ImportWorkflowIssues,
  ImportWorkflowMapping,
  ImportWorkflowMappingRow,
  ImportWorkflowMappingSample,
  ImportWorkflowMappingSource,
  ImportWorkflowMappingTarget,
  ImportWorkflowPanel,
  ImportWorkflowPanelTitle,
  ImportWorkflowProgress,
  ImportWorkflowStep,
  ImportWorkflowSteps,
  ImportWorkflowTable,
  ImportWorkflowTableRow,
  ImportWorkflowTitle,
  ImportWorkflowUpload,
  type ImportWorkflowVariant,
} from "@/components/uai/import-workflow";
import {
  FileUploadDropzone,
  FileUploadInput,
  FileUploadItem,
  FileUploadList,
  FileUploadRemove,
  FileUploadTrigger,
} from "@/components/ui/uai/file-upload";
import {
  ProgressSummaryBar,
  ProgressSummaryHeader,
  ProgressSummaryStat,
  ProgressSummaryStatLabel,
  ProgressSummaryStats,
  ProgressSummaryStatusText,
  ProgressSummaryStatValue,
  ProgressSummaryTitle,
  ProgressSummaryValue,
} from "@/components/ui/uai/progress-summary";
import {
  StatusBannerContent,
  StatusBannerDescription,
  StatusBannerIcon,
  StatusBannerTitle,
} from "@/components/ui/uai/status-banner";
import { StepIndicatorDescription, StepIndicatorTitle } from "@/components/ui/uai/step-indicator";

const steps = [
  { value: "file", title: "Choose file", description: "CSV up to 10 MB" },
  { value: "mapping", title: "Map columns", description: "Match CRM fields" },
  { value: "review", title: "Review", description: "Fix flagged rows" },
  { value: "import", title: "Import", description: "Write contacts" },
];
const columns = [
  { source: "email_address", sample: "ana@fieldnote.io", target: "email" },
  { source: "full_name", sample: "Ana Duarte", target: "name" },
  { source: "company", sample: "Fieldnote Labs", target: "account" },
  { source: "fax", sample: "+351 21 555 0100", target: "" },
];
const total = 2418;

export function ImportWorkflowPreview({ variant = "wizard" }: { variant?: ImportWorkflowVariant }) {
  const [step, setStep] = useState("file");
  const [file, setFile] = useState<string | null>("contacts-september.csv");
  const [mapping, setMapping] = useState(columns.map((column) => column.target));
  const [imported, setImported] = useState(0);
  const index = steps.findIndex((item) => item.value === step);
  const go = (offset: number) => setStep(steps[index + offset]?.value ?? "file");

  useEffect(() => {
    if (step !== "import") return;
    setImported(0);
    const timer = window.setInterval(() => {
      setImported((value) => Math.min(value + 403, total - 3));
    }, 400);
    return () => window.clearInterval(timer);
  }, [step]);
  const done = imported === total - 3;

  return (
    <ImportWorkflow variant={variant} value={step} onValueChange={setStep}>
      <ImportWorkflowHeader>
        <ImportWorkflowHeading>
          <ImportWorkflowTitle>Import contacts</ImportWorkflowTitle>
          <ImportWorkflowDescription>
            Add people to the Sales workspace from a spreadsheet export.
          </ImportWorkflowDescription>
        </ImportWorkflowHeading>
      </ImportWorkflowHeader>
      <ImportWorkflowBody>
        <ImportWorkflowSteps>
          {steps.map((item, position) => (
            <ImportWorkflowStep
              key={item.value}
              value={item.value}
              status={position < index ? "complete" : "upcoming"}
            >
              <StepIndicatorTitle>{item.title}</StepIndicatorTitle>
              {variant === "compact" ? null : (
                <StepIndicatorDescription>{item.description}</StepIndicatorDescription>
              )}
            </ImportWorkflowStep>
          ))}
        </ImportWorkflowSteps>
        <ImportWorkflowPanel value="file">
          <ImportWorkflowPanelTitle>Choose a CSV file</ImportWorkflowPanelTitle>
          <ImportWorkflowUpload
            accept=".csv"
            maxSize={10_000_000}
            maxFiles={1}
            multiple={false}
            fileCount={file ? 1 : 0}
            onFilesAccepted={(files) => setFile(files[0]?.name ?? null)}
          >
            <FileUploadDropzone>
              <span>Drop a .csv file here, or</span>
              <FileUploadTrigger>Choose file</FileUploadTrigger>
              <FileUploadInput />
            </FileUploadDropzone>
            {file ? (
              <FileUploadList>
                <FileUploadItem status="complete">
                  <strong>{file}</strong>
                  <FileUploadRemove onClick={() => setFile(null)} />
                </FileUploadItem>
              </FileUploadList>
            ) : null}
          </ImportWorkflowUpload>
        </ImportWorkflowPanel>
        <ImportWorkflowPanel value="mapping">
          <ImportWorkflowPanelTitle>Map columns to contact fields</ImportWorkflowPanelTitle>
          <ImportWorkflowMapping>
            {columns.map((column, position) => (
              <ImportWorkflowMappingRow key={column.source}>
                <ImportWorkflowMappingSource>
                  {column.source}
                  <ImportWorkflowMappingSample>{column.sample}</ImportWorkflowMappingSample>
                </ImportWorkflowMappingSource>
                <ImportWorkflowMappingTarget
                  value={mapping[position]}
                  onChange={(event) =>
                    setMapping((current) =>
                      current.map((target, item) =>
                        item === position ? event.target.value : target,
                      ),
                    )
                  }
                >
                  <option value="">Skip this column</option>
                  <option value="email">Email</option>
                  <option value="name">Name</option>
                  <option value="account">Account</option>
                  <option value="phone">Phone</option>
                </ImportWorkflowMappingTarget>
              </ImportWorkflowMappingRow>
            ))}
          </ImportWorkflowMapping>
        </ImportWorkflowPanel>
        <ImportWorkflowPanel value="review">
          <ImportWorkflowPanelTitle>Review before importing</ImportWorkflowPanelTitle>
          <ImportWorkflowIssues tone="warning">
            <StatusBannerIcon />
            <StatusBannerContent>
              <StatusBannerTitle>
                3 of {total.toLocaleString("en-US")} rows will be skipped
              </StatusBannerTitle>
              <StatusBannerDescription>
                Their email addresses are missing or malformed. Everything else is ready.
              </StatusBannerDescription>
            </StatusBannerContent>
          </ImportWorkflowIssues>
          <ImportWorkflowTable aria-label="First rows of contacts-september.csv">
            <thead>
              <tr>
                <ImportWorkflowHeaderCell>Email</ImportWorkflowHeaderCell>
                <ImportWorkflowHeaderCell>Name</ImportWorkflowHeaderCell>
                <ImportWorkflowHeaderCell>Account</ImportWorkflowHeaderCell>
              </tr>
            </thead>
            <tbody>
              <ImportWorkflowTableRow>
                <ImportWorkflowCell>ana@fieldnote.io</ImportWorkflowCell>
                <ImportWorkflowCell>Ana Duarte</ImportWorkflowCell>
                <ImportWorkflowCell>Fieldnote Labs</ImportWorkflowCell>
              </ImportWorkflowTableRow>
              <ImportWorkflowTableRow>
                <ImportWorkflowCell tone="error">
                  jonas.orbit-dental.com · Missing @
                </ImportWorkflowCell>
                <ImportWorkflowCell>Jonas Berg</ImportWorkflowCell>
                <ImportWorkflowCell>Orbit Dental</ImportWorkflowCell>
              </ImportWorkflowTableRow>
              <ImportWorkflowTableRow>
                <ImportWorkflowCell>mei@kestrel.studio</ImportWorkflowCell>
                <ImportWorkflowCell>Mei Tanaka</ImportWorkflowCell>
                <ImportWorkflowCell>Kestrel Studio</ImportWorkflowCell>
              </ImportWorkflowTableRow>
            </tbody>
          </ImportWorkflowTable>
        </ImportWorkflowPanel>
        <ImportWorkflowPanel value="import">
          <ImportWorkflowPanelTitle>
            {done ? "Import complete" : "Importing contacts"}
          </ImportWorkflowPanelTitle>
          <ImportWorkflowProgress
            value={imported}
            max={total - 3}
            status={done ? "complete" : "running"}
          >
            <ProgressSummaryHeader>
              <ProgressSummaryTitle>contacts-september.csv</ProgressSummaryTitle>
              <ProgressSummaryStatusText />
            </ProgressSummaryHeader>
            <ProgressSummaryValue />
            <ProgressSummaryBar />
            <ProgressSummaryStats>
              <ProgressSummaryStat>
                <ProgressSummaryStatLabel>Imported</ProgressSummaryStatLabel>
                <ProgressSummaryStatValue>
                  {imported.toLocaleString("en-US")}
                </ProgressSummaryStatValue>
              </ProgressSummaryStat>
              <ProgressSummaryStat>
                <ProgressSummaryStatLabel>Skipped</ProgressSummaryStatLabel>
                <ProgressSummaryStatValue>3</ProgressSummaryStatValue>
              </ProgressSummaryStat>
            </ProgressSummaryStats>
          </ImportWorkflowProgress>
        </ImportWorkflowPanel>
      </ImportWorkflowBody>
      <ImportWorkflowFooter>
        {index > 0 && step !== "import" ? (
          <ImportWorkflowAction onClick={() => go(-1)}>Back</ImportWorkflowAction>
        ) : null}
        {step === "import" ? (
          <ImportWorkflowAction emphasis="primary" disabled={!done} onClick={() => go(-3)}>
            Import another file
          </ImportWorkflowAction>
        ) : (
          <ImportWorkflowAction emphasis="primary" disabled={!file} onClick={() => go(1)}>
            {step === "review" ? "Import 2,415 contacts" : "Continue"}
          </ImportWorkflowAction>
        )}
      </ImportWorkflowFooter>
    </ImportWorkflow>
  );
}
