import dynamic from "next/dynamic";
import type { DiffReviewVariant } from "@/components/ui/uai/diff-review";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";

// The diff engine (@pierre/diffs and Shiki) loads only on the Diff Review page, so this
// file names its variants instead of importing DIFF_REVIEW_VARIANTS from the component.
const DiffReviewPreview = dynamic(() =>
  import("./diff-review-preview").then((module) => module.DiffReviewPreview),
);

export const entry: PreviewEntry = {
  control: variantControl("diff review variant", ["unified", "compact"]),
  render: (selection) => (
    <SpecimenStage label="AI and automation" maxWidth={selection !== "compact" ? 560 : 540}>
      <DiffReviewPreview variant={selection as DiffReviewVariant} />
    </SpecimenStage>
  ),
};
