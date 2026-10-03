import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PageTabsList, PageTabsPanel, PageTabsTab } from "@/components/ui/uai/page-tabs";
import {
  DATA_EXPLORER_VARIANTS,
  DataExplorer,
  DataExplorerCell,
  DataExplorerHeaderCell,
  type DataExplorerProps,
  DataExplorerQuery,
  DataExplorerQueryInput,
  DataExplorerQueryLabel,
  DataExplorerResults,
  DataExplorerRun,
  DataExplorerStatus,
  DataExplorerTable,
  DataExplorerTitle,
  DataExplorerViews,
} from "@/registry/uai/blocks/data-explorer";

function Fixture({
  onRun,
  onView,
  ...props
}: DataExplorerProps & { onRun?: (query: string) => void; onView?: (view: string) => void }) {
  return (
    <DataExplorer {...props}>
      <DataExplorerTitle>Accounts explorer</DataExplorerTitle>
      <DataExplorerViews defaultValue="expansion" onValueChange={onView}>
        <PageTabsList aria-label="Saved views">
          <PageTabsTab value="expansion">Expansion</PageTabsTab>
          <PageTabsTab value="churn">Churn risk</PageTabsTab>
        </PageTabsList>
        <PageTabsPanel value="expansion">
          <DataExplorerQuery
            onSubmit={(event) => {
              event.preventDefault();
              onRun?.(new FormData(event.currentTarget).get("query") as string);
            }}
          >
            <DataExplorerQueryLabel>SQL</DataExplorerQueryLabel>
            <DataExplorerQueryInput name="query" defaultValue="select 1" />
            <DataExplorerRun />
          </DataExplorerQuery>
          <DataExplorerResults>
            <DataExplorerTable aria-label="Expansion results">
              <thead>
                <tr>
                  <DataExplorerHeaderCell>Account</DataExplorerHeaderCell>
                  <DataExplorerHeaderCell align="end">Seats</DataExplorerHeaderCell>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <DataExplorerCell>Fieldnote Labs</DataExplorerCell>
                  <DataExplorerCell align="end">48</DataExplorerCell>
                </tr>
              </tbody>
            </DataExplorerTable>
            <DataExplorerStatus>1 row · 38 ms</DataExplorerStatus>
          </DataExplorerResults>
        </PageTabsPanel>
        <PageTabsPanel value="churn">No saved query</PageTabsPanel>
      </DataExplorerViews>
    </DataExplorer>
  );
}

test("runs the labelled query through the consumer submit handler", async () => {
  const user = userEvent.setup();
  const run = mock((_query: string) => {});
  render(<Fixture onRun={run} />);
  expect(screen.getByRole("region", { name: "Accounts explorer" })).toBeTruthy();
  const input = screen.getByLabelText("SQL");
  await user.clear(input);
  await user.type(input, "select account from accounts");
  await user.click(screen.getByRole("button", { name: "Run query" }));
  expect(run).toHaveBeenCalledWith("select account from accounts");
  expect(screen.getByRole("status").textContent).toBe("1 row · 38 ms");
});

test("exposes a focusable results region with real table headers", () => {
  render(<Fixture />);
  const region = screen.getByRole("region", { name: "Expansion results" });
  expect(region.getAttribute("tabindex")).toBe("0");
  expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
    "Account",
    "Seats",
  ]);
  expect(screen.getByRole("cell", { name: "48" }).className).toContain("text-right");
});

test("switches saved views with the keyboard", async () => {
  const user = userEvent.setup();
  const view = mock((_value: string) => {});
  render(<Fixture onView={view} />);
  screen.getByRole("tab", { name: "Expansion" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(view).toHaveBeenCalledWith("churn");
  expect(screen.getByRole("tab", { name: "Churn risk" }).getAttribute("aria-selected")).toBe(
    "true",
  );
});

test("maps each layout variant onto saved views and guards its parts", () => {
  const tabs = { workbench: "underline", stacked: "pill", compact: "segmented" } as const;
  for (const variant of DATA_EXPLORER_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(view.container.querySelectorAll("[data-variant]")[1]?.getAttribute("data-variant")).toBe(
      tabs[variant],
    );
    view.unmount();
  }
  expect(() => render(<DataExplorerRun />)).toThrow(
    "DataExplorerRun must be used within DataExplorer",
  );
});
