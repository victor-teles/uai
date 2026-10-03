import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  RUN_SUMMARY_VARIANTS,
  RunSummary,
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
  type RunSummaryProps,
  RunSummaryStat,
  RunSummaryStats,
  RunSummaryTitle,
  RunSummaryWarning,
  RunSummaryWarnings,
} from "@/registry/uai/components/run-summary";

function Fixture({ onOpen, ...props }: RunSummaryProps & { onOpen?: () => void }) {
  return (
    <RunSummary {...props}>
      <RunSummaryHeader>
        <RunSummaryTitle>Migrated billing emails</RunSummaryTitle>
        <RunSummaryDescription>Finished in 4m 12s</RunSummaryDescription>
      </RunSummaryHeader>
      <RunSummaryStats>
        <RunSummaryStat label="Files changed">2</RunSummaryStat>
      </RunSummaryStats>
      <RunSummaryArtifacts>
        <RunSummaryArtifact change="added">
          <RunSummaryArtifactName>emails/receipt.tsx</RunSummaryArtifactName>
          <RunSummaryArtifactMeta>+128</RunSummaryArtifactMeta>
        </RunSummaryArtifact>
        <RunSummaryArtifact change="deleted">
          <RunSummaryArtifactName>templates/receipt.html</RunSummaryArtifactName>
        </RunSummaryArtifact>
      </RunSummaryArtifacts>
      <RunSummaryWarnings>
        <RunSummaryWarning>Snapshot tests were updated, not reviewed.</RunSummaryWarning>
      </RunSummaryWarnings>
      <RunSummaryNextSteps label="Before merging">
        <RunSummaryNextStep>Review the receipt snapshots.</RunSummaryNextStep>
      </RunSummaryNextSteps>
      <RunSummaryActions>
        <RunSummaryAction primary onClick={onOpen}>
          Open pull request
        </RunSummaryAction>
      </RunSummaryActions>
    </RunSummary>
  );
}

test("labels the summary, outcome, and each list", () => {
  render(<Fixture outcome="partial" />);
  const region = screen.getByRole("region", { name: "Migrated billing emails" });
  expect(region.getAttribute("data-outcome")).toBe("partial");
  expect(screen.getByText("Completed with warnings")).toBeTruthy();
  expect(screen.getByRole("list", { name: "Changed files" }).children.length).toBe(2);
  expect(screen.getByRole("list", { name: "Warnings" })).toBeTruthy();
  expect(screen.getByRole("list", { name: "Before merging" }).tagName).toBe("OL");
  expect(screen.getByText("Files changed").tagName).toBe("DT");
});

test("announces artifact changes as text", () => {
  render(<Fixture />);
  const items = screen.getAllByRole("listitem");
  expect(items[0]?.textContent).toContain("Added: emails/receipt.tsx");
  expect(items[1]?.textContent).toContain("Deleted: templates/receipt.html");
  expect(items[1]?.getAttribute("data-change")).toBe("deleted");
});

test("runs next actions from the keyboard", async () => {
  const user = userEvent.setup();
  const open = mock(() => {});
  render(<Fixture onOpen={open} />);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open pull request" }));
  await user.keyboard("{Enter}");
  expect(open).toHaveBeenCalledTimes(1);
});

test("renders every variant and guards compound children", () => {
  for (const variant of RUN_SUMMARY_VARIANTS) {
    const view = render(<Fixture variant={variant} outcome="failed" />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<RunSummaryTitle>Orphan</RunSummaryTitle>)).toThrow(
    "RunSummaryTitle must be used within RunSummary",
  );
});
