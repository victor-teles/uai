"use client";

import { SearchX } from "lucide-react";
import { useState } from "react";
import {
  SearchResults,
  SearchResultsBar,
  SearchResultsEmpty,
  SearchResultsFilters,
  SearchResultsHighlight,
  SearchResultsItem,
  SearchResultsItemMeta,
  SearchResultsItemSnippet,
  SearchResultsItemTitle,
  SearchResultsList,
  SearchResultsMain,
  SearchResultsPagination,
  SearchResultsQuery,
  SearchResultsSort,
  SearchResultsSummary,
  type SearchResultsVariant,
} from "@/components/uai/search-results";
import {
  EmptyStateAction,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import {
  FilterBarChip,
  FilterBarChips,
  FilterBarCount,
  FilterBarReset,
} from "@/components/ui/uai/filter-bar";
import {
  SearchFieldClear,
  SearchFieldControl,
  SearchFieldInput,
  SearchFieldLabel,
} from "@/components/ui/uai/search-field";

const articles = [
  {
    id: "issue-refund",
    title: "Issue a full or partial refund",
    path: "Help center › Orders",
    updated: "Updated Sep 22",
    type: "Guide",
    snippet:
      "Open the order, choose Refund, and pick the items and shipping to return to the customer.",
  },
  {
    id: "refund-policy",
    title: "Set your refund policy",
    path: "Help center › Store settings",
    updated: "Updated Sep 3",
    type: "Guide",
    snippet: "Customers see the refund policy at checkout and in every order confirmation email.",
  },
  {
    id: "refund-fees",
    title: "Are payment fees returned with a refund?",
    path: "Help center › Payouts",
    updated: "Updated Aug 18",
    type: "FAQ",
    snippet: "Card processing fees are not returned when you refund an order, even in full.",
  },
  {
    id: "exchange",
    title: "Exchange an item for a different size",
    path: "Help center › Orders",
    updated: "Updated Jul 30",
    type: "Guide",
    snippet: "Create an exchange instead of a refund to keep the sale and send the new size.",
  },
];

function highlight(text: string, query: string) {
  const term = query.trim().toLowerCase();
  const index = term ? text.toLowerCase().indexOf(term) : -1;
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <SearchResultsHighlight>{text.slice(index, index + term.length)}</SearchResultsHighlight>
      {text.slice(index + term.length)}
    </>
  );
}

export function SearchResultsPreview({ variant = "list" }: { variant?: SearchResultsVariant }) {
  const [query, setQuery] = useState("refund");
  const [guidesOnly, setGuidesOnly] = useState(true);
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const term = query.trim().toLowerCase();
  const matches = articles
    .filter((article) => !guidesOnly || article.type === "Guide")
    .filter(
      (article) =>
        !term ||
        article.title.toLowerCase().includes(term) ||
        article.snippet.toLowerCase().includes(term),
    );
  const results =
    sort === "title" ? [...matches].sort((a, b) => a.title.localeCompare(b.title)) : matches;

  return (
    <SearchResults variant={variant}>
      <SearchResultsQuery
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          setPage(1);
        }}
      >
        <SearchFieldLabel className="sr-only">Search the help center</SearchFieldLabel>
        <SearchFieldControl>
          <SearchFieldInput placeholder="Search the help center" />
          <SearchFieldClear />
        </SearchFieldControl>
      </SearchResultsQuery>
      <SearchResultsFilters activeCount={guidesOnly ? 1 : 0} onReset={() => setGuidesOnly(false)}>
        <FilterBarChips>
          {guidesOnly ? (
            <FilterBarChip onRemove={() => setGuidesOnly(false)}>Type: Guides</FilterBarChip>
          ) : (
            <FilterBarCount>No filters applied</FilterBarCount>
          )}
        </FilterBarChips>
        <FilterBarReset />
      </SearchResultsFilters>
      <SearchResultsMain>
        <SearchResultsBar>
          <SearchResultsSummary>
            {results.length} {results.length === 1 ? "result" : "results"}
            {term ? ` for “${query.trim()}”` : ""}
          </SearchResultsSummary>
          <SearchResultsSort value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="relevance">Best match</option>
            <option value="title">Title A–Z</option>
          </SearchResultsSort>
        </SearchResultsBar>
        {results.length === 0 ? (
          <SearchResultsEmpty>
            <EmptyStateMedia>
              <SearchX aria-hidden="true" />
            </EmptyStateMedia>
            <EmptyStateContent>
              <EmptyStateHeader>
                <EmptyStateTitle>No articles match “{query.trim()}”</EmptyStateTitle>
                <EmptyStateDescription>
                  Try a shorter phrase, or include FAQs in the results.
                </EmptyStateDescription>
              </EmptyStateHeader>
              <EmptyStateActions>
                <EmptyStateAction emphasis="secondary" onClick={() => setGuidesOnly(false)}>
                  Include FAQs
                </EmptyStateAction>
              </EmptyStateActions>
            </EmptyStateContent>
          </SearchResultsEmpty>
        ) : (
          <>
            <SearchResultsList>
              {results.map((article) => (
                <SearchResultsItem key={article.id}>
                  <SearchResultsItemTitle
                    href={`#${article.id}`}
                    onClick={(event) => event.preventDefault()}
                  >
                    {highlight(article.title, query)}
                  </SearchResultsItemTitle>
                  <SearchResultsItemMeta>
                    <span>{article.path}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.updated}</span>
                  </SearchResultsItemMeta>
                  <SearchResultsItemSnippet>
                    {highlight(article.snippet, query)}
                  </SearchResultsItemSnippet>
                </SearchResultsItem>
              ))}
            </SearchResultsList>
            <SearchResultsPagination pageCount={8} page={page} onPageChange={setPage} />
          </>
        )}
      </SearchResultsMain>
    </SearchResults>
  );
}
