import {
  ChangelogEntry,
  ChangelogEntryBody,
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
} from "@/components/ui/uai/changelog-entry";

export function ChangelogEntryPreview({
  variant = "timeline",
}: {
  variant?: ChangelogEntryVariant;
}) {
  return (
    <ChangelogEntry variant={variant}>
      <ChangelogEntryHeader>
        <ChangelogEntryVersion>v2.8.0</ChangelogEntryVersion>
        <ChangelogEntryDate dateTime="2026-09-24">September 24, 2026</ChangelogEntryDate>
      </ChangelogEntryHeader>
      <ChangelogEntryContent>
        <ChangelogEntryTitle>Scheduled exports and faster search</ChangelogEntryTitle>
        <ChangelogEntryCategories>
          <ChangelogEntryCategory tone="added">Added</ChangelogEntryCategory>
          <ChangelogEntryCategory tone="improved">Improved</ChangelogEntryCategory>
          <ChangelogEntryCategory tone="fixed">Fixed</ChangelogEntryCategory>
        </ChangelogEntryCategories>
        <ChangelogEntryBody>
          Exports can now run on a schedule, and workspace search returns results in about half the
          time.
        </ChangelogEntryBody>
        <ChangelogEntryChanges>
          <ChangelogEntryChange href="#scheduled-exports">
            Schedule CSV exports daily or weekly
          </ChangelogEntryChange>
          <ChangelogEntryChange href="#search">
            Search indexes comments and attachments
          </ChangelogEntryChange>
          <ChangelogEntryChange>Fixed duplicate rows when an export retried</ChangelogEntryChange>
        </ChangelogEntryChanges>
      </ChangelogEntryContent>
    </ChangelogEntry>
  );
}
