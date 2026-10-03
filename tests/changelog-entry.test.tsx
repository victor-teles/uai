import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import {
  CHANGELOG_ENTRY_VARIANTS,
  ChangelogEntry,
  ChangelogEntryCategories,
  ChangelogEntryCategory,
  ChangelogEntryChange,
  ChangelogEntryChanges,
  ChangelogEntryContent,
  ChangelogEntryDate,
  ChangelogEntryHeader,
  ChangelogEntryTitle,
  type ChangelogEntryVariant,
  ChangelogEntryVersion,
} from "@/registry/uai/components/changelog-entry";

function Fixture({ variant, level }: { variant?: ChangelogEntryVariant; level?: 2 | 3 | 4 }) {
  return (
    <ChangelogEntry variant={variant}>
      <ChangelogEntryHeader>
        <ChangelogEntryVersion>v1.2.0</ChangelogEntryVersion>
        <ChangelogEntryDate dateTime="2026-09-24">Sep 24, 2026</ChangelogEntryDate>
      </ChangelogEntryHeader>
      <ChangelogEntryContent>
        <ChangelogEntryTitle level={level}>Faster search</ChangelogEntryTitle>
        <ChangelogEntryCategories>
          <ChangelogEntryCategory tone="added">Added</ChangelogEntryCategory>
          <ChangelogEntryCategory tone="fixed">Fixed</ChangelogEntryCategory>
        </ChangelogEntryCategories>
        <ChangelogEntryChanges>
          <ChangelogEntryChange href="/changes/search">
            Search indexes comments
          </ChangelogEntryChange>
          <ChangelogEntryChange>Fixed duplicate rows</ChangelogEntryChange>
        </ChangelogEntryChanges>
      </ChangelogEntryContent>
    </ChangelogEntry>
  );
}

test("labels the entry by its heading and exposes date, categories, and changes", () => {
  render(<Fixture />);
  expect(screen.getByRole("article", { name: "Faster search" })).toBeTruthy();
  expect(screen.getByRole("heading", { level: 3, name: "Faster search" })).toBeTruthy();
  const time = document.querySelector("time");
  expect(time?.getAttribute("datetime")).toBe("2026-09-24");
  const categories = screen.getByRole("list", { name: "Categories" });
  expect(categories.querySelectorAll("li").length).toBe(2);
  expect(categories.textContent).toBe("AddedFixed");
  expect(screen.getByRole("link", { name: "Search indexes comments" }).getAttribute("href")).toBe(
    "/changes/search",
  );
  expect(screen.getByText("Fixed duplicate rows").tagName).toBe("LI");
});

test("supports custom heading levels", () => {
  render(<Fixture level={2} />);
  expect(screen.getByRole("heading", { level: 2, name: "Faster search" })).toBeTruthy();
});

test("renders every variant and guards compound children", () => {
  for (const variant of CHANGELOG_ENTRY_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ChangelogEntryTitle>Orphan</ChangelogEntryTitle>)).toThrow(
    "ChangelogEntryTitle must be used within ChangelogEntry",
  );
});
