"use client";

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
