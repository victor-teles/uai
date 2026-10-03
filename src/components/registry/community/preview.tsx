"use client";

import { AUTHOR_CARD_VARIANTS, type AuthorCardVariant } from "@/components/ui/uai/author-card";
import {
  CHANGELOG_ENTRY_VARIANTS,
  type ChangelogEntryVariant,
} from "@/components/ui/uai/changelog-entry";
import { COMMENT_VARIANTS, type CommentVariant } from "@/components/ui/uai/comment";
import { REACTION_BAR_VARIANTS, type ReactionBarVariant } from "@/components/ui/uai/reaction-bar";
import { SHARE_MENU_VARIANTS, type ShareMenuVariant } from "@/components/ui/uai/share-menu";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { AuthorCardPreview } from "./author-card-preview";
import { ChangelogEntryPreview } from "./changelog-entry-preview";
import { CommentPreview } from "./comment-preview";
import { ReactionBarPreview } from "./reaction-bar-preview";
import { ShareMenuPreview } from "./share-menu-preview";

const controls: Record<string, { label: string; variants: readonly string[] }> = {
  "author-card": { label: "author card variant", variants: AUTHOR_CARD_VARIANTS },
  comment: { label: "comment variant", variants: COMMENT_VARIANTS },
  "reaction-bar": { label: "reaction bar variant", variants: REACTION_BAR_VARIANTS },
  "share-menu": { label: "share menu variant", variants: SHARE_MENU_VARIANTS },
  "changelog-entry": { label: "changelog entry variant", variants: CHANGELOG_ENTRY_VARIANTS },
};

export function getCommunityPreviewControl(itemId: string): PreviewControl | undefined {
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

export function CommunityPreview({ itemId, selection }: { itemId: string; selection: string }) {
  return (
    <PreviewStage label="Content and community">
      <div
        style={{
          width: "100%",
          maxWidth:
            itemId === "reaction-bar" || itemId === "share-menu"
              ? 420
              : itemId === "changelog-entry"
                ? 640
                : 520,
          minWidth: 0,
          minHeight: itemId === "share-menu" || itemId === "reaction-bar" ? 220 : undefined,
          padding: "24px 0",
        }}
      >
        {itemId === "author-card" && <AuthorCardPreview variant={selection as AuthorCardVariant} />}
        {itemId === "comment" && <CommentPreview variant={selection as CommentVariant} />}
        {itemId === "reaction-bar" && (
          <ReactionBarPreview variant={selection as ReactionBarVariant} />
        )}
        {itemId === "share-menu" && <ShareMenuPreview variant={selection as ShareMenuVariant} />}
        {itemId === "changelog-entry" && (
          <ChangelogEntryPreview variant={selection as ChangelogEntryVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
