"use client";

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
