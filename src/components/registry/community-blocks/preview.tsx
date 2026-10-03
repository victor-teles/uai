"use client";

import { ARTICLE_PAGE_VARIANTS, type ArticlePageVariant } from "@/components/uai/article-page";
import {
  CHANGELOG_PAGE_VARIANTS,
  type ChangelogPageVariant,
} from "@/components/uai/changelog-page";
import {
  COMMENT_THREAD_VARIANTS,
  type CommentThreadVariant,
} from "@/components/uai/comment-thread";
import {
  COMMUNITY_FEED_VARIANTS,
  type CommunityFeedVariant,
} from "@/components/uai/community-feed";
import {
  DOCUMENTATION_PAGE_VARIANTS,
  type DocumentationPageVariant,
} from "@/components/uai/documentation-page";
import {
  PUBLIC_PROFILE_VARIANTS,
  type PublicProfileVariant,
} from "@/components/uai/public-profile";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { ArticlePagePreview } from "./article-page-preview";
import { ChangelogPagePreview } from "./changelog-page-preview";
import { CommentThreadPreview } from "./comment-thread-preview";
import { CommunityFeedPreview } from "./community-feed-preview";
import { DocumentationPagePreview } from "./documentation-page-preview";
import { PublicProfilePreview } from "./public-profile-preview";

const controls: Record<string, { label: string; variants: readonly string[]; width: number }> = {
  "article-page": { label: "article page layout", variants: ARTICLE_PAGE_VARIANTS, width: 920 },
  "documentation-page": {
    label: "documentation page layout",
    variants: DOCUMENTATION_PAGE_VARIANTS,
    width: 960,
  },
  "changelog-page": {
    label: "changelog page layout",
    variants: CHANGELOG_PAGE_VARIANTS,
    width: 780,
  },
  "comment-thread": {
    label: "comment thread layout",
    variants: COMMENT_THREAD_VARIANTS,
    width: 640,
  },
  "community-feed": {
    label: "community feed layout",
    variants: COMMUNITY_FEED_VARIANTS,
    width: 780,
  },
  "public-profile": {
    label: "public profile layout",
    variants: PUBLIC_PROFILE_VARIANTS,
    width: 880,
  },
};

export function getCommunityBlocksPreviewControl(itemId: string): PreviewControl | undefined {
  const control = controls[itemId];
  if (!control) return undefined;
  return {
    ariaLabel: control.label,
    defaultValue: control.variants[0] ?? "",
    options: control.variants.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  };
}

export function CommunityBlocksPreview({
  itemId,
  selection,
}: {
  itemId: string;
  selection: string;
}) {
  return (
    <PreviewStage label="Content and community">
      <div
        style={{
          width: "100%",
          maxWidth: controls[itemId]?.width ?? 880,
          minWidth: 0,
          padding: "24px 0",
        }}
      >
        {itemId === "article-page" && (
          <ArticlePagePreview variant={selection as ArticlePageVariant} />
        )}
        {itemId === "documentation-page" && (
          <DocumentationPagePreview variant={selection as DocumentationPageVariant} />
        )}
        {itemId === "changelog-page" && (
          <ChangelogPagePreview variant={selection as ChangelogPageVariant} />
        )}
        {itemId === "comment-thread" && (
          <CommentThreadPreview variant={selection as CommentThreadVariant} />
        )}
        {itemId === "community-feed" && (
          <CommunityFeedPreview variant={selection as CommunityFeedVariant} />
        )}
        {itemId === "public-profile" && (
          <PublicProfilePreview variant={selection as PublicProfileVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
