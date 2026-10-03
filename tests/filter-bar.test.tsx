import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBarPreview } from "@/components/registry/forms/filter-bar-preview";
import {
  FILTER_BAR_VARIANTS,
  FilterBar,
  FilterBarChip,
  FilterBarCount,
  FilterBarReset,
} from "@/registry/uai/components/filter-bar";

test("removes chips and resets all composed controls", async () => {
  const user = userEvent.setup();
  render(<FilterBarPreview />);
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Remove Status: Open filter" }));
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("");
  await user.click(screen.getByRole("button", { name: "Reset filters" }));
  expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
  expect(
    (screen.getByRole("button", { name: "Reset filters" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect(screen.getByRole("status").textContent).toBe("24 example results");
});
test("does not remove or reset disabled filters or submit a parent form", async () => {
  const action = mock(() => {});
  const submit = mock(() => {});
  const user = userEvent.setup();
  const view = render(
    <form onSubmit={submit}>
      <FilterBar disabled activeCount={1} onReset={action}>
        <FilterBarChip onRemove={action}>Open</FilterBarChip>
        <FilterBarReset />
      </FilterBar>
    </form>,
  );
  for (const button of screen.getAllByRole("button")) await user.click(button);
  expect(action).not.toHaveBeenCalled();
  view.rerender(
    <form onSubmit={submit}>
      <FilterBar activeCount={1} onReset={action}>
        <FilterBarReset />
      </FilterBar>
    </form>,
  );
  await user.click(screen.getByRole("button"));
  expect(action).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
});
test("renders filter variants and guards stateful children", () => {
  for (const variant of FILTER_BAR_VARIANTS) {
    const view = render(
      <FilterBar variant={variant}>
        <FilterBarCount>4 results</FilterBarCount>
      </FilterBar>,
    );
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<FilterBarReset />)).toThrow("within FilterBar");
});
