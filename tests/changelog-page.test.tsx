import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangelogEntryTitle } from "@/components/ui/uai/changelog-entry";
import { EmptyStateTitle } from "@/components/ui/uai/empty-state";
import { FilterBarReset } from "@/components/ui/uai/filter-bar";
import {
  CHANGELOG_PAGE_VARIANTS,
  ChangelogPage,
  ChangelogPageCount,
  ChangelogPageEmpty,
  ChangelogPageFilter,
  ChangelogPageFilterOption,
  ChangelogPageFilters,
  ChangelogPageGroup,
  ChangelogPageGroupTitle,
  type ChangelogPageProps,
  ChangelogPageRelease,
  ChangelogPageTitle,
} from "@/registry/uai/blocks/changelog-page";

function Fixture(props: Omit<ChangelogPageProps, "children">) {
  return (
    <ChangelogPage {...props}>
      <ChangelogPageTitle>Changelog</ChangelogPageTitle>
      <ChangelogPageCount />
      <ChangelogPageFilters>
        <ChangelogPageFilter name="category" label="Category">
          <ChangelogPageFilterOption value="">All categories</ChangelogPageFilterOption>
          <ChangelogPageFilterOption value="added">Added</ChangelogPageFilterOption>
          <ChangelogPageFilterOption value="fixed">Fixed</ChangelogPageFilterOption>
          <ChangelogPageFilterOption value="security">Security</ChangelogPageFilterOption>
        </ChangelogPageFilter>
        <ChangelogPageFilter name="area" label="Product area">
          <ChangelogPageFilterOption value="">All areas</ChangelogPageFilterOption>
          <ChangelogPageFilterOption value="Builds">Builds</ChangelogPageFilterOption>
          <ChangelogPageFilterOption value="Images">Images</ChangelogPageFilterOption>
        </ChangelogPageFilter>
        <FilterBarReset />
      </ChangelogPageFilters>
      <ChangelogPageGroup>
        <ChangelogPageGroupTitle>September 2026</ChangelogPageGroupTitle>
        <ChangelogPageRelease categories={["added"]} area="Builds">
          <ChangelogEntryTitle>Persistent build cache</ChangelogEntryTitle>
        </ChangelogPageRelease>
        <ChangelogPageRelease categories={["fixed"]} area="Builds">
          <ChangelogEntryTitle>Safer reloads</ChangelogEntryTitle>
        </ChangelogPageRelease>
      </ChangelogPageGroup>
      <ChangelogPageGroup>
        <ChangelogPageGroupTitle>August 2026</ChangelogPageGroupTitle>
        <ChangelogPageRelease categories={["added"]} area="Images">
          <ChangelogEntryTitle>AVIF output</ChangelogEntryTitle>
        </ChangelogPageRelease>
      </ChangelogPageGroup>
      <ChangelogPageEmpty>
        <EmptyStateTitle>No releases match</EmptyStateTitle>
      </ChangelogPageEmpty>
    </ChangelogPage>
  );
}

test("groups releases into named sections and counts them", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Changelog" })).toBeTruthy();
  expect(screen.getByRole("region", { name: "September 2026" })).toBeTruthy();
  expect(screen.getAllByRole("article")).toHaveLength(3);
  expect(screen.getByRole("status").textContent).toBe("3 releases");
  expect(
    (screen.getByRole("button", { name: "Reset filters" }) as HTMLButtonElement).disabled,
  ).toBe(true);
});

test("filters by category and area, hides empty groups, and resets", async () => {
  const user = userEvent.setup();
  const onCategoryChange = mock();
  render(<Fixture onCategoryChange={onCategoryChange} />);
  await user.click(screen.getByRole("combobox", { name: "Category" }));
  await user.click(screen.getByRole("option", { name: "Fixed" }));
  expect(onCategoryChange).toHaveBeenCalledWith("fixed");
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getByRole("article", { name: "Safer reloads" })).toBeTruthy();
  expect(screen.queryByRole("region", { name: "August 2026" })).toBeNull();
  expect(screen.getByRole("status").textContent).toBe("Showing 1 of 3 releases");

  await user.click(screen.getByRole("combobox", { name: "Product area" }));
  await user.click(screen.getByRole("option", { name: "Images" }));
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  expect(screen.getByRole("heading", { name: "No releases match" })).toBeTruthy();

  await user.click(screen.getByRole("button", { name: "Reset filters" }));
  expect(screen.getAllByRole("article")).toHaveLength(3);
  expect(screen.getByRole("combobox", { name: "Category" }).textContent).toBe("All categories");
  expect(screen.queryByRole("heading", { name: "No releases match" })).toBeNull();
});

test('maps the empty "All" option back to an empty filter', async () => {
  const user = userEvent.setup();
  const onCategoryChange = mock();
  render(<Fixture defaultCategory="fixed" onCategoryChange={onCategoryChange} />);
  expect(screen.getAllByRole("article")).toHaveLength(1);
  await user.click(screen.getByRole("combobox", { name: "Category" }));
  await user.click(screen.getByRole("option", { name: "All categories" }));
  expect(onCategoryChange).toHaveBeenCalledWith("");
  expect(screen.getAllByRole("article")).toHaveLength(3);
});

test("respects controlled filters", () => {
  render(<Fixture category="added" area="Images" />);
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getByRole("combobox", { name: "Category" }).textContent).toBe("Added");
});

test("renders every variant and guards its parts", () => {
  for (const variant of CHANGELOG_PAGE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ChangelogPageRelease />)).toThrow(
    "ChangelogPageRelease must be used within ChangelogPage",
  );
  expect(() =>
    render(
      <ChangelogPage>
        <ChangelogPageGroupTitle />
      </ChangelogPage>,
    ),
  ).toThrow("ChangelogPageGroupTitle must be used within ChangelogPageGroup");
});
