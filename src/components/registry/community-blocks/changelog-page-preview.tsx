"use client";

import { SearchX } from "lucide-react";
import { useState } from "react";
import {
  ChangelogPage,
  ChangelogPageCount,
  ChangelogPageDescription,
  ChangelogPageEmpty,
  ChangelogPageFilter,
  ChangelogPageFilterOption,
  ChangelogPageFilters,
  ChangelogPageGroup,
  ChangelogPageGroupTitle,
  ChangelogPageHeader,
  ChangelogPageRelease,
  ChangelogPageTitle,
  type ChangelogPageVariant,
} from "@/components/uai/changelog-page";
import {
  ChangelogEntryCategories,
  ChangelogEntryCategory,
  type ChangelogEntryCategoryTone,
  ChangelogEntryChange,
  ChangelogEntryChanges,
  ChangelogEntryContent,
  ChangelogEntryDate,
  ChangelogEntryHeader,
  ChangelogEntryTitle,
  ChangelogEntryVersion,
} from "@/components/ui/uai/changelog-entry";
import {
  EmptyStateAction,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import { FilterBarControls, FilterBarReset } from "@/components/ui/uai/filter-bar";

const categoryLabels: Record<ChangelogEntryCategoryTone, string> = {
  added: "Added",
  improved: "Improved",
  fixed: "Fixed",
  removed: "Removed",
  security: "Security",
};

const months = [
  {
    month: "September 2026",
    releases: [
      {
        version: "4.2.0",
        date: "2026-09-24",
        label: "Sep 24",
        title: "Persistent build cache",
        area: "Builds",
        categories: ["added", "improved"] as ChangelogEntryCategoryTone[],
        changes: [
          "Parsed templates are cached on disk, keyed by content hash.",
          "Images are resized only when the source or size changes.",
        ],
      },
      {
        version: "4.1.3",
        date: "2026-09-09",
        label: "Sep 9",
        title: "Safer dev server reloads",
        area: "Dev server",
        categories: ["fixed", "security"] as ChangelogEntryCategoryTone[],
        changes: [
          "Reloads no longer drop query strings.",
          "The dev server now binds to localhost unless --host is passed.",
        ],
      },
    ],
  },
  {
    month: "August 2026",
    releases: [
      {
        version: "4.1.0",
        date: "2026-08-19",
        label: "Aug 19",
        title: "Image formats and the legacy router",
        area: "Images",
        categories: ["added", "removed"] as ChangelogEntryCategoryTone[],
        changes: [
          "AVIF output for every responsive image size.",
          "The legacy router, deprecated since 3.0, has been removed.",
        ],
      },
    ],
  },
];

export function ChangelogPagePreview({ variant = "timeline" }: { variant?: ChangelogPageVariant }) {
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  return (
    <ChangelogPage
      variant={variant}
      category={category}
      onCategoryChange={setCategory}
      area={area}
      onAreaChange={setArea}
    >
      <ChangelogPageHeader>
        <div style={{ display: "grid", gap: 6 }}>
          <ChangelogPageTitle>Changelog</ChangelogPageTitle>
          <ChangelogPageDescription>
            Every Kiln release, grouped by month. Subscribe to the feed to hear about new versions.
          </ChangelogPageDescription>
        </div>
        <ChangelogPageCount />
      </ChangelogPageHeader>
      <ChangelogPageFilters>
        <FilterBarControls>
          <ChangelogPageFilter name="category" label="Category">
            <ChangelogPageFilterOption value="">All categories</ChangelogPageFilterOption>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <ChangelogPageFilterOption key={value} value={value}>
                {label}
              </ChangelogPageFilterOption>
            ))}
          </ChangelogPageFilter>
          <ChangelogPageFilter name="area" label="Product area">
            <ChangelogPageFilterOption value="">All areas</ChangelogPageFilterOption>
            <ChangelogPageFilterOption value="Builds">Builds</ChangelogPageFilterOption>
            <ChangelogPageFilterOption value="Dev server">Dev server</ChangelogPageFilterOption>
            <ChangelogPageFilterOption value="Images">Images</ChangelogPageFilterOption>
          </ChangelogPageFilter>
        </FilterBarControls>
        <FilterBarReset />
      </ChangelogPageFilters>
      {months.map((group) => (
        <ChangelogPageGroup key={group.month}>
          <ChangelogPageGroupTitle>{group.month}</ChangelogPageGroupTitle>
          {group.releases.map((release) => (
            <ChangelogPageRelease
              key={release.version}
              categories={release.categories}
              area={release.area}
            >
              <ChangelogEntryHeader>
                <ChangelogEntryVersion>v{release.version}</ChangelogEntryVersion>
                <ChangelogEntryDate dateTime={release.date}>{release.label}</ChangelogEntryDate>
                <span style={{ color: "var(--uai-subtle)", fontSize: 12 }}>{release.area}</span>
              </ChangelogEntryHeader>
              <ChangelogEntryContent>
                <ChangelogEntryTitle>{release.title}</ChangelogEntryTitle>
                <ChangelogEntryCategories>
                  {release.categories.map((tone) => (
                    <ChangelogEntryCategory key={tone} tone={tone}>
                      {categoryLabels[tone]}
                    </ChangelogEntryCategory>
                  ))}
                </ChangelogEntryCategories>
                <ChangelogEntryChanges>
                  {release.changes.map((change) => (
                    <ChangelogEntryChange key={change}>{change}</ChangelogEntryChange>
                  ))}
                </ChangelogEntryChanges>
              </ChangelogEntryContent>
            </ChangelogPageRelease>
          ))}
        </ChangelogPageGroup>
      ))}
      <ChangelogPageEmpty>
        <EmptyStateMedia>
          <SearchX />
        </EmptyStateMedia>
        <EmptyStateContent>
          <EmptyStateHeader>
            <EmptyStateTitle>No releases match these filters</EmptyStateTitle>
            <EmptyStateDescription>
              Try another category or product area, or clear the filters to see every release.
            </EmptyStateDescription>
          </EmptyStateHeader>
          <EmptyStateActions>
            <EmptyStateAction
              emphasis="secondary"
              onClick={() => {
                setCategory("");
                setArea("");
              }}
            >
              Clear filters
            </EmptyStateAction>
          </EmptyStateActions>
        </EmptyStateContent>
      </ChangelogPageEmpty>
    </ChangelogPage>
  );
}
