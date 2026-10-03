import { MessageSquare, ScrollText, Share2, SmilePlus, UserRound } from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type CommunityItemId =
  | "author-card"
  | "comment"
  | "reaction-bar"
  | "share-menu"
  | "changelog-entry";

export const communityCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "author-card",
    name: "Author Card",
    category: "Content",
    icon: UserRound,
    description: "Identity, biography, profile links, and a follow toggle.",
    usage: `"use client";

import {
  AuthorCard,
  AuthorCardAvatar,
  AuthorCardBio,
  AuthorCardFollow,
  AuthorCardHeader,
  AuthorCardLink,
  AuthorCardLinks,
  AuthorCardName,
  AuthorCardRole,
  type AuthorCardVariant,
} from "@/components/ui/uai/author-card";

export function AuthorCardPreview({ variant = "card" }: { variant?: AuthorCardVariant }) {
  return (
    <AuthorCard variant={variant}>
      <AuthorCardAvatar name="Marta Oliveira" />
      <AuthorCardHeader>
        <div>
          <AuthorCardName>Marta Oliveira</AuthorCardName>
          <AuthorCardRole>Staff engineer, Payments</AuthorCardRole>
        </div>
        <AuthorCardFollow />
      </AuthorCardHeader>
      <AuthorCardBio>
        Writes about retry budgets, idempotent APIs, and the boring parts of moving money between
        banks.
      </AuthorCardBio>
      <AuthorCardLinks>
        <AuthorCardLink href="#posts" onClick={(event) => event.preventDefault()}>
          42 posts
        </AuthorCardLink>
        <AuthorCardLink href="#github" onClick={(event) => event.preventDefault()}>
          GitHub
        </AuthorCardLink>
        <AuthorCardLink href="#site" onClick={(event) => event.preventDefault()}>
          marta.dev
        </AuthorCardLink>
      </AuthorCardLinks>
    </AuthorCard>
  );
}
`,
    accessibility: [
      "The card is an article labelled by the author name; the avatar is decorative and falls back to initials when the image is missing or fails.",
      "Follow is a toggle button with aria-pressed and a constant visible label, described by the author name.",
      "Profile links are a labelled list of native links with visible focus.",
    ],
  },
  {
    id: "comment",
    name: "Comment",
    category: "Content",
    icon: MessageSquare,
    description: "Replies, reactions, inline editing, moderation states, and timestamps.",
    usage: `"use client";

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
`,
    accessibility: [
      "Each comment is an article labelled by its author; timestamps use a machine-readable time element.",
      "Edit moves focus into a labelled textarea; Escape cancels, Ctrl or Cmd+Enter saves, and focus returns to the Edit button.",
      "Hidden comments expose a Show button with aria-expanded; removed and flagged states are stated in text, not color.",
      "Replies nest as a labelled section of comments, so the thread structure is available to assistive technology.",
    ],
  },
  {
    id: "reaction-bar",
    name: "Reaction Bar",
    category: "Content",
    icon: SmilePlus,
    description: "Reaction counts and selected states with accessible names.",
    usage: `"use client";

import { useState } from "react";
import {
  ReactionBar,
  ReactionBarItem,
  ReactionBarPicker,
  ReactionBarPickerOption,
  type ReactionBarVariant,
} from "@/components/ui/uai/reaction-bar";

const reactions = [
  { value: "thumbs-up", emoji: "👍", label: "Thumbs up", count: 12 },
  { value: "heart", emoji: "❤️", label: "Heart", count: 5 },
  { value: "rocket", emoji: "🚀", label: "Rocket", count: 3 },
  { value: "eyes", emoji: "👀", label: "Eyes", count: 0 },
  { value: "party", emoji: "🎉", label: "Party", count: 0 },
];

export function ReactionBarPreview({ variant = "pill" }: { variant?: ReactionBarVariant }) {
  const [selected, setSelected] = useState<string[]>(["heart"]);
  return (
    <ReactionBar
      variant={variant}
      aria-label="Reactions to this release note"
      value={selected}
      onValueChange={setSelected}
    >
      {reactions.map((reaction) => {
        const count = reaction.count + (selected.includes(reaction.value) ? 1 : 0);
        if (count === 0) return null;
        return (
          <ReactionBarItem
            key={reaction.value}
            value={reaction.value}
            emoji={reaction.emoji}
            label={reaction.label}
            count={count}
          />
        );
      })}
      <ReactionBarPicker>
        {reactions.map((reaction) => (
          <ReactionBarPickerOption
            key={reaction.value}
            value={reaction.value}
            emoji={reaction.emoji}
            label={reaction.label}
          />
        ))}
      </ReactionBarPicker>
    </ReactionBar>
  );
}
`,
    accessibility: [
      "Each reaction is a toggle button with aria-pressed and a name that includes the reaction and its count.",
      "The add-reaction picker is an APG menu button: arrows, Home, End, Escape, and Tab move or close focus.",
      "Picker options are menuitemcheckbox elements that report whether the reaction is already selected.",
    ],
  },
  {
    id: "share-menu",
    name: "Share Menu",
    category: "Content",
    icon: Share2,
    description: "Native sharing, copy-link feedback, and share channels in a floating menu.",
    usage: `"use client";

import { AtSign, Mail } from "lucide-react";
import {
  ShareMenu,
  ShareMenuChannel,
  ShareMenuContent,
  ShareMenuCopy,
  ShareMenuNative,
  ShareMenuSeparator,
  ShareMenuTrigger,
  type ShareMenuVariant,
} from "@/components/ui/uai/share-menu";

const url = "https://uai.dev/blog/retry-budgets";
const title = "Retry budgets in practice";

export function ShareMenuPreview({ variant = "outlined" }: { variant?: ShareMenuVariant }) {
  return (
    <ShareMenu variant={variant} url={url} shareTitle={title}>
      <ShareMenuTrigger>Share article</ShareMenuTrigger>
      <ShareMenuContent>
        <ShareMenuNative />
        <ShareMenuCopy />
        <ShareMenuSeparator />
        <ShareMenuChannel
          href={\`mailto:?subject=\${encodeURIComponent(title)}&body=\${encodeURIComponent(url)}\`}
        >
          <Mail size={14} aria-hidden="true" />
          Email
        </ShareMenuChannel>
        <ShareMenuChannel
          href={\`https://bsky.app/intent/compose?text=\${encodeURIComponent(\`\${title} \${url}\`)}\`}
        >
          <AtSign size={14} aria-hidden="true" />
          Bluesky
        </ShareMenuChannel>
      </ShareMenuContent>
    </ShareMenu>
  );
}
`,
    accessibility: [
      "The trigger is an APG menu button with aria-haspopup, aria-expanded, and Arrow Up or Down to open.",
      "Arrow keys, Home, and End move focus between items; Escape closes and returns focus to the trigger.",
      "Copy results are announced in a polite live region, and the native share item appears only where navigator.share exists.",
    ],
  },
  {
    id: "changelog-entry",
    name: "Changelog Entry",
    category: "Content",
    icon: ScrollText,
    description: "Release date, version, categories, and linked changes.",
    usage: `import {
  ChangelogEntry,
  ChangelogEntryBody,
  ChangelogEntryCategories,
  ChangelogEntryCategory,
  ChangelogEntryChange,
  ChangelogEntryChanges,
  ChangelogEntryContent,
  ChangelogEntryDate,
  ChangelogEntryHeader,
  ChangelogEntryTitle,
  type ChangelogEntryVariant,
  ChangelogEntryVersion,
} from "@/components/ui/uai/changelog-entry";

export function ChangelogEntryPreview({
  variant = "timeline",
}: {
  variant?: ChangelogEntryVariant;
}) {
  return (
    <ChangelogEntry variant={variant}>
      <ChangelogEntryHeader>
        <ChangelogEntryVersion>v2.8.0</ChangelogEntryVersion>
        <ChangelogEntryDate dateTime="2026-09-24">September 24, 2026</ChangelogEntryDate>
      </ChangelogEntryHeader>
      <ChangelogEntryContent>
        <ChangelogEntryTitle>Scheduled exports and faster search</ChangelogEntryTitle>
        <ChangelogEntryCategories>
          <ChangelogEntryCategory tone="added">Added</ChangelogEntryCategory>
          <ChangelogEntryCategory tone="improved">Improved</ChangelogEntryCategory>
          <ChangelogEntryCategory tone="fixed">Fixed</ChangelogEntryCategory>
        </ChangelogEntryCategories>
        <ChangelogEntryBody>
          Exports can now run on a schedule, and workspace search returns results in about half the
          time.
        </ChangelogEntryBody>
        <ChangelogEntryChanges>
          <ChangelogEntryChange href="#scheduled-exports">
            Schedule CSV exports daily or weekly
          </ChangelogEntryChange>
          <ChangelogEntryChange href="#search">
            Search indexes comments and attachments
          </ChangelogEntryChange>
          <ChangelogEntryChange>Fixed duplicate rows when an export retried</ChangelogEntryChange>
        </ChangelogEntryChanges>
      </ChangelogEntryContent>
    </ChangelogEntry>
  );
}
`,
    accessibility: [
      "Each entry is an article labelled by its heading; set the heading level to match the page outline.",
      "Release dates use a machine-readable time element, and categories are a labelled list with text labels.",
      "Changes are a native list; linked changes are ordinary links with a decorative arrow.",
    ],
  },
];
