"use client";

import { Bell, CircleHelp, FileText, Inbox, LayoutDashboard, Settings, Users } from "lucide-react";
import { useState } from "react";
import {
  AppSidebar,
  AppSidebarCollapseToggle,
  AppSidebarFooter,
  AppSidebarGroup,
  AppSidebarGroupLabel,
  AppSidebarHeader,
  AppSidebarItem,
  AppSidebarItemBadge,
  AppSidebarItemIcon,
  AppSidebarItemLabel,
  AppSidebarList,
  AppSidebarMobileTrigger,
  AppSidebarNav,
  AppSidebarSubmenu,
  AppSidebarSubmenuList,
  AppSidebarSubmenuTrigger,
  AppSidebarTitle,
  type AppSidebarVariant,
} from "@/components/ui/uai/app-sidebar";

const pages: Record<string, string> = {
  overview: "Overview",
  inbox: "Inbox",
  briefs: "Project briefs",
  contracts: "Contracts",
  team: "Team",
  alerts: "Notifications",
  settings: "Settings",
  help: "Help center",
};

export function AppSidebarPreview({ variant = "panel" }: { variant?: AppSidebarVariant }) {
  const [page, setPage] = useState("overview");
  return (
    <div style={{ display: "flex", height: 460, gap: 16 }}>
      <AppSidebar variant={variant} value={page} onValueChange={setPage}>
        <AppSidebarHeader>
          <AppSidebarTitle>Northwind Studio</AppSidebarTitle>
          <AppSidebarCollapseToggle />
          <AppSidebarMobileTrigger />
        </AppSidebarHeader>
        <AppSidebarNav>
          <AppSidebarGroup>
            <AppSidebarGroupLabel>Workspace</AppSidebarGroupLabel>
            <AppSidebarList>
              <AppSidebarItem value="overview" label="Overview" onClick={(e) => e.preventDefault()}>
                <AppSidebarItemIcon>
                  <LayoutDashboard size={16} />
                </AppSidebarItemIcon>
                <AppSidebarItemLabel>Overview</AppSidebarItemLabel>
              </AppSidebarItem>
              <AppSidebarItem value="inbox" label="Inbox" onClick={(e) => e.preventDefault()}>
                <AppSidebarItemIcon>
                  <Inbox size={16} />
                </AppSidebarItemIcon>
                <AppSidebarItemLabel>Inbox</AppSidebarItemLabel>
                <AppSidebarItemBadge>12</AppSidebarItemBadge>
              </AppSidebarItem>
              <AppSidebarSubmenu defaultOpen>
                <AppSidebarSubmenuTrigger label="Documents">
                  <AppSidebarItemIcon>
                    <FileText size={16} />
                  </AppSidebarItemIcon>
                  <AppSidebarItemLabel>Documents</AppSidebarItemLabel>
                </AppSidebarSubmenuTrigger>
                <AppSidebarSubmenuList>
                  <AppSidebarItem value="briefs" onClick={(e) => e.preventDefault()}>
                    <AppSidebarItemLabel>Project briefs</AppSidebarItemLabel>
                  </AppSidebarItem>
                  <AppSidebarItem value="contracts" onClick={(e) => e.preventDefault()}>
                    <AppSidebarItemLabel>Contracts</AppSidebarItemLabel>
                  </AppSidebarItem>
                </AppSidebarSubmenuList>
              </AppSidebarSubmenu>
              <AppSidebarItem value="team" label="Team" onClick={(e) => e.preventDefault()}>
                <AppSidebarItemIcon>
                  <Users size={16} />
                </AppSidebarItemIcon>
                <AppSidebarItemLabel>Team</AppSidebarItemLabel>
              </AppSidebarItem>
            </AppSidebarList>
          </AppSidebarGroup>
          <AppSidebarGroup>
            <AppSidebarGroupLabel>Account</AppSidebarGroupLabel>
            <AppSidebarList>
              <AppSidebarItem
                value="alerts"
                label="Notifications"
                onClick={(e) => e.preventDefault()}
              >
                <AppSidebarItemIcon>
                  <Bell size={16} />
                </AppSidebarItemIcon>
                <AppSidebarItemLabel>Notifications</AppSidebarItemLabel>
              </AppSidebarItem>
              <AppSidebarItem value="settings" label="Settings" onClick={(e) => e.preventDefault()}>
                <AppSidebarItemIcon>
                  <Settings size={16} />
                </AppSidebarItemIcon>
                <AppSidebarItemLabel>Settings</AppSidebarItemLabel>
              </AppSidebarItem>
            </AppSidebarList>
          </AppSidebarGroup>
        </AppSidebarNav>
        <AppSidebarFooter>
          <AppSidebarList>
            <AppSidebarItem value="help" label="Help center" onClick={(e) => e.preventDefault()}>
              <AppSidebarItemIcon>
                <CircleHelp size={16} />
              </AppSidebarItemIcon>
              <AppSidebarItemLabel>Help center</AppSidebarItemLabel>
            </AppSidebarItem>
          </AppSidebarList>
        </AppSidebarFooter>
      </AppSidebar>
      <section
        aria-live="polite"
        style={{
          display: "grid",
          alignContent: "start",
          gap: 6,
          flex: 1,
          minWidth: 0,
          padding: "20px 4px",
          fontSize: 13,
        }}
      >
        <span style={{ color: "var(--uai-subtle)", fontSize: 11.5 }}>Northwind Studio</span>
        <h3 style={{ margin: 0, fontSize: 18, lineHeight: "24px", fontWeight: 600 }}>
          {pages[page] ?? page}
        </h3>
        <p style={{ margin: 0, color: "var(--uai-muted)" }}>
          Pick a row to move the active pill. Collapse the panel to keep icons only.
        </p>
      </section>
    </div>
  );
}
