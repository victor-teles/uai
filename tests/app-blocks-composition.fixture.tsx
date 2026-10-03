import { BillingPortalPreview } from "@/components/registry/app-blocks/billing-portal-preview";
import { DashboardShellPreview } from "@/components/registry/app-blocks/dashboard-shell-preview";
import { NotificationCenterPreview } from "@/components/registry/app-blocks/notification-center-preview";
import { ProfilePagePreview } from "@/components/registry/app-blocks/profile-page-preview";
import { SearchResultsPreview } from "@/components/registry/app-blocks/search-results-preview";
import { SettingsPagePreview } from "@/components/registry/app-blocks/settings-page-preview";
import { TeamManagementPreview } from "@/components/registry/app-blocks/team-management-preview";

export function AppBlocksCompositionFixture() {
  return (
    <>
      <DashboardShellPreview />
      <SettingsPagePreview />
      <ProfilePagePreview />
      <TeamManagementPreview />
      <NotificationCenterPreview />
      <BillingPortalPreview />
      <SearchResultsPreview />
    </>
  );
}
