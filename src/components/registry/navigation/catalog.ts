import { ChevronsRight, Columns2, Command, PanelLeft, PanelTop } from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type NavigationItemId =
  | "app-sidebar"
  | "breadcrumb-trail"
  | "page-tabs"
  | "command-menu"
  | "split-pane";

export const navigationCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "app-sidebar",
    name: "App Sidebar",
    category: "Navigation",
    icon: PanelLeft,
    description: "Nested navigation with collapsed mode, a mobile disclosure, and active states.",
    usage: `"use client";

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
`,
    accessibility: [
      'Rows are links with aria-current="page" on the active item; labels stay in the accessibility tree when the sidebar collapses.',
      "The collapse toggle and mobile trigger expose aria-expanded and aria-controls. Escape closes the mobile disclosure and returns focus to its trigger.",
      "Submenu triggers are disclosure buttons. In collapsed mode they expand the sidebar before opening the submenu.",
      "Routing, permissions, and persistence of the collapsed state remain consumer-owned.",
    ],
  },
  {
    id: "breadcrumb-trail",
    name: "Breadcrumb Trail",
    category: "Navigation",
    icon: ChevronsRight,
    description:
      "Hierarchy with label truncation, collapsed levels, and a compact mobile fallback.",
    usage: `"use client";

import {
  BreadcrumbTrail,
  BreadcrumbTrailCollapsed,
  BreadcrumbTrailItem,
  type BreadcrumbTrailVariant,
} from "@/components/ui/uai/breadcrumb-trail";

export function BreadcrumbTrailPreview({
  variant = "chevron",
}: {
  variant?: BreadcrumbTrailVariant;
}) {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <BreadcrumbTrail variant={variant}>
        <BreadcrumbTrailItem href="#workspace">Northwind</BreadcrumbTrailItem>
        <BreadcrumbTrailCollapsed label="Show 2 more levels">
          <BreadcrumbTrailItem href="#projects">Projects</BreadcrumbTrailItem>
          <BreadcrumbTrailItem href="#launches">2026 launches</BreadcrumbTrailItem>
        </BreadcrumbTrailCollapsed>
        <BreadcrumbTrailItem href="#q3" parent>
          Q3 mobile release
        </BreadcrumbTrailItem>
        <BreadcrumbTrailItem current>Accessibility review checklist</BreadcrumbTrailItem>
      </BreadcrumbTrail>
      <BreadcrumbTrail variant={variant} compact aria-label="Breadcrumb, compact">
        <BreadcrumbTrailItem href="#workspace">Northwind</BreadcrumbTrailItem>
        <BreadcrumbTrailItem href="#q3" parent>
          Q3 mobile release
        </BreadcrumbTrailItem>
        <BreadcrumbTrailItem current>Accessibility review checklist</BreadcrumbTrailItem>
      </BreadcrumbTrail>
    </div>
  );
}
`,
    accessibility: [
      'Renders a labelled nav landmark with an ordered list. The current page uses aria-current="page".',
      "Separators are decorative and hidden from assistive technology. Truncated labels keep their full text in the title.",
      "The ellipsis is a named button; revealing hidden levels moves focus to the first revealed link.",
      'The compact fallback keeps only the parent as a back link, with the full "Back to" name for screen readers.',
    ],
  },
  {
    id: "page-tabs",
    name: "Page Tabs",
    category: "Navigation",
    icon: PanelTop,
    description: "Primary tabs with counts, page actions, and horizontal overflow.",
    usage: `"use client";

import { Plus, Settings2 } from "lucide-react";
import {
  PageTabs,
  PageTabsActions,
  PageTabsBar,
  PageTabsCount,
  PageTabsList,
  PageTabsPanel,
  PageTabsTab,
  type PageTabsVariant,
} from "@/components/ui/uai/page-tabs";

const actionStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 28,
  padding: "0 12px",
  border: 0,
  borderRadius: 999,
  background: "var(--uai-surface-raised)",
  color: "var(--uai-text)",
  font: "inherit",
  fontSize: 12.5,
  fontWeight: 500,
  cursor: "pointer",
} as const;

export function PageTabsPreview({ variant = "underline" }: { variant?: PageTabsVariant }) {
  return (
    <PageTabs variant={variant} defaultValue="open">
      <PageTabsBar>
        <PageTabsList aria-label="Issues">
          <PageTabsTab value="open">
            Open <PageTabsCount>24</PageTabsCount>
          </PageTabsTab>
          <PageTabsTab value="review">
            In review <PageTabsCount>6</PageTabsCount>
          </PageTabsTab>
          <PageTabsTab value="blocked">
            Blocked <PageTabsCount>2</PageTabsCount>
          </PageTabsTab>
          <PageTabsTab value="closed">Closed</PageTabsTab>
          <PageTabsTab value="archived" disabled>
            Archived
          </PageTabsTab>
        </PageTabsList>
        <PageTabsActions>
          <button
            type="button"
            aria-label="View options"
            style={{
              ...actionStyle,
              padding: 0,
              width: 28,
              justifyContent: "center",
              borderRadius: 8,
              background: "transparent",
              color: "var(--uai-muted)",
            }}
          >
            <Settings2 size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            style={{
              ...actionStyle,
              background: "var(--uai-accent)",
              color: "var(--uai-accent-foreground)",
            }}
          >
            <Plus size={14} aria-hidden="true" />
            New issue
          </button>
        </PageTabsActions>
      </PageTabsBar>
      <PageTabsPanel value="open">24 open issues across checkout and onboarding.</PageTabsPanel>
      <PageTabsPanel value="review">6 issues are waiting for design review.</PageTabsPanel>
      <PageTabsPanel value="blocked">2 issues are blocked by the payments migration.</PageTabsPanel>
      <PageTabsPanel value="closed">Closed issues from the last 30 days.</PageTabsPanel>
    </PageTabs>
  );
}
`,
    accessibility: [
      "Implements the WAI-ARIA tabs pattern with tablist, tab, and tabpanel roles linked by generated ids.",
      "Arrow keys move and activate tabs automatically, Home and End jump to the ends, and disabled tabs are skipped.",
      "Only the selected tab is in the tab order. Page actions sit outside the tab list and keep normal tab order.",
      "The tab list scrolls horizontally and keeps the selected tab in view.",
    ],
  },
  {
    id: "command-menu",
    name: "Command Menu",
    category: "Navigation",
    icon: Command,
    description: "Search and run grouped actions with full keyboard navigation.",
    usage: `"use client";

import { FilePlus2, FolderOpen, Moon, Settings, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  CommandMenu,
  CommandMenuEmpty,
  CommandMenuGroup,
  CommandMenuGroupLabel,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuShortcut,
  type CommandMenuVariant,
} from "@/components/ui/uai/command-menu";

export function CommandMenuPreview({ variant = "panel" }: { variant?: CommandMenuVariant }) {
  const [lastRun, setLastRun] = useState("Nothing yet");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <CommandMenu variant={variant} label="Workspace commands">
        <CommandMenuInput placeholder="Type a command or search…" />
        <CommandMenuList>
          <CommandMenuGroup>
            <CommandMenuGroupLabel>Create</CommandMenuGroupLabel>
            <CommandMenuItem
              value="New document"
              keywords={["file", "page"]}
              onSelect={() => setLastRun("New document")}
            >
              <FilePlus2 size={16} aria-hidden="true" />
              New document
              <CommandMenuShortcut>⌘N</CommandMenuShortcut>
            </CommandMenuItem>
            <CommandMenuItem
              value="Invite teammate"
              keywords={["member", "user"]}
              onSelect={() => setLastRun("Invite teammate")}
            >
              <UserPlus size={16} aria-hidden="true" />
              Invite teammate
            </CommandMenuItem>
          </CommandMenuGroup>
          <CommandMenuGroup>
            <CommandMenuGroupLabel>Navigate</CommandMenuGroupLabel>
            <CommandMenuItem
              value="Open recent project"
              onSelect={() => setLastRun("Open recent project")}
            >
              <FolderOpen size={16} aria-hidden="true" />
              Open recent project
              <CommandMenuShortcut>⌘O</CommandMenuShortcut>
            </CommandMenuItem>
            <CommandMenuItem
              value="Workspace settings"
              keywords={["preferences"]}
              onSelect={() => setLastRun("Workspace settings")}
            >
              <Settings size={16} aria-hidden="true" />
              Workspace settings
              <CommandMenuShortcut>⌘,</CommandMenuShortcut>
            </CommandMenuItem>
            <CommandMenuItem value="Switch to dark theme" disabled>
              <Moon size={16} aria-hidden="true" />
              Switch to dark theme
            </CommandMenuItem>
          </CommandMenuGroup>
          <CommandMenuEmpty />
        </CommandMenuList>
      </CommandMenu>
      <p style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12 }}>Last command: {lastRun}</p>
    </div>
  );
}
`,
    accessibility: [
      "Uses the combobox and listbox pattern: focus stays in the input and aria-activedescendant points to the active option.",
      "Arrow keys move through enabled options, Home and End jump to the ends, and Enter runs the active command.",
      "Escape clears the query, then calls onDismiss so a surrounding dialog can close and restore focus.",
      "Empty results are announced through a status region. Groups with no matching options are hidden.",
    ],
  },
  {
    id: "split-pane",
    name: "Split Pane",
    category: "Navigation",
    icon: Columns2,
    description: "Two resizable regions with keyboard controls and saved proportions.",
    usage: `"use client";

import { useState } from "react";
import {
  SplitPane,
  SplitPaneHandle,
  SplitPanePrimary,
  SplitPaneSecondary,
  type SplitPaneVariant,
} from "@/components/ui/uai/split-pane";

export function SplitPanePreview({ variant = "card" }: { variant?: SplitPaneVariant }) {
  const [size, setSize] = useState(38);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <SplitPane
        variant={variant}
        value={size}
        onValueChange={setSize}
        min={25}
        max={70}
        storageKey="uai-preview-split-pane"
        style={{ height: 280 }}
      >
        <SplitPanePrimary>
          <ul style={{ margin: 0, padding: 12, listStyle: "none", display: "grid", gap: 4 }}>
            <li style={{ fontWeight: 550 }}>Refund request #4821</li>
            <li style={{ color: "var(--uai-muted)" }}>Shipping delay #4819</li>
            <li style={{ color: "var(--uai-muted)" }}>Invoice copy #4816</li>
          </ul>
        </SplitPanePrimary>
        <SplitPaneHandle aria-label="Resize inbox and conversation" />
        <SplitPaneSecondary>
          <div style={{ padding: 16, display: "grid", gap: 8 }}>
            <strong>Refund request #4821</strong>
            <p style={{ margin: 0, color: "var(--uai-muted)" }}>
              The order arrived after the event date. The customer asks for a refund to the original
              card.
            </p>
          </div>
        </SplitPaneSecondary>
      </SplitPane>
      <p style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12 }}>
        List width: {Math.round(size)}%. Use the arrow keys, Home, End, or Enter on the divider.
      </p>
    </div>
  );
}
`,
    accessibility: [
      'The handle follows the WAI-ARIA window splitter pattern with role="separator", value bounds, and aria-controls.',
      "Arrow keys resize by the step, Home and End jump to the limits, and Enter collapses or restores the primary region.",
      "Pointer dragging uses pointer capture. The handle has a 12px hit area and a visible focus line.",
      "onValueChange reports the proportion; an optional storageKey saves and restores it from localStorage.",
    ],
  },
];
