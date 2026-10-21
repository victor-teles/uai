import {
  COMMENT_THREAD_VARIANTS,
  type CommentThreadVariant,
} from "@/components/uai/comment-thread";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { CommentThreadPreview } from "./comment-thread-preview";

export const entry: PreviewEntry = {
  control: variantControl("comment thread layout", COMMENT_THREAD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Content and community" maxWidth={640}>
      <CommentThreadPreview variant={selection as CommentThreadVariant} />
    </SpecimenStage>
  ),
};
