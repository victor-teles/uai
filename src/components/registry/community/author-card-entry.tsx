import { AUTHOR_CARD_VARIANTS, type AuthorCardVariant } from "@/components/ui/uai/author-card";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { AuthorCardPreview } from "./author-card-preview";

export const entry: PreviewEntry = {
  control: variantControl("author card variant", AUTHOR_CARD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Content and community" maxWidth={520}>
      <AuthorCardPreview variant={selection as AuthorCardVariant} />
    </SpecimenStage>
  ),
};
