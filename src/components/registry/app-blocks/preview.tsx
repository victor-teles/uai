"use client";

import {
  BILLING_PORTAL_VARIANTS,
  type BillingPortalVariant,
} from "@/components/uai/billing-portal";
import {
  DASHBOARD_SHELL_VARIANTS,
  type DashboardShellVariant,
} from "@/components/uai/dashboard-shell";
import {
  NOTIFICATION_CENTER_VARIANTS,
  type NotificationCenterVariant,
} from "@/components/uai/notification-center";
import { PROFILE_PAGE_VARIANTS, type ProfilePageVariant } from "@/components/uai/profile-page";
import {
  SEARCH_RESULTS_VARIANTS,
  type SearchResultsVariant,
} from "@/components/uai/search-results";
import { SETTINGS_PAGE_VARIANTS, type SettingsPageVariant } from "@/components/uai/settings-page";
import {
  TEAM_MANAGEMENT_VARIANTS,
  type TeamManagementVariant,
} from "@/components/uai/team-management";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { BillingPortalPreview } from "./billing-portal-preview";
import { DashboardShellPreview } from "./dashboard-shell-preview";
import { NotificationCenterPreview } from "./notification-center-preview";
import { ProfilePagePreview } from "./profile-page-preview";
import { SearchResultsPreview } from "./search-results-preview";
import { SettingsPagePreview } from "./settings-page-preview";
import { TeamManagementPreview } from "./team-management-preview";

const controls: Record<string, { label: string; variants: readonly string[]; width: number }> = {
  "dashboard-shell": {
    label: "dashboard shell layout",
    variants: DASHBOARD_SHELL_VARIANTS,
    width: 960,
  },
  "settings-page": { label: "settings page layout", variants: SETTINGS_PAGE_VARIANTS, width: 760 },
  "profile-page": { label: "profile page layout", variants: PROFILE_PAGE_VARIANTS, width: 880 },
  "team-management": {
    label: "team management layout",
    variants: TEAM_MANAGEMENT_VARIANTS,
    width: 800,
  },
  "notification-center": {
    label: "notification center layout",
    variants: NOTIFICATION_CENTER_VARIANTS,
    width: 560,
  },
  "billing-portal": {
    label: "billing portal layout",
    variants: BILLING_PORTAL_VARIANTS,
    width: 880,
  },
  "search-results": {
    label: "search results layout",
    variants: SEARCH_RESULTS_VARIANTS,
    width: 860,
  },
};

export function getAppBlocksPreviewControl(itemId: string): PreviewControl | undefined {
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

export function AppBlocksPreview({ itemId, selection }: { itemId: string; selection: string }) {
  return (
    <PreviewStage label="Application surfaces">
      <div
        style={{
          width: "100%",
          maxWidth: controls[itemId]?.width ?? 880,
          minWidth: 0,
          padding: "24px 0",
        }}
      >
        {itemId === "dashboard-shell" && (
          <DashboardShellPreview variant={selection as DashboardShellVariant} />
        )}
        {itemId === "settings-page" && (
          <SettingsPagePreview variant={selection as SettingsPageVariant} />
        )}
        {itemId === "profile-page" && (
          <ProfilePagePreview variant={selection as ProfilePageVariant} />
        )}
        {itemId === "team-management" && (
          <TeamManagementPreview variant={selection as TeamManagementVariant} />
        )}
        {itemId === "notification-center" && (
          <NotificationCenterPreview variant={selection as NotificationCenterVariant} />
        )}
        {itemId === "billing-portal" && (
          <BillingPortalPreview variant={selection as BillingPortalVariant} />
        )}
        {itemId === "search-results" && (
          <SearchResultsPreview variant={selection as SearchResultsVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
