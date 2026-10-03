"use client";

import { MessageSquare, MessagesSquare } from "lucide-react";
import { useState } from "react";
import {
  CommunityFeed,
  CommunityFeedDescription,
  CommunityFeedEmpty,
  CommunityFeedFilter,
  CommunityFeedFilters,
  CommunityFeedHeader,
  CommunityFeedPagination,
  CommunityFeedPost,
  CommunityFeedPostAuthor,
  CommunityFeedPostBody,
  CommunityFeedPostFooter,
  CommunityFeedPostHeader,
  CommunityFeedPostMeta,
  CommunityFeedPostReactions,
  CommunityFeedPosts,
  CommunityFeedPostTag,
  CommunityFeedPostTags,
  CommunityFeedPostTime,
  CommunityFeedPostTitle,
  CommunityFeedTitle,
  type CommunityFeedVariant,
} from "@/components/uai/community-feed";
import { AuthorCardAvatar, AuthorCardName, AuthorCardRole } from "@/components/ui/uai/author-card";
import {
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import { ReactionBarItem } from "@/components/ui/uai/reaction-bar";

const posts = [
  {
    id: "p1",
    kind: "show",
    author: "Amara Okafor",
    role: "Maintainer of kiln-plugin-maps",
    time: "2026-09-30T07:45",
    label: "3h ago",
    title: "Show Kiln: offline maps for documentation sites",
    body: "Tiles are pre-rendered at build time, so the map works without a tile server. The cache from 4.2 keeps rebuilds under a second.",
    tags: ["plugins", "maps"],
    likes: 48,
    replies: 12,
  },
  {
    id: "p2",
    kind: "question",
    author: "Jonas Berg",
    role: "Docs lead at Lumen",
    time: "2026-09-29T18:20",
    label: "Yesterday",
    title: "How do you version docs for three supported releases?",
    body: "We keep a branch per release and build each one separately. It works, but search shows results from every version at once.",
    tags: ["versioning", "search"],
    likes: 17,
    replies: 9,
  },
  {
    id: "p3",
    kind: "question",
    author: "Mei Lin",
    role: "Frontend engineer",
    time: "2026-09-28T10:05",
    label: "Sep 28",
    title: "Images are blurry after upgrading to 4.1",
    body: "Retina screenshots look soft since the AVIF change. Setting quality to 80 helped, but file sizes doubled.",
    tags: ["images"],
    likes: 6,
    replies: 4,
  },
  {
    id: "p4",
    kind: "show",
    author: "Rafael Souza",
    role: "Indie developer",
    time: "2026-09-27T21:30",
    label: "Sep 27",
    title: "A Kiln theme that reads well in print",
    body: "Print styles for long guides: page breaks before headings, link URLs in footnotes, and no navigation chrome.",
    tags: ["themes", "print"],
    likes: 31,
    replies: 7,
  },
];
const perPage = 2;

export function CommunityFeedPreview({ variant = "list" }: { variant?: CommunityFeedVariant }) {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const matching = posts.filter((post) => filter === "all" || post.kind === filter);
  const visible = matching.slice((page - 1) * perPage, page * perPage);
  return (
    <CommunityFeed
      variant={variant}
      filter={filter}
      onFilterChange={setFilter}
      page={page}
      onPageChange={setPage}
    >
      <CommunityFeedHeader>
        <div style={{ display: "grid", gap: 4 }}>
          <CommunityFeedTitle>Community</CommunityFeedTitle>
          <CommunityFeedDescription>
            Questions, plugins, and themes from people building with Kiln.
          </CommunityFeedDescription>
        </div>
        <CommunityFeedFilters>
          <CommunityFeedFilter value="all">All</CommunityFeedFilter>
          <CommunityFeedFilter value="question">Questions</CommunityFeedFilter>
          <CommunityFeedFilter value="show">Show and tell</CommunityFeedFilter>
          <CommunityFeedFilter value="announcement">Announcements</CommunityFeedFilter>
        </CommunityFeedFilters>
      </CommunityFeedHeader>
      {visible.length ? (
        <CommunityFeedPosts>
          {visible.map((post) => (
            <CommunityFeedPost key={post.id}>
              <CommunityFeedPostHeader>
                <CommunityFeedPostAuthor>
                  <AuthorCardAvatar name={post.author} style={{ width: 24, height: 24 }} />
                  <AuthorCardName style={{ fontSize: 13, lineHeight: "18px" }}>
                    {post.author}
                  </AuthorCardName>
                  <AuthorCardRole>{post.role}</AuthorCardRole>
                </CommunityFeedPostAuthor>
                <CommunityFeedPostTime dateTime={post.time}>{post.label}</CommunityFeedPostTime>
              </CommunityFeedPostHeader>
              <CommunityFeedPostTitle href={`#${post.id}`}>{post.title}</CommunityFeedPostTitle>
              <CommunityFeedPostBody>{post.body}</CommunityFeedPostBody>
              <CommunityFeedPostTags>
                {post.tags.map((tag) => (
                  <CommunityFeedPostTag key={tag}>{tag}</CommunityFeedPostTag>
                ))}
              </CommunityFeedPostTags>
              <CommunityFeedPostFooter>
                <CommunityFeedPostReactions aria-label={`Reactions to ${post.title}`}>
                  <ReactionBarItem value="like" emoji="👍" label="Like" count={post.likes} />
                  <ReactionBarItem value="celebrate" emoji="🎉" label="Celebrate" count={4} />
                </CommunityFeedPostReactions>
                <CommunityFeedPostMeta href={`#${post.id}-replies`}>
                  <MessageSquare size={14} aria-hidden="true" />
                  {post.replies} replies
                </CommunityFeedPostMeta>
              </CommunityFeedPostFooter>
            </CommunityFeedPost>
          ))}
        </CommunityFeedPosts>
      ) : (
        <CommunityFeedEmpty>
          <EmptyStateMedia>
            <MessagesSquare />
          </EmptyStateMedia>
          <EmptyStateContent>
            <EmptyStateHeader>
              <EmptyStateTitle>No announcements yet</EmptyStateTitle>
              <EmptyStateDescription>
                Release news and events will show up here. Pick another filter to keep reading.
              </EmptyStateDescription>
            </EmptyStateHeader>
          </EmptyStateContent>
        </CommunityFeedEmpty>
      )}
      <CommunityFeedPagination pageCount={Math.ceil(matching.length / perPage)} />
    </CommunityFeed>
  );
}
