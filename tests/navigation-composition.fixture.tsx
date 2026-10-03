import { AppSidebarPreview } from "@/components/registry/navigation/app-sidebar-preview";
import { BreadcrumbTrailPreview } from "@/components/registry/navigation/breadcrumb-trail-preview";
import { CommandMenuPreview } from "@/components/registry/navigation/command-menu-preview";
import { PageTabsPreview } from "@/components/registry/navigation/page-tabs-preview";
import { SplitPanePreview } from "@/components/registry/navigation/split-pane-preview";

export function NavigationCompositionFixture() {
  return (
    <>
      <AppSidebarPreview />
      <BreadcrumbTrailPreview />
      <PageTabsPreview />
      <CommandMenuPreview />
      <SplitPanePreview />
    </>
  );
}
