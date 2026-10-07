import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  APP_SIDEBAR_VARIANTS,
  AppSidebar,
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
  type AppSidebarProps,
  AppSidebarSubmenu,
  AppSidebarSubmenuList,
  AppSidebarSubmenuTrigger,
  AppSidebarTitle,
} from "@/registry/uai/components/app-sidebar";

function Fixture(props: Omit<AppSidebarProps, "children">) {
  return (
    <AppSidebar defaultValue="overview" {...props}>
      <AppSidebarHeader>
        <AppSidebarTitle>Northwind</AppSidebarTitle>
        <AppSidebarCollapseToggle />
        <AppSidebarMobileTrigger />
      </AppSidebarHeader>
      <AppSidebarNav>
        <AppSidebarGroup>
          <AppSidebarGroupLabel>Workspace</AppSidebarGroupLabel>
          <AppSidebarList>
            <AppSidebarItem value="overview" href="#overview" label="Overview">
              <AppSidebarItemIcon>O</AppSidebarItemIcon>
              <AppSidebarItemLabel>Overview</AppSidebarItemLabel>
            </AppSidebarItem>
            <AppSidebarItem value="inbox" href="#inbox" label="Inbox">
              <AppSidebarItemLabel>Inbox</AppSidebarItemLabel>
              <AppSidebarItemBadge>12</AppSidebarItemBadge>
            </AppSidebarItem>
            <AppSidebarSubmenu>
              <AppSidebarSubmenuTrigger label="Documents">
                <AppSidebarItemLabel>Documents</AppSidebarItemLabel>
              </AppSidebarSubmenuTrigger>
              <AppSidebarSubmenuList>
                <AppSidebarItem value="briefs" href="#briefs">
                  <AppSidebarItemLabel>Project briefs</AppSidebarItemLabel>
                </AppSidebarItem>
              </AppSidebarSubmenuList>
            </AppSidebarSubmenu>
          </AppSidebarList>
        </AppSidebarGroup>
      </AppSidebarNav>
    </AppSidebar>
  );
}
const wide = "(max-width: 1px)";
const narrow = "(min-width: 1px)";

test("marks the active item and updates it on selection", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string) => {});
  render(<Fixture mobileQuery={wide} onValueChange={change} />);
  expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Workspace" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Overview" }).getAttribute("aria-current")).toBe("page");
  await user.click(screen.getByRole("link", { name: /Inbox/ }));
  expect(change).toHaveBeenCalledWith("inbox");
  expect(screen.getByRole("link", { name: /Inbox/ }).getAttribute("aria-current")).toBe("page");
  expect(screen.getByRole("link", { name: "Overview" }).hasAttribute("aria-current")).toBe(false);
});

test("opens nested navigation through a disclosure button", async () => {
  const user = userEvent.setup();
  render(<Fixture mobileQuery={wide} />);
  const trigger = screen.getByRole("button", { name: "Documents" });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("link", { name: "Project briefs" })).toBeNull();
  await user.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(document.getElementById(trigger.getAttribute("aria-controls") ?? "")?.hidden).toBe(false);
  expect(screen.getByRole("link", { name: "Project briefs" })).toBeTruthy();
});

test("collapses to icons while keeping accessible names", async () => {
  const user = userEvent.setup();
  const collapse = mock((_collapsed: boolean) => {});
  const { container } = render(<Fixture mobileQuery={wide} onCollapsedChange={collapse} />);
  await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
  expect(collapse).toHaveBeenCalledWith(true);
  expect(container.firstElementChild?.hasAttribute("data-collapsed")).toBe(true);
  const toggle = screen.getByRole("button", { name: "Expand sidebar" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  const overview = screen.getByRole("link", { name: "Overview" });
  expect(overview.getAttribute("title")).toBe("Overview");
  // Labels and badges fade out in place; badges leave the accessibility tree.
  expect(screen.getByText("12").getAttribute("aria-hidden")).toBe("true");
  expect(screen.getByText("Overview").className).toContain("opacity-0");
  await user.click(screen.getByRole("button", { name: "Documents" }));
  expect(container.firstElementChild?.hasAttribute("data-collapsed")).toBe(false);
  expect(screen.getByRole("link", { name: "Project briefs" })).toBeTruthy();
});

test("uses a mobile disclosure that closes on Escape and on navigation", async () => {
  const user = userEvent.setup();
  render(<Fixture mobileQuery={narrow} />);
  expect(screen.queryByRole("button", { name: "Collapse sidebar" })).toBeNull();
  const trigger = screen.getByRole("button", { name: "Open navigation" });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("navigation")).toBeNull();
  await user.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  screen.getByRole("link", { name: "Overview" }).focus();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("navigation")).toBeNull();
  expect(document.activeElement).toBe(trigger);
  await user.click(trigger);
  await user.click(screen.getByRole("link", { name: /Inbox/ }));
  expect(screen.queryByRole("navigation")).toBeNull();
});

test("renders every variant and guards compound children", () => {
  for (const variant of APP_SIDEBAR_VARIANTS) {
    const view = render(<Fixture variant={variant} mobileQuery={wide} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() =>
    render(
      <AppSidebarItem value="x">
        <AppSidebarItemLabel>X</AppSidebarItemLabel>
      </AppSidebarItem>,
    ),
  ).toThrow("AppSidebarItem must be used within AppSidebar");
  expect(() =>
    render(
      <AppSidebar>
        <AppSidebarSubmenuList />
      </AppSidebar>,
    ),
  ).toThrow("AppSidebarSubmenuList must be used within AppSidebarSubmenu");
});
