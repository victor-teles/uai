"use client";

import { Reply } from "lucide-react";
import { useState } from "react";
import {
  Comment,
  CommentAction,
  CommentActions,
  CommentAuthor,
  CommentAvatar,
  CommentBody,
  CommentEdited,
  CommentEditor,
  CommentEditTrigger,
  CommentHeader,
  type CommentModeration,
  CommentReplies,
  CommentTime,
  type CommentVariant,
} from "@/components/ui/uai/comment";
import { ReactionBar, ReactionBarItem } from "@/components/ui/uai/reaction-bar";

export function CommentPreview({ variant = "thread" }: { variant?: CommentVariant }) {
  const [text, setText] = useState(
    "Could we keep the old export format for one more release? Finance still imports it by hand.",
  );
  const [edited, setEdited] = useState(false);
  const [moderation, setModeration] = useState<CommentModeration>("hidden");
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Comment variant={variant}>
        <CommentHeader>
          <CommentAvatar name="Jonas Weber" />
          <CommentAuthor>Jonas Weber</CommentAuthor>
          <CommentTime dateTime="2026-09-29T14:12">2 hours ago</CommentTime>
          {edited && <CommentEdited />}
        </CommentHeader>
        <CommentBody>{text}</CommentBody>
        <CommentEditor
          defaultValue={text}
          onSave={(next) => {
            setText(next);
            setEdited(true);
          }}
        />
        <CommentActions>
          <ReactionBar variant="compact" aria-label="Reactions to Jonas Weber’s comment">
            <ReactionBarItem value="thumbs-up" emoji="👍" label="Thumbs up" count={4} />
          </ReactionBar>
          <CommentAction>
            <Reply size={13} strokeWidth={1.75} aria-hidden="true" />
            Reply
          </CommentAction>
          <CommentEditTrigger />
        </CommentActions>
        <CommentReplies>
          <Comment variant={variant}>
            <CommentHeader>
              <CommentAvatar name="Priya Raman" />
              <CommentAuthor>Priya Raman</CommentAuthor>
              <CommentTime dateTime="2026-09-29T15:40">35 minutes ago</CommentTime>
            </CommentHeader>
            <CommentBody>Yes. I’ll keep both formats behind a setting until November.</CommentBody>
            <CommentActions>
              <CommentAction>
                <Reply size={13} strokeWidth={1.75} aria-hidden="true" />
                Reply
              </CommentAction>
            </CommentActions>
          </Comment>
          <Comment variant={variant} moderation={moderation}>
            <CommentHeader>
              <CommentAvatar name="Guest 4821" />
              <CommentAuthor>Guest 4821</CommentAuthor>
              <CommentTime dateTime="2026-09-29T15:52">23 minutes ago</CommentTime>
            </CommentHeader>
            <CommentBody>Just use a spreadsheet, nobody reads these threads anyway.</CommentBody>
          </Comment>
        </CommentReplies>
      </Comment>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          fontSize: 12,
          color: "var(--uai-subtle)",
        }}
      >
        Preview moderation
        <select
          value={moderation}
          onChange={(event) => setModeration(event.target.value as CommentModeration)}
          style={{
            height: 26,
            padding: "0 8px",
            border: 0,
            borderRadius: 8,
            background: "var(--uai-surface-raised)",
            color: "var(--uai-text)",
            fontSize: 12,
          }}
        >
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
          <option value="flagged">Flagged</option>
          <option value="removed">Removed</option>
        </select>
      </label>
    </div>
  );
}
