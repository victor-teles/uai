import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SEARCH_FIELD_VARIANTS,
  SearchField,
  SearchFieldClear,
  SearchFieldControl,
  SearchFieldInput,
  SearchFieldLabel,
  SearchFieldMessage,
  type SearchFieldProps,
  SearchFieldRecent,
  SearchFieldRecentItem,
} from "@/registry/uai/components/search-field";

function Fixture(props: SearchFieldProps) {
  return (
    <SearchField {...props}>
      <SearchFieldLabel>Search documents</SearchFieldLabel>
      <SearchFieldControl>
        <SearchFieldInput />
        <SearchFieldClear />
      </SearchFieldControl>
      <SearchFieldMessage />
      <SearchFieldRecent>
        <SearchFieldRecentItem value="Release notes" />
      </SearchFieldRecent>
    </SearchField>
  );
}
test("selects a recent query, clears with focus restoration, and supports Escape", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const input = screen.getByRole("searchbox") as HTMLInputElement;
  await user.click(screen.getByRole("button", { name: "Release notes" }));
  expect(input.value).toBe("Release notes");
  expect(document.activeElement).toBe(input);
  expect(screen.queryByRole("group", { name: "Recent searches" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Clear search" }));
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
  await user.type(input, "test{Escape}");
  expect(input.value).toBe("");
});
test("announces loading, empty, and error without replacing the search input", () => {
  const view = render(<Fixture status="loading" />);
  const input = screen.getByRole("searchbox");
  expect(input.getAttribute("aria-busy")).toBe("true");
  expect(screen.getByRole("status").textContent).toBe("Searching…");
  view.rerender(<Fixture status="empty" />);
  expect(screen.getByRole("status").textContent).toContain("No results");
  view.rerender(<Fixture status="error" />);
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByRole("alert").textContent).toContain("Search failed");
});
test("respects controlled value and disables clear and input", async () => {
  const change = mock(() => {});
  const user = userEvent.setup();
  const view = render(<Fixture value="fixed" onValueChange={change} />);
  await user.click(screen.getByRole("button", { name: "Clear search" }));
  expect(change).toHaveBeenCalledWith("");
  expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("fixed");
  view.rerender(<Fixture disabled value="fixed" />);
  expect((screen.getByRole("searchbox") as HTMLInputElement).disabled).toBe(true);
  expect((screen.getByRole("button", { name: "Clear search" }) as HTMLButtonElement).disabled).toBe(
    true,
  );
});
test("renders every search variant and guards compound children", () => {
  for (const variant of SEARCH_FIELD_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<SearchFieldClear />)).toThrow("within SearchField");
});
