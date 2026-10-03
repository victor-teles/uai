"use client";

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
