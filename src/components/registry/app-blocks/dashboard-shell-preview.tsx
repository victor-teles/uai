"use client";

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
                      background: `var(--uai-${order.tone})`,
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
                        width: `${channel.share}%`,
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
