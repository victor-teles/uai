import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardHeader,
} from "@/components/ui/uai/approval-card";
import { MetricCardLabel, MetricCardValue } from "@/components/ui/uai/metric-card";
import {
  APPROVAL_QUEUE_VARIANTS,
  ApprovalQueue,
  ApprovalQueueGroup,
  ApprovalQueueGroupBy,
  ApprovalQueueGroupByOption,
  ApprovalQueueGroupCount,
  ApprovalQueueGroupHeader,
  ApprovalQueueGroups,
  ApprovalQueueGroupTitle,
  ApprovalQueueItem,
  ApprovalQueueItems,
  ApprovalQueueMetric,
  ApprovalQueueSummary,
  ApprovalQueueTitle,
  type ApprovalQueueVariant,
} from "@/registry/uai/blocks/approval-queue";

function Fixture({
  variant,
  onGroupBy,
}: {
  variant?: ApprovalQueueVariant;
  onGroupBy?: (value: string) => void;
}) {
  const [approved, setApproved] = useState(false);
  return (
    <ApprovalQueue variant={variant}>
      <ApprovalQueueTitle>Approvals</ApprovalQueueTitle>
      <ApprovalQueueGroupBy defaultValue="risk" onValueChange={onGroupBy}>
        <ApprovalQueueGroupByOption value="risk">Risk</ApprovalQueueGroupByOption>
        <ApprovalQueueGroupByOption value="age">Age</ApprovalQueueGroupByOption>
      </ApprovalQueueGroupBy>
      <ApprovalQueueSummary>
        <ApprovalQueueMetric>
          <MetricCardLabel>Waiting</MetricCardLabel>
          <MetricCardValue>{approved ? 0 : 1}</MetricCardValue>
        </ApprovalQueueMetric>
      </ApprovalQueueSummary>
      <ApprovalQueueGroups>
        <ApprovalQueueGroup>
          <ApprovalQueueGroupHeader>
            <ApprovalQueueGroupTitle>High risk</ApprovalQueueGroupTitle>
            <ApprovalQueueGroupCount>1</ApprovalQueueGroupCount>
          </ApprovalQueueGroupHeader>
          <ApprovalQueueItems>
            <ApprovalQueueItem risk="high" status={approved ? "approved" : "ready"}>
              <ApprovalCardHeader title="Refund $1,240 to Pallet & Co" />
              <ApprovalCardActions>
                <ApprovalCardApprove onClick={() => setApproved(true)} />
              </ApprovalCardActions>
            </ApprovalQueueItem>
          </ApprovalQueueItems>
        </ApprovalQueueGroup>
      </ApprovalQueueGroups>
    </ApprovalQueue>
  );
}

test("chooses the grouping key with a radio group", async () => {
  const user = userEvent.setup();
  const groupBy = mock((_value: string) => {});
  render(<Fixture onGroupBy={groupBy} />);
  const group = screen.getByRole("radiogroup", { name: "Group by" });
  expect(group.tagName).toBe("FIELDSET");
  const risk = screen.getByRole("radio", { name: "Risk" });
  const age = screen.getByRole("radio", { name: "Age" });
  expect(risk.getAttribute("aria-checked")).toBe("true");
  expect(group.contains(risk) && group.contains(age)).toBe(true);
  await user.click(age);
  expect(groupBy).toHaveBeenCalledWith("age");
  expect(age.getAttribute("aria-checked")).toBe("true");
  await user.keyboard(" ");
  expect(age.getAttribute("aria-checked")).toBe("true");
  await user.click(screen.getByText("Risk"));
  expect(groupBy).toHaveBeenLastCalledWith("risk");
  expect(risk.getAttribute("aria-checked")).toBe("true");
});

test("labels groups and their decision lists and settles decided requests", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "High risk" })).toBeTruthy();
  expect(screen.getByRole("list", { name: "High risk" })).toBeTruthy();
  const approve = screen.getByRole("button", { name: "Approve" });
  approve.focus();
  await user.keyboard("{Enter}");
  expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
  expect(screen.getByText("Approved")).toBeTruthy();
  expect(screen.getByText("0")).toBeTruthy();
});

test("renders every layout variant and guards its parts", () => {
  for (const variant of APPROVAL_QUEUE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ApprovalQueueGroupTitle>High risk</ApprovalQueueGroupTitle>)).toThrow(
    "ApprovalQueueGroupTitle must be used within ApprovalQueueGroup",
  );
  expect(() => render(<ApprovalQueueGroups />)).toThrow(
    "ApprovalQueueGroups must be used within ApprovalQueue",
  );
});
