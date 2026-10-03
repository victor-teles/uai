import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardHeader,
} from "@/components/ui/uai/approval-card";
import { ResponseStatusLabel } from "@/components/ui/uai/response-status";
import { RunSummaryHeader, RunSummaryTitle } from "@/components/ui/uai/run-summary";
import { TaskListItem, TaskListTitle } from "@/components/ui/uai/task-list";
import { ThinkingTrigger } from "@/components/ui/uai/thinking";
import {
  ToolCallContent,
  ToolCallHeader,
  ToolCallName,
  ToolCallOutput,
  ToolCallTrigger,
} from "@/components/ui/uai/tool-call";
import {
  AGENT_RUN_VARIANTS,
  AgentRun,
  AgentRunActivity,
  AgentRunApproval,
  AgentRunApprovals,
  AgentRunAside,
  AgentRunHeader,
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
} from "@/registry/uai/blocks/agent-run";

function Fixture({ variant, onApprove }: { variant?: AgentRunVariant; onApprove?: () => void }) {
  return (
    <AgentRun variant={variant}>
      <AgentRunHeader>
        <AgentRunTitle>Upgrade to Node 22</AgentRunTitle>
        <AgentRunStatus status="queued">
          <ResponseStatusLabel>Waiting for your approval</ResponseStatusLabel>
        </AgentRunStatus>
      </AgentRunHeader>
      <AgentRunMain>
        <AgentRunActivity>
          <AgentRunSectionTitle>Activity</AgentRunSectionTitle>
          <AgentRunLog>
            <AgentRunThinking status="complete" defaultOpen={false}>
              <ThinkingTrigger title="Planned the upgrade" />
            </AgentRunThinking>
            <AgentRunToolCall status="success">
              <ToolCallHeader>
                <ToolCallTrigger>
                  <ToolCallName>run_tests</ToolCallName>
                </ToolCallTrigger>
              </ToolCallHeader>
              <ToolCallContent>
                <ToolCallOutput>312 passed</ToolCallOutput>
              </ToolCallContent>
            </AgentRunToolCall>
          </AgentRunLog>
        </AgentRunActivity>
        <AgentRunSummary>
          <RunSummaryHeader>
            <RunSummaryTitle>Upgraded and deployed</RunSummaryTitle>
          </RunSummaryHeader>
        </AgentRunSummary>
      </AgentRunMain>
      <AgentRunAside>
        <AgentRunTasks>
          <AgentRunSectionTitle>Tasks</AgentRunSectionTitle>
          <AgentRunTaskList>
            <TaskListItem status="active">
              <TaskListTitle>Deploy to staging</TaskListTitle>
            </TaskListItem>
          </AgentRunTaskList>
        </AgentRunTasks>
        <AgentRunApprovals>
          <AgentRunSectionTitle>Approvals</AgentRunSectionTitle>
          <AgentRunApproval risk="medium">
            <ApprovalCardHeader title="Deploy billing-service to staging" />
            <ApprovalCardActions>
              <ApprovalCardApprove onClick={onApprove}>Deploy</ApprovalCardApprove>
            </ApprovalCardActions>
          </AgentRunApproval>
        </AgentRunApprovals>
      </AgentRunAside>
    </AgentRun>
  );
}

test("labels the run, its activity log, tasks, approvals, and summary", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Upgrade to Node 22" })).toBeTruthy();
  const log = screen.getByRole("log", { name: "Activity" });
  expect(log.getAttribute("aria-live")).toBe("polite");
  for (const name of ["Activity", "Tasks", "Approvals", "Upgraded and deployed"]) {
    expect(screen.getByRole("region", { name })).toBeTruthy();
  }
  expect(screen.getByRole("region", { name: "Deploy billing-service to staging" })).toBeTruthy();
  expect(screen.getByText("Waiting for your approval").getAttribute("role")).toBe("status");
});

test("expands a tool call and approves with the keyboard", async () => {
  const user = userEvent.setup();
  const approve = mock(() => {});
  render(<Fixture onApprove={approve} />);
  const tool = screen.getByRole("button", { name: /run_tests/ });
  expect(screen.getByText("312 passed").closest("[hidden]")).not.toBeNull();
  tool.focus();
  await user.keyboard("{Enter}");
  expect(tool.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText("312 passed").closest("[hidden]")).toBeNull();
  screen.getByRole("button", { name: "Deploy" }).focus();
  await user.keyboard(" ");
  expect(approve).toHaveBeenCalledTimes(1);
});

test("maps each layout onto its parts and guards them", () => {
  const tools = { split: "card", stacked: "card", compact: "compact" } as const;
  const summaries = { split: "card", stacked: "card", compact: "compact" } as const;
  for (const variant of AGENT_RUN_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(
      view.container.querySelector("[data-status='success']")?.getAttribute("data-variant"),
    ).toBe(tools[variant]);
    expect(
      screen.getByRole("region", { name: "Upgraded and deployed" }).getAttribute("data-variant"),
    ).toBe(summaries[variant]);
    view.unmount();
  }
  expect(() => render(<AgentRunLog />)).toThrow("AgentRunLog must be used within AgentRun");
  expect(() => render(<AgentRunSectionTitle>Tasks</AgentRunSectionTitle>)).toThrow(
    "AgentRunSectionTitle must be used within an AgentRun section",
  );
});
