import { COMMENT_VARIANTS, type CommentVariant } from "@/components/ui/uai/comment";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { CommentPreview } from "./comment-preview";

export const entry: PreviewEntry = {
  control: variantControl("comment variant", COMMENT_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Content and community" maxWidth={520}>
      <CommentPreview variant={selection as CommentVariant} />
    </SpecimenStage>
  ),
};
