import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardConfirmation,
  ApprovalCardDetail,
  ApprovalCardDetails,
  ApprovalCardError,
  ApprovalCardHeader,
  ApprovalCardReject,
} from "@/registry/uai/components/approval-card";

test("keeps critical confirmation across composed approval regions", async () => {
  const user = userEvent.setup();
  const onApprove = mock(() => {});

  render(
    <ApprovalCard
      risk="critical"
      variant="detailed"
      confirmation={{ phrase: "support-search-prod" }}
    >
      <ApprovalCardHeader
        title="Delete the production search index?"
        description="This cannot be undone."
      />
      <ApprovalCardDetails>
        <ApprovalCardDetail label="Affected resource">support-search-prod</ApprovalCardDetail>
      </ApprovalCardDetails>
      <ApprovalCardConfirmation />
      <ApprovalCardActions>
        <ApprovalCardReject>Cancel</ApprovalCardReject>
        <ApprovalCardApprove disabled={false} onClick={onApprove}>
          Delete index
        </ApprovalCardApprove>
      </ApprovalCardActions>
    </ApprovalCard>,
  );

  const approve = screen.getByRole("button", { name: "Delete index" }) as HTMLButtonElement;
  expect(approve.disabled).toBe(true);

  await user.type(screen.getByRole("textbox"), "support-search-prod");
  expect(approve.disabled).toBe(false);
  await user.click(approve);

  expect(onApprove).toHaveBeenCalledTimes(1);
});

test("composes recoverable errors and hides actions after a terminal decision", () => {
  const { rerender } = render(
    <ApprovalCard status="error">
      <ApprovalCardHeader title="Deploy the policy?" />
      <ApprovalCardError>The approval service did not respond.</ApprovalCardError>
      <ApprovalCardActions>
        <ApprovalCardReject />
        <ApprovalCardApprove>Try again</ApprovalCardApprove>
      </ApprovalCardActions>
    </ApprovalCard>,
  );

  expect(screen.getByRole("alert").textContent).toContain("The approval service did not respond.");
  expect((screen.getByRole("button", { name: "Try again" }) as HTMLButtonElement).disabled).toBe(
    false,
  );

  rerender(
    <ApprovalCard status="approved">
      <ApprovalCardHeader title="Deploy the policy?" />
      <ApprovalCardActions>
        <ApprovalCardReject />
        <ApprovalCardApprove />
      </ApprovalCardActions>
    </ApprovalCard>,
  );

  expect(screen.queryByRole("button")).toBeNull();
});

test("compound approval children require their root", () => {
  expect(() => render(<ApprovalCardConfirmation />)).toThrow(
    "ApprovalCardConfirmation must be used within ApprovalCard",
  );
});
