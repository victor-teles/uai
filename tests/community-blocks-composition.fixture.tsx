import { ArticlePagePreview } from "@/components/registry/community-blocks/article-page-preview";
import { ChangelogPagePreview } from "@/components/registry/community-blocks/changelog-page-preview";
import { CommentThreadPreview } from "@/components/registry/community-blocks/comment-thread-preview";
import { CommunityFeedPreview } from "@/components/registry/community-blocks/community-feed-preview";
import { DocumentationPagePreview } from "@/components/registry/community-blocks/documentation-page-preview";
import { PublicProfilePreview } from "@/components/registry/community-blocks/public-profile-preview";

export function CommunityBlocksCompositionFixture() {
  return (
    <>
      <ArticlePagePreview />
      <DocumentationPagePreview />
      <ChangelogPagePreview />
      <CommentThreadPreview />
      <CommunityFeedPreview />
      <PublicProfilePreview />
    </>
  );
}
