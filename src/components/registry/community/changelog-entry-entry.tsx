import {
  CHANGELOG_ENTRY_VARIANTS,
  type ChangelogEntryVariant,
} from "@/components/ui/uai/changelog-entry";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ChangelogEntryPreview } from "./changelog-entry-preview";

export const entry: PreviewEntry = {
  control: variantControl("changelog entry variant", CHANGELOG_ENTRY_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Content and community" maxWidth={640}>
      <ChangelogEntryPreview variant={selection as ChangelogEntryVariant} />
    </SpecimenStage>
  ),
};
