"use client";

import { APP_SIDEBAR_VARIANTS, type AppSidebarVariant } from "@/components/ui/uai/app-sidebar";
import {
  BREADCRUMB_TRAIL_VARIANTS,
  type BreadcrumbTrailVariant,
} from "@/components/ui/uai/breadcrumb-trail";
import { COMMAND_MENU_VARIANTS, type CommandMenuVariant } from "@/components/ui/uai/command-menu";
import { PAGE_TABS_VARIANTS, type PageTabsVariant } from "@/components/ui/uai/page-tabs";
import { SPLIT_PANE_VARIANTS, type SplitPaneVariant } from "@/components/ui/uai/split-pane";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { AppSidebarPreview } from "./app-sidebar-preview";
import { BreadcrumbTrailPreview } from "./breadcrumb-trail-preview";
import { CommandMenuPreview } from "./command-menu-preview";
import { PageTabsPreview } from "./page-tabs-preview";
import { SplitPanePreview } from "./split-pane-preview";

const controls: Record<string, { label: string; variants: readonly string[] }> = {
  "app-sidebar": { label: "app sidebar variant", variants: APP_SIDEBAR_VARIANTS },
  "breadcrumb-trail": { label: "breadcrumb trail variant", variants: BREADCRUMB_TRAIL_VARIANTS },
  "page-tabs": { label: "page tabs variant", variants: PAGE_TABS_VARIANTS },
  "command-menu": { label: "command menu variant", variants: COMMAND_MENU_VARIANTS },
  "split-pane": { label: "split pane variant", variants: SPLIT_PANE_VARIANTS },
};

export function getNavigationPreviewControl(itemId: string): PreviewControl | undefined {
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

export function NavigationPreview({ itemId, selection }: { itemId: string; selection: string }) {
  return (
    <PreviewStage label="Navigation and layout">
      <div
        style={{
          width: "100%",
          maxWidth: itemId === "command-menu" ? 480 : itemId === "breadcrumb-trail" ? 560 : 680,
          minWidth: 0,
          padding: "24px 0",
        }}
      >
        {itemId === "app-sidebar" && <AppSidebarPreview variant={selection as AppSidebarVariant} />}
        {itemId === "breadcrumb-trail" && (
          <BreadcrumbTrailPreview variant={selection as BreadcrumbTrailVariant} />
        )}
        {itemId === "page-tabs" && <PageTabsPreview variant={selection as PageTabsVariant} />}
        {itemId === "command-menu" && (
          <CommandMenuPreview variant={selection as CommandMenuVariant} />
        )}
        {itemId === "split-pane" && <SplitPanePreview variant={selection as SplitPaneVariant} />}
      </div>
    </PreviewStage>
  );
}
