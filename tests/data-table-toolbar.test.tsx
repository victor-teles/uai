import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DATA_TABLE_TOOLBAR_VARIANTS,
  DataTableToolbar,
  DataTableToolbarBulkActions,
  DataTableToolbarButton,
  DataTableToolbarClearSelection,
  DataTableToolbarColumn,
  DataTableToolbarColumns,
  DataTableToolbarExport,
  type DataTableToolbarProps,
  DataTableToolbarSearch,
  DataTableToolbarSelectionCount,
} from "@/registry/uai/components/data-table-toolbar";

function Fixture({
  onColumnsChange,
  onExport,
  ...props
}: Omit<DataTableToolbarProps, "children"> & {
  onColumnsChange?: (value: string[]) => void;
  onExport?: () => void;
}) {
  return (
    <DataTableToolbar {...props}>
      <DataTableToolbarSearch label="Search invoices" />
      <DataTableToolbarColumns defaultValue={["customer"]} onValueChange={onColumnsChange}>
        <DataTableToolbarColumn value="customer">Customer</DataTableToolbarColumn>
        <DataTableToolbarColumn value="amount">Amount</DataTableToolbarColumn>
      </DataTableToolbarColumns>
      <DataTableToolbarExport onClick={onExport} />
      <DataTableToolbarBulkActions>
        <DataTableToolbarSelectionCount />
        <DataTableToolbarButton>Archive</DataTableToolbarButton>
        <DataTableToolbarClearSelection />
      </DataTableToolbarBulkActions>
    </DataTableToolbar>
  );
}

test("searches, clears with focus restoration, and clears on Escape", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string) => {});
  render(<Fixture onSearchChange={change} />);
  const input = screen.getByRole("searchbox", { name: "Search invoices" }) as HTMLInputElement;
  await user.type(input, "north");
  expect(input.value).toBe("north");
  expect(change).toHaveBeenLastCalledWith("north");
  await user.click(screen.getByRole("button", { name: "Clear search" }));
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
  await user.type(input, "paid{Escape}");
  expect(input.value).toBe("");
});

test("toggles column visibility in a disclosure that closes on Escape", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string[]) => {});
  render(<Fixture onColumnsChange={change} />);
  const trigger = screen.getByRole("button", { name: "Columns" });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  await user.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("group", { name: "Visible columns" })).toBeTruthy();
  const amount = screen.getByRole("checkbox", { name: "Amount" });
  expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Customer" }));
  expect(screen.getByRole("checkbox", { name: "Customer" }).getAttribute("aria-checked")).toBe(
    "true",
  );
  await user.click(amount);
  expect(amount.getAttribute("aria-checked")).toBe("true");
  expect(change).toHaveBeenLastCalledWith(["customer", "amount"]);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("checkbox", { name: "Amount" })).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

test("shows bulk actions only with a selection and announces the count", async () => {
  const user = userEvent.setup();
  const clear = mock(() => {});
  const exportRows = mock(() => {});
  const view = render(<Fixture onExport={exportRows} />);
  expect(screen.queryByRole("group", { name: "Bulk actions" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Export" }));
  expect(exportRows).toHaveBeenCalledTimes(1);
  view.rerender(<Fixture selectedCount={3} onClearSelection={clear} />);
  expect(screen.getByRole("group", { name: "Bulk actions" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe("3 selected");
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(clear).toHaveBeenCalledTimes(1);
});

test("renders every variant and guards compound children", () => {
  for (const variant of DATA_TABLE_TOOLBAR_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<DataTableToolbarSearch />)).toThrow(
    "DataTableToolbarSearch must be used within DataTableToolbar",
  );
  expect(() => render(<DataTableToolbarColumn value="a">A</DataTableToolbarColumn>)).toThrow(
    "DataTableToolbarColumn must be used within DataTableToolbarColumns",
  );
});
