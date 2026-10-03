import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  COMPARISON_TABLE_VARIANTS,
  ComparisonTable,
  ComparisonTableBody,
  ComparisonTableCell,
  ComparisonTableCheck,
  ComparisonTableColumn,
  ComparisonTableContent,
  ComparisonTableCorner,
  ComparisonTableDifferencesToggle,
  ComparisonTableHead,
  type ComparisonTableProps,
  ComparisonTableRow,
  ComparisonTableRowHeader,
  ComparisonTableTitle,
} from "@/registry/uai/components/comparison-table";

function Fixture(props: Omit<ComparisonTableProps, "children">) {
  return (
    <ComparisonTable {...props}>
      <ComparisonTableTitle>Compare plans</ComparisonTableTitle>
      <ComparisonTableDifferencesToggle />
      <ComparisonTableContent>
        <ComparisonTableHead>
          <ComparisonTableCorner>Feature</ComparisonTableCorner>
          <ComparisonTableColumn>Starter</ComparisonTableColumn>
          <ComparisonTableColumn recommended>Team</ComparisonTableColumn>
        </ComparisonTableHead>
        <ComparisonTableBody>
          <ComparisonTableRow different>
            <ComparisonTableRowHeader>SSO</ComparisonTableRowHeader>
            <ComparisonTableCell>
              <ComparisonTableCheck value={false} />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
          </ComparisonTableRow>
          <ComparisonTableRow>
            <ComparisonTableRowHeader>Projects</ComparisonTableRowHeader>
            <ComparisonTableCell>Unlimited</ComparisonTableCell>
            <ComparisonTableCell>Unlimited</ComparisonTableCell>
          </ComparisonTableRow>
        </ComparisonTableBody>
      </ComparisonTableContent>
    </ComparisonTable>
  );
}

test("exposes a labelled, focusable table with row and column headers", () => {
  render(<Fixture />);
  const region = screen.getByRole("region", { name: "Compare plans" });
  expect(region.getAttribute("tabindex")).toBe("0");
  expect(screen.getByRole("table", { name: "Compare plans" })).toBeTruthy();
  expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
    "Feature",
    "Starter",
    "RecommendedTeam",
  ]);
  expect(screen.getByRole("rowheader", { name: "SSO" })).toBeTruthy();
  expect(screen.getByText("Not included")).toBeTruthy();
  expect(screen.getByText("Included")).toBeTruthy();
});

test("toggles difference highlighting with a visible text marker", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  expect(screen.queryByText("Differs")).toBeNull();
  await user.click(screen.getByRole("checkbox", { name: "Highlight differences" }));
  expect(screen.getByRole("rowheader", { name: "SSO Differs" })).toBeTruthy();
  expect(screen.getByRole("rowheader", { name: "Projects" }).textContent).toBe("Projects");
});

test("supports controlled highlighting", async () => {
  const user = userEvent.setup();
  const change = mock(() => {});
  render(<Fixture highlightDifferences onHighlightDifferencesChange={change} />);
  await user.click(screen.getByRole("checkbox", { name: "Highlight differences" }));
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.getByText("Differs")).toBeTruthy();
});

test("renders every variant and guards compound children", () => {
  for (const variant of COMPARISON_TABLE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ComparisonTableTitle>Plans</ComparisonTableTitle>)).toThrow(
    "ComparisonTableTitle must be used within ComparisonTable",
  );
});
