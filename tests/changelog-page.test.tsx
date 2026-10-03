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
          <option value="">All categories</option>
          <option value="added">Added</option>
          <option value="fixed">Fixed</option>
          <option value="security">Security</option>
        </ChangelogPageFilter>
        <ChangelogPageFilter name="area" label="Product area">
          <option value="">All areas</option>
          <option value="Builds">Builds</option>
          <option value="Images">Images</option>
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
  await user.selectOptions(screen.getByLabelText("Category"), "fixed");
  expect(onCategoryChange).toHaveBeenCalledWith("fixed");
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getByRole("article", { name: "Safer reloads" })).toBeTruthy();
  expect(screen.queryByRole("region", { name: "August 2026" })).toBeNull();
  expect(screen.getByRole("status").textContent).toBe("Showing 1 of 3 releases");

  await user.selectOptions(screen.getByLabelText("Product area"), "Images");
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  expect(screen.getByRole("heading", { name: "No releases match" })).toBeTruthy();

  await user.click(screen.getByRole("button", { name: "Reset filters" }));
  expect(screen.getAllByRole("article")).toHaveLength(3);
  expect(screen.queryByRole("heading", { name: "No releases match" })).toBeNull();
});

test("respects controlled filters", () => {
  render(<Fixture category="added" area="Images" />);
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect((screen.getByLabelText("Category") as HTMLSelectElement).value).toBe("added");
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
