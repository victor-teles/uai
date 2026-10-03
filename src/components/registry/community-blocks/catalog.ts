import { BookText, CircleUserRound, History, MessagesSquare, Newspaper, Rss } from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type CommunityBlocksItemId =
  | "article-page"
  | "documentation-page"
  | "changelog-page"
  | "comment-thread"
  | "community-feed"
  | "public-profile";

export const communityBlocksCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "article-page",
    name: "Article Page",
    category: "Content",
    icon: Newspaper,
    description:
      "Long-form reading with metadata, text size controls, sharing, and related articles.",
    usage: `"use client";

import {
  ArticlePage,
  ArticlePageAuthor,
  ArticlePageCategory,
  ArticlePageContent,
  ArticlePageDescription,
  ArticlePageDetails,
  ArticlePageHeader,
  ArticlePageMeta,
  ArticlePageRelated,
  ArticlePageRelatedItem,
  ArticlePageRelatedList,
  ArticlePageRelatedMeta,
  ArticlePageRelatedTitle,
  ArticlePageShare,
  ArticlePageTextSizeControl,
  ArticlePageTextSizeOption,
  ArticlePageTitle,
  ArticlePageToolbar,
  type ArticlePageVariant,
} from "@/components/uai/article-page";
import { AuthorCardAvatar, AuthorCardName } from "@/components/ui/uai/author-card";
import {
  ShareMenuChannel,
  ShareMenuContent,
  ShareMenuCopy,
  ShareMenuNative,
  ShareMenuSeparator,
  ShareMenuTrigger,
} from "@/components/ui/uai/share-menu";

export function ArticlePagePreview({ variant = "centered" }: { variant?: ArticlePageVariant }) {
  return (
    <ArticlePage variant={variant}>
      <ArticlePageHeader>
        <ArticlePageCategory>Engineering · Build performance</ArticlePageCategory>
        <ArticlePageTitle>How we cut cold builds from 41 seconds to 9</ArticlePageTitle>
        <ArticlePageDescription>
          Kiln 4.2 caches parsed templates on disk and skips image work that has not changed. Here
          is what we measured, what we threw away, and what is still slow.
        </ArticlePageDescription>
        <ArticlePageMeta>
          <ArticlePageAuthor>
            <AuthorCardAvatar name="Ines Moreau" />
            <AuthorCardName>Ines Moreau</AuthorCardName>
            <ArticlePageDetails>
              <time dateTime="2026-09-24">September 24, 2026</time>
              <span aria-hidden="true">·</span>
              <span>8 min read</span>
            </ArticlePageDetails>
          </ArticlePageAuthor>
          <ArticlePageToolbar>
            <ArticlePageTextSizeControl>
              <ArticlePageTextSizeOption value="small" aria-label="Small text">
                A
              </ArticlePageTextSizeOption>
              <ArticlePageTextSizeOption value="default" aria-label="Default text">
                A
              </ArticlePageTextSizeOption>
              <ArticlePageTextSizeOption value="large" aria-label="Large text">
                A
              </ArticlePageTextSizeOption>
            </ArticlePageTextSizeControl>
            <ArticlePageShare
              url="https://kiln.example/blog/cold-builds"
              shareTitle="How we cut cold builds from 41 seconds to 9"
            >
              <ShareMenuTrigger />
              <ShareMenuContent align="end">
                <ShareMenuCopy />
                <ShareMenuNative />
                <ShareMenuSeparator />
                <ShareMenuChannel href="https://mastodon.example/share?url=https%3A%2F%2Fkiln.example%2Fblog%2Fcold-builds">
                  Mastodon
                </ShareMenuChannel>
                <ShareMenuChannel href="mailto:?subject=Kiln%20cold%20builds&body=https%3A%2F%2Fkiln.example%2Fblog%2Fcold-builds">
                  Email
                </ShareMenuChannel>
              </ShareMenuContent>
            </ArticlePageShare>
          </ArticlePageToolbar>
        </ArticlePageMeta>
      </ArticlePageHeader>
      <ArticlePageContent>
        <p>
          A cold build is the first build after cloning a site or clearing the cache. For a
          2,400-page documentation site, Kiln 4.1 spent 41 seconds there, and most of it was work we
          had already done on the previous machine.
        </p>
        <h2>Where the time went</h2>
        <p>
          Profiling twelve large sites showed the same shape: 58% of the time parsing templates, 27%
          resizing images, and the rest writing files. Template parsing was the surprise. The same
          140 partials were parsed again for every page that used them.
        </p>
        <blockquote>
          We assumed images were the problem because they were the loudest part of the log.
        </blockquote>
        <h2>What changed in 4.2</h2>
        <ul>
          <li>Parsed templates are stored in the cache, keyed by their content hash.</li>
          <li>Images are only resized when the source or the requested size changes.</li>
          <li>Pages write in parallel, up to the number of available cores.</li>
        </ul>
        <p>
          On the same site, a cold build now takes 9 seconds and a warm build takes under 2. Read
          the <a href="#cache-guide">cache guide</a> to share the cache between CI runs.
        </p>
      </ArticlePageContent>
      <ArticlePageRelated>
        <ArticlePageRelatedTitle>Related reading</ArticlePageRelatedTitle>
        <ArticlePageRelatedList>
          <ArticlePageRelatedItem href="#incremental">
            Incremental builds, explained
            <ArticlePageRelatedMeta>6 min read</ArticlePageRelatedMeta>
          </ArticlePageRelatedItem>
          <ArticlePageRelatedItem href="#ci-cache">
            Sharing the build cache in CI
            <ArticlePageRelatedMeta>4 min read</ArticlePageRelatedMeta>
          </ArticlePageRelatedItem>
          <ArticlePageRelatedItem href="#release-4-2">
            Kiln 4.2 release notes
            <ArticlePageRelatedMeta>Changelog</ArticlePageRelatedMeta>
          </ArticlePageRelatedItem>
        </ArticlePageRelatedList>
      </ArticlePageRelated>
    </ArticlePage>
  );
}
`,
    accessibility: [
      "The page is an article named by its h1 title. Related reading is a complementary region named by its h2.",
      "Text size is an APG radio group: one tab stop, arrow keys, Home, and End move and select. Each option has a spoken name.",
      "Sharing is a Share Menu: a menu button with arrow-key navigation, Escape to close, and a status message after copying.",
      "Reading size changes the type in the content only, so the layout and controls stay where readers left them.",
    ],
  },
  {
    id: "documentation-page",
    name: "Documentation Page",
    category: "Content",
    icon: BookText,
    description:
      "Navigation, an in-page table of contents with the current section, content, and page actions.",
    usage: `"use client";

import { BookOpen, Boxes, Rocket, Settings2 } from "lucide-react";
import { useState } from "react";
import {
  DocumentationPage,
  DocumentationPageAction,
  DocumentationPageActionLink,
  DocumentationPageActions,
  DocumentationPageBreadcrumb,
  DocumentationPageContent,
  DocumentationPageDescription,
  DocumentationPageHeader,
  DocumentationPageMain,
  DocumentationPageNav,
  DocumentationPagePager,
  DocumentationPagePagerLink,
  DocumentationPageSection,
  DocumentationPageSectionTitle,
  DocumentationPageTitle,
  DocumentationPageToc,
  DocumentationPageTocItem,
  DocumentationPageTocList,
  DocumentationPageTocTitle,
  type DocumentationPageVariant,
} from "@/components/uai/documentation-page";
import {
  AppSidebarGroup,
  AppSidebarGroupLabel,
  AppSidebarHeader,
  AppSidebarItem,
  AppSidebarItemIcon,
  AppSidebarItemLabel,
  AppSidebarList,
  AppSidebarMobileTrigger,
  AppSidebarNav,
  AppSidebarTitle,
} from "@/components/ui/uai/app-sidebar";
import { BreadcrumbTrailItem } from "@/components/ui/uai/breadcrumb-trail";

export function DocumentationPagePreview({
  variant = "columns",
}: {
  variant?: DocumentationPageVariant;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <DocumentationPage variant={variant} defaultActiveSection="install">
      <DocumentationPageNav defaultValue="caching">
        <AppSidebarHeader>
          <AppSidebarTitle>Kiln docs</AppSidebarTitle>
          <AppSidebarMobileTrigger />
        </AppSidebarHeader>
        <AppSidebarNav aria-label="Documentation">
          <AppSidebarGroup>
            <AppSidebarGroupLabel>Get started</AppSidebarGroupLabel>
            <AppSidebarList>
              <AppSidebarItem value="quickstart">
                <AppSidebarItemIcon>
                  <Rocket size={16} />
                </AppSidebarItemIcon>
                <AppSidebarItemLabel>Quickstart</AppSidebarItemLabel>
              </AppSidebarItem>
              <AppSidebarItem value="concepts">
                <AppSidebarItemIcon>
                  <BookOpen size={16} />
                </AppSidebarItemIcon>
                <AppSidebarItemLabel>Core concepts</AppSidebarItemLabel>
              </AppSidebarItem>
            </AppSidebarList>
          </AppSidebarGroup>
          <AppSidebarGroup>
            <AppSidebarGroupLabel>Guides</AppSidebarGroupLabel>
            <AppSidebarList>
              <AppSidebarItem value="caching">
                <AppSidebarItemIcon>
                  <Boxes size={16} />
                </AppSidebarItemIcon>
                <AppSidebarItemLabel>Build cache</AppSidebarItemLabel>
              </AppSidebarItem>
              <AppSidebarItem value="config">
                <AppSidebarItemIcon>
                  <Settings2 size={16} />
                </AppSidebarItemIcon>
                <AppSidebarItemLabel>Configuration</AppSidebarItemLabel>
              </AppSidebarItem>
            </AppSidebarList>
          </AppSidebarGroup>
        </AppSidebarNav>
      </DocumentationPageNav>
      <DocumentationPageToc>
        <DocumentationPageTocTitle>On this page</DocumentationPageTocTitle>
        <DocumentationPageTocList>
          <DocumentationPageTocItem section="install">Turn on the cache</DocumentationPageTocItem>
          <DocumentationPageTocItem section="ci">Share it in CI</DocumentationPageTocItem>
          <DocumentationPageTocItem section="ci-keys" level={3}>
            Cache keys
          </DocumentationPageTocItem>
          <DocumentationPageTocItem section="clear">Clear the cache</DocumentationPageTocItem>
        </DocumentationPageTocList>
      </DocumentationPageToc>
      <DocumentationPageMain>
        <DocumentationPageHeader>
          <DocumentationPageBreadcrumb>
            <BreadcrumbTrailItem href="#docs">Docs</BreadcrumbTrailItem>
            <BreadcrumbTrailItem href="#guides" parent>
              Guides
            </BreadcrumbTrailItem>
            <BreadcrumbTrailItem current>Build cache</BreadcrumbTrailItem>
          </DocumentationPageBreadcrumb>
          <DocumentationPageTitle>Build cache</DocumentationPageTitle>
          <DocumentationPageDescription>
            Keep parsed templates and resized images between builds, so only changed pages do any
            work.
          </DocumentationPageDescription>
          <DocumentationPageActions>
            <DocumentationPageAction
              onClick={() => {
                void navigator.clipboard?.writeText("https://kiln.example/docs/build-cache");
                setCopied(true);
              }}
            >
              {copied ? "Link copied" : "Copy link"}
            </DocumentationPageAction>
            <DocumentationPageActionLink href="#edit">Edit this page</DocumentationPageActionLink>
          </DocumentationPageActions>
        </DocumentationPageHeader>
        <DocumentationPageContent>
          <DocumentationPageSection id="install">
            <DocumentationPageSectionTitle>Turn on the cache</DocumentationPageSectionTitle>
            <p>
              The cache is on by default from Kiln 4.2. Older projects opt in with one line in{" "}
              <code>kiln.config.ts</code>:
            </p>
            <pre>
              <code>{'export default { cache: { dir: ".kiln/cache" } };'}</code>
            </pre>
          </DocumentationPageSection>
          <DocumentationPageSection id="ci">
            <DocumentationPageSectionTitle>Share it in CI</DocumentationPageSectionTitle>
            <p>
              Restore <code>.kiln/cache</code> before the build step and save it afterwards. A
              restored cache brings a 2,400-page site from 41 seconds to about 9.
            </p>
          </DocumentationPageSection>
          <DocumentationPageSection id="ci-keys">
            <DocumentationPageSectionTitle>Cache keys</DocumentationPageSectionTitle>
            <p>
              Key the cache on your lockfile and Kiln version. Template and image entries are
              already keyed by content, so stale entries are never used.
            </p>
          </DocumentationPageSection>
          <DocumentationPageSection id="clear">
            <DocumentationPageSectionTitle>Clear the cache</DocumentationPageSectionTitle>
            <p>
              Run <code>kiln cache clear</code> after upgrading plugins that change output without
              changing their inputs.
            </p>
          </DocumentationPageSection>
        </DocumentationPageContent>
        <DocumentationPagePager>
          <DocumentationPagePagerLink direction="previous" href="#concepts">
            Core concepts
          </DocumentationPagePagerLink>
          <DocumentationPagePagerLink direction="next" href="#config">
            Configuration
          </DocumentationPagePagerLink>
        </DocumentationPagePager>
      </DocumentationPageMain>
    </DocumentationPage>
  );
}
`,
    accessibility: [
      "Site navigation is an App Sidebar: a labelled nav with aria-current on the current page and a mobile disclosure.",
      'The table of contents is a nav named by its title. The current section link carries aria-current="location", so position is not shown by color alone.',
      "Content is an article named by the h1. Each section is labelled by its h2 and keeps a scroll margin so linked headings are not hidden.",
      "Page actions are a labelled group of native buttons and links. The pager is a labelled nav with previous and next relationships.",
    ],
  },
  {
    id: "changelog-page",
    name: "Changelog Page",
    category: "Content",
    icon: History,
    description: "Releases grouped by date with version, category, and product area filters.",
    usage: `"use client";

import { SearchX } from "lucide-react";
import { useState } from "react";
import {
  ChangelogPage,
  ChangelogPageCount,
  ChangelogPageDescription,
  ChangelogPageEmpty,
  ChangelogPageFilter,
  ChangelogPageFilters,
  ChangelogPageGroup,
  ChangelogPageGroupTitle,
  ChangelogPageHeader,
  ChangelogPageRelease,
  ChangelogPageTitle,
  type ChangelogPageVariant,
} from "@/components/uai/changelog-page";
import {
  ChangelogEntryCategories,
  ChangelogEntryCategory,
  type ChangelogEntryCategoryTone,
  ChangelogEntryChange,
  ChangelogEntryChanges,
  ChangelogEntryContent,
  ChangelogEntryDate,
  ChangelogEntryHeader,
  ChangelogEntryTitle,
  ChangelogEntryVersion,
} from "@/components/ui/uai/changelog-entry";
import {
  EmptyStateAction,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import { FilterBarControls, FilterBarReset } from "@/components/ui/uai/filter-bar";

const categoryLabels: Record<ChangelogEntryCategoryTone, string> = {
  added: "Added",
  improved: "Improved",
  fixed: "Fixed",
  removed: "Removed",
  security: "Security",
};

const months = [
  {
    month: "September 2026",
    releases: [
      {
        version: "4.2.0",
        date: "2026-09-24",
        label: "Sep 24",
        title: "Persistent build cache",
        area: "Builds",
        categories: ["added", "improved"] as ChangelogEntryCategoryTone[],
        changes: [
          "Parsed templates are cached on disk, keyed by content hash.",
          "Images are resized only when the source or size changes.",
        ],
      },
      {
        version: "4.1.3",
        date: "2026-09-09",
        label: "Sep 9",
        title: "Safer dev server reloads",
        area: "Dev server",
        categories: ["fixed", "security"] as ChangelogEntryCategoryTone[],
        changes: [
          "Reloads no longer drop query strings.",
          "The dev server now binds to localhost unless --host is passed.",
        ],
      },
    ],
  },
  {
    month: "August 2026",
    releases: [
      {
        version: "4.1.0",
        date: "2026-08-19",
        label: "Aug 19",
        title: "Image formats and the legacy router",
        area: "Images",
        categories: ["added", "removed"] as ChangelogEntryCategoryTone[],
        changes: [
          "AVIF output for every responsive image size.",
          "The legacy router, deprecated since 3.0, has been removed.",
        ],
      },
    ],
  },
];

export function ChangelogPagePreview({ variant = "timeline" }: { variant?: ChangelogPageVariant }) {
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  return (
    <ChangelogPage
      variant={variant}
      category={category}
      onCategoryChange={setCategory}
      area={area}
      onAreaChange={setArea}
    >
      <ChangelogPageHeader>
        <div style={{ display: "grid", gap: 6 }}>
          <ChangelogPageTitle>Changelog</ChangelogPageTitle>
          <ChangelogPageDescription>
            Every Kiln release, grouped by month. Subscribe to the feed to hear about new versions.
          </ChangelogPageDescription>
        </div>
        <ChangelogPageCount />
      </ChangelogPageHeader>
      <ChangelogPageFilters>
        <FilterBarControls>
          <ChangelogPageFilter name="category" label="Category">
            <option value="">All categories</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </ChangelogPageFilter>
          <ChangelogPageFilter name="area" label="Product area">
            <option value="">All areas</option>
            <option value="Builds">Builds</option>
            <option value="Dev server">Dev server</option>
            <option value="Images">Images</option>
          </ChangelogPageFilter>
        </FilterBarControls>
        <FilterBarReset />
      </ChangelogPageFilters>
      {months.map((group) => (
        <ChangelogPageGroup key={group.month}>
          <ChangelogPageGroupTitle>{group.month}</ChangelogPageGroupTitle>
          {group.releases.map((release) => (
            <ChangelogPageRelease
              key={release.version}
              categories={release.categories}
              area={release.area}
            >
              <ChangelogEntryHeader>
                <ChangelogEntryVersion>v{release.version}</ChangelogEntryVersion>
                <ChangelogEntryDate dateTime={release.date}>{release.label}</ChangelogEntryDate>
                <span style={{ color: "var(--uai-subtle)", fontSize: 12 }}>{release.area}</span>
              </ChangelogEntryHeader>
              <ChangelogEntryContent>
                <ChangelogEntryTitle>{release.title}</ChangelogEntryTitle>
                <ChangelogEntryCategories>
                  {release.categories.map((tone) => (
                    <ChangelogEntryCategory key={tone} tone={tone}>
                      {categoryLabels[tone]}
                    </ChangelogEntryCategory>
                  ))}
                </ChangelogEntryCategories>
                <ChangelogEntryChanges>
                  {release.changes.map((change) => (
                    <ChangelogEntryChange key={change}>{change}</ChangelogEntryChange>
                  ))}
                </ChangelogEntryChanges>
              </ChangelogEntryContent>
            </ChangelogPageRelease>
          ))}
        </ChangelogPageGroup>
      ))}
      <ChangelogPageEmpty>
        <EmptyStateMedia>
          <SearchX />
        </EmptyStateMedia>
        <EmptyStateContent>
          <EmptyStateHeader>
            <EmptyStateTitle>No releases match these filters</EmptyStateTitle>
            <EmptyStateDescription>
              Try another category or product area, or clear the filters to see every release.
            </EmptyStateDescription>
          </EmptyStateHeader>
          <EmptyStateActions>
            <EmptyStateAction
              emphasis="secondary"
              onClick={() => {
                setCategory("");
                setArea("");
              }}
            >
              Clear filters
            </EmptyStateAction>
          </EmptyStateActions>
        </EmptyStateContent>
      </ChangelogPageEmpty>
    </ChangelogPage>
  );
}
`,
    accessibility: [
      "Filters are labelled native selects inside a Filter Bar, and Reset filters is disabled until a filter is active.",
      "A polite status announces how many releases match after each filter change.",
      "Each month is a section named by its h2, and each release is an article named by its h3 title. Empty months are removed from the page and the accessibility tree.",
      "Categories pair a color dot with a written label, and an empty result explains how to recover.",
    ],
  },
  {
    id: "comment-thread",
    name: "Comment Thread",
    category: "Content",
    icon: MessagesSquare,
    description: "Nested replies, reactions, sorting, moderation states, and a comment composer.",
    usage: `"use client";

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
              id: \`c\${current.length + 1}\`,
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
                aria-label={\`Reactions to \${comment.author}\`}
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
              <CommentReplies aria-label={\`Replies to \${comment.author}\`}>
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
`,
    accessibility: [
      "The thread is a section named by its h2. Each comment is an article named by its author, and replies are a labelled region.",
      "Sort order is an APG radio group with arrow-key, Home, and End selection.",
      "Reactions are toggle buttons with aria-pressed and spoken counts. Hidden, flagged, and removed comments say so in text.",
      "The composer text area is labelled, Command or Control + Enter submits, and the send button stays disabled while empty.",
    ],
  },
  {
    id: "community-feed",
    name: "Community Feed",
    category: "Content",
    icon: Rss,
    description: "Posts with authors, tags, reactions, filters, and numbered pagination.",
    usage: `"use client";

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
              <CommunityFeedPostTitle href={\`#\${post.id}\`}>{post.title}</CommunityFeedPostTitle>
              <CommunityFeedPostBody>{post.body}</CommunityFeedPostBody>
              <CommunityFeedPostTags>
                {post.tags.map((tag) => (
                  <CommunityFeedPostTag key={tag}>{tag}</CommunityFeedPostTag>
                ))}
              </CommunityFeedPostTags>
              <CommunityFeedPostFooter>
                <CommunityFeedPostReactions aria-label={\`Reactions to \${post.title}\`}>
                  <ReactionBarItem value="like" emoji="👍" label="Like" count={post.likes} />
                  <ReactionBarItem value="celebrate" emoji="🎉" label="Celebrate" count={4} />
                </CommunityFeedPostReactions>
                <CommunityFeedPostMeta href={\`#\${post.id}-replies\`}>
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
`,
    accessibility: [
      "Filters are an APG radio group. Changing the filter returns to the first page.",
      "Posts are an ordered list of articles, each named by its h3 title, with the author as a nested Author Card.",
      'Pagination is a labelled nav. The current page is marked with aria-current="page", and previous and next are disabled at the ends.',
      "Reactions are toggle buttons with aria-pressed and spoken counts; tags are a labelled list.",
    ],
  },
  {
    id: "public-profile",
    name: "Public Profile",
    category: "Content",
    icon: CircleUserRound,
    description: "Identity, links, follower counts, pinned work, and recent activity.",
    usage: `"use client";

import { GitPullRequest, MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import {
  PublicProfile,
  PublicProfileActivity,
  PublicProfileAside,
  PublicProfileIdentity,
  PublicProfileMain,
  PublicProfileSection,
  PublicProfileSectionTitle,
  PublicProfileStat,
  PublicProfileStats,
  type PublicProfileVariant,
  PublicProfileWork,
  PublicProfileWorkDescription,
  PublicProfileWorkItem,
  PublicProfileWorkMeta,
  PublicProfileWorkTitle,
} from "@/components/uai/public-profile";
import {
  ActivityTimelineContent,
  ActivityTimelineDate,
  ActivityTimelineEvent,
  ActivityTimelineEvents,
  ActivityTimelineGroup,
  ActivityTimelineMarker,
  ActivityTimelineTime,
  ActivityTimelineTitle,
} from "@/components/ui/uai/activity-timeline";
import {
  AuthorCardAvatar,
  AuthorCardBio,
  AuthorCardFollow,
  AuthorCardHeader,
  AuthorCardLink,
  AuthorCardLinks,
  AuthorCardName,
  AuthorCardRole,
} from "@/components/ui/uai/author-card";

export function PublicProfilePreview({ variant = "sidebar" }: { variant?: PublicProfileVariant }) {
  const [following, setFollowing] = useState(false);
  const followers = 1284 + (following ? 1 : 0);
  return (
    <PublicProfile variant={variant}>
      <PublicProfileAside>
        <PublicProfileIdentity>
          <AuthorCardAvatar name="Amara Okafor" />
          <AuthorCardHeader>
            <div style={{ display: "grid", gap: 2 }}>
              <AuthorCardName>Amara Okafor</AuthorCardName>
              <AuthorCardRole>Plugin author · Lagos</AuthorCardRole>
            </div>
            <AuthorCardFollow pressed={following} onPressedChange={setFollowing}>
              {following ? "Following" : "Follow"}
            </AuthorCardFollow>
          </AuthorCardHeader>
          <AuthorCardBio>
            Builds mapping and data plugins for Kiln. Previously on the maps team at a logistics
            startup.
          </AuthorCardBio>
          <AuthorCardLinks>
            <AuthorCardLink href="#site">amara.example</AuthorCardLink>
            <AuthorCardLink href="#code">Code</AuthorCardLink>
            <AuthorCardLink href="#mastodon">Mastodon</AuthorCardLink>
          </AuthorCardLinks>
        </PublicProfileIdentity>
        <PublicProfileStats>
          <PublicProfileStat label="Followers">
            {followers.toLocaleString("en-US")}
          </PublicProfileStat>
          <PublicProfileStat label="Following">86</PublicProfileStat>
          <PublicProfileStat label="Posts">142</PublicProfileStat>
        </PublicProfileStats>
      </PublicProfileAside>
      <PublicProfileMain>
        <PublicProfileSection>
          <PublicProfileSectionTitle>Pinned work</PublicProfileSectionTitle>
          <PublicProfileWork>
            <PublicProfileWorkItem href="#kiln-plugin-maps">
              <PublicProfileWorkTitle>kiln-plugin-maps</PublicProfileWorkTitle>
              <PublicProfileWorkDescription>
                Offline maps for documentation sites, rendered at build time.
              </PublicProfileWorkDescription>
              <PublicProfileWorkMeta>
                <span>2.1k stars</span>
                <span>Updated Sep 30</span>
              </PublicProfileWorkMeta>
            </PublicProfileWorkItem>
            <PublicProfileWorkItem href="#kiln-plugin-csv">
              <PublicProfileWorkTitle>kiln-plugin-csv</PublicProfileWorkTitle>
              <PublicProfileWorkDescription>
                Turns CSV files into sortable tables and typed page data.
              </PublicProfileWorkDescription>
              <PublicProfileWorkMeta>
                <span>640 stars</span>
                <span>Updated Aug 12</span>
              </PublicProfileWorkMeta>
            </PublicProfileWorkItem>
          </PublicProfileWork>
        </PublicProfileSection>
        <PublicProfileSection>
          <PublicProfileSectionTitle>Recent activity</PublicProfileSectionTitle>
          <PublicProfileActivity>
            <ActivityTimelineGroup>
              <ActivityTimelineDate>This week</ActivityTimelineDate>
              <ActivityTimelineEvents>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker>
                    <MessageSquare size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      Posted “Show Kiln: offline maps for documentation sites”
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-30T07:45">Today</ActivityTimelineTime>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker>
                    <GitPullRequest size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      Contributed cache keys to the CI guide
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-28T16:10">Sep 28</ActivityTimelineTime>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker>
                    <Star size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>Starred kiln-theme-print</ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-27T22:02">Sep 27</ActivityTimelineTime>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
              </ActivityTimelineEvents>
            </ActivityTimelineGroup>
          </PublicProfileActivity>
        </PublicProfileSection>
      </PublicProfileMain>
    </PublicProfile>
  );
}
`,
    accessibility: [
      "Identity is an Author Card named by the person's name. The follow button is a toggle with aria-pressed and is described by the name.",
      "Counts are a description list: each label is read before its value even though the value is shown first.",
      "Sections are named by their h2 titles. Pinned work is a list of links, and activity groups are named by their dates.",
    ],
  },
];
