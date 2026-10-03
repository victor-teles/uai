import { AuthorCardPreview } from "@/components/registry/community/author-card-preview";
import { ChangelogEntryPreview } from "@/components/registry/community/changelog-entry-preview";
import { CommentPreview } from "@/components/registry/community/comment-preview";
import { ReactionBarPreview } from "@/components/registry/community/reaction-bar-preview";
import { ShareMenuPreview } from "@/components/registry/community/share-menu-preview";

export function CommunityCompositionFixture() {
  return (
    <>
      <AuthorCardPreview />
      <CommentPreview />
      <ReactionBarPreview />
      <ShareMenuPreview />
      <ChangelogEntryPreview />
    </>
  );
}
