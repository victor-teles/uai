import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PROGRESS_SUMMARY_VARIANTS,
  ProgressSummary,
  ProgressSummaryActions,
  ProgressSummaryBar,
  ProgressSummaryCancel,
  ProgressSummaryHeader,
  type ProgressSummaryProps,
  ProgressSummaryStat,
  ProgressSummaryStatLabel,
  ProgressSummaryStats,
  ProgressSummaryStatusText,
  ProgressSummaryStatValue,
  ProgressSummaryTitle,
  ProgressSummaryValue,
} from "@/registry/uai/components/progress-summary";

function Fixture({ onCancel, ...props }: ProgressSummaryProps & { onCancel?: () => void }) {
  return (
    <ProgressSummary {...props}>
      <ProgressSummaryHeader>
        <ProgressSummaryTitle>Importing contacts</ProgressSummaryTitle>
        <ProgressSummaryStatusText />
      </ProgressSummaryHeader>
      <ProgressSummaryValue />
      <ProgressSummaryBar />
      <ProgressSummaryStats>
        <ProgressSummaryStat>
          <ProgressSummaryStatLabel>Elapsed</ProgressSummaryStatLabel>
          <ProgressSummaryStatValue>1m 24s</ProgressSummaryStatValue>
        </ProgressSummaryStat>
      </ProgressSummaryStats>
      <ProgressSummaryActions>
        <ProgressSummaryCancel onClick={onCancel} />
      </ProgressSummaryActions>
    </ProgressSummary>
  );
}

test("exposes a labelled progressbar with clamped values and readable text", () => {
  const view = render(<Fixture value={60} max={240} />);
  const bar = screen.getByRole("progressbar", { name: "Importing contacts" });
  expect(bar.getAttribute("aria-valuenow")).toBe("60");
  expect(bar.getAttribute("aria-valuemax")).toBe("240");
  expect(bar.getAttribute("aria-valuetext")).toBe("25% · In progress");
  expect(screen.getByText("25%")).toBeTruthy();
  expect(screen.getByRole("region", { name: "Importing contacts" })).toBeTruthy();
  view.rerender(<Fixture value={500} max={240} />);
  expect(bar.getAttribute("aria-valuenow")).toBe("240");
  view.rerender(<Fixture />);
  expect(bar.hasAttribute("aria-valuenow")).toBe(false);
  expect(bar.getAttribute("aria-valuetext")).toBe("In progress");
});

test("pairs stats and cancels from the keyboard while running", async () => {
  const user = userEvent.setup();
  const cancel = mock(() => {});
  render(<Fixture value={10} onCancel={cancel} />);
  expect(screen.getByText("Elapsed").tagName).toBe("DT");
  expect(screen.getByText("1m 24s").tagName).toBe("DD");
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancel" }));
  await user.keyboard("{Enter}");
  expect(cancel).toHaveBeenCalledTimes(1);
});

test("announces terminal states and disables cancellation", () => {
  const view = render(<Fixture value={100} status="complete" />);
  expect(screen.getByRole("status").textContent).toBe("Complete");
  expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(true);
  view.rerender(<Fixture value={40} status="error" />);
  expect(screen.getByRole("status").textContent).toBe("Failed");
  view.rerender(<Fixture value={40} status="paused" />);
  expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(
    false,
  );
});

test("renders every variant and guards compound children", () => {
  for (const variant of PROGRESS_SUMMARY_VARIANTS) {
    const view = render(<Fixture variant={variant} value={5} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ProgressSummaryBar />)).toThrow(
    "ProgressSummaryBar must be used within ProgressSummary",
  );
});
