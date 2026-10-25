import { SPLIT_PANE_VARIANTS, type SplitPaneVariant } from "@/components/ui/uai/split-pane";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { SplitPanePreview } from "./split-pane-preview";

export const entry: PreviewEntry = {
  control: variantControl("split pane variant", SPLIT_PANE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Navigation and layout" maxWidth={680}>
      <SplitPanePreview variant={selection as SplitPaneVariant} />
    </SpecimenStage>
  ),
};
