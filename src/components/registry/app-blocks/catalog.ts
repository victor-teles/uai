import {
  Bell,
  CreditCard,
  LayoutDashboard,
  Settings2,
  TextSearch,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type AppBlocksItemId =
  | "dashboard-shell"
  | "settings-page"
  | "profile-page"
  | "team-management"
  | "notification-center"
  | "billing-portal"
  | "search-results";

export const appBlocksCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "dashboard-shell",
    name: "Dashboard Shell",
    category: "Application",
    icon: LayoutDashboard,
    description:
      "Global navigation, page hierarchy, actions, key metrics, and a layout that stacks on narrow screens.",
    usage: `"use client";

import { BarChart3, LayoutDashboard, Package, Settings, Users } from "lucide-react";
import { useState } from "react";
import {
  DashboardShell,
  DashboardShellAction,
  DashboardShellActions,
  DashboardShellBreadcrumb,
  DashboardShellContent,
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellHeading,
  DashboardShellMain,
  DashboardShellMetric,
  DashboardShellMetrics,
  DashboardShellPanel,
  DashboardShellPanelTitle,
  DashboardShellSidebar,
  DashboardShellTitle,
  type DashboardShellVariant,
} from "@/components/uai/dashboard-shell";
import {
  AppSidebarCollapseToggle,
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
  AppSidebarTitle,
} from "@/components/ui/uai/app-sidebar";
import { BreadcrumbTrailItem } from "@/components/ui/uai/breadcrumb-trail";
import {
  MetricCardComparison,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardTrend,
  MetricCardValue,
} from "@/components/ui/uai/metric-card";

const pages = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "orders", label: "Orders", icon: Package, badge: "12" },
  { value: "customers", label: "Customers", icon: Users },
  { value: "reports", label: "Reports", icon: BarChart3 },
];

const metrics = [
  {
    label: "Revenue",
    value: "$48,210",
    trend: "12.4%",
    direction: "up",
    note: "vs. $42,890 in August",
  },
  { label: "Orders", value: "1,284", trend: "3.1%", direction: "up", note: "vs. 1,245 in August" },
  {
    label: "Refund rate",
    value: "1.8%",
    trend: "0.4 pts",
    direction: "down",
    note: "Lower is better",
  },
  {
    label: "Time to ship",
    value: "1.6 days",
    trend: "No change",
    direction: "flat",
    note: "Median, all warehouses",
  },
] as const;

const attention = [
  { id: "#4821", detail: "Address failed validation", age: "2h", tone: "danger" },
  { id: "#4817", detail: "Payment under review", age: "5h", tone: "warning" },
  { id: "#4809", detail: "Backordered: Linen apron, sand", age: "1d", tone: "warning" },
] as const;

const channels = [
  { name: "Online store", share: 64 },
  { name: "Wholesale", share: 22 },
  { name: "Market stalls", share: 14 },
];

export function DashboardShellPreview({ variant = "split" }: { variant?: DashboardShellVariant }) {
  const [page, setPage] = useState("overview");
  return (
    <DashboardShell variant={variant} style={{ minHeight: 560 }}>
      <DashboardShellSidebar value={page} onValueChange={setPage}>
        <AppSidebarHeader>
          <AppSidebarTitle>Northwind Goods</AppSidebarTitle>
          <AppSidebarCollapseToggle />
          <AppSidebarMobileTrigger />
        </AppSidebarHeader>
        <AppSidebarNav>
          <AppSidebarGroup>
            <AppSidebarGroupLabel>Store</AppSidebarGroupLabel>
            <AppSidebarList>
              {pages.map((item) => (
                <AppSidebarItem
                  key={item.value}
                  value={item.value}
                  label={item.label}
                  onClick={(event) => {
                    event.preventDefault();
                    setPage(item.value);
                  }}
                >
                  <AppSidebarItemIcon>
                    <item.icon size={16} />
                  </AppSidebarItemIcon>
                  <AppSidebarItemLabel>{item.label}</AppSidebarItemLabel>
                  {item.badge ? <AppSidebarItemBadge>{item.badge}</AppSidebarItemBadge> : null}
                </AppSidebarItem>
              ))}
            </AppSidebarList>
          </AppSidebarGroup>
          <AppSidebarGroup>
            <AppSidebarGroupLabel>Workspace</AppSidebarGroupLabel>
            <AppSidebarList>
              <AppSidebarItem
                value="settings"
                label="Settings"
                onClick={(event) => {
                  event.preventDefault();
                  setPage("settings");
                }}
              >
                <AppSidebarItemIcon>
                  <Settings size={16} />
                </AppSidebarItemIcon>
                <AppSidebarItemLabel>Settings</AppSidebarItemLabel>
              </AppSidebarItem>
            </AppSidebarList>
          </AppSidebarGroup>
        </AppSidebarNav>
      </DashboardShellSidebar>
      <DashboardShellMain>
        <DashboardShellHeader>
          <DashboardShellHeading>
            <DashboardShellBreadcrumb>
              <BreadcrumbTrailItem href="#store">Northwind Goods</BreadcrumbTrailItem>
              <BreadcrumbTrailItem href="#analytics" parent>
                Analytics
              </BreadcrumbTrailItem>
              <BreadcrumbTrailItem current>September 2026</BreadcrumbTrailItem>
            </DashboardShellBreadcrumb>
            <DashboardShellTitle>Store overview</DashboardShellTitle>
            <DashboardShellDescription>
              Sales and fulfilment across every channel, updated 10 minutes ago.
            </DashboardShellDescription>
          </DashboardShellHeading>
          <DashboardShellActions>
            <DashboardShellAction>Export CSV</DashboardShellAction>
            <DashboardShellAction emphasis="primary">New report</DashboardShellAction>
          </DashboardShellActions>
        </DashboardShellHeader>
        <DashboardShellMetrics>
          {metrics.map((metric) => (
            <DashboardShellMetric key={metric.label}>
              <MetricCardHeader>
                <MetricCardLabel>{metric.label}</MetricCardLabel>
                <MetricCardTrend
                  direction={metric.direction}
                  sentiment={metric.label === "Refund rate" ? "positive" : undefined}
                >
                  {metric.trend}
                </MetricCardTrend>
              </MetricCardHeader>
              <MetricCardValue>{metric.value}</MetricCardValue>
              <MetricCardComparison>{metric.note}</MetricCardComparison>
            </DashboardShellMetric>
          ))}
        </DashboardShellMetrics>
        <DashboardShellContent>
          <DashboardShellPanel>
            <DashboardShellPanelTitle>Orders needing attention</DashboardShellPanelTitle>
            <ul style={{ display: "grid", gap: 2, margin: 0, padding: 0, listStyle: "none" }}>
              {attention.map((order) => (
                <li
                  key={order.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    minWidth: 0,
                    padding: "5px 0",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 6,
                      height: 6,
                      flex: "none",
                      borderRadius: 999,
                      background: \`var(--uai-\${order.tone})\`,
                    }}
                  />
                  <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                    {order.id}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      color: "var(--uai-muted)",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {order.detail}
                  </span>
                  <span
                    style={{
                      flex: "none",
                      color: "var(--uai-subtle)",
                      fontSize: 12,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {order.age} ago
                  </span>
                </li>
              ))}
            </ul>
          </DashboardShellPanel>
          <DashboardShellPanel>
            <DashboardShellPanelTitle>Revenue by channel</DashboardShellPanelTitle>
            <ul style={{ display: "grid", gap: 12, margin: 0, padding: 0, listStyle: "none" }}>
              {channels.map((channel) => (
                <li key={channel.name} style={{ display: "grid", gap: 6 }}>
                  <span style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--uai-muted)" }}>{channel.name}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                      {channel.share}%
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      height: 4,
                      overflow: "hidden",
                      borderRadius: 999,
                      background: "var(--uai-surface-raised)",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        width: \`\${channel.share}%\`,
                        height: "100%",
                        borderRadius: 999,
                        background: "var(--uai-text)",
                        opacity: 0.7,
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </DashboardShellPanel>
        </DashboardShellContent>
      </DashboardShellMain>
    </DashboardShell>
  );
}
`,
    accessibility: [
      "The sidebar is an App Sidebar: a labelled nav with aria-current on the active link, a collapse toggle with aria-expanded, and a mobile disclosure that Escape closes.",
      'The main region is a section named by the page title. The breadcrumb is a labelled nav whose current page uses aria-current="page".',
      "Each metric is a group named by its label, and trend arrows carry spoken direction text so color is never the only signal.",
      "Panels are sections named by their h3 titles. Routing, permissions, and data loading remain consumer-owned.",
    ],
  },
  {
    id: "settings-page",
    name: "Settings Page",
    category: "Application",
    icon: Settings2,
    description:
      "Grouped settings with field validation, a sticky save state, and a guarded danger zone.",
    usage: `"use client";

import { useState } from "react";
import {
  SettingsPage,
  SettingsPageConfirm,
  SettingsPageDescription,
  SettingsPageField,
  SettingsPageHeader,
  SettingsPageSaveBar,
  SettingsPageSection,
  SettingsPageSectionContent,
  SettingsPageSectionDescription,
  SettingsPageSectionHeader,
  SettingsPageSectionTitle,
  SettingsPageTitle,
  type SettingsPageVariant,
} from "@/components/uai/settings-page";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogImpact,
  ConfirmationDialogInput,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import {
  FormFieldDescription,
  FormFieldError,
  FormFieldInput,
  FormFieldLabel,
} from "@/components/ui/uai/form-field";
import {
  UnsavedChangesBarActions,
  UnsavedChangesBarDiscard,
  UnsavedChangesBarMessage,
  UnsavedChangesBarSave,
} from "@/components/ui/uai/unsaved-changes-bar";

const initial = { name: "Northwind Goods", email: "support@northwind.example" };

export function SettingsPagePreview({ variant = "stacked" }: { variant?: SettingsPageVariant }) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [deleted, setDeleted] = useState(false);
  const dirty = draft.name !== saved.name || draft.email !== saved.email;
  const emailInvalid = !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(draft.email);
  const nameInvalid = draft.name.trim().length === 0;

  function save() {
    setStatus("saving");
    window.setTimeout(() => {
      setSaved(draft);
      setStatus("idle");
    }, 900);
  }

  return (
    <SettingsPage variant={variant}>
      <SettingsPageHeader>
        <SettingsPageTitle>Workspace settings</SettingsPageTitle>
        <SettingsPageDescription>
          These details appear on invoices, receipts, and customer emails.
        </SettingsPageDescription>
      </SettingsPageHeader>
      <SettingsPageSection>
        <SettingsPageSectionHeader>
          <SettingsPageSectionTitle>General</SettingsPageSectionTitle>
          <SettingsPageSectionDescription>
            The name and contact address customers see.
          </SettingsPageSectionDescription>
        </SettingsPageSectionHeader>
        <SettingsPageSectionContent>
          <SettingsPageField
            required
            invalid={nameInvalid}
            value={draft.name}
            onValueChange={(name) => setDraft({ ...draft, name })}
          >
            <FormFieldLabel>Workspace name</FormFieldLabel>
            <FormFieldInput autoComplete="organization" />
            <FormFieldError>Enter a workspace name.</FormFieldError>
          </SettingsPageField>
          <SettingsPageField
            required
            invalid={emailInvalid}
            value={draft.email}
            onValueChange={(email) => setDraft({ ...draft, email })}
          >
            <FormFieldLabel>Support email</FormFieldLabel>
            <FormFieldInput type="email" autoComplete="email" />
            <FormFieldDescription>Replies to order emails go here.</FormFieldDescription>
            <FormFieldError>Enter an email address such as help@northwind.example.</FormFieldError>
          </SettingsPageField>
        </SettingsPageSectionContent>
      </SettingsPageSection>
      <SettingsPageSection tone="danger">
        <SettingsPageSectionHeader>
          <SettingsPageSectionTitle>Delete workspace</SettingsPageSectionTitle>
          <SettingsPageSectionDescription>
            {deleted
              ? "Workspace scheduled for deletion. Contact support within 30 days to restore it."
              : "Removes every order, product, and team member. This cannot be undone."}
          </SettingsPageSectionDescription>
        </SettingsPageSectionHeader>
        <SettingsPageSectionContent>
          <SettingsPageConfirm>
            <div>
              <ConfirmationDialogTrigger disabled={deleted}>
                Delete workspace
              </ConfirmationDialogTrigger>
            </div>
            <ConfirmationDialogContent>
              <ConfirmationDialogTitle>Delete Northwind Goods?</ConfirmationDialogTitle>
              <ConfirmationDialogDescription>
                <p style={{ margin: 0 }}>This permanently removes:</p>
                <ConfirmationDialogImpact>
                  <li>4,812 orders and their invoices</li>
                  <li>312 products and 1,240 images</li>
                  <li>Access for 9 team members</li>
                </ConfirmationDialogImpact>
              </ConfirmationDialogDescription>
              <ConfirmationDialogInput match="northwind-goods" />
              <ConfirmationDialogActions>
                <ConfirmationDialogCancel />
                <ConfirmationDialogConfirm onClick={() => setDeleted(true)}>
                  Delete workspace
                </ConfirmationDialogConfirm>
              </ConfirmationDialogActions>
            </ConfirmationDialogContent>
          </SettingsPageConfirm>
        </SettingsPageSectionContent>
      </SettingsPageSection>
      <SettingsPageSaveBar
        dirty={dirty}
        status={status}
        warnBeforeUnload={false}
        onSave={save}
        onDiscard={() => setDraft(saved)}
      >
        <UnsavedChangesBarMessage>
          {status === "saving"
            ? "Saving workspace settings…"
            : nameInvalid || emailInvalid
              ? "Fix the highlighted fields before saving."
              : "You have unsaved changes."}
        </UnsavedChangesBarMessage>
        <UnsavedChangesBarActions>
          <UnsavedChangesBarDiscard />
          <UnsavedChangesBarSave disabled={nameInvalid || emailInvalid} />
        </UnsavedChangesBarActions>
      </SettingsPageSaveBar>
    </SettingsPage>
  );
}
`,
    accessibility: [
      "Each settings group is a section named by its h3 title and described by its summary text.",
      'Fields are Form Fields: visible labels, required text, and errors announced with role="alert" and linked with aria-describedby.',
      "The save bar is a labelled region whose message is a live status, or an alert when saving fails. Save is disabled while saving.",
      "Destructive actions open a modal alert dialog that traps focus, focuses Cancel, can require a typed phrase, and returns focus to the trigger.",
    ],
  },
  {
    id: "profile-page",
    name: "Profile Page",
    category: "Application",
    icon: UserRound,
    description:
      "Identity, account actions, contact details, and recent activity in a sidebar or stacked layout.",
    usage: `"use client";

import { FileText, MessageSquare, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  ProfilePage,
  ProfilePageAction,
  ProfilePageActions,
  ProfilePageActivity,
  ProfilePageAside,
  ProfilePageDetails,
  ProfilePageIdentity,
  ProfilePageMain,
  ProfilePageSection,
  ProfilePageSectionHeader,
  ProfilePageSectionTitle,
  type ProfilePageVariant,
} from "@/components/uai/profile-page";
import {
  ActivityTimelineActor,
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
  AuthorCardName,
  AuthorCardRole,
} from "@/components/ui/uai/author-card";
import {
  DescriptionListAction,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";

export function ProfilePagePreview({ variant = "sidebar" }: { variant?: ProfilePageVariant }) {
  const [copied, setCopied] = useState(false);
  return (
    <ProfilePage variant={variant}>
      <ProfilePageAside>
        <ProfilePageIdentity>
          <AuthorCardAvatar name="Amara Okafor" />
          <div style={{ display: "grid", gap: 2 }}>
            <AuthorCardName>Amara Okafor</AuthorCardName>
            <AuthorCardRole>Operations lead · Lagos</AuthorCardRole>
          </div>
          <AuthorCardBio>
            Runs fulfilment for the West Africa warehouses and owns the returns policy.
          </AuthorCardBio>
        </ProfilePageIdentity>
        <ProfilePageActions>
          <ProfilePageAction emphasis="primary">Edit profile</ProfilePageAction>
          <ProfilePageAction>Send message</ProfilePageAction>
          <ProfilePageAction tone="danger">Deactivate</ProfilePageAction>
        </ProfilePageActions>
      </ProfilePageAside>
      <ProfilePageMain>
        <ProfilePageSection>
          <ProfilePageSectionHeader>
            <ProfilePageSectionTitle>Contact details</ProfilePageSectionTitle>
          </ProfilePageSectionHeader>
          <ProfilePageDetails>
            <DescriptionListItem>
              <DescriptionListTerm>Email</DescriptionListTerm>
              <DescriptionListDetails>
                amara@northwind.example
                <DescriptionListAction
                  aria-label="Copy email address"
                  onClick={() => {
                    void navigator.clipboard?.writeText("amara@northwind.example");
                    setCopied(true);
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </DescriptionListAction>
              </DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Phone</DescriptionListTerm>
              <DescriptionListDetails>+234 803 555 0142</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Time zone</DescriptionListTerm>
              <DescriptionListDetails>West Africa Time (UTC+1)</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Member since</DescriptionListTerm>
              <DescriptionListDetails>March 2023</DescriptionListDetails>
            </DescriptionListItem>
          </ProfilePageDetails>
        </ProfilePageSection>
        <ProfilePageSection>
          <ProfilePageSectionHeader>
            <ProfilePageSectionTitle>Recent activity</ProfilePageSectionTitle>
          </ProfilePageSectionHeader>
          <ProfilePageActivity>
            <ActivityTimelineGroup>
              <ActivityTimelineDate>Today</ActivityTimelineDate>
              <ActivityTimelineEvents>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker>
                    <FileText size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      <ActivityTimelineActor>Amara</ActivityTimelineActor> updated the returns
                      policy
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-30T09:12">09:12</ActivityTimelineTime>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker>
                    <MessageSquare size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      <ActivityTimelineActor>Amara</ActivityTimelineActor> replied on order #4817
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-30T08:40">08:40</ActivityTimelineTime>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
              </ActivityTimelineEvents>
            </ActivityTimelineGroup>
            <ActivityTimelineGroup>
              <ActivityTimelineDate>September 28</ActivityTimelineDate>
              <ActivityTimelineEvents>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker>
                    <UserPlus size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      <ActivityTimelineActor>Amara</ActivityTimelineActor> invited Tomás Rivera to
                      Fulfilment
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-28T16:05">16:05</ActivityTimelineTime>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
              </ActivityTimelineEvents>
            </ActivityTimelineGroup>
          </ProfilePageActivity>
        </ProfilePageSection>
      </ProfilePageMain>
    </ProfilePage>
  );
}
`,
    accessibility: [
      "The identity card is an article named by the person's name. The avatar is decorative; initials replace a missing photo.",
      "Account actions are a labelled group of native buttons. Destructive actions use danger text, not color alone, with a clear verb.",
      "Contact details are a description list, so each value is read with its term.",
      "Activity groups are sections named by their dates. Each event uses a time element with a machine-readable dateTime.",
    ],
  },
  {
    id: "team-management",
    name: "Team Management",
    category: "Application",
    icon: UsersRound,
    description: "Members, roles, invitations, access status, search, and confirmed removal.",
    usage: `"use client";

import { SearchX } from "lucide-react";
import { useState } from "react";
import {
  TeamManagement,
  TeamManagementButton,
  TeamManagementDescription,
  TeamManagementEmpty,
  TeamManagementHeader,
  TeamManagementHeading,
  TeamManagementInvite,
  TeamManagementMember,
  TeamManagementMemberActions,
  TeamManagementMemberAvatar,
  TeamManagementMemberEmail,
  TeamManagementMemberIdentity,
  TeamManagementMemberName,
  TeamManagementMemberStatus,
  TeamManagementMembers,
  TeamManagementRemove,
  TeamManagementRoleOption,
  TeamManagementRoleSelect,
  TeamManagementTitle,
  TeamManagementToolbar,
  type TeamManagementVariant,
} from "@/components/uai/team-management";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import { DataTableToolbarSearch } from "@/components/ui/uai/data-table-toolbar";
import {
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import {
  FormField,
  FormFieldError,
  FormFieldInput,
  FormFieldLabel,
} from "@/components/ui/uai/form-field";

type Member = { email: string; name: string; role: string; pending?: boolean; owner?: boolean };

const roles = ["Admin", "Editor", "Viewer"];

export function TeamManagementPreview({ variant = "table" }: { variant?: TeamManagementVariant }) {
  const [members, setMembers] = useState<Member[]>([
    { email: "amara@northwind.example", name: "Amara Okafor", role: "Admin", owner: true },
    { email: "tomas@northwind.example", name: "Tomás Rivera", role: "Editor" },
    { email: "mei@northwind.example", name: "Mei Tanaka", role: "Viewer" },
    { email: "jonas@harbor.example", name: "jonas@harbor.example", role: "Editor", pending: true },
  ]);
  const [search, setSearch] = useState("");
  const [invite, setInvite] = useState("");
  const [inviteRole, setInviteRole] = useState("Editor");
  const [inviteError, setInviteError] = useState(false);
  const query = search.trim().toLowerCase();
  const visible = members.filter(
    (member) =>
      member.name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query),
  );

  function update(email: string, change: Partial<Member>) {
    setMembers((current) =>
      current.map((member) => (member.email === email ? { ...member, ...change } : member)),
    );
  }

  return (
    <TeamManagement variant={variant}>
      <TeamManagementHeader>
        <TeamManagementHeading>
          <TeamManagementTitle>Team</TeamManagementTitle>
          <TeamManagementDescription>
            {members.length} people can access Northwind Goods. Admins manage billing and roles.
          </TeamManagementDescription>
        </TeamManagementHeading>
      </TeamManagementHeader>
      <TeamManagementInvite
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const email = invite.trim();
          if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
            setInviteError(true);
            return;
          }
          setMembers((current) => [
            ...current,
            { email, name: email, role: inviteRole, pending: true },
          ]);
          setInvite("");
          setInviteError(false);
        }}
      >
        <FormField
          variant="compact"
          invalid={inviteError}
          value={invite}
          onValueChange={setInvite}
          style={{ flex: "1 1 220px" }}
        >
          <FormFieldLabel>Email address</FormFieldLabel>
          <FormFieldInput type="email" placeholder="name@company.com" />
          <FormFieldError>Enter a valid email address.</FormFieldError>
        </FormField>
        <TeamManagementRoleSelect
          aria-label="Role for new member"
          value={inviteRole}
          onValueChange={setInviteRole}
          style={{ height: 32 }}
        >
          {roles.map((role) => (
            <TeamManagementRoleOption key={role} value={role}>
              {role}
            </TeamManagementRoleOption>
          ))}
        </TeamManagementRoleSelect>
        <TeamManagementButton type="submit" emphasis="primary" style={{ height: 32 }}>
          Send invite
        </TeamManagementButton>
      </TeamManagementInvite>
      <TeamManagementToolbar search={search} onSearchChange={setSearch}>
        <DataTableToolbarSearch label="Search members" placeholder="Search by name or email" />
      </TeamManagementToolbar>
      {visible.length === 0 ? (
        <TeamManagementEmpty>
          <EmptyStateMedia>
            <SearchX aria-hidden="true" />
          </EmptyStateMedia>
          <EmptyStateContent>
            <EmptyStateHeader>
              <EmptyStateTitle>No members match “{search}”</EmptyStateTitle>
              <EmptyStateDescription>
                Check the spelling or invite them above.
              </EmptyStateDescription>
            </EmptyStateHeader>
          </EmptyStateContent>
        </TeamManagementEmpty>
      ) : (
        <TeamManagementMembers>
          {visible.map((member) => (
            <TeamManagementMember key={member.email}>
              <TeamManagementMemberIdentity>
                <TeamManagementMemberAvatar name={member.name} />
                <TeamManagementMemberName>{member.name}</TeamManagementMemberName>
                <TeamManagementMemberEmail>
                  {member.pending ? "Invitation sent" : member.email}
                </TeamManagementMemberEmail>
              </TeamManagementMemberIdentity>
              {member.pending ? (
                <TeamManagementMemberStatus tone="warning">Pending</TeamManagementMemberStatus>
              ) : null}
              {member.owner ? (
                <TeamManagementMemberStatus tone="accent">Owner</TeamManagementMemberStatus>
              ) : null}
              <TeamManagementMemberActions>
                <TeamManagementRoleSelect
                  value={member.role}
                  disabled={member.owner}
                  onValueChange={(role) => update(member.email, { role })}
                >
                  {roles.map((role) => (
                    <TeamManagementRoleOption key={role} value={role}>
                      {role}
                    </TeamManagementRoleOption>
                  ))}
                </TeamManagementRoleSelect>
                {member.owner ? null : (
                  <TeamManagementRemove>
                    <ConfirmationDialogTrigger
                      aria-label={\`\${member.pending ? "Revoke invitation for" : "Remove"} \${member.name}\`}
                    >
                      {member.pending ? "Revoke" : "Remove"}
                    </ConfirmationDialogTrigger>
                    <ConfirmationDialogContent>
                      <ConfirmationDialogTitle>
                        {member.pending ? "Revoke invitation?" : \`Remove \${member.name}?\`}
                      </ConfirmationDialogTitle>
                      <ConfirmationDialogDescription>
                        <p style={{ margin: 0 }}>
                          {member.pending
                            ? "The invitation link stops working immediately."
                            : "They lose access to orders, products, and reports right away. Their past activity stays in the audit log."}
                        </p>
                      </ConfirmationDialogDescription>
                      <ConfirmationDialogActions>
                        <ConfirmationDialogCancel />
                        <ConfirmationDialogConfirm
                          onClick={() =>
                            setMembers((current) =>
                              current.filter((item) => item.email !== member.email),
                            )
                          }
                        >
                          {member.pending ? "Revoke invitation" : "Remove member"}
                        </ConfirmationDialogConfirm>
                      </ConfirmationDialogActions>
                    </ConfirmationDialogContent>
                  </TeamManagementRemove>
                )}
              </TeamManagementMemberActions>
            </TeamManagementMember>
          ))}
        </TeamManagementMembers>
      )}
    </TeamManagement>
  );
}
`,
    accessibility: [
      "The invite form is a labelled form with a validated email field. Errors are announced and linked to the input.",
      "Each member's role select is named \"Role for\" plus the member's name, so repeated selects stay distinguishable.",
      "Member search clears with Escape, and an empty result explains what to change.",
      "Removal opens a modal alert dialog that names the member, explains the impact, and returns focus to its trigger.",
    ],
  },
  {
    id: "notification-center",
    name: "Notification Center",
    category: "Application",
    icon: Bell,
    description:
      "Updates grouped by date with unread state, filters, per-item toggles, and bulk actions.",
    usage: `"use client";

import { BellOff } from "lucide-react";
import { useState } from "react";
import {
  NotificationCenter,
  NotificationCenterAction,
  NotificationCenterActions,
  NotificationCenterCount,
  NotificationCenterEmpty,
  NotificationCenterGroup,
  NotificationCenterGroupDate,
  NotificationCenterHeader,
  NotificationCenterItem,
  NotificationCenterItemActions,
  NotificationCenterItemContent,
  NotificationCenterItemDescription,
  NotificationCenterItemTime,
  NotificationCenterItemTitle,
  NotificationCenterItemToggle,
  NotificationCenterList,
  NotificationCenterTabs,
  NotificationCenterTitle,
  type NotificationCenterVariant,
} from "@/components/uai/notification-center";
import {
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import {
  PageTabsBar,
  PageTabsCount,
  PageTabsList,
  PageTabsPanel,
  PageTabsTab,
} from "@/components/ui/uai/page-tabs";

type Notice = {
  id: string;
  day: "Today" | "Yesterday";
  title: string;
  detail: string;
  time: string;
  at: string;
  read: boolean;
  mention?: boolean;
};

const initial: Notice[] = [
  {
    id: "n1",
    day: "Today",
    title: "Tomás mentioned you on order #4817",
    detail: "“Can you approve the partial refund before 3 pm?”",
    time: "10:42",
    at: "2026-09-30T10:42",
    read: false,
    mention: true,
  },
  {
    id: "n2",
    day: "Today",
    title: "Payout of $12,480.00 sent",
    detail: "Arrives in the account ending 4421 by Friday.",
    time: "08:15",
    at: "2026-09-30T08:15",
    read: false,
  },
  {
    id: "n3",
    day: "Yesterday",
    title: "Linen apron, sand is low on stock",
    detail: "6 left at the Lisbon warehouse.",
    time: "17:30",
    at: "2026-09-29T17:30",
    read: true,
  },
  {
    id: "n4",
    day: "Yesterday",
    title: "Mei invited jonas@harbor.example",
    detail: "Role: Editor. The invitation expires in 7 days.",
    time: "11:02",
    at: "2026-09-29T11:02",
    read: true,
  },
];

export function NotificationCenterPreview({
  variant = "panel",
}: {
  variant?: NotificationCenterVariant;
}) {
  const [notices, setNotices] = useState(initial);
  const unread = notices.filter((notice) => !notice.read).length;
  const filters = [
    { value: "all", label: "All", items: notices },
    { value: "unread", label: "Unread", items: notices.filter((notice) => !notice.read) },
    { value: "mentions", label: "Mentions", items: notices.filter((notice) => notice.mention) },
  ];

  function setRead(id: string, read: boolean) {
    setNotices((current) =>
      current.map((notice) => (notice.id === id ? { ...notice, read } : notice)),
    );
  }

  return (
    <NotificationCenter variant={variant}>
      <NotificationCenterHeader>
        <NotificationCenterTitle>
          Notifications
          {unread > 0 ? <NotificationCenterCount>{unread} unread</NotificationCenterCount> : null}
        </NotificationCenterTitle>
        <NotificationCenterActions>
          <NotificationCenterAction
            disabled={unread === 0}
            onClick={() => setNotices((current) => current.map((n) => ({ ...n, read: true })))}
          >
            Mark all as read
          </NotificationCenterAction>
        </NotificationCenterActions>
      </NotificationCenterHeader>
      <NotificationCenterTabs defaultValue="all">
        <PageTabsBar>
          <PageTabsList aria-label="Filter notifications">
            {filters.map((filter) => (
              <PageTabsTab key={filter.value} value={filter.value}>
                {filter.label}
                <PageTabsCount>{filter.items.length}</PageTabsCount>
              </PageTabsTab>
            ))}
          </PageTabsList>
        </PageTabsBar>
        {filters.map((filter) => (
          <PageTabsPanel key={filter.value} value={filter.value}>
            <div style={{ display: "grid", gap: 12 }}>
              {filter.items.length === 0 ? (
                <NotificationCenterEmpty>
                  <EmptyStateMedia>
                    <BellOff aria-hidden="true" />
                  </EmptyStateMedia>
                  <EmptyStateContent>
                    <EmptyStateHeader>
                      <EmptyStateTitle>You’re all caught up</EmptyStateTitle>
                      <EmptyStateDescription>
                        New mentions, payouts, and stock alerts will appear here.
                      </EmptyStateDescription>
                    </EmptyStateHeader>
                  </EmptyStateContent>
                </NotificationCenterEmpty>
              ) : (
                (["Today", "Yesterday"] as const).map((day) => {
                  const items = filter.items.filter((notice) => notice.day === day);
                  if (items.length === 0) return null;
                  return (
                    <NotificationCenterGroup key={day}>
                      <NotificationCenterGroupDate>{day}</NotificationCenterGroupDate>
                      <NotificationCenterList>
                        {items.map((notice) => (
                          <NotificationCenterItem
                            key={notice.id}
                            read={notice.read}
                            onReadChange={(read) => setRead(notice.id, read)}
                          >
                            <NotificationCenterItemContent>
                              <NotificationCenterItemTitle>
                                {notice.title}
                              </NotificationCenterItemTitle>
                              <NotificationCenterItemDescription>
                                {notice.detail}
                              </NotificationCenterItemDescription>
                              <NotificationCenterItemTime dateTime={notice.at}>
                                {notice.time}
                              </NotificationCenterItemTime>
                            </NotificationCenterItemContent>
                            <NotificationCenterItemActions>
                              <NotificationCenterItemToggle />
                            </NotificationCenterItemActions>
                          </NotificationCenterItem>
                        ))}
                      </NotificationCenterList>
                    </NotificationCenterGroup>
                  );
                })
              )}
            </div>
          </PageTabsPanel>
        ))}
      </NotificationCenterTabs>
    </NotificationCenter>
  );
}
`,
    accessibility: [
      "Filters are APG tabs with arrow-key, Home, and End navigation. Each panel is labelled by its tab.",
      'Date groups are sections named by their h3 dates. Unread items say "Unread" before the title, so the dot is not the only signal.',
      'Each read toggle is named "Mark as read" or "Mark as unread" and described by the notification title.',
      "Mark all as read is disabled when nothing is unread. Notification data and persistence remain consumer-owned.",
    ],
  },
  {
    id: "billing-portal",
    name: "Billing Portal",
    category: "Application",
    icon: CreditCard,
    description:
      "Plan, usage, payment method, invoice history, billing alerts, and confirmed cancellation.",
    usage: `"use client";

import { useState } from "react";
import {
  BillingPortal,
  BillingPortalAlert,
  BillingPortalButton,
  BillingPortalCancel,
  BillingPortalDescription,
  BillingPortalDetails,
  BillingPortalGrid,
  BillingPortalHeader,
  BillingPortalHeading,
  BillingPortalInvoice,
  BillingPortalInvoiceCell,
  BillingPortalInvoices,
  BillingPortalInvoicesBody,
  BillingPortalInvoicesColumn,
  BillingPortalInvoicesHeader,
  BillingPortalPrice,
  BillingPortalSection,
  BillingPortalSectionDescription,
  BillingPortalSectionFooter,
  BillingPortalSectionHeader,
  BillingPortalSectionTitle,
  BillingPortalTitle,
  BillingPortalUsage,
  type BillingPortalVariant,
} from "@/components/uai/billing-portal";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogImpact,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import {
  DescriptionListAction,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  ProgressSummaryBar,
  ProgressSummaryHeader,
  ProgressSummaryStatusText,
  ProgressSummaryTitle,
  ProgressSummaryValue,
} from "@/components/ui/uai/progress-summary";
import {
  StatusBannerAction,
  StatusBannerActions,
  StatusBannerContent,
  StatusBannerDescription,
  StatusBannerIcon,
  StatusBannerTitle,
} from "@/components/ui/uai/status-banner";

const invoices = [
  { id: "INV-2026-009", date: "Sep 14, 2026", amount: "$48.00", status: "Failed" },
  { id: "INV-2026-008", date: "Aug 14, 2026", amount: "$48.00", status: "Paid" },
  { id: "INV-2026-007", date: "Jul 14, 2026", amount: "$48.00", status: "Paid" },
];

export function BillingPortalPreview({ variant = "overview" }: { variant?: BillingPortalVariant }) {
  const [alertOpen, setAlertOpen] = useState(true);
  const [cancelled, setCancelled] = useState(false);
  return (
    <BillingPortal variant={variant}>
      <BillingPortalHeader>
        <BillingPortalHeading>
          <BillingPortalTitle>Billing</BillingPortalTitle>
          <BillingPortalDescription>
            Manage the Northwind Goods subscription, payment method, and invoices.
          </BillingPortalDescription>
        </BillingPortalHeading>
      </BillingPortalHeader>
      <BillingPortalAlert tone="warning" open={alertOpen} onOpenChange={setAlertOpen}>
        <StatusBannerIcon />
        <StatusBannerContent>
          <StatusBannerTitle>Your September payment failed</StatusBannerTitle>
          <StatusBannerDescription>
            We’ll retry on October 2. Update the card to avoid losing access.
          </StatusBannerDescription>
        </StatusBannerContent>
        <StatusBannerActions>
          <StatusBannerAction onClick={() => setAlertOpen(false)}>Update card</StatusBannerAction>
        </StatusBannerActions>
      </BillingPortalAlert>
      <BillingPortalGrid>
        <BillingPortalSection>
          <BillingPortalSectionHeader>
            <BillingPortalSectionTitle>Growth plan</BillingPortalSectionTitle>
          </BillingPortalSectionHeader>
          <BillingPortalPrice>
            $48
            <span style={{ color: "var(--uai-subtle)", fontSize: 13, fontWeight: 400 }}>
              per month
            </span>
          </BillingPortalPrice>
          <BillingPortalSectionDescription>
            {cancelled
              ? "Cancelled. You keep access until October 14, 2026."
              : "Renews on October 14, 2026."}
          </BillingPortalSectionDescription>
          <BillingPortalUsage value={3210} max={5000}>
            <ProgressSummaryHeader>
              <ProgressSummaryTitle>Orders this cycle</ProgressSummaryTitle>
              <ProgressSummaryStatusText>3,210 of 5,000 included orders</ProgressSummaryStatusText>
            </ProgressSummaryHeader>
            <ProgressSummaryValue />
            <ProgressSummaryBar aria-valuetext="3,210 of 5,000 orders" />
          </BillingPortalUsage>
          <BillingPortalSectionFooter>
            <BillingPortalButton emphasis="primary">Change plan</BillingPortalButton>
            <BillingPortalCancel>
              <ConfirmationDialogTrigger disabled={cancelled}>
                {cancelled ? "Cancellation scheduled" : "Cancel subscription"}
              </ConfirmationDialogTrigger>
              <ConfirmationDialogContent>
                <ConfirmationDialogTitle>Cancel the Growth plan?</ConfirmationDialogTitle>
                <ConfirmationDialogDescription>
                  <p style={{ margin: 0 }}>On October 14, 2026, Northwind Goods will:</p>
                  <ConfirmationDialogImpact>
                    <li>Stop accepting new orders</li>
                    <li>Move to read-only access for 9 team members</li>
                    <li>Keep invoices available for download</li>
                  </ConfirmationDialogImpact>
                </ConfirmationDialogDescription>
                <ConfirmationDialogActions>
                  <ConfirmationDialogCancel>Keep plan</ConfirmationDialogCancel>
                  <ConfirmationDialogConfirm onClick={() => setCancelled(true)}>
                    Cancel subscription
                  </ConfirmationDialogConfirm>
                </ConfirmationDialogActions>
              </ConfirmationDialogContent>
            </BillingPortalCancel>
          </BillingPortalSectionFooter>
        </BillingPortalSection>
        <BillingPortalSection>
          <BillingPortalSectionHeader>
            <BillingPortalSectionTitle>Payment method</BillingPortalSectionTitle>
          </BillingPortalSectionHeader>
          <BillingPortalDetails>
            <DescriptionListItem>
              <DescriptionListTerm>Card</DescriptionListTerm>
              <DescriptionListDetails>
                Visa ending 4421
                <DescriptionListAction aria-label="Update card">Update</DescriptionListAction>
              </DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Expires</DescriptionListTerm>
              <DescriptionListDetails>08 / 2028</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Billing email</DescriptionListTerm>
              <DescriptionListDetails>finance@northwind.example</DescriptionListDetails>
            </DescriptionListItem>
          </BillingPortalDetails>
        </BillingPortalSection>
        <BillingPortalSection span>
          <BillingPortalSectionHeader>
            <BillingPortalSectionTitle>Invoices</BillingPortalSectionTitle>
            <BillingPortalButton>Download all</BillingPortalButton>
          </BillingPortalSectionHeader>
          <BillingPortalInvoices aria-label="Invoices">
            <BillingPortalInvoicesHeader>
              <BillingPortalInvoicesColumn>Invoice</BillingPortalInvoicesColumn>
              <BillingPortalInvoicesColumn>Date</BillingPortalInvoicesColumn>
              <BillingPortalInvoicesColumn>Status</BillingPortalInvoicesColumn>
              <BillingPortalInvoicesColumn align="end">Amount</BillingPortalInvoicesColumn>
            </BillingPortalInvoicesHeader>
            <BillingPortalInvoicesBody>
              {invoices.map((invoice) => (
                <BillingPortalInvoice key={invoice.id}>
                  <BillingPortalInvoiceCell>
                    <a
                      href={\`#\${invoice.id}\`}
                      style={{ color: "inherit", fontWeight: 500, textDecoration: "none" }}
                    >
                      {invoice.id}
                    </a>
                  </BillingPortalInvoiceCell>
                  <BillingPortalInvoiceCell style={{ color: "var(--uai-muted)" }}>
                    {invoice.date}
                  </BillingPortalInvoiceCell>
                  <BillingPortalInvoiceCell>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0 8px",
                        borderRadius: 999,
                        background: \`color-mix(in oklab, var(\${
                          invoice.status === "Failed" ? "--uai-danger" : "--uai-success"
                        }) 14%, transparent)\`,
                        color:
                          invoice.status === "Failed" ? "var(--uai-danger)" : "var(--uai-success)",
                        fontSize: 11.5,
                        lineHeight: "20px",
                        fontWeight: 500,
                      }}
                    >
                      {invoice.status}
                    </span>
                  </BillingPortalInvoiceCell>
                  <BillingPortalInvoiceCell align="end">{invoice.amount}</BillingPortalInvoiceCell>
                </BillingPortalInvoice>
              ))}
            </BillingPortalInvoicesBody>
          </BillingPortalInvoices>
        </BillingPortalSection>
      </BillingPortalGrid>
    </BillingPortal>
  );
}
`,
    accessibility: [
      "Billing problems use a Status Banner: warnings and errors are alerts, and information is a polite status.",
      'Usage is a labelled progressbar with a text value such as "3,210 of 5,000 orders".',
      "Invoices are a native table with column headers. It scrolls horizontally on narrow screens instead of squeezing columns.",
      'Cancellation opens a modal alert dialog that lists what changes and keeps "Keep plan" as the focused default.',
    ],
  },
  {
    id: "search-results",
    name: "Search Results",
    category: "Application",
    icon: TextSearch,
    description:
      "Query controls, filters, ranked results with highlighted terms, empty states, and pagination.",
    usage: `"use client";

import { SearchX } from "lucide-react";
import { useState } from "react";
import {
  SearchResults,
  SearchResultsBar,
  SearchResultsEmpty,
  SearchResultsFilters,
  SearchResultsHighlight,
  SearchResultsItem,
  SearchResultsItemMeta,
  SearchResultsItemSnippet,
  SearchResultsItemTitle,
  SearchResultsList,
  SearchResultsMain,
  SearchResultsPagination,
  SearchResultsQuery,
  SearchResultsSort,
  SearchResultsSortOption,
  SearchResultsSummary,
  type SearchResultsVariant,
} from "@/components/uai/search-results";
import {
  EmptyStateAction,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import {
  FilterBarChip,
  FilterBarChips,
  FilterBarCount,
  FilterBarReset,
} from "@/components/ui/uai/filter-bar";
import {
  SearchFieldClear,
  SearchFieldControl,
  SearchFieldInput,
  SearchFieldLabel,
} from "@/components/ui/uai/search-field";

const articles = [
  {
    id: "issue-refund",
    title: "Issue a full or partial refund",
    path: "Help center › Orders",
    updated: "Updated Sep 22",
    type: "Guide",
    snippet:
      "Open the order, choose Refund, and pick the items and shipping to return to the customer.",
  },
  {
    id: "refund-policy",
    title: "Set your refund policy",
    path: "Help center › Store settings",
    updated: "Updated Sep 3",
    type: "Guide",
    snippet: "Customers see the refund policy at checkout and in every order confirmation email.",
  },
  {
    id: "refund-fees",
    title: "Are payment fees returned with a refund?",
    path: "Help center › Payouts",
    updated: "Updated Aug 18",
    type: "FAQ",
    snippet: "Card processing fees are not returned when you refund an order, even in full.",
  },
  {
    id: "exchange",
    title: "Exchange an item for a different size",
    path: "Help center › Orders",
    updated: "Updated Jul 30",
    type: "Guide",
    snippet: "Create an exchange instead of a refund to keep the sale and send the new size.",
  },
];

function highlight(text: string, query: string) {
  const term = query.trim().toLowerCase();
  const index = term ? text.toLowerCase().indexOf(term) : -1;
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <SearchResultsHighlight>{text.slice(index, index + term.length)}</SearchResultsHighlight>
      {text.slice(index + term.length)}
    </>
  );
}

export function SearchResultsPreview({ variant = "list" }: { variant?: SearchResultsVariant }) {
  const [query, setQuery] = useState("refund");
  const [guidesOnly, setGuidesOnly] = useState(true);
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const term = query.trim().toLowerCase();
  const matches = articles
    .filter((article) => !guidesOnly || article.type === "Guide")
    .filter(
      (article) =>
        !term ||
        article.title.toLowerCase().includes(term) ||
        article.snippet.toLowerCase().includes(term),
    );
  const results =
    sort === "title" ? [...matches].sort((a, b) => a.title.localeCompare(b.title)) : matches;

  return (
    <SearchResults variant={variant}>
      <SearchResultsQuery
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          setPage(1);
        }}
      >
        <SearchFieldLabel className="sr-only">Search the help center</SearchFieldLabel>
        <SearchFieldControl>
          <SearchFieldInput placeholder="Search the help center" />
          <SearchFieldClear />
        </SearchFieldControl>
      </SearchResultsQuery>
      <SearchResultsFilters activeCount={guidesOnly ? 1 : 0} onReset={() => setGuidesOnly(false)}>
        <FilterBarChips>
          {guidesOnly ? (
            <FilterBarChip onRemove={() => setGuidesOnly(false)}>Type: Guides</FilterBarChip>
          ) : (
            <FilterBarCount>No filters applied</FilterBarCount>
          )}
        </FilterBarChips>
        <FilterBarReset />
      </SearchResultsFilters>
      <SearchResultsMain>
        <SearchResultsBar>
          <SearchResultsSummary>
            {results.length} {results.length === 1 ? "result" : "results"}
            {term ? \` for “\${query.trim()}”\` : ""}
          </SearchResultsSummary>
          <SearchResultsSort value={sort} onValueChange={setSort}>
            <SearchResultsSortOption value="relevance">Best match</SearchResultsSortOption>
            <SearchResultsSortOption value="title">Title A–Z</SearchResultsSortOption>
          </SearchResultsSort>
        </SearchResultsBar>
        {results.length === 0 ? (
          <SearchResultsEmpty>
            <EmptyStateMedia>
              <SearchX aria-hidden="true" />
            </EmptyStateMedia>
            <EmptyStateContent>
              <EmptyStateHeader>
                <EmptyStateTitle>No articles match “{query.trim()}”</EmptyStateTitle>
                <EmptyStateDescription>
                  Try a shorter phrase, or include FAQs in the results.
                </EmptyStateDescription>
              </EmptyStateHeader>
              <EmptyStateActions>
                <EmptyStateAction emphasis="secondary" onClick={() => setGuidesOnly(false)}>
                  Include FAQs
                </EmptyStateAction>
              </EmptyStateActions>
            </EmptyStateContent>
          </SearchResultsEmpty>
        ) : (
          <>
            <SearchResultsList>
              {results.map((article) => (
                <SearchResultsItem key={article.id}>
                  <SearchResultsItemTitle
                    href={\`#\${article.id}\`}
                    onClick={(event) => event.preventDefault()}
                  >
                    {highlight(article.title, query)}
                  </SearchResultsItemTitle>
                  <SearchResultsItemMeta>
                    <span>{article.path}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.updated}</span>
                  </SearchResultsItemMeta>
                  <SearchResultsItemSnippet>
                    {highlight(article.snippet, query)}
                  </SearchResultsItemSnippet>
                </SearchResultsItem>
              ))}
            </SearchResultsList>
            <SearchResultsPagination pageCount={8} page={page} onPageChange={setPage} />
          </>
        )}
      </SearchResultsMain>
    </SearchResults>
  );
}
`,
    accessibility: [
      "The query field sits in a search landmark. Escape clears it, and the clear button returns focus to the input.",
      "The result count is a polite status and describes the results list, so changes are announced without moving focus.",
      "Each result is an article named by its linked h3 title. Matched terms use mark elements.",
      'Pagination is a labelled nav. Page buttons are named "Page N", the current page uses aria-current, and edge buttons are disabled.',
    ],
  },
];
