"use client";

import { useState } from "react";
import {
  CommentThread,
  CommentThreadComment,
  CommentThreadComposer,
  CommentThreadCount,
  CommentThreadHeader,
  CommentThreadList,
  CommentThreadReactions,
  CommentThreadSort,
  CommentThreadSortOption,
  CommentThreadTitle,
  type CommentThreadVariant,
} from "@/components/uai/comment-thread";
import {
  CommentAction,
  CommentActions,
  CommentAuthor,
  CommentAvatar,
  CommentBody,
  CommentHeader,
  type CommentModeration,
  CommentReplies,
  CommentTime,
} from "@/components/ui/uai/comment";
import { ReactionBarItem } from "@/components/ui/uai/reaction-bar";

type Reply = { id: string; author: string; time: string; label: string; body: string };
type Post = Reply & { score: number; moderation: CommentModeration; replies: Reply[] };

const initialComments: Post[] = [
  {
    id: "c1",
    author: "Tomás Rivera",
    time: "2026-09-29T14:02",
    label: "Yesterday",
    score: 24,
    moderation: "visible",
    body: "The cache took our docs build from 52 seconds to 11. Is there a way to see which pages were rebuilt?",
    replies: [
      {
        id: "c1-r1",
        author: "Ines Moreau",
        time: "2026-09-29T15:40",
        label: "Yesterday",
        body: "Run kiln build --explain. It lists every page with the reason it was rebuilt.",
      },
    ],
  },
  {
    id: "c2",
    author: "Priya Raman",
    time: "2026-09-30T08:15",
    label: "2 hours ago",
    score: 9,
    moderation: "visible",
    body: "Does the cache survive a plugin upgrade, or should we clear it in CI after bumping versions?",
    replies: [],
  },
  {
    id: "c3",
    author: "Guest 4821",
    time: "2026-09-30T09:01",
    label: "1 hour ago",
    score: 0,
    moderation: "flagged",
    body: "Check out my build service, it is 10x faster than this.",
    replies: [],
  },
];

export function CommentThreadPreview({ variant = "threaded" }: { variant?: CommentThreadVariant }) {
  const [sort, setSort] = useState("top");
  const [comments, setComments] = useState(initialComments);
  const sorted = [...comments].sort((a, b) =>
    sort === "top" ? b.score - a.score : sort === "newest" ? (a.time < b.time ? 1 : -1) : 0,
  );
  const moderate = (id: string, moderation: CommentModeration) =>
    setComments((current) =>
      current.map((comment) => (comment.id === id ? { ...comment, moderation } : comment)),
    );
  return (
    <CommentThread variant={variant} sort={sort} onSortChange={setSort}>
      <CommentThreadHeader>
        <CommentThreadTitle>
          Discussion <CommentThreadCount>{comments.length} comments</CommentThreadCount>
        </CommentThreadTitle>
        <CommentThreadSort>
          <CommentThreadSortOption value="top">Top</CommentThreadSortOption>
          <CommentThreadSortOption value="newest">Newest</CommentThreadSortOption>
        </CommentThreadSort>
      </CommentThreadHeader>
      <CommentThreadComposer
        onSubmit={(body) =>
          setComments((current) => [
            ...current,
            {
              id: `c${current.length + 1}`,
              author: "You",
              time: new Date().toISOString(),
              label: "Just now",
              score: 0,
              moderation: "visible",
              body,
              replies: [],
            },
          ])
        }
      />
      <CommentThreadList>
        {sorted.map((comment) => (
          <CommentThreadComment key={comment.id} moderation={comment.moderation}>
            <CommentHeader>
              <CommentAvatar name={comment.author} />
              <CommentAuthor>{comment.author}</CommentAuthor>
              <CommentTime dateTime={comment.time}>{comment.label}</CommentTime>
            </CommentHeader>
            <CommentBody>{comment.body}</CommentBody>
            {comment.moderation === "visible" && (
              <CommentThreadReactions
                defaultValue={comment.id === "c1" ? ["thanks"] : []}
                aria-label={`Reactions to ${comment.author}`}
              >
                <ReactionBarItem value="up" emoji="👍" label="Thumbs up" count={comment.score} />
                <ReactionBarItem value="thanks" emoji="🙏" label="Thanks" count={3} />
              </CommentThreadReactions>
            )}
            <CommentActions>
              <CommentAction>Reply</CommentAction>
              {comment.moderation === "flagged" ? (
                <>
                  <CommentAction onClick={() => moderate(comment.id, "visible")}>
                    Approve
                  </CommentAction>
                  <CommentAction onClick={() => moderate(comment.id, "removed")}>
                    Remove
                  </CommentAction>
                </>
              ) : comment.moderation === "hidden" ? (
                <CommentAction onClick={() => moderate(comment.id, "visible")}>
                  Unhide
                </CommentAction>
              ) : (
                <CommentAction onClick={() => moderate(comment.id, "hidden")}>Hide</CommentAction>
              )}
            </CommentActions>
            {comment.replies.length > 0 && (
              <CommentReplies aria-label={`Replies to ${comment.author}`}>
                {comment.replies.map((reply) => (
                  <CommentThreadComment key={reply.id}>
                    <CommentHeader>
                      <CommentAvatar name={reply.author} />
                      <CommentAuthor>{reply.author}</CommentAuthor>
                      <CommentTime dateTime={reply.time}>{reply.label}</CommentTime>
                    </CommentHeader>
                    <CommentBody>{reply.body}</CommentBody>
                  </CommentThreadComment>
                ))}
              </CommentReplies>
            )}
          </CommentThreadComment>
        ))}
      </CommentThreadList>
    </CommentThread>
  );
}
