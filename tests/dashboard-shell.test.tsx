import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AppSidebarCollapseToggle,
  AppSidebarHeader,
  AppSidebarItem,
  AppSidebarItemLabel,
  AppSidebarList,
  AppSidebarNav,
  AppSidebarTitle,
} from "@/components/ui/uai/app-sidebar";
import { BreadcrumbTrailItem } from "@/components/ui/uai/breadcrumb-trail";
import { MetricCardLabel, MetricCardValue } from "@/components/ui/uai/metric-card";
import {
  DASHBOARD_SHELL_VARIANTS,
  DashboardShell,
  DashboardShellAction,
  DashboardShellActions,
  DashboardShellBreadcrumb,
  DashboardShellContent,
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
} from "@/registry/uai/blocks/dashboard-shell";

function Fixture({
  variant,
  onAction,
}: {
  variant?: DashboardShellVariant;
  onAction?: () => void;
}) {
  return (
    <DashboardShell variant={variant}>
      <DashboardShellSidebar defaultValue="overview">
        <AppSidebarHeader>
          <AppSidebarTitle>Northwind</AppSidebarTitle>
          <AppSidebarCollapseToggle />
        </AppSidebarHeader>
        <AppSidebarNav>
          <AppSidebarList>
            <AppSidebarItem value="overview">
              <AppSidebarItemLabel>Overview</AppSidebarItemLabel>
            </AppSidebarItem>
            <AppSidebarItem value="orders">
              <AppSidebarItemLabel>Orders</AppSidebarItemLabel>
            </AppSidebarItem>
          </AppSidebarList>
        </AppSidebarNav>
      </DashboardShellSidebar>
      <DashboardShellMain>
        <DashboardShellHeader>
          <DashboardShellHeading>
            <DashboardShellBreadcrumb>
              <BreadcrumbTrailItem href="/analytics" parent>
                Analytics
              </BreadcrumbTrailItem>
              <BreadcrumbTrailItem current>Overview</BreadcrumbTrailItem>
            </DashboardShellBreadcrumb>
            <DashboardShellTitle>Store overview</DashboardShellTitle>
          </DashboardShellHeading>
          <DashboardShellActions>
            <DashboardShellAction emphasis="primary" onClick={onAction}>
              New report
            </DashboardShellAction>
          </DashboardShellActions>
        </DashboardShellHeader>
        <DashboardShellMetrics>
          <DashboardShellMetric>
            <MetricCardLabel>Revenue</MetricCardLabel>
            <MetricCardValue>$48,210</MetricCardValue>
          </DashboardShellMetric>
        </DashboardShellMetrics>
        <DashboardShellContent>
          <DashboardShellPanel>
            <DashboardShellPanelTitle>Orders needing attention</DashboardShellPanelTitle>
          </DashboardShellPanel>
        </DashboardShellContent>
      </DashboardShellMain>
    </DashboardShell>
  );
}

test("labels the main region, breadcrumb, metrics, and panels", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Store overview" })).toBeTruthy();
  expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Revenue" })).toBeTruthy();
  expect(screen.getByRole("region", { name: "Orders needing attention" })).toBeTruthy();
  expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
});

test("keeps sidebar selection, collapse, and page actions working", async () => {
  const user = userEvent.setup();
  let clicks = 0;
  render(<Fixture onAction={() => clicks++} />);
  const orders = screen.getByRole("link", { name: "Orders" });
  await user.click(orders);
  expect(orders.getAttribute("aria-current")).toBe("page");
  const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
  await user.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  screen.getByRole("button", { name: "New report" }).focus();
  await user.keyboard("{Enter}");
  expect(clicks).toBe(1);
});

test("maps each layout variant onto the composed components", () => {
  const sidebar = { split: "panel", inset: "inset", compact: "compact" };
  const metric = { split: "card", inset: "card", compact: "compact" };
  for (const variant of DASHBOARD_SHELL_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    const root = view.container.firstElementChild as HTMLElement;
    expect(root.getAttribute("data-variant")).toBe(variant);
    expect(root.querySelector("[data-app-sidebar]")?.getAttribute("data-variant")).toBe(
      sidebar[variant],
    );
    expect(screen.getByRole("group", { name: "Revenue" }).getAttribute("data-variant")).toBe(
      metric[variant],
    );
    view.unmount();
  }
});

test("guards regions rendered outside the shell", () => {
  expect(() => render(<DashboardShellTitle>Overview</DashboardShellTitle>)).toThrow(
    "DashboardShellTitle must be used within DashboardShell",
  );
  expect(() => render(<DashboardShellPanelTitle>Orders</DashboardShellPanelTitle>)).toThrow(
    "DashboardShellPanelTitle must be used within DashboardShellPanel",
  );
});
