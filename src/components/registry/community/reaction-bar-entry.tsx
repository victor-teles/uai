import { REACTION_BAR_VARIANTS, type ReactionBarVariant } from "@/components/ui/uai/reaction-bar";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ReactionBarPreview } from "./reaction-bar-preview";

export const entry: PreviewEntry = {
  control: variantControl("reaction bar variant", REACTION_BAR_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Content and community" maxWidth={420} minHeight={220}>
      <ReactionBarPreview variant={selection as ReactionBarVariant} />
    </SpecimenStage>
  ),
};
