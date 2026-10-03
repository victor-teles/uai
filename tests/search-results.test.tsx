import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { EmptyStateTitle } from "@/components/ui/uai/empty-state";
import { FilterBarChip, FilterBarChips, FilterBarReset } from "@/components/ui/uai/filter-bar";
import {
  SearchFieldControl,
  SearchFieldInput,
  SearchFieldLabel,
} from "@/components/ui/uai/search-field";
import { SkeletonGroupLine } from "@/components/ui/uai/skeleton-group";
import {
  SEARCH_RESULTS_VARIANTS,
  SearchResults,
  SearchResultsBar,
  SearchResultsEmpty,
  SearchResultsFilters,
  SearchResultsHighlight,
  SearchResultsItem,
  SearchResultsItemSnippet,
  SearchResultsItemTitle,
  SearchResultsList,
  SearchResultsLoading,
  SearchResultsMain,
  SearchResultsPagination,
  SearchResultsQuery,
  SearchResultsSort,
  SearchResultsSummary,
  type SearchResultsVariant,
} from "@/registry/uai/blocks/search-results";

const titles = ["Issue a refund", "Set your refund policy", "Exchange an item"];

function Fixture({
  variant,
  loading = false,
}: {
  variant?: SearchResultsVariant;
  loading?: boolean;
}) {
  const [query, setQuery] = useState("refund");
  const [filtered, setFiltered] = useState(true);
  const results = titles.filter((title) => title.toLowerCase().includes(query.toLowerCase()));
  return (
    <SearchResults variant={variant}>
      <SearchResultsQuery value={query} onValueChange={setQuery}>
        <SearchFieldLabel>Search the help center</SearchFieldLabel>
        <SearchFieldControl>
          <SearchFieldInput />
        </SearchFieldControl>
      </SearchResultsQuery>
      <SearchResultsFilters activeCount={filtered ? 1 : 0} onReset={() => setFiltered(false)}>
        <FilterBarChips>
          {filtered ? (
            <FilterBarChip onRemove={() => setFiltered(false)}>Type: Guides</FilterBarChip>
          ) : null}
        </FilterBarChips>
        <FilterBarReset />
      </SearchResultsFilters>
      <SearchResultsMain>
        <SearchResultsBar>
          <SearchResultsSummary>{results.length} results</SearchResultsSummary>
          <SearchResultsSort defaultValue="relevance">
            <option value="relevance">Best match</option>
            <option value="newest">Newest</option>
          </SearchResultsSort>
        </SearchResultsBar>
        {loading ? (
          <SearchResultsLoading>
            <SkeletonGroupLine />
          </SearchResultsLoading>
        ) : results.length === 0 ? (
          <SearchResultsEmpty>
            <EmptyStateTitle>No articles match</EmptyStateTitle>
          </SearchResultsEmpty>
        ) : (
          <SearchResultsList>
            {results.map((title) => (
              <SearchResultsItem key={title}>
                <SearchResultsItemTitle href={`#${title}`}>{title}</SearchResultsItemTitle>
                <SearchResultsItemSnippet>
                  Choose <SearchResultsHighlight>refund</SearchResultsHighlight> on the order.
                </SearchResultsItemSnippet>
              </SearchResultsItem>
            ))}
          </SearchResultsList>
        )}
        <SearchResultsPagination pageCount={9} defaultPage={1} />
      </SearchResultsMain>
    </SearchResults>
  );
}

test("wraps the query in a search landmark and labels results", () => {
  const view = render(<Fixture />);
  expect(screen.getByRole("search").contains(screen.getByRole("searchbox"))).toBe(true);
  const summary = screen.getByRole("status", { name: "" });
  expect(summary.textContent).toBe("2 results");
  const list = view.container.querySelector("ol") as HTMLOListElement;
  expect(list.getAttribute("aria-describedby")).toBe(summary.id);
  expect(screen.getByRole("article", { name: "Issue a refund" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Issue a refund" }).getAttribute("href")).toBe(
    "#Issue a refund",
  );
  expect(screen.getAllByText("refund", { selector: "mark" })).toHaveLength(2);
  expect(screen.getByRole("combobox", { name: "Sort by" })).toBeTruthy();
});

test("updates results from the query and shows an empty state", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const input = screen.getByRole("searchbox", { name: "Search the help center" });
  await user.clear(input);
  await user.type(input, "warranty");
  expect(screen.getByRole("region", { name: "No articles match" })).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(screen.getAllByRole("article")).toHaveLength(3);
  await user.click(screen.getByRole("button", { name: "Reset filters" }));
  expect(screen.queryByText("Type: Guides")).toBeNull();
});

test("paginates with previous, numbered, and next buttons", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const nav = screen.getByRole("navigation", { name: "Pagination" });
  expect(nav).toBeTruthy();
  expect(
    (screen.getByRole("button", { name: "Previous page" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect(screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe("page");
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(screen.getByRole("button", { name: "Page 2" }).getAttribute("aria-current")).toBe("page");
  await user.click(screen.getByRole("button", { name: "Page 9" }));
  expect((screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement).disabled).toBe(
    true,
  );
  expect(screen.getByRole("button", { name: "Page 8" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Page 5" })).toBeNull();
});

test("announces loading, maps variants, and guards regions", () => {
  const view = render(<Fixture loading />);
  expect(screen.getByText("Loading results…")).toBeTruthy();
  view.unmount();
  const filters = { list: "toolbar", sidebar: "panel", compact: "compact" };
  for (const variant of SEARCH_RESULTS_VARIANTS) {
    const rendered = render(<Fixture variant={variant} />);
    expect(rendered.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(screen.getByRole("group", { name: "Filters" }).getAttribute("data-variant")).toBe(
      filters[variant],
    );
    expect(screen.queryAllByText("refund", { selector: "mark" }).length).toBe(
      variant === "compact" ? 0 : 2,
    );
    rendered.unmount();
  }
  expect(() => render(<SearchResultsList />)).toThrow(
    "SearchResultsList must be used within SearchResults",
  );
  expect(() =>
    render(
      <SearchResults>
        <SearchResultsItemTitle>Refunds</SearchResultsItemTitle>
      </SearchResults>,
    ),
  ).toThrow("SearchResultsItemTitle must be used within SearchResultsItem");
});
