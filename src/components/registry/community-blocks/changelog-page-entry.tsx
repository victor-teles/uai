import {
  CHANGELOG_PAGE_VARIANTS,
  type ChangelogPageVariant,
} from "@/components/uai/changelog-page";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ChangelogPagePreview } from "./changelog-page-preview";

export const entry: PreviewEntry = {
  control: variantControl("changelog page layout", CHANGELOG_PAGE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Content and community" maxWidth={780}>
      <ChangelogPagePreview variant={selection as ChangelogPageVariant} />
    </SpecimenStage>
  ),
};
